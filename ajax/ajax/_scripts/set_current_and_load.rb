# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script pour charger une analyse en la mettant en analyse courante
  et en la créant si nécessaire.
=end
# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui retourne les données du score courant
=end
begin
  DATA = Ajax.param(:data).to_sym
  log("DATA: #{DATA.inspect}")
  CURRENT_ANALYSE = DATA[:folder_name]
  score = Score.new(CURRENT_ANALYSE)
  if not score.exists?
    score.create(DATA)
    score_ini_path = DATA[:score_ini_path]
    if score_ini_path
      score.set(score_ini_path: score_ini_path)
      score.prepare_score_pages
    end
  end
  score.set_current
  if File.exists?(score.data_file_path)
    # Ajout pour compatibilité ascendante
    unless score.data.key?(:page_count)
      score.set(page_count: Dir["#{score.pages_score_folder}/*.jpg"].count)
    end
    Ajax << { data: score.data }
  else
    Ajax << { error: "Le fichier des données n'existe pas… Il faut redéfinir les éléments…" }
  end
rescue Exception => e
  Ajax.error(e)
end
