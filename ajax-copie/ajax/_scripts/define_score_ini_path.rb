# encoding: UTF-8
=begin

  Script qui sauve le code de l'analyse courante

=end
CURRENT_ANALYSE = Ajax.param(:current_analyse)
PAGE = Ajax.param(:page) || 1

begin
  score_ini_path  = Ajax.param(:path)

  if File.exists?(score_ini_path)

    if File.directory?(score_ini_path)
      # Quand le path est celui d'un dossier, ce dossier doit contenir toutes
      # les feuilles des partitions qu'il faut assembler en une seule image
      # pour la découper ensuite
      # NON : on procède par page et on assemble tout à la fin
      Ajax << {error: "On ne peut pas encore fournir de dossier."}

    else

      score = Score.new(CURRENT_ANALYSE)
      # On enregistre ce path dans les données du score
      pages = scores.data[:pages] || {}
      pages.merge!( PAGE => {}) if not pages.key?(PAGE)
      pages[PAGE].merge!(score_ini_path: score_ini_path)
      score.set(pages: pages)

      FileUtils.mkdir_p(File.join(score.folder, 'pages'))
      FileUtils.copy(score_ini_path, score.page_path(PAGE))
      Ajax << {
        message: "Le chemin d'accès à la partition a été enregistré."
      }
    end
  else
    Ajax << {error: "La partition '#{score_ini_path}' est introuvable…"}
  end

rescue Exception => e
  Ajax.error(e)
end
