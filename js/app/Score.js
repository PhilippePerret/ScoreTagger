'use strict';

const TOP_PAGE = 1065

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

  /**
  * Méthode qui calcule les dimensions
  *
  * On part du principe qu'un système se présente sous cette forme : cf.
  * le manuel.
  * +data_systems+ Les données des systèmes de l'analyse
  ***/
  static calculateDim(data_systems){
    /**
    * D'abord, on a besoin de connaitre la hauteur moyenne des systèmes de
    * cette analyse. On prend tous les systèmes et on en calcule la hauteur
    * moyenne
    ***/
    if (undefined == data_systems){
      return Ajax.send('get_data_pages.rb').then(ret => {
        if (ret.error) return erreur(ret.error)
        Score.calculateDim(ret.data_pages)
      })
    }

    console.log("On va calculer la hauteur moyenne avec ", data_systems)

    var allheights = 0
    var nbrheights = 0
    for ( var ipage in data_systems ) {
      for ( var isys in data_systems[ipage] ) {
        allheights += data_systems[ipage][isys].height
        ++ nbrheights
      }
    }
    this.hauteur_system_moyenne = parseInt(allheight / nbrheights, 10)
    console.info("this.hauteur_system_moyenne = %i", this.hauteur_system_moyenne)

    /**
    * La première page étant particulière, on la traite à part : on considère
    * que trois systèmes seulement seront posés dessus et on les compte à
    * l'envers, en partant du dessous.
    ***/


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
    })
  }

  /**
    * Méthode qui lance la découpe de la partition originale d'après
    * les lignes de découpe définies dans +cropLinesData+
  ***/
  cutPage(numPage, cropLinesData, callback){
    Ajax.send('cut_page.rb', {data: cropLinesData, page: numPage})
    .then(callback)
  }
}
