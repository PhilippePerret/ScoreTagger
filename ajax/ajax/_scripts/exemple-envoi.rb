# encoding: UTF-8
=begin

  Script qui sauve le code de l'analyse courante

=end

# Pour récupérer la valeur "code" transmise en donnée
# Par exemple par
valeur  = Ajax.param(:donnee)

begin

  Ajax << {valeur_transmise: valeur}

rescue Exception => e
  Ajax.error(e)
end
