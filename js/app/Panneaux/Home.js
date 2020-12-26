'use strict'

const ROSE_DES_VENTS = ['top','left','bottom','right']

class PanneauHome extends Panneau {

constructor() {
  super('home')
}


async onActivate(){
  __in(`${this.ref}#onActivate`)
  // await ( this.isPrepared || preparePanneauHome() /* segment */)
  await ( this.isPrepared || runSegment("préparation du panneau HOME", "preparePanneauHome", window.preparePanneauHome.bind(window), true /*output*/))
  this.setInterface.bind(this)
  __out(`${this.ref}#onActivate`)
}

/**
* Réinitialise toutes les valeurs de la page d'accueil, en vue d'une
* création d'analyse, et désactive les boutons d'enregistrement (tant qu'on
* n'a pas défini une nouvelle analyse)
***/
resetForm(){
  __in(`${this.ref}#resetForm`)
  SCORE_ANALYZE_FULL_PROPS.forEach(id => $(`#score-${id}`).val(''))
  // On désactive les boutons qui permettent d'enregistrer
  Panneau.get('home').buttonsSaveData.each((i,o) => o.disabled = true)
  __out(`${this.ref}#resetForm`)
}

/**
* Retourne toutes les valeurs présentes sur la page d'accueil (sauf les
* valeurs de préférences — pour le moment)
***/
getAllValuesInHomePane(){
  __in(`${this.ref}#getAllValuesInHomePane`)
  const d = {}
  SCORE_ANALYZE_FULL_PROPS.forEach(prop => {
    Object.assign(d, {[prop]: $(`#score-${prop}`).val().trim()})
  })
  // Checkbox
  SCORE_ANALYZE_FULL_PROPS.forEach(prop => $(`#score-${prop}`).val(data[prop]))
  // Réglage des préférences binaires
  for ( var k in PREFS_DATA.binary ) {
    for ( var kp in PREFS_DATA.binary[k].items ) {
      const ditem = PREFS_DATA.binary[k].items[kp]
      const value = document.querySelector(`#cb-${kp}`).checked
      Object.assign(d, {[`${k}.${kp}`]: value})
    }
  }
  __out(`${this.ref}#getAllValuesInHomePane`, {return: d})
  return d
}

/**
* Réglage de la page d'accueil pour la partition courante
***/
setAllValuesInHomePane(score){
  __in(`${this.ref}#setAllValuesInHomePane`, {score:score})
  const sPrefs  = score.preferences
  const data    = score.data

  // Réglage des titre, compositeur, etc.
  SCORE_ANALYZE_FULL_PROPS.forEach(prop => $(`#score-${prop}`).val(data[prop]))

  // Réglage des préférences binaires (CB)
  for ( var k in PREFS_DATA.binary ) {
    const section = PREFS_DATA.binary[k]
    for ( var kp in section.items ) {
      const ditem = section.items[kp]
      const value = sPrefs.binary(`${k}.${kp}`)
      document.querySelector(`#cb-${kp}`).checked = value
    }
  }

  /**
  * Réglages des préférences "divers"
  ***/
  for (var k in PREFS_DATA.divers){
    document.querySelector(`#pref-divers-${k}`).value = sPrefs.divers(k)
  }

  __out(`${this.ref}#setAllValuesInHomePane`)
}


setInterface(){
  document.body.style.width = '1040px'
}

/**
* On positionne les éléments de première page suivant les valeurs par
* défaut en les rendant déplaçable.
***/
preparePreferencesFirstPage(){
  const my = this
  Object.keys(PREFS_DATA.first_page).forEach(prop => {
    $(`div#pref-${prop}`)
      .draggable({stop: my.onStopMoveScoreProp.bind(my, prop)})
  })
}

/**
* Toutes les préférences checkbox (binary) avec les valeurs par défaut
***/
buildCheckboxesPreferences(){
  __in(`${this.ref}#buildCheckboxesPreferences`)
  for ( var k in PREFS_DATA.binary ) {
    const section = PREFS_DATA.binary[k]
    const div   = DCreate('DIV', {class:'prefs-section-checkbox'})
    const titre = DCreate('DIV', {text:section.titre, class:"prefs-section-checkbox-titre"})
    div.appendChild(titre)
    for ( var kp in section.items ) {
      const ditem   = section.items[kp]
      const dinput  = {type:'checkbox', id:`cb-${kp}`}
      const value   = Preferences.getBinaryDefault(`${k}.${kp}`)
      value && Object.assign(dinput, {checked: true})
      const cb = DCreate('DIV', {class:'prefs-checkbox-container', inner:[
          DCreate('INPUT', dinput)
        , DCreate('LABEL', {for:`cb-${kp}`, text:ditem.name})
      ]})
      div.appendChild(cb)
    }
    $('#preferences-binaires').append(div)
  }
  __out(`${this.ref}#buildCheckboxesPreferences`)
}

/**
* Toutes les préférences diverses
***/
buildPreferencesDiverses() {
  for (var k in PREFS_DATA.divers){
    const dpref   = PREFS_DATA.divers[k]
    const defVal  = Preferences.getDiversDefault(k)
    const div = DCreate('DIV', {id: `div-pref-${k}`, class:'row pref-divers', inner:[
        DCreate('SPAN', {class:'libelle', text: dpref.name})
      , DCreate('SPAN', {class:'value', inner: [
          DCreate('INPUT', {type:'text', id:`pref-divers-${k}`, value:defVal})
        ]})
      , DCreate('SPAN', {class:'unity', text: (dpref.unity || '')})
    ]})
    $('div#preferences-divers').append(div)
  }
}

/**
* Préparation du premier système témoin sur la première page témoin, qui
* permet de définir où se positionneront les [lignes de pose]
***/
buildFirstSystemTemoin(){
  $('#temoin-first-system').css('top', px(PREFS_DATA.first_page.first_system_top))
  $('img#img-system-temoin')[0].src = 'img/system-exemple.jpg'

  // Attente du chargement de l'image du système témoin (pour les préférences
  // de positionnement des [lignes de pose])
  return new Promise((ok,ko) => {
    $('img#img-system-temoin')
      .on('load', ev => {
        // On prend la hauteur de l'image
        const imgHeight = $('img#img-system-temoin').height()
        __add(`Hauteur de l'image du système témoin = ${imgHeight}px`)
        // On définit le top des lignes d'objets d'analyse
        for ( var otype in PREFS_DATA.lignes) {
          var top = PREFS_DATA.lignes[otype]
          if ( top >= 0 ) top += imgHeight
          $(`div#pref-line-${otype}`).css('top', `${top}px`).draggable({axis:'y'})
        }
        ok()
      })
      .on('error', ko)
  })
}

/**
* Préparation du menu qui contient toutes les analyses trouvées dans le
* dossier _score_ en racine de l'application.
***/
async prepareMenuAnalyses(){
  var ret = await Ajax.send('get_all_analysis.rb')
  // __add("Retour Ajax de la liste des analyses " + JSON.stringify(ret.analyses), `${this.ref}#prepareMenuAnalyses`)
  ret.analyses.splice(0,0,{folder:'none', titre:'Choisir l’analyse…'})
  ret.analyses.forEach(dana => {
    $('#analyses').append(DCreate('OPTION', {value: dana.folder, text: dana.titre}))
  })
}

/**
* Méthode qui met les titre, compositeur, analyste, etc. dans les champs
* du tableau Home
***/
fillInfosScoreFields(){
  const score   = Score.current
  SCORE_ANALYZE_PROPS.forEach(prop => {
    score.data[prop] && $(`.oeuvre-${prop} span.value`).html(score.data[prop])
  })
}

/**
* Méthode qui positionne les éléments de première page (titre, compositeur,
* etc.) sur le panneau d'accueil
***/
positionneElementsFirstPage(score){
  __in(`${this.ref}#positionneElementsFirstPage`)
  const sPrefs = score.preferences
  Object.keys(PREFS_DATA.first_page).forEach(prop => {
    const dprop = sPrefs.first_page(prop)
    let dcss = {}
    ROSE_DES_VENTS.forEach(pos => {dprop[pos] && Object.assign(dcss, { [pos]: dprop[pos]})})
    $(`div#page-temoin div#pref-${prop}`).css(px(dcss))
  })
  __out(`${this.ref}#positionneElementsFirstPage`)
}

positionneLignes(score){
  __in(`${this.ref}#positionneLignes`)
  const sPrefs = score.preferences
  // Position du premier système
  $('#temoin-first-system').css('top', px(sPrefs.first_page('first_system_top')) )
  const imgHeight = $('#temoin-first-system').height()
  console.log("imgHeight = %i", imgHeight)

  // On définit le top des lignes d'objets d'analyse
  for ( var otype in PREFS_DATA.lignes) {
    let top = sPrefs.ligne(otype)
    if ( top >= 0 ) top += imgHeight
    $(`div#pref-line-${otype}`).css('top', px(top))
  }
  __out(`${this.ref}#positionneLignes`)
}


get buttonsSaveData(){ return $('.btn-save-analyse-data') }

/**
* Observation du panneau d'accueil (panneau d'information de la partition)
***/
observe(){
  __in(`${this.ref}#observe`)
  super.observe()
  this.buttonsSaveData.on('click', this.onClickSaveButton.bind(this))
  $('.btn-reset-data').on('click', this.resetForm.bind(Score))
  $('#btn-load-analyse-data').on('click', this.onClickLoadButton.bind(this))
  $('#btn-prepare-score').on('click', this.onClickPrepareButton.bind(this))

  // Boutons pour enregistrer les préférences ou revenir
  // aux préférences par défaut
  // Note : une class car plusieurs boutons
  $('button.btn-save-preferences').on('click', this.onClickSavePreferences.bind(this))
  $('button.btn-revenir-prefs-default').on('click', this.onClickRevenirPrefsDefault.bind(this))

  // Quand on choisit une analyse dans le menu des analyses
  $('#analyses').on('change', this.onChooseAnalyse.bind(this))
  this.observed = true
  __out(`${this.ref}#observe`, {panneau:this.name, observed: this.observed})
}

getScoreName(){
  const AnalyseFolder = $('input#score-folder_name').val()
  if ( AnalyseFolder == '' ) return erreur("Il faut définir le nom du dossier d'analyse ! (même s'il n'existe pas encore)")
  else return AnalyseFolder
}

/** ---------------------------------------------------------------------
*   EVENT METHODS

Toutes les méthodes qui réagissent aux évènements et notamment les
méthode 'on click' des boutons du panneau d'accueil (infos du score)

*** --------------------------------------------------------------------- */

/**
* Méthode appelée quand on choisit une analyse dans le menu
* Note : ça ne la change que lorsqu'elle est différente de l'analyse
* courante.
* Note : c'est un début de segment de programme.
***/
async onChooseAnalyse(ev){
  __start("Choix d'une analyse dans le menu", 'onChooseAnalyse')
  const folder = $('#analyses').val()
  const score = Score.current
  $('#analyses').val('none')
  if (score && folder == score.folder_name){return message("C'est l'analyse courante !")}
  await openAnalyse(folder, {setCurrent: true})
  __end("Fin du choix de l'analyse à voir", 'onChooseAnalyse', {output:true})
}

/**
Méthode appelée quand on finit de déplacer un élément comme
le titre, le compositeur, etc.
Elle permet d'ajuster les éléments en respectant ces règles :
  - si un élément se trouve à moins de 20 pixels à droite ou à gauche,
    l'élément se cale dessus
  - l'élément se cale verticalement sur une des lignes "repères" en
    fonctionne de line-height
***/
onStopMoveScoreProp(prop, ev){
  const pos = $(`div#pref-${prop}`).position()

  // Ajustement du left
  const left = pos.left
  let newCss = {}
  SCORE_ANALYZE_PROPS.forEach(cprop => {
    if (cprop == prop) return ;
    const cleft = $(`div#pref-${cprop}`).position().left
    if ( Math.abs(cleft - left) < 32 ) {
      console.debug("Élément %s ajusté à %i", prop, cleft)
      newCss.left = `${cleft}px`
    }
  })

  // Ajustement du top
  const top = pos.top
  const goodTop = parseInt(top / BASELINE_HEIGHT, 10) * BASELINE_HEIGHT
  if ( top != goodTop ) {
    newCss.top = goodTop
    console.debug("Hauteur de %s : %i. Rectifié à %i.", prop, top, goodTop)
  }

  // On ajute l'élément
  $(`div#pref-${prop}`).css(newCss)
}
/**
* Enregistrement des préférences
***/
onClickSavePreferences(ev){
  if ( !Score.current ) return erreur("Il faut définir l'analyse.")

  // Pour mettre les préférences à enregistrer
  const Prefs = Score.current.preferences
  const scorePrefs = Prefs.data
  // On compare avec les valeurs par défaut pour ne prendre que celles
  // qui sont différentes.
  const sPrefs = PREFS_DATA

  // On aura besoin de la hauteur de l'image pour le positionnement
  // des éléments sous le système témoin
  const imgHeight = $('img#img-system-temoin').height()

  /**
  * Enregistrement des valeurs checkbox (binaires)
  *
  * Avant de changer quoi que ce soit, on prend la valeur de
  * export.use_segment_line pour updater l'interface (espaces entre systèmes,
  * visibilité du bouton "Segment", etc.) en cas de changement
  ***/
  const oldUseSegmentLine = Prefs.binary('export.use_segment_line')
  for (var k in sPrefs.binary) {
    const dsection = sPrefs.binary[k]
    for (var kp in dsection.items) {
      const cb = $(`input#cb-${kp}`)[0]
      scorePrefs.binary[`${k}.${kp}`] = cb.checked
    }
  }
  const newUseSegmentLine = Prefs.binary('export.use_segment_line')

  SCORE_ANALYZE_PROPS.forEach(prop => {
    const valPref = Prefs.first_page(prop)
    const valCur  = $(`div#pref-${prop}`).position()
    console.debug("Comparaison de %s (ancienne) et %s (nouvelle)", JSON.stringify(valPref), JSON.stringify(valCur))
    if ( valPref == valCur ) {
      console.debug("La propriété %s est différente de la valeur par défaut.")
      scorePrefs.first_page[prop] = null
    } else {
      scorePrefs.first_page[prop] = valCur
    }
  })

  for ( var otype in sPrefs.lignes) {
    const valPref = Prefs.ligne(otype)
    let valCur  = $(`div#pref-line-${otype}`).position().top
    if ( valCur >= 0 ) valCur -= imgHeight ;
    if ( valCur == valPref ) {
      scorePrefs.lignes[otype] = null
    } else {
      scorePrefs.lignes[otype] = valCur
    }
  }
  // On enregistre ces nouvelles valeurs
  Prefs._data = scorePrefs
  Score.current.save()

  /**
  * Modifications immédiates à faire en cas de changement de préférences
  ***/
  if ( oldUseSegmentLine != newUseSegmentLine ) {
    AObjectToolbox.setBoutonSegment()
    ASystem.repositionneAll()
  }
}

/**
* Retour aux préférences par défaut
***/
onClickRevenirPrefsDefault(ev){
  if(!CURRENT_ANALYSE)return erreur("Il faut au préalable définir l'analyse.")
  console.warn("Il faut implémenter le retour aux préférences par défaut")
}

/**
* Quand on clique le bouton pour préparer la partition, c'est-à-dire
* en faire des pages exploitables par la découpe.
* Par la même occasion, cette méthode enregistre le chemin d'accès au
* fichier original qui vient peut-être d'être défini.
***/
onClickPrepareButton(ev){
  const score_path = $('#score-score_ini_path').val().trim()
  if ( score_path == "" ) return erreur("Il faut définir le chemin d'accès à la partition ou au dossier contenant les pages classées de la partition.")
  message("Préparation de la partition…")
  Ajax.send('prepare_score.rb', {score_path: score_path})
  .then(this.confirmationPartitionPrepared.bind(this))
}
confirmationPartitionPrepared(ret){
  message(`Partition préparée (nombre de pages : ${ret.page_count}). Tu peux passer à la coupe.`)
  Panneau.get('crop').open()
}

onClickSaveButton(ev){
  Score.current.getValuesAndSave()
}

/**
* Quand on clique sur le bouton pour charger/créer l'analyse
***/
async onClickLoadButton(ev){
  __in(`${this.ref}#onClickLoadButton`)
  const folder = this.getScoreName()
  // if ( folder ) {
  //   await openAnalyse(folder, {setCurrent: true})
  // }
  folder && (await openAnalyse(folder, {setCurrent: true}))
  __end(`${this.ref}#onClickLoadButton`)
}

showHelp(){
  message("Je dois afficher l'aide pour l'analyse")
}


}
