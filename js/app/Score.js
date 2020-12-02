'use strict';

class Score {
  static get current(){ return this._current || (this._current = new Score())}
  static set current(v){ this._current = v }


  constructor(data) {
    this.scoreIniPath = null // chemin d'accès à la partition originale
    this._data = data || {}
  }

  // Sauvegarde les données générales de la partition
  save(callback){
    Ajax.send('save_data.rb', {data: this.data}).then(ret => {
      if(ret.error)erreur(ret.error)
      else {
        message("Données de l'analyse enregistrées.")
        if ('function' == typeof(callback)) callback.call()
      }
    })
  }

  /**
    * Méthode qui place les données dans les fenêtres/onglets
  ***/
  dispatchData(){
    $('input#analyse_folder_name').val(CURRENT_ANALYSE)
    $('input#analyse_partition_path').val(this.data.score_ini_path)
  }

  getValuesAndSave(){
    if(this.getValuesInFields()){this.save()}
  }

  getValuesInFields(){
    this._data.folder_name    = $('input#analyse_folder_name').val()
    if ( this._data.folder_name == "" ) {
      return erreur("Il faut indiquer le nom de l'analyse !")
    }
    this._data.score_ini_path = $('input#analyse_partition_path').val()
    if ( this._data.score_ini_path == ""){
      return erreur("Il faut indiquer le chemin d'accès à la partition originale !")
    }
    return true
  }


  get data(){ return this._data }

  getData(){
    Ajax.send('get_data.rb')
    .then(ret => {
      if (ret.error){
        erreur(ret.error)
        ret.data = {}
      }
      this._data = ret.data
    })
  }

  /**
    * Méthode qui lance la découpe de la partition originale d'après
    * les lignes de découpe définies dans +cropLinesData+
  ***/
  crop(cropLinesData, callback){
    Ajax.send('crop_score_ini.rb', {data: cropLinesData, page: 1})
    .then(callback)
  }
}
