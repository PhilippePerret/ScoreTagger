# encoding: UTF-8
=begin

  Script qui retourne les données du score courant

=end
begin
  Ajax << { data: Score.data }
rescue Exception => e
  Ajax.error(e)
end
