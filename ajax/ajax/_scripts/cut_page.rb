# encoding: UTF-8
=begin

  Script qui découpe une page de la partition originale, selon les
  "lignes de coupe" fournies, pour produire les systèmes


  NOTES
  -----
      [1] Tandis que CUTLINES_DATA ne contient que les sections de systèmes
          à découper, ALL_CUTLINES_TOPS contient TOUTES les lignes de coupe
          qui ont été dessinées, même celle qui permettent de supprimer du
          "blanc" entre des systèmes.
      [2] Table qui définit :left et :right, respectivement les marges à
          prendre en compte à gauche et à droite.

=end

# Pour récupérer la valeur "code" transmise en donnée
# Par exemple par
CUTLINES_DATA     = Ajax.param(:data)
ALL_CUTLINES_TOPS = Ajax.param(:cutlines_top) # [1]
VLINES_DATA       = Ajax.param(:vlines) # [2]
CURRENT_ANALYSE   = Ajax.param(:current_analyse)
CURRENT_PAGE      = Ajax.param(:page)

begin

  # On enregistre ces lignes de coupe pour la page courante
  SCORE = Score.new(CURRENT_ANALYSE)
  DATA = SCORE.data
  DATA.merge!(pages: {}) unless DATA.key?(:pages)
  DATA[:pages].merge!( CURRENT_PAGE => {}) unless DATA[:pages].key?(CURRENT_PAGE)
  DATA[:pages][CURRENT_PAGE].merge!(cutlines: CUTLINES_DATA, all_cutlines: ALL_CUTLINES_TOPS, vlines: VLINES_DATA)
  SCORE.set(DATA)

  # séparation en pixels entre les système
  SYSTEMS_SEPARATOR = SCORE.data[:systems_separator] || 200

  # Table pour enregistrer les données utiles des systèmes,
  # c'est-à-dire leur height à présent que les systèmes ne sont
  # plus assemblés.
  SYSTEMS_DATA = {}

  require_relative 'cutlib/cut_page'
  res = proceed_crop_score_ini
  log("res (retour de proceed_crop_score_ini) : #{res.inspect}::#{res.class}")

  Ajax << {ok: true, res: res.inspect, data: CUTLINES_DATA}

rescue Exception => e
  Ajax.error(e)
end
