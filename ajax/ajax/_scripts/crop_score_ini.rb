# encoding: UTF-8
=begin

  Script qui découpe la partition originale, pour former une nouvelle
  partition aérée où chaque système est séparé par un nombre

=end

# Pour récupérer la valeur "code" transmise en donnée
# Par exemple par
CROP_LINES_DATA = Ajax.param(:data)
CURRENT_ANALYSE = Ajax.param(:current_analyse)
PAGE = Ajax.param(:page) || 1

begin

  # On enregistre ces lignes de découpe
  SCORE = Score.new(CURRENT_ANALYSE)
  DATA = SCORE.data
  DATA.merge!(pages: {}) unless DATA.key?(:pages)
  DATA[:pages].merge!( PAGE => {}) unless DATA[:pages].key?(PAGE)
  DATA[:pages][PAGE].merge!(crop_lines: CROP_LINES_DATA)
  SCORE.set(DATA)

  # séparation en pixels entre les système
  SYSTEMS_SEPARATOR = SCORE.data[:systems_separator] || 200
  # On va profiter pour enregistrer les données utiles des systèmes courants,
  # c'est-à-dire leur top, height et ligne médiane
  SYSTEMS_DATA = {}

  require_relative 'crop_score/crop'
  res = proceed_crop_score_ini
  log("res (retour de proceed_crop_score_ini) : #{res.inspect}::#{res.class}")
  if res
    # On peut procéder au montage des systèmes
    require_relative 'crop_score/assemble_systems'
    if assemble_systems
      DATA[:pages][PAGE].merge!(systems_data: SYSTEMS_DATA)
      SCORE.set(DATA)
      Ajax << {systems_data: SYSTEMS_DATA}
    end
  end

  Ajax << {ok: true, res: res.inspect, data: CROP_LINES_DATA}

rescue Exception => e
  Ajax.error(e)
end
