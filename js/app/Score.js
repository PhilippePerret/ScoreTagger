'use strict';

const SCORE_ANALYZE_PROPS = ['title', 'composer','composing_year','analyze_year', 'analyst', 'tune', 'incipit']

const SCORE_ANALYZE_FULL_PROPS = [...SCORE_ANALYZE_PROPS]
SCORE_ANALYZE_FULL_PROPS.push('folder_name','score_ini_path')

// Hauteur exacte d'une page
const HEIGHT_PAGE = 1065 // (= 28,7cm => marge de 0.5 cm)

class Score {

static get current(){ return this._current }
static setCurrent(score){ this._current = score }


/**
* On initialise la classe avec les données qui sont remontée. Mais il se
* peut que ces données n'existe pas quand CURRENT_ANALYSE est défini avec
* une partition qui n'existe plus. MAIS dans la nouvelle version, il y a
* toujours une analyse remontée.
* Retourne l'instance du score (mais il pourrait être récupéré par Score.current)
***/
static async initCurrentWithData(data){
  __in('Score::initCurrentWithData', {data: data})
  CURRENT_ANALYSE = data.folder_name
  await this.setCurrent(new Score({name:CURRENT_ANALYSE}))
  await this.current.dispatchData(data)
  __out('Score::initCurrentWithData')
  return this.current
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

/**
* Retourne les valeurs des champs de données de la page principale
* (normalement : en vue de leur enregistrement)
***/
getValuesInFields(){
  this._data = Panneau.get('home').getAllValuesInHomePane()
  // On ajoute les préférences actuelles
  this._data.preferences = this.preferences.data
  // Pour poursuivre
  return true
}

/**
* Dispatche les données du score (à son instanciation)
***/
async dispatchData(data){
  __in(`${this.ref}#dispatchData`)
  this._data = data
  this.isPrepared = this.data.isPrepared
  this.preferences.setData(this.data.preferences)
  __out(`${this.ref}#dispatchData`)
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
sur la table d'analyse.

***/

/**
* @révisée
*
* Si la partition est préparée, on charge les données complètes des systèmes
*
* Retourne les données de tous les systèmes
***/
async loadSystemsPrepared(){
  __in("Score#loadSystemsPrepared")
  const retour = await Ajax.send('load_all_systems.rb')
  __out("Score#loadSystemsPrepared", {data_systems: retour.data})
  return retour.data
}

/**
* Construction des titre, compositeur, etc. en fonction des données et
* des préférences
***/
drawFirstPage(){
  __in(`${this.ref}#drawFirstPage`)
  let divHeight = 0
  SCORE_ANALYZE_PROPS.forEach(prop => {
    if ( ! this.data[prop] ) return ;
    if ( prop == 'tune' ) return ;
    var elements = []
    if (['analyst','analyze_year'].includes(prop)){
      const libelle = prop == 'analyst' ? 'analyste' : 'année'
      elements.push(DCreate('SPAN', {class:'libelle', text:libelle}))
    }
    elements.push(DCreate('SPAN', {class:'value', text:this.data[prop]}))
    const dome = DCreate('DIV', {id: `score-${prop}`, class:`oeuvre-${prop}`,
      inner:elements})
    TableAnalyse.systemsContainer.append(dome)
    $(dome).css(px(this.preferences.first_page(prop)))
  })
  __out(`${this.ref}#drawFirstPage`)
}

/**
* @révisée
*
* Méthode procédant à l'instanciation de tous les systèmes de la partition
*
***/
async instanciateAllSystems(dataSystems){
  __in(`${this.ref}#instanciateAllSystems`)
  this.systems = []
  dataSystems.forEach(dsys => this.systems.push(new ASystem(dsys)))
  __out(`${this.ref}#instanciateAllSystems`)
}

async loadAllImageSystems(){
  __in(`${this.ref}#loadAllImageSystems`)
  return new Promise((ok,ko) => {
    var nombreImagesRest = this.systems.length
    this.systems.forEach(system => {
      const img = new Image()
      img.onload = ev => {
        if ((--nombreImagesRest) == 0) {
          __out(`${this.ref}#loadAllImageSystems`)
          ok()
        }
      }
      img.src = system.imageSrc
      system.preloadedImg = img
    })
  })
}

async poseAllSystems(){
  __in(`${this.ref}#poseAllSystems`)
  this.systems.forEach(system => system.build())
  __out(`${this.ref}#poseAllSystems`)
}
/**
* @révisée
*
* Quand on a posé les systèmes sur la table d'analyse, ensuite, on les
* position et on les dessine, c'est-à-dire qu'on crée leurs objets
***/
async positionneAndDrawSystems(){
  __in(`${this.ref}#positionneAndDrawSystems`)
  this.systems.forEach(system => system.positionneAndDraw())
  __out(`${this.ref}#positionneAndDrawSystems`)
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
    this.systems.forEach(system => $(system.obj).find('.numero-mesure').addClass('hidden'))
  }
  __out('Score#setNumerosFirstMesures')
}

finDrawing(ret){
  __in("Score#finDrawing")
  this.isDrawn = true
  __out("Score#finDrawing")
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
* Méthode qui se charge d'attendre que toutes les images des systèmes soient
* chargées. C'est nécessaire pour pouvoir dessiner leurs objets.
* OBSOLÈTE : maintenant, on lance le dessin du système que lorsque l'image
* chargée.
*
***/
async checkImagesLoading(){
  __in('Score#checkImagesLoading')
  if ( ! this.loadingTimer ) {
    this.loadingTimer = setInterval(this.checkImagesLoading.bind(this), 500)
  } else {
    var imagesLoading = false // un a priori
    this.systems.forEach( system => {
      if ( imagesLoading ) return ; // pour accélérer
      if ( false == system.imageLoaded ) imagesLoading = true
    })
    if ( ! imagesLoading ) {
      // Les images sont toutes chargées
      clearInterval(this.loadingTimer)
      this.loadingTimer = null
      __add("Images toutes chargées", "Score#checkImagesLoading")
      console.log("Images toutes chargées", "Score#checkImagesLoading")
      __out('Score#checkImagesLoading')
    }
  }
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


get name(){
  return this._name || (this._name = this.data.name || this.data.folder_name)
}

/**
* Les données générales enregistrées
***/
get data(){ return this._data }

/**
* Analyse (classe Analyse)
* Pour le moment, ne sert que pour jouer l'analyse
***/
get analyse(){return this._analyse || (this._analyse = new Analyse(this))}

get pref_auto_save(){
  return this.preferences.binary('analyse.autosave')
}
get pref_apercu_tonal(){
  return this.preferences.binary('export.apercu_tonal')
}
get pref_no_ligne_segment(){
  return false === this.preferences.binary('export.use_segment_line')
}

/**
* Préférences (objet de type Preferences)
***/
get preferences(){return this._prefs || (this._prefs = new Preferences(this))}

}//class Score
