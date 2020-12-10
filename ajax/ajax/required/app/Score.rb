# encoding: UTF-8
# frozen_string_literal: true
require 'yaml'
require_relative './app_constants'

class Score
attr_reader :name # nom du dossier
def initialize(name)
  @name = name
end #/ initialize

# Création de l'analyse
def create(hdata)
  mkdir_p_folders
  set(hdata)
end #/ create

# Pour mettre cette analyse en analyse courante
def set_current
  File.open(File.join(SCORE_FOLDER,'_CURRENT_.js'),'wb') do |f|
    f.write("const CURRENT_ANALYSE = '#{name}';\n")
  end
end #/ set_current

# Fabrication de tous les dossiers de l'analyse
def mkdir_p_folders
  [systems_folder, images_systems_folder, data_systems_folder, pages_score_folder].each do |dossier|
    FileUtils.mkdir_p(dossier)
  end
end
# Pour recommencer le découpage par exemple
def reset_folders
  [systems_folder, score_folder].each do |dossier|
    FileUtils.rm_rf(dossier)
  end
  mkdir_p_folders
end

def exists?
  File.exists?(folder)
end

def set(hdata)
  @data = data.merge!(hdata)
  save
end #/ set

def save
  File.open(data_file_path,'wb'){|f| f.write(YAML.dump(data))}
  SafeFile.new(data_file_path, name).backup
end

# Méthode qui prépare les pages (ou la page) de score à partir du chemin
# d'accès fourni dans :score_ini_path, qui peut être soit un chemin de
# dossier (contenant les pages) soit un chemin de fichier (définissant
# l'unique page)
def prepare_score_pages
  score_path = data[:score_ini_path]
  # On s'assure d'abord que l'image originale ou le dossier soit défini
  # et existe bien.
  if score_path.nil?
    raise "Il faut définir le chemin d'accès à la partition originale."
  elsif not File.exists?(score_path)
    raise "Le fichier ou dossier '#{score_path}' n'existe pas ou plus…"
  end
  # On s'assure que les dossiers de l'analyse existent. On les
  # crée au besoin.
  mkdir_p_folders
  # Si :score_ini_path est un dossier, on copie toutes les images de son
  # contenu dans le dossier ./score/images/pages/
  page_count = 0
  if File.directory?(score_path)
    # On copie toutes les pages du dossier initial
    Dir["#{score_path}/*.*"].select do |p|
      ext = File.extname(p).downcase
      ['.jpg','.jpeg','.png','.tiff','.bitmap','.gif'].include?(ext)
    end.sort.each_with_index do |pimage, idx|
      copie_score_page(idx, pimage)
      page_count += 1
    end
  else
    # Une seule page
    copie_score_page(1, score_path)
    page_count = 1
  end
  return page_count
end

# Copie la page de partition originale +pimage+ dans le dossier des pages
# de partition.
# Retourne le chemin d'accès à la copie
def copie_score_page(idx, pimage)
  ipage   = idx + 1
  extname = File.extname(pimage).downcase
  pcopie  = File.join(pages_score_folder, "page-#{ipage}.jpg")
  if ['.jpg','jpgeg'].include?(extname)
    # Il suffit de dupliquer l'image dans le dossier, peut-être
    # en changeant son extension (.jpeg => .jpg)
    FileUtils.copy(pimage, pcopie)
  else
    # Il faut convertir l'image en .jpg
    `/usr/local/bin/convert "#{pimage}" "#{pcopie}"`
  end
  return pcopie
end #/ copie_score_page

# Retourne les données de la partition
def data
  @data ||= begin
    if File.exists?(data_file_path)
      YAML.load_file(data_file_path)
    else
      {}
    end.merge(score_is_prepared: is_prepared?)
  end
end #/ data

def data_file_path
  @data_file_path ||= File.join(score_folder,'data.yml')
end


# Retourne TRUE si la partition est préparée, c'est-à-dire, simplement, si
# les données des systèmes sont enregistrés.
def is_prepared?
  Dir["#{data_systems_folder}/*.yml"].count > 0
end

def save_system(data)
  system_path = system_data_path(data[:minid])
  File.open(system_path,'wb') do |f|
    f.write YAML.dump(data)
  end
  SafeFile.new(system_path, name).backup
end

# Retourne les données du système de minid +minid+
def load_system(minid)
  YAML.load_file(system_data_path(dimid))
end

# Retourne les données de tous les systèmes
# Noter que c'est une liste
def load_all_system
  Dir["#{data_systems_folder}/*.yml"].sort.collect do |psys|
    YAML.load_file(psys)
  end
end

def prefs_file_path
  @prefs_file_path ||= File.join(score_folder,'prefs.yml')
end
# Retourne le chemin d'accès au fichier qui contient les données du
# système de minid +minid+
def system_data_path(minid)
  File.join(data_systems_folder, "system-#{minid}.yml")
end
# *** dossiers ***
def images_systems_folder
  @images_systems_folder ||= File.join(systems_folder,'images')
end
def data_systems_folder
  @data_systems_folder ||= File.join(systems_folder,'data')
end
def systems_folder
  @systems_folder ||= File.join(folder,'systems')
end
def pages_score_folder
  @pages_score_folder ||= File.join(images_score_folder,'pages')
end
def images_score_folder
  @images_score_folder ||= File.join(score_folder,'images')
end
def score_folder
  @score_folder ||= File.join(folder,'score')
end
def folder
  @folder ||= File.join(SCORE_FOLDER,name)
end

end #/Score
