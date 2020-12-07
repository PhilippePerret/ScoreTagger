# encoding: UTF-8
# frozen_string_literal: true
=begin
  Script qui retourne les données du score courant
=end
begin
  CURRENT_ANALYSE = Ajax.param(:current_analyse)
  CURRENT_PAGE    = Ajax.param(:num)
  if CURRENT_ANALYSE == nil || CURRENT_ANALYSE.empty?
    Ajax << { error: "Aucune analyse n'est définie. Consultez l'aide pour savoir comment la définir."}
  else
    score = Score.new(CURRENT_ANALYSE)
    if File.exists?(score.data_file_path)
      data_page = score.data.key?(:pages) ? (score.data[:pages][CURRENT_PAGE.to_i]||score.data[:pages][CURRENT_PAGE.to_s]): nil
      Ajax << {data_page: data_page}
    else
      Ajax << {error: "Aucun fichier de données… Il faut redéfinir les éléments…"}
    end
  end
rescue Exception => e
  Ajax.error(e)
end
