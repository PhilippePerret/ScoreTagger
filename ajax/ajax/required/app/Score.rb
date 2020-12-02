# encoding: UTF-8
# frozen_string_literal: true
require 'yaml'
require_relative './app_constants'

class Score
attr_reader :name # nom du dossier
def initialize(name)
  @name = name
end #/ initialize

def exists?
  File.exists?(folder)
end

def set(hdata)
  @data = data.merge!(hdata)
  save
end #/ set

def save
  File.open(data_file_path,'wb'){|f| f.write(YAML.dump(data))}
end

# Méthode qui s'assure que la partition soit bien copiée dans le
# dossier 'pages' du dossier d'analyse
def check_score_ini
  FileUtils.mkdir_p(pages_folder)
  images = []
  if File.directory?(data[:score_ini_path])
    # On copie toutes les pages du dossier
    Dir["#{data[:score_ini_path]}/*.*"].sort.each_with_index do |pimage, idx|
      pimage_page = page_path(idx + 1, File.extname(pimage))
      FileUtils.copy(pimage, pimage_page)
      images << pimage_page
    end
  else
    # Une seule page
    pimage_page = page_path(1, File.extname(data[:score_ini_path]))
    FileUtils.copy(data[:score_ini_path], pimage_page)
    images << pimage_page
  end
  # On s'assure qu'on a bien des fichier .jpg, sinon on les converti
  images.each do |image|
    extimage = File.extname(image).downcase
    next if extimage == '.jpg'
    image_jpg = File.join(File.dirname(image),"#{File.basename(image, File.extname(image))}.jpg")
    if extimage == '.jpeg'
      FileUtils.copy(image, image_jpg) # un renommage suffit
    else
      # Il faut convertir
      `/usr/local/bin/convert "#{image}" "#{image_jpg}"`
    end
  end
end #/ check_score_ini

def data
  @data ||= begin
    if File.exists?(data_file_path)
      YAML.load_file(data_file_path)
    else
      {}
    end
  end
end #/ data

def data_file_path
  @data_file_path ||= File.join(folder,'data.yaml')
end

# Le path vers la page de score +page+ (1-start)
def page_path(page, ext = '.jpg')
  File.join(pages_folder,"page-#{page}#{ext}")
end

def pages_folder
  @pages_folder ||= File.join(folder,'pages')
end
def folder
  @folder ||= File.join(SCORE_FOLDER,name)
end

end #/Score
