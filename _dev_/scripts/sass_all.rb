# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui prend tous les fichiers SASS du fichier ./css et les assemble
  dans le fichier main.css à partir de la définition de main.sass

  Note
  La difficulté avec le nouveau SassC, c'est qu'il ne travaille en réalité
  qu'avec du Scss. Donc il faut transformer dans un premier temps tous les
  .sass ou .scss
=end
require 'fileutils'
# require 'sassc' # ne fonctionne pas…
require 'sass' # deprecated, mais très efficace

MAIN_CSS_PATH   = File.join('.','css','main_sass.css')
MAIN_SASS_PATH  = File.join('.','css','main.sass')

data_compilation = { line_comments: false, style: :compressed }
Sass.compile_file( MAIN_SASS_PATH, MAIN_CSS_PATH, data_compilation)

puts "Tous les SASS ont été transformés. Recharger la page du navigateur."
