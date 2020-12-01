# encoding: UTF-8
require 'fileutils'

# Le dossier de l'application
# ---------------------------
# Contient quelque chose comme '/Users/moi/Sites/MonApplication'
#
APP_FOLDER = File.dirname(File.dirname(File.dirname(__FILE__)))

SCORE_FOLDER    = File.join(APP_FOLDER,'_score_')
FACTORY_FOLDER  = File.join(SCORE_FOLDER,'factory')

require_relative 'ajax_class'

log("Chargement des modules")
Dir["#{APP_FOLDER}/ajax/ajax/required/**/*.rb"].each do |m|
  log("Chargement module '#{m}'")
  require m
end
