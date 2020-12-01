# encoding: UTF-8
# frozen_string_literal: true
=begin
  Ce module permet de produire les systèmes séparés de la partition

  Procédure
  ---------
    * Définir ci-dessous le chemin d'accès à la partition (source)
      (quel que soit son emplacement, les images produites seront placées
       dans le dossier ./factory — en détruisant celles qui s'y trouvent)
    * Mettre la constante SET_DECOUPE à true pour définir à la découpe
    * Lancer ce script avec CMD-i
    => Ouvre une fenêtre dans le navigateur qui permet de placer des
       lignes de découpe sur la partition (clic and drag)
    * Cliquer sur le bouton CROP_LINES_DATA dans la page HTML
    * Récupérer le code fourni et le copier ci-dessous dans CODE_DECOUPE
    * Mettre SET_DECOUPE à false
    * Relancer ce script
    * Les systèmes découpés sont placés dans le dossier 'factory'
    * Une image avec les systèmes séparés est produite (on peut régler
      la distance entre les systèmes avec la constante SYSTEMES_SEPARATOR)
=end

# CROP_LINES_DATA = [[418, 209],[627, 179],[806, 203],[1009, 198],[1207, 204],[1411, 239]]

# Ligne pour extraire le système de la partition originale
CODE_CROP_IMAGE = "/usr/local/bin/convert #{File.basename(SCORE_INI_PATH)} -crop 0x%{height}+0+%{top} ./factory/score-%{iimg}.jpg"

def proceed_crop_score_ini
  FileUtils.rm_rf(FACTORY_FOLDER) if File.exists?(FACTORY_FOLDER)
  FileUtils.mkdir_p(FACTORY_FOLDER)

  # Produire le code qui va découper
  code_decoupe = []
  CROP_LINES_DATA.each_with_index do |paire, idx|
    top, height = paire
    code_decoupe << CODE_CROP_IMAGE % {top: top, height: height, iimg: idx.to_s.rjust(3,'0')}
  end

  code_decoupe = <<-BASH
cd "#{SCORE_FOLDER}"
#{code_decoupe.join("\n")}

BASH
  log("Code de découpe:\n#{code_decoupe}")
  # res = `#{code_decoupe}\n`
  res = system("#{code_decoupe}\n 2>&1")

  return res
end #/ proceed_crop_score_ini
