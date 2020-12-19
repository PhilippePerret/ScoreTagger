'use strict';

const SCORE_ANALYZE_PROPS = ['title', 'composer','composing_year','analyze_year', 'analyst', 'tune', 'incipit']
// Hauteur exacte d'une page
const HEIGHT_PAGE = 1065 // (= 28,7cm => marge de 0.5 cm)

class Score {

static get current(){ return this._current }
static setCurrent(score){ this._current = score }

/**
* Réinitialise toutes les valeurs de la page d'accueil, en vue d'une
* création d'analyse.
***/
static resetForm(){
  const l = ['analyse_folder_name', 'analyse_partition_path']
  l.forEach(id => $(`#${id}`).val(''))
  SCORE_ANALYZE_PROPS.forEach(id => $(`#score-${id}`).val(''))
  // On désactive les boutons qui permettent d'enregistrer
  Panneau.get('home').buttonsSaveData.each((i,o) => o.disabled = true)
}

/**
* Retourne toutes les valeurs présentes sur la page d'accueil (sauf les
* valeurs de préférences — pour le moment)
***/
static getAllValuesInHomePage(){
  __in('Score::getAllValuesInHomePage')
  const d = {}
  Object.assign(d, {
      folder_name: $('input#analyse_folder_name').val().trim()
    , score_ini_path: $('input#analyse_partition_path').val().trim()
  })
  // Les valeurs options des titre, compositeur, etc.
  SCORE_ANALYZE_PROPS.forEach(prop => {
    Object.assign(d, {[prop]: $(`#score-${prop}`).val().trim()})
  })
  __out('Score::getAllValuesInHomePage')
  return d
}

/**
* Initialisation de la partition (au chargement de l'application)
***/
static initialize(){
  const my = this
  __in("Score::initialize")
  // __add("CURRENT_ANALYSE = " + (CURRENT_ANALYSE?CURRENT_ANALYSE:"-non définie-"))
}

/**
* On initialise la classe avec les données qui sont remontée. Mais il se
* peut que ces données n'existe pas quand CURRENT_ANALYSE est défini avec
* une partition qui n'existe plus. MAIS dans la nouvelle version, il y a
* toujours une analyse remontée.
***/
static initializeWithData(ret){
  __in('Score::initializeWithData', {data: ret.data})
  const my = this
  return new Promise((ok,ko) => {
    CURRENT_ANALYSE = ret.data.folder_name // dans le cas où celle demandée n'aurait pas été trouvée
    my.setCurrent(new Score({name:ret.data.folder_name}))
    my.current.dispatchData(ret.data)
      .then(ASync_out('Score::initializeWithData'))
      .then(ok)
  })
}

/** ---------------------------------------------------------------------
  *
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */

constructor(data) {
  this._data = data || {}
}


get ref(){ return this._ref || (this._ref = `Score[${this.name}]`)}
get modified(){return this._modified}
set modified(v){
  this._modified = v
  TableAnalyse.voyantSave.css('background-color', v?'red':'green')
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
  __in("Score#startAutosave")
  this.saveTimer = setInterval(this.autosave.bind(this), 10 * 1000)
  message("Sauvegarde automatique enclenchée.")
  __out("Score#startAutosave")
}
/**
* Pour arrêter la sauvegarde automatique des données d'analyse,
* particulièrement des systèmes (et donc objets d'analyse)
* Cette méthode est déclenchée quand on quitte le panneau de sauvegarde.
***/
stopAutosave(){
  __in("Score#stopAutosave")
  clearInterval(this.saveTimer)
  delete this.saveTimer
  this.saveTimer = null
  message("Sauvegarde automatique arrêtée.")
  __out("Score#stopAutosave")
}

/**
* Sauvegarde automatique (quand analyse)
*
* Principe : on passe en revue tous les systèmes et on enregistre ceux
* qui ont été modifiés.
***/
autosave(){
  __in("Score#autosave")
  const my = this
  if ( ASystem.items ) {
    Object.values(ASystem.items).forEach(system => system.modified && system.save() )
    my.modified = false
  }
  __out("Score#autosave")
}

/**
* Analyse (classe Analyse)
* Pour le moment, ne sert que pour jouer l'analyse
***/
get analyse(){return this._analyse || (this._analyse = new Analyse(this))}

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
  if(this.getValuesInFields()) {
    this.save()
    UI.setInterface()
  }
}

get folder_name(){ return $('input#analyse_folder_name').val().trim() }
get score_ini_path(){ return $('input#analyse_partition_path').val().trim() }

/**
* Retourne les valeurs des champs de données de la page principale
* (normalement : en vue de leur enregistrement)
***/
getValuesInFields(){
  this._data = this.constructor.getAllValuesInHomePage()
  // On ajoute les préférences actuelles
  this._data.preferences = this.preferences.data
  // Pour poursuivre
  return true
}

/**
* Méthode qui place les données dans les fenêtres/onglets
***/
dispatchData(data){
  __in(`${this.ref}#dispatchData`)
  return new Promise((ok,ko) => {
    this._data = data
    this.score_is_prepared = this.data.score_is_prepared
    // Valeurs panneau Home
    this.dispatchDataOnPanneauHome()
    // Préférences
    this.preferences.setData(this.data.preferences)
    __out(`${this.ref}#dispatchData`)
    ok()
  })
}

dispatchDataOnPanneauHome(){
  __in(`${this.ref}#dispatchDataOnPanneauHome`)
  $('input#analyse_folder_name').val(CURRENT_ANALYSE)
  $('input#analyse_partition_path').val(this.data.score_ini_path)
  SCORE_ANALYZE_PROPS.forEach(prop => $(`#score-${prop}`).val(this.data[prop]))
  __out(`${this.ref}#dispatchDataOnPanneauHome`)
}


get data(){ return this._data }

getData(){
  Ajax.send('get_data.rb').then(ret => {
    if ( ret.error ) { ret.data = {} }
    this._data = ret.data
    this.preferences.data = ret.data.preferences
    // console.debug("this.preferences.data:", this.preferences.data)
  })
}

/**
* Méthode qui lance la découpe de la page de partition originale d'après
* les lignes de découpe définies dans +cropLinesData+
***/
cutPage(numPage, cropLinesData, cutLinesTops, vlines, callback){
  Ajax.send('cut_page.rb', {data: cropLinesData, cutlines_top:cutLinesTops, vlines:vlines, page: numPage})
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
*
***/
draw(){
  __in("Score#draw", {isDraw: this.isDraw, score_is_prepared:this.score_is_prepared})
  const loadingMethod = this.score_is_prepared
                    ? this.loadSystemsPrepared.bind(this)
                    : this.loadSystemsNonPrepared.bind(this) ;


  return loadingMethod.call()
    .then(this.instanciateAndPoseAllSystems.bind(this))
    .then(this.positionneAndDrawSystems.bind(this))
    .then(this.finDrawing.bind(this))
    .catch(window.erreur.bind(window))
}

/**
* Méthode qui calcule le numéro de première mesure de chaque système
* et le marque (le span se trouve déjà dans le système)
*
* Note : ce numéro est affiché si les préférences le demandent (affiché
* par défaut)
***/
setNumerosFirstMesures(){
  __in('Score#setNumerosFirstMesures')
  if ( this.preferences.binary('score.numero_mesure')) {
    var num = 1
    let showAlert = false
    this.systems.forEach(system => {
      system.numero_first_mesure = num
      $(system.obj).find('.numero-mesure')
        .removeClass('hidden')
        .html(num)
      if ( undefined == system.nombre_mesures ) showAlert = true
      num += system.nombre_mesures || 3
    })
    if ( showAlert && !this.alertLakeNombreMesureShown ) {
      message("Pour avoir un numérotage de mesure juste, il faut définir<br>le nombre de mesures par système en cliquant sur le numéro<br>de la première mesure.")
      this.alertLakeNombreMesureShown = true
    }
  } else {
    // Si les préférences déterminent qu'il ne faut pas de numéro,
    // on les masques
    this.systems.forEach(system => {
      $(system.obj).find('.numero-mesure').addClass('hidden')
    })
  }
  __out('Score#setNumerosFirstMesures')
}

/**
* Méthode procédant à l'instanciation de tous les systèmes de la partition
* et leur affichage dans la page, pour le moment, sans les positionner et sans
* créer leurs objets (s'ils en ont)
* @note   Dans tous les cas (partition préparée ou non), il faut le faire
***/
instanciateAndPoseAllSystems(ret){
  __in('Score#instanciateAndPoseAllSystems')
  const my = this
  const dataSystems = ret.data
  return new Promise((ok,ko) => {
    // console.log("dataSystems: ", dataSystems)
    my.systems = []
    dataSystems.forEach(dsys => {
      const system = new ASystem(dsys)
      system.build()
      my.systems.push(system)
    })
    my.checkImagesLoading(ok)
  })
}

/**
* Quand on a posé les systèmes sur la table d'analyse, ensuite, on les
* position et on les dessine, c'est-à-dire qu'on crée leurs objets
***/
positionneAndDrawSystems(){
  __in('Score#positionneAndDrawSystems')
  if ( ! this.score_is_prepared ) {
    this.calcPositionAllSystems()
  }
  this.systems.forEach(system => {
    system.positionne()
    system.draw()
  })
  __out('Score#positionneAndDrawSystems')
}

/**
* Pour repositionner les systèmes quand ils ont déjà été dessinés sur la
* table d'analyse.
* Cette méthode est appelée par exemple lorsque l'on change les préférences
* au niveau des lignes à prendre en compte
***/
repositionneAllSystems(){
  __in('Score#repositionneAllSystems')
  this.calcPositionAllSystems()
  this.systems.forEach(system => system.repositionne())
  __out('Score#repositionneAllSystems')
}

calcPositionAllSystems(){
  __in('Score#calcPositionAllSystems')
  for(var isys in this.systems){
    const system = this.systems[isys]
    if ( isys > 0 ) system.prevSystem = this.systems[isys - 1]
    TableAnalyse.calcSystemPos(system)
    system.modified = true
  }
  __out('Score#calcPositionAllSystems')
}

/**
* Toutes les secondes on va checker pour voir si les images sont chargées
***/
checkImagesLoading(ok){
  __in('Score#checkImagesLoading')
  if ( ! this.loadingTimer ) {
    this.loadingTimer = setInterval(this.checkImagesLoading.bind(this, ok), 500)
  } else {
    var imagesLoading = false // un a priori
    this.systems.forEach( system => {
      if ( imagesLoading ) return ; // pour accélérer
      if ( false == system.imageLoaded ) imagesLoading = true
    })
    if ( !imagesLoading ) {
      // Les images sont toutes chargées
      clearInterval(this.loadingTimer)
      this.loadingTimer = null
      __add("Images toutes chargées", "Score#checkImagesLoading")
      __out("Score#instanciateAndPoseAllSystems")//parce que ça met fin à ça
      ok()
    }
  }
}

finDrawing(ret){
  __in("Score#finDrawing")
  this.setNumerosFirstMesures()
  this.isDrawn = true
  __out("Score#finDrawing")
}

/**
* Si la partition n'est pas encore préparée, on charge seulement les
* données de coupe des systèmes (mais en fait, le script get_data_cutlines.rb
* prépare les données de telle sorte qu'elles contiennent toutes les propriétés
* que les systèmes contiendront lorsqu'ils seront préparés)
***/
loadSystemsNonPrepared(){
  __in("Score#loadSystemsNonPrepared")
  return Ajax.send('get_data_cutlines.rb')
}

/**
* Si la partition est préparée, on charge les données complètes des systèmes
***/
loadSystemsPrepared(){
  __in("Score#loadSystemsPrepared")
  return Ajax.send('load_all_systems.rb')
}

get name(){
  return this._name || (this._name = this.data.name || this.data.folder_name)
}

}//class Score
