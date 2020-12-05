'use strict';

const HEIGHT_PAGE = 1065 // (= 28,7cm => marge de 0.5 cm)

class Score {

  static get current(){ return this._current || (this._current = new Score())}
  static set current(v){ this._current = v }

  /**
  * Initialisation de la partition (au chargement de l'application)
  ***/
  static initialize(){
    const my = this
    if (CURRENT_ANALYSE){
      $('#analyse_folder_name').val(CURRENT_ANALYSE)
      return Ajax.send('get_data.rb').then(ret => {
        if (ret.error) erreur(ret.error)
        else {
          my.current = new Score(ret.data)
          my.current.dispatchData()
        }
      })
    } else {
      return new Promise((ok,ko) => {ok()})
    }
  }

  constructor(data) {
    this.scoreIniPath = null // chemin d'accès à la partition originale
    this._data = data || {}
  }

  // Sauvegarde les données générales de la partition (titre, auteur,
  // chemin d'accès, date, etc.)
  save(callback){
    Ajax.send('save_data.rb', {data: this.data}).then(ret => {
      if(ret.error)erreur(ret.error)
      else {
        message("Données de l'analyse enregistrées.")
        callback && callback.call()
      }
    })
  }

  /**
  * Procède à la sauvegarde des objets d'analyse lorsque c'est nécessaire
  * Ces données sont enregistrées dans le fichier `objets_analyse.yaml` du
  * dossier de l'analyse courante
  ***/
  saveObjetsAnalyse(callback){
    Ajax.send('save_objets_analyse.rb', {data: AObject.getAllObjectsData()})
    .then(ret => {
      if ( ret.error ) return erreur(ret.error)
      message("Les données des objets d'analyse ont été enregistrés.")
      callback && callback.call()
    })
  }

  /**
  * Chargement des objets d'analyse
  ***/
  loadObjetsAnalyse(callback){
    Ajax.send('get_data_objets').then(ret => {
      if ( ret.error ) return erreur(ret.error)
      this.dispatchObjetsAnalyse(ret.data)
      callback && callback.call()
    })
  }


  /**
  * Préférences
  ***/
  get preferences(){return this._prefs || (this._prefs = new Preferences(this))}

  /**
  * Méthode qui, après le chargement des données des objets d'analyse,
  * les dispatch dans AObject et les reconstruit
  ***/
  dispatchObjetsAnalyse(data){
    // TODO Régler AObject.lastId avec la valeur du dernier ID
    console.info("Je dois dispatcher les objets enregistrés")
  }


  // Méthode pour imprimer la partition analysée
  print(){
    Panneau.setCurrent('analyse')
    window.print()
  }
  /**
    * Méthode qui place les données dans les fenêtres/onglets
  ***/
  dispatchData(){
    $('input#analyse_folder_name').val(CURRENT_ANALYSE)
    $('input#analyse_partition_path').val(this.data.score_ini_path)
    // TODO Ajouter titre, auteur, date, etc.
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
    // On récupère les valeurs de préférences
    this.preferences.getValuesInFields()
    this._data.preferences = this.preferences.getData()

    // Pour poursuivre
    return true
  }

  get data(){ return this._data }

  getData(){
    Ajax.send('get_data.rb').then(ret => {
      if (ret.error){
        erreur(ret.error)
        ret.data = {}
      }
      this._data = ret.data
      this.preferences.setData(ret.data.preferences)
    })
  }

  /**
    * Méthode qui lance la découpe de la page de partition originale d'après
    * les lignes de découpe définies dans +cropLinesData+
  ***/
  cutPage(numPage, cropLinesData, callback){
    Ajax.send('cut_page.rb', {data: cropLinesData, page: numPage})
    .then(callback)
  }
}
