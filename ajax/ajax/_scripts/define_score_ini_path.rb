# encoding: UTF-8
=begin

  Script qui sauve le code de l'analyse courante

=end

# Pour récupérer la valeur "code" transmise en donnée
# Par exemple par
score_ini_path  = Ajax.param(:path)

begin

  if File.exists?(score_ini_path)
    Ajax << {message: "Le chemin d'accès à la partition a été enregistré."}
  else
    Ajax << {error: "La partition '#{score_ini_path}' est introuvable…"}
  end

rescue Exception => e
  Ajax.error(e)
end
