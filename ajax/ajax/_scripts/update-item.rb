# encoding: UTF-8

begin
  table   = Ajax.param(:table)
  values  = Ajax.param(:values)
  item_id = Ajax.param(:item_id)

  values.merge!('updated_at' => Time.now.to_i)

  valeurs = []
  assigns = values.collect do |k,v|
    valeurs << v
    "#{k} = ?"
  end.join(', ')
  request = "UPDATE #{table} SET #{assigns} WHERE id = #{item_id}"
  db_exec(request, valeurs)

  Ajax << {
    table:    table,
    values:   values,
    operation: "Actualisation de l'item ##{item_id} dans la table #{table}",
    request:  request,
    valeurs:  valeurs,
    error:    MyDB.error
  }

rescue Exception => e
  Ajax.error(e)
end
