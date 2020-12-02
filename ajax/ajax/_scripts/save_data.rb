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
