# encoding: UTF-8
=begin

  Destruction d'un élément

=end

begin
  dbname  = Ajax.param(:dbname) || (TESTS ? DB_NAME_TEST : DB_NAME)
  table   = Ajax.param(:table)
  item_id = Ajax.param(:item_id)

  MyDB.DBNAME = dbname
  request = "DELETE FROM #{table} WHERE id = ?"
  valeurs = [item_id]
  db_exec(request,valeurs)

  Ajax << {
    message: "Item ##{id} détruit dans #{dbname}.#{table}."
    error:   MyDB.error
  }

rescue Exception => e
  Ajax.error(e)
end
