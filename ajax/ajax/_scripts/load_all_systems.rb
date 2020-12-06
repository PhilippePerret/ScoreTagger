# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui retourne les données du score courant
=end
begin
  CURRENT_ANALYSE = Ajax.param(:current_analyse)
  if CURRENT_ANALYSE == nil || CURRENT_ANALYSE.empty?
    Ajax << { error: "Aucune analyse n'est définie. Consultez l'aide pour savoir comment la définir."}
  else
    score = Score.new(CURRENT_ANALYSE)
    if score.nil? || not(score.exists?)
      Ajax << {error: "Cette analyse n'existe pas… Impossible d'enregistrer le système."}
    elsif not score.is_prepared?
      Ajax << {error: "Cette partition n'est pas encore analysée, impossible d'obtenir les données systèmes."}
    else
      Ajax << {data: score.load_all_system}
    end
  end
rescue Exception => e
  Ajax.error(e)
end
