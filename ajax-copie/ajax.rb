#!/Users/philippeperret/.rbenv/versions/2.7.2/bin/ruby
# encoding: UTF-8

#############!/Users/philippeperret/.rbenv/versions/2.6.3/bin/ruby
#################!/usr/bin/env ruby
def log message
  File.open('./log.txt','a'){|f| f.write "#{message}\n"}
end

log("--- [#{Time.now}] Entrée dans ajax.rb")

require_relative 'ajax/required'
require_relative 'config'
Ajax.treate_request
