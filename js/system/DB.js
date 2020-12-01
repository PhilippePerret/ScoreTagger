'use strict'
class DB {
  /**
    Procède à la sauvegarde complète de la base de données
  **/
  static backupDB(ev, dbname){
    dbname = dbname || App.DBName
    dbname || raise("Il faut définir le nom de la base de données dans App.DBName")
    const confirmation = `Voulez-vous procéder au backup complet de la base ${dbname}`
    if ( confirm(confirmation) ) {
      Ajax.send('system/db-backup.rb', {dbname: dbname})
      .then(onAjaxSuccess).catch(onError)
    }
  }
}
