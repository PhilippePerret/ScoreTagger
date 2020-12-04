# encoding: UTF-8
# frozen_string_literal: true
=begin
  Préparation des pages de la partition, à partir du chemin fourni
=end
begin
  CURRENT_ANALYSE = Ajax.param(:current_analyse)
  score_ini_path  = Ajax.param(:score_path)
  if CURRENT_ANALYSE == nil || CURRENT_ANALYSE.empty?
    Ajax << { error: "Aucune analyse n'est définie. Consultez l'aide pour savoir comment la définir."}
  elsif not File.exists?(score_ini_path)
    Ajax << {error: "La partition à '#{score_ini_path}' est introuvable…"}
  else
    score = Score.new(CURRENT_ANALYSE)
    # On s'assure que tous les dossiers soient bien présents
    score.mkdir_p_folders
    # On enregistre le chemin d'accès fourni
    score.set(score_ini_path: score_ini_path)
    page_count = score.prepare_score_pages
    Ajax << {ok: true, page_count: page_count}
  end
rescue Exception => e
  Ajax.error(e)
end
