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
  elsif not ['.jpg','.png','.jpeg','.tiff'].include?(File.extname(data[:score_ini_path]))
    Ajax << {error: "La partition originale doit absolument être un fichier image. Or son extension est '#{File.extname(data[:score_ini_path])}'…"}
  else
    score = Score.new(CURRENT_ANALYSE)
    if not(score.exists?)
      FileUtils.mkdir_p(score.folder)
    end
    data = score.data.merge!(data)
    score.set(data)
  end
rescue Exception => e
  Ajax.error(e)
end
