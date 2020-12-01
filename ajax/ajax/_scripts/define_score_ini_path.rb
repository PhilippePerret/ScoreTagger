# encoding: UTF-8
=begin

  Script qui sauve le code de l'analyse courante

=end

# Pour récupérer la valeur "code" transmise en donnée
# Par exemple par
score_ini_path  = Ajax.param(:path)

begin

  if File.exists?(score_ini_path)


    score_ini_name = "score_ini#{File.extname(score_ini_path)}"

    # On enregistre ce path dans les données du score
    Score.set(score_ini_path: score_ini_path)
    
    dst = File.join(SCORE_FOLDER,score_ini_name)
    FileUtils.copy(score_ini_path, dst)
    Ajax << {
      message: "Le chemin d'accès à la partition a été enregistré.",
      score_ini_name: score_ini_name
    }
  else
    Ajax << {error: "La partition '#{score_ini_path}' est introuvable…"}
  end

rescue Exception => e
  Ajax.error(e)
end
