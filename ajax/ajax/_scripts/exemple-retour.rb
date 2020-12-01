# encoding: UTF-8
=begin

  Script qui sauve le code de l'analyse courante

=end

begin

  res = db_exec('SELECT * FROM societes')

  Ajax << {returned_value: res}

rescue Exception => e
  Ajax.error(e)
end
