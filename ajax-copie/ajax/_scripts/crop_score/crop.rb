# encoding: UTF-8
# frozen_string_literal: true
=begin
  Ce module permet de produire les systèmes séparés de la partition
=end

# CROP_LINES_DATA = [[418, 209],[627, 179],[806, 203],[1009, 198],[1207, 204],[1411, 239]]

# Ligne pour extraire le système de la partition originale
CODE_CROP_IMAGE = "/usr/local/bin/convert #{File.basename(SCORE_INI_PATH)} -crop 0x%{height}+0+%{top} ./factory/system-#{PAGE}-%{iimg}.jpg"

def proceed_crop_score_ini
  FileUtils.rm_rf(FACTORY_FOLDER) if File.exists?(FACTORY_FOLDER)
  FileUtils.mkdir_p(FACTORY_FOLDER)

  # Produire le code qui va découper
  code_decoupe = []
  CROP_LINES_DATA.each_with_index do |dline, idx|
    dline = dline.merge(iimg: idx.to_s.rjust(3,'0')).to_sym
    log("dline: #{dline.inspect}")
    code_decoupe << CODE_CROP_IMAGE % dline
  end

  code_decoupe = <<-BASH
cd "#{SCORE_FOLDER}"
#{code_decoupe.join("\n")}

BASH
  log("Code de découpe:\n#{code_decoupe}")
  # res = `#{code_decoupe}\n`
  res = system("#{code_decoupe}\n")

  return res
end #/ proceed_crop_score_ini
