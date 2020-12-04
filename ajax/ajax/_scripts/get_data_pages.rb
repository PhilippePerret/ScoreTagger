# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui retourne les données de toutes les pages du score courant
=end
begin
  CURRENT_ANALYSE = Ajax.param(:current_analyse)
  if CURRENT_ANALYSE == nil || CURRENT_ANALYSE.empty?
    Ajax << { error: "Aucune analyse n'est définie. Consultez l'aide pour savoir comment la définir."}
  else
    score = Score.new(CURRENT_ANALYSE)
    if File.exists?(score.data_file_path)
      data_pages = score.data.key?(:pages) ? score.data[:pages] : nil
      Ajax << {data_pages: data_pages}
    else
      Ajax << {error: "Aucun fichier de données… Il faut redéfinir les éléments…"}
    end
  end
rescue Exception => e
  Ajax.error(e)
end
