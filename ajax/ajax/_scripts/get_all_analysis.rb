# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui remonte toutes les analyses, avec leur titre
  pour peupler le menu des analyses
=end
begin
  analyses = Dir["#{SCORE_FOLDER}/**/data.yml"].collect do |p|
    d = YAML.load_file(p)
    {titre: d[:title], folder: d[:folder_name]}
  end
  Ajax << {analyses: analyses}
rescue Exception => e
  Ajax.error(e)
end
