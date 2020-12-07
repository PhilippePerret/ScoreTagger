# encoding: UTF-8
# frozen_string_literal: true
class Integer
  def days
    self * 24 * 3600
  end #/ days
  alias :day :days
end #/Integer
