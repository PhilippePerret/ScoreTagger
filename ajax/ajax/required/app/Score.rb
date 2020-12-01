# encoding: UTF-8
# frozen_string_literal: true
require 'json'

class Score
class << self

def set(hdata)
  @data = data.merge!(hdata)
  save
end #/ set

def save
  File.open(data_file_path,'wb'){|f| f.write(data.to_json)}
end

def data
  @data ||= begin
    if File.exists?(data_file_path)
      JSON.parse(File.read(data_file_path))
    else
      {}
    end
  end
end #/ data

def data_file_path
  @data_file_path ||= File.join(SCORE_FOLDER,'data.json')
end

end #/<< self
end #/Score
