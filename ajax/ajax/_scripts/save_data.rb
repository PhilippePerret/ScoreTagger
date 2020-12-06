# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui retourne les données du score courant
=end
begin
  CURRENT_ANALYSE = Ajax.param(:current_analyse)
  data = Ajax.param(:data).to_sym
  if CURRENT_ANALYSE == nil || CURRENT_ANALYSE.empty?
    Ajax << { error: "Aucune analyse n'est définie. Consultez l'aide pour savoir comment la définir."}
  elsif data[:score_ini_path].nil?
    Ajax << {error: "Il faut définir le chemin d'accès à la partition originale."}
  else
    score = Score.new(CURRENT_ANALYSE)
    score.mkdir_p_folders if not(score.exists?)
    data = score.data.merge!(data)
    score.set(data)
  end
rescue Exception => e
  Ajax.error(e)
end
