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
      data_pages = score.data[:pages]
      data_all_cutlines = []
      index_system = 0
      data_pages.each do |ipage, dpage|
        dpage[:cutlines].each_with_index do |dcutline, idx|
          # On passe le dernier qui n'a pas de hauteur
          break if dcutline['height'].nil?
          minid = "p#{ipage}-s#{(idx + 1).to_s.rjust(2,'0')}"
          data_all_cutlines << dcutline.merge(indexInPage:idx, page: ipage, top: nil, top_on_page: dcutline.delete('top'), height_on_page:dcutline.delete('height'), minid: minid, index: index_system, rHeight:nil, fullHeight:nil, bottom_limit:nil)
          index_system += 1
        end
      end
      Ajax << {data: data_all_cutlines}
    else
      Ajax << {error: "Aucun fichier de données… Il faut redéfinir les éléments…"}
    end
  end
rescue Exception => e
  Ajax.error(e)
end
