# encoding: UTF-8
# frozen_string_literal: true
require 'yaml'

class Score
attr_reader :name # nom du dossier
def initialize(name)
  @name = name
end #/ initialize

def set(hdata)
  @data = data.merge!(hdata)
  save
end #/ set

def save
  File.open(data_file_path,'wb'){|f| f.write(YAML.dump(data))}
end

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
def page_path(page)
  File.join(folder,'pages',"score_page_#{page}.jpg")
end

def folder
  @folder ||= File.join(SCORE_FOLDER,name)
end

end #/<< self
end #/Score
