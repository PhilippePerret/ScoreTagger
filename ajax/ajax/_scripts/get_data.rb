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
    if score.exists?
      if File.exists?(score.data_file_path)
        Ajax << { data: score.data }
      else
        Ajax << {error: "Le fichier des données n'existe pas… Il faut redéfinir les éléments…"}
      end
    else
      Ajax << {error: "L'analyse “#{CURRENT_ANALYSE}” est introuvable (dans _score_)."}
    end
  end
rescue Exception => e
  Ajax.error(e)
end
