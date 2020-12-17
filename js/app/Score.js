'use strict';

const SCORE_ANALYZE_PROPS = ['title', 'composer','composing_year','analyze_year', 'analyst', 'tune', 'incipit']
// Hauteur exacte d'une page
const HEIGHT_PAGE = 1065 // (= 28,7cm => marge de 0.5 cm)

class Score {

static get current(){ return this._current || (this._current = new Score())}
static set current(v){ this._current = v }

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
  const d = {}
  Object.assign(d, {
      folder_name: $('input#analyse_folder_name').val().trim()
    , score_ini_path: $('input#analyse_partition_path').val().trim()
  })
  // Les valeurs options des titre, compositeur, etc.
  SCORE_ANALYZE_PROPS.forEach(prop => {
    Object.assign(d, {[prop]: $(`#score-${prop}`).val().trim()})
  })
  return d
}

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
  console.log("ret:", ret)
  CURRENT_ANALYSE = ret.data.folder_name
  $('#analyse_folder_name').val(CURRENT_ANALYSE)
  this.current = new Score(ret.data)
  this.current.dispatchData()
  UI.setInterface()
}

/** ---------------------------------------------------------------------
  *
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */

constructor(data) {
  this._data = data || {}
}

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
  console.log("-> Score#startAutosave")
  this.saveTimer = setInterval(this.autosave.bind(this), 10 * 1000)
  message("Sauvegarde automatique enclenchée.")
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
  message("Sauvegarde automatique arrêtée.")
}

/**
* Sauvegarde automatique (quand analyse)
*
* Principe : on passe en revue tous les systèmes et on enregistre ceux
* qui ont été modifiés.
***/
autosave(){
  const my = this
  if ( ASystem.items ) {
    Object.values(ASystem.items).forEach(system => system.modified && system.save() )
    my.modified = false
  }
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
dispatchData(){
  this.score_is_prepared = this.data.score_is_prepared
  $('input#analyse_folder_name').val(CURRENT_ANALYSE)
  $('input#analyse_partition_path').val(this.data.score_ini_path)
  // Les valeurs optionnelles des titre, compositeur, etc.
  SCORE_ANALYZE_PROPS.forEach(prop => $(`#score-${prop}`).val(this.data[prop]))
  // Préférences
  this.preferences.data = this.data.preferences
}


get data(){ return this._data }

getData(){
  Ajax.send('get_data.rb').then(ret => {
    if ( ret.error ) { ret.data = {} }
    this._data = ret.data
    console.debug("Data score: ", this.data)
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
  console.debug("-> Score#draw / isDrawn est %s", this.isDrawn?'true':'false')
  console.debug("   Score#score_is_prepared ? %s", this.score_is_prepared?'oui':'non')
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
}

/**
* Méthode procédant à l'instanciation de tous les systèmes de la partition
* et leur affichage dans la page, pour le moment, sans les positionner et sans
* créer leurs objets (s'ils en ont)
* @note   Dans tous les cas (partition préparée ou non), il faut le faire
***/
instanciateAndPoseAllSystems(ret){
  console.log("-> instanciateAndPoseAllSystems")
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
  console.debug("-> positionneAndDrawSystems")
  if ( ! this.score_is_prepared ) {
    console.log("On doit calculer la position de tous les systèmes.")
    this.calcPositionAllSystems()
  }
  this.systems.forEach(system => {
    system.positionne()
    system.draw()
  })
  console.debug("<- positionneAndDrawSystems")
}

/**
* Pour repositionner les systèmes quand ils ont déjà été dessinés sur la
* table d'analyse.
* Cette méthode est appelée par exemple lorsque l'on change les préférences
* au niveau des lignes à prendre en compte
***/
repositionneAllSystems(){
  console.debug("Repositionnement de tous les systèmes.")
  this.calcPositionAllSystems()
  this.systems.forEach(system => system.repositionne())
}

calcPositionAllSystems(){
  console.debug("Calcul de la position de chaque système…")
  for(var isys in this.systems){
    const system = this.systems[isys]
    if ( isys > 0 ) system.prevSystem = this.systems[isys - 1]
    TableAnalyse.calcSystemPos(system)
    system.modified = true
  }
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
      console.log("<- instanciateAndPoseAllSystems")//parce que ça met fin à ça
      ok()
    }
  }
}

//
// /**
// * Cette méthode calcule la position des systèmes avant de les afficher
// * Elle fonctionne en deux temps :
// *   Temps #1 :  Affichage de tous les systèmes dans la page (pour pouvoir
// *               mesurer leur hauteur sur la table d'analyse)
// *   Temps #2 :  Calcul des valeurs minimales
// ***/
// calculateDataSystems(data){
//   console.log("-> Score#calculateDataSystems")
//   return this.afficheAllSystems().then( data => {
//     return new Promise((ok,ko) => {
//       const dataSystems = []
//       const data_pages = data.data_pages
//       var index = 0
//       for ( var ipage in data_pages ){
//         const dpage = data_pages[ipage]
//         const data_cutlines = dpage.cutlines
//         // console.log("data_cutlines:", data_cutlines)
//         for ( var isys = 0, len = data_cutlines.length - 1; isys < len ; ++ isys  ) {
//           const dcut = data_cutlines[isys]
//           const prevSystemData = isys > 0 ? dataSystems[isys - 1] : null
//           Object.assign(dcut, {score: this, ipage: ipage, isystem: (1 + Number(isys)), index: index++, prevSystemData: prevSystemData})
//           dataSystems.push(TableAnalyse.calcSystemPos(dcut))
//         }
//       }
//       ok()
//     })
//   })
// }

finDrawing(ret){
  this.setNumerosFirstMesures()
  console.debug("<- Score.draw")
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
