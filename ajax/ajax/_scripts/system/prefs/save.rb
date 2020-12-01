# encoding: UTF-8
require 'json'

require_relative 'required'

begin

  File.open(DATA_PREFS_PATH,'wb'){|f| f.write Ajax.param(:prefs_data).to_json}

  Ajax << { message: "Préférences enregistrées."}

rescue Exception => e
  Ajax.error(e)
end
