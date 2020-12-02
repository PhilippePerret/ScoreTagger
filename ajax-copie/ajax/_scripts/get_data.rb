# encoding: UTF-8
=begin

  Script qui retourne les données du score courant

=end
begin
  # score = Score.new(Ajax.params[:current_analyse])
  # Ajax << { data: score.data }
  Ajax << {data: {}}
rescue Exception => e
  Ajax.error(e)
end
