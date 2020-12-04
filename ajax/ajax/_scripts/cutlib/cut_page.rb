# encoding: UTF-8
# frozen_string_literal: true
=begin
  Ce module permet de produire les systèmes séparés de la partition
=end

# CUTLINES_DATA = [[418, 209],[627, 179],[806, 203],[1009, 198],[1207, 204],[1411, 239]]

# Ligne pour extraire le système de la partition originale
CODE_CROP_IMAGE = "/usr/local/bin/convert ./score/images/pages/page-#{CURRENT_PAGE}.jpg -crop 0x%{height}+0+%{top} ./systems/images/system-p#{CURRENT_PAGE}-s%{iimg}.jpg"

def proceed_crop_score_ini

  # On commence par supprimer les systèmes de la page qui ont
  # pu être découpés précédemment
  Dir["#{SCORE.images_systems_folder}/system-p#{CURRENT_PAGE}-s*.jpg"].each do |p|
    File.delete(p)
  end

  # Produire le code qui va découper la page
  code_decoupe = []
  CUTLINES_DATA.each_with_index do |dline, idx|
    dline = dline.merge(iimg: (idx+1).to_s.rjust(2,'0')).to_sym
    code_decoupe << CODE_CROP_IMAGE % dline
  end
  # On supprime la derniere coupe qui doit être le vide
  code_decoupe.pop

  # *** Code final de coupe ***
  code_decoupe = <<-BASH
cd "#{SCORE.folder}"
#{code_decoupe.join("\n")}

BASH
  log("Code de découpe:\n#{code_decoupe}")

  # === On procède à la découpe ===
  res = system("#{code_decoupe}\n")

  return res
end #/ proceed_crop_score_ini
