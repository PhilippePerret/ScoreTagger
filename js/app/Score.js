'use strict';

const SCORE_ANALYZE_PROPS = ['title', 'composer','composing-year','analyze-year', 'analyst', 'incipit']
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
      return Ajax.send('get_data.rb')
      .then(this.initializeWithData.bind(this))
    } else {
      return new Promise((ok,ko) => {ok()})
    }
  }

  static initializeWithData(ret){
    $('#analyse_folder_name').val(CURRENT_ANALYSE)
    this.current = new Score(ret.data)
    this.current.dispatchData()
  }

/** ---------------------------------------------------------------------
  *
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */

constructor(data) {
  this._data = data || {}
}

// Sauvegarde les données générales de la partition (titre, auteur,
// chemin d'accès, date, etc.)
save(callback){
  Ajax.send('save_data.rb', {data: this.data}).then(ret => {
    message("Données de l'analyse enregistrées.")
    callback && callback.call()
  })
}

/**
* Pour démarrer la sauvegarde automatique des données d'analyse
* Cette méthode est déclenchée quand on active le panneau d'analyse
***/
startAutosave(){
  console.log("-> Score#startAutosave")
  this.saveTimer = setInterval(this.autosave.bind(this), 10 * 1000)
}
/**
* Pour arrêter la sauvegarde automatique des données d'analyse,
* particulièrement des systèmes (et donc objets d'analyse)
* Cette méthode est déclenchée quand on quitte le panneau de sauvegarde.
***/
stopAutosave(){
  console.log("-> Score#stopAutosave")
  clearInterval(this.saveTimer)
  delete this.saveTimer
  this.saveTimer = null
}

/**
* Sauvegarde automatique (quand analyse)
*
* Principe : on passe en revue tous les systèmes et on enregistre ceux
* qui ont été modifiés.
***/
autosave(){
  if ( ASystem.items ) {
    Object.values(ASystem.items).forEach(system => system.modified && system.save() )
  }
}

/**
* Préférences (objet de type Preferences)
***/
get preferences(){return this._prefs || (this._prefs = new Preferences(this))}

/**
* Méthode pour imprimer la partition analysée
*
* @rappel : il y a deux modes d'impression :
*   1. par l'impression (Imprimer…) du navigateur. Le résultat sera
*      une partition avec les pages délimitées
*   2. par l'exportation ("Exporter au format PDF…") qui produira un
*      PDF avec une (très) longue page unique.
* Cette méthode lance la méthode 1.
***/
print(){
  Panneau.setCurrent('analyse')
  window.print()
}

/**
* Méthode qui récupère les données sur la page principale (titre, auteur, etc.)
* et les enregistre dans le fichier data.yml de la partition.
***/
getValuesAndSave(){
  if(this.getValuesInFields()){this.save()}
}

/**
* Retourne les valeurs des champs de données de la page principale
* (normalement : en vue de leur enregistrement)
***/
getValuesInFields(){
  this._data.folder_name = $('input#analyse_folder_name').val()
  if ( this._data.folder_name == "" ) {
    return erreur("Il faut indiquer le nom de l'analyse !")
  }
  this._data.score_ini_path = $('input#analyse_partition_path').val()
  if ( this._data.score_ini_path == ""){
    return erreur("Il faut indiquer le chemin d'accès à la partition originale !")
  }
  // Les valeurs options des titre, compositeur, etc.
  SCORE_ANALYZE_PROPS.forEach(prop => {
    Object.assign(this._data, {[prop]: $(`#score-${prop}`).val().trim()})
  })
  // On récupère les valeurs de préférences
  this.preferences.getValuesInFields()
  this._data.preferences = this.preferences.getData()

  // Pour poursuivre
  return true
}

/**
* Méthode qui place les données dans les fenêtres/onglets
***/
dispatchData(){
  this.score_is_prepared = this.data.score_is_prepared
  $('input#analyse_folder_name').val(CURRENT_ANALYSE)
  $('input#analyse_partition_path').val(this.data.score_ini_path)
  // Les valeurs options des titre, compositeur, etc.
  SCORE_ANALYZE_PROPS.forEach(prop => $(`#score-${prop}`).val(this.data[prop]))
  // Préférences
}


get data(){ return this._data }

getData(){
  Ajax.send('get_data.rb').then(ret => {
    if ( ret.error ) { ret.data = {} }
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

/**
========== DESSIN DE LA PARTITION SUR LA TABLE D'ANALYSE ==========

Les méthodes suivantes permettent de dessiner la partition et son analyse
sur la table d'analyse
***/

/**
* Méthode générale qui dessine la partition analysée.
*
* @note : il existe deux instances possibles :
*   1. la partition a déjà été préparée (systèmes séparés et enregistrés)
*   2. la partition vient d'être découpée (systèmes non séparés/préparés)
***/
draw(){
  console.debug("-> Score#draw / isDrawn est %s", this.isDrawn?'true':'false')
  console.debug("   Score#score_is_prepared ? %s", this.score_is_prepared?'oui':'non')
  TableAnalyse.resetAll()
  const loadingMethod = this.score_is_prepared
                    ? this.loadSystemsPrepared.bind(this)
                    : this.loadSystemsNonPrepared.bind(this) ;


  loadingMethod.call()
    .then(this.instanciateAndPoseAllSystems.bind(this))
    .then(this.positionneAndDrawSystems.bind(this))
    .then(this.finDrawing.bind(this))
    .catch(window.erreur.bind(window))

}

/**
* Méthode procédant à l'instanciation de tous les systèmes de la partition
* et leur affichage dans la page, pour le moment, sans les positionner et sans
* créer leurs objets (s'ils en ont)
* @note   Dans tous les cas (partition préparée ou non), il faut le faire
***/
instanciateAndPoseAllSystems(ret){
  const dataSystems = ret.data
  return new Promise((ok,ko) => {
    // console.log("dataSystems: ", dataSystems)
    this.systems = []
    dataSystems.forEach(dsys => {
      const system = new ASystem(dsys)
      system.build()
      this.systems.push(system)
    })
    this.checkImagesLoading(ok)
  })
}

/**
* Toutes les secondes on va checker pour voir si les images sont chargées
***/
checkImagesLoading(ok){
  if ( ! this.loadingTimer ) {
    this.loadingTimer = setInterval(this.checkImagesLoading.bind(this, ok), 500)
  } else {
    console.log("Vérification du chargement des images…")
    var imagesLoading = false // un a priori
    this.systems.forEach( system => {
      if ( imagesLoading ) return ; // pour accélérer
      if ( false == system.imageLoaded ) imagesLoading = true
    })
    if ( !imagesLoading ) {
      // Les images sont toutes chargées
      clearInterval(this.loadingTimer)
      this.loadingTimer = null
      console.log("Les images sont toutes chargées.")
      ok()
    }
  }
}

positionneAndDrawSystems(){
  if ( ! this.score_is_prepared ) {
    console.debug("Calcul de la position de chaque système…")
    for(var isys in this.systems){
      const system = this.systems[isys]
      if ( isys > 0 ) system.prevSystem = this.systems[isys - 1]
      TableAnalyse.calcSystemPos(system)
      system.modified = true
    }
  }
  this.systems.forEach(system => {
    system.positionne()
    system.draw()
  })
}

/**
* Cette méthode calcule la position des systèmes avant de les afficher
* Elle fonctionne en deux temps :
*   Temps #1 :  Affichage de tous les systèmes dans la page (pour pouvoir
*               mesurer leur hauteur sur la table d'analyse)
*   Temps #2 :  Calcul des valeurs minimales
***/
calculateDataSystems(data){
  console.log("-> Score#calculateDataSystems")
  return this.afficheAllSystems().then( data => {
    return new Promise((ok,ko) => {
      const dataSystems = []
      const data_pages = data.data_pages
      var index = 0
      for ( var ipage in data_pages ){
        const dpage = data_pages[ipage]
        const data_cutlines = dpage.cutlines
        console.log("data_cutlines:", data_cutlines)
        for ( var isys = 0, len = data_cutlines.length - 1; isys < len ; ++ isys  ) {
          const dcut = data_cutlines[isys]
          const prevSystemData = isys > 0 ? dataSystems[isys - 1] : null
          Object.assign(dcut, {score: this, ipage: ipage, isystem: (1 + Number(isys)), index: index++, prevSystemData: prevSystemData})
          dataSystems.push(TableAnalyse.calcSystemPos(dcut))
        }
      }
      ok()
    })
  })
}

finDrawing(ret){
  console.debug("=== Fin du dessin des systèmes ===")
  this.isDrawn = true
}

/**
* Si la partition n'est pas encore préparée, on charge seulement les
* données de coupe des systèmes (mais en fait, le script get_data_cutlines.rb
* prépare les données de telle sorte qu'elles contiennent toutes les propriétés
* que les systèmes contiendront lorsqu'ils seront préparés)
***/
loadSystemsNonPrepared(){
  return Ajax.send('get_data_cutlines.rb')
}

/**
* Si la partition est préparée, on charge les données complètes des systèmes
***/
loadSystemsPrepared(){
  return Ajax.send('load_all_systems.rb')
}

}//class Score
