# encoding: UTF-8
=begin

  Script qui découpe la partition originale, pour former une nouvelle
  partition aérée où chaque système est séparé par un nombre

=end

# Pour récupérer la valeur "code" transmise en donnée
# Par exemple par
CROP_LINES_DATA = Ajax.param(:data)
SCORE_INI_PATH  = Ajax.param(:score_ini_path)

begin

  # On enregistre ces lignes de découpe
  Score.set(crop_lines: CROP_LINES_DATA)

  require_relative 'crop_score/crop'
  res = proceed_crop_score_ini
  log("res (retour de proceed_crop_score_ini) : #{res.inspect}::#{res.class}")
  if res
    # On peut procéder au montage des systèmes
    require_relative 'crop_score/assemble_systems'
    assemble_systems
  end

  Ajax << {ok: true, res: res.inspect, data: CROP_LINES_DATA, data_class: CROP_LINES_DATA.class}

rescue Exception => e
  Ajax.error(e)
end
