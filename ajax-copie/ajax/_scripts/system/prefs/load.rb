# encoding: UTF-8
require 'json'
require_relative 'required'

begin

  prefs = if File.exists?(DATA_PREFS_PATH)
            JSON.parse(File.read(DATA_PREFS_PATH).force_encoding('utf-8'))
          else
            {}
          end

  Ajax << {
    prefs_data: prefs
  }

rescue Exception => e
  Ajax.error(e)
end
