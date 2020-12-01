# encoding: UTF-8
# frozen_string_literal: true
class Hash

  def to_sym(deep = false)
    h = {}
    self.each do |k,v|
      h.merge!(k.to_sym => v)
    end
    return h
  end #/ to_sym

end #/Hash
