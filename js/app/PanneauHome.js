'use strict'

const ROSE_DES_VENTS = ['top','left','bottom','right']

class PanneauHome extends Panneau {

constructor() {
  super('home')
}

async onActivate(){
  __in(`${this.ref}#onActivate`)
  await this.ObserveOnFirstActivation()
  await this.setInterface.bind(this)
  __out(`${this.ref}#onActivate`)
}

setInterface(){
  document.body.style.width = '1040px'
}

async ObserveOnFirstActivation(){
  __in(`${this.ref}#ObserveOnFirstActivation`)
  this.observed || (await this.prepareAndObserve());
  __out(`${this.ref}#ObserveOnFirstActivation`)
}

async prepareAndObserve(){
  __in(`${this.ref}#prepareAndObserve`)
  await this.prepare()
  this.observe()
  __out(`${this.ref}#prepareAndObserve`)
}

/**
* Préparation de la page d'accueil
*
* Cette prépartion consiste à disposer les éléments sur la
* page témoin pour pouvoir définir les positions des lignes
* et des éléments comme les titres, etc.
***/
async prepare(){
  __in(`${this.ref}#prepare`)
  const my = this

  this.preparePreferencesFirstPage()

  this.preparePreferencesCheckboxes()

  this.preparePreferencesDiverses()

  await this.prepareFirstSystemTemoin()

  await this.prepareMenuAnalyses()

  __out(`${this.ref}#prepare`)
}// prepare

/**
* On positionne les éléments de première page suivant les valeurs par
* défaut en les rendant déplaçable.
***/
preparePreferencesFirstPage(){
  const my = this
  Object.keys(PREFS_DEFAULT_VALUES.first_page).forEach(prop => {
    $(`div#pref-${prop}`)
      .draggable({stop: my.onStopMoveScoreProp.bind(my, prop)})
  })
}

preparePreferencesCheckboxes(){
  /**
  * Toutes les préférences checkbox (binary) avec les valeurs par défaut
  ***/
  for(var k in PREFS_DEFAULT_VALUES.binary){
    const section = PREFS_DEFAULT_VALUES.binary[k]
    const div = DCreate('DIV', {class:'prefs-section-checkbox'})
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
}

/**
* Toutes les préférences diverses
***/
preparePreferencesDiverses() {
  for (var k in PREFS_DEFAULT_VALUES.divers){
    const dpref   = PREFS_DEFAULT_VALUES.divers[k]
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
prepareFirstSystemTemoin(){
  $('#temoin-first-system').css('top', px(PREFS_DEFAULT_VALUES.first_page.first_system_top))
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
        for ( var otype in PREFS_DEFAULT_VALUES.lignes) {
          var top = PREFS_DEFAULT_VALUES.lignes[otype]
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
* Préparation du panneau pour une partition donnée
***/
async preparePanneauForCurrentScore(){
  const score   = Score.current
  const cPrefs  = score && score.preferences

  /**
  * Les titre, compositeurs, etc. (seulement si )
  * On renseigne leur valeur si elles sont définies
  ***/
  SCORE_ANALYZE_PROPS.forEach(prop => {
    score.data[prop] && $(`.oeuvre-${prop} span.value`).html(score.data[prop])
  })

  /**
  * On repositionne les titres, compositeurs, etc. en fonction des
  * préférence du score
  ***/
  Object.keys(PREFS_DEFAULT_VALUES.first_page).forEach(prop => {
    const dprop = cPrefs.first_page(prop)
    let dcss = {}
    ROSE_DES_VENTS.forEach(pos => {dprop[pos] && Object.assign(dcss, { [pos]: dprop[pos]})})
    $(`div#pref-${prop}`).css(dcss)
  })

  /**
  * Toutes les préférences checkbox (binary) avec les valeurs par défaut
  ***/
  for ( var k in PREFS_DEFAULT_VALUES.binary ) {
    const section = PREFS_DEFAULT_VALUES.binary[k]
    for ( var kp in section.items ) {
      const checked = score.preferences.binary(`${k}.${kp}`)
      document.querySelector(`input[type="checkbox"]#cb-${kp}`).checked = checked
    }
  }

  /**
  * Réglages des préférences "divers"
  ***/
  for (var k in PREFS_DEFAULT_VALUES.divers){
    document.querySelector(`pref-divers-${k}`).checked = cPrefs.divers(k)
  }

  // Position du premier système
  $('#temoin-first-system').css('top', `${cPrefs.first_page('first_system_top')}px`)

  // On définit le top des lignes d'objets d'analyse
  for ( var otype in PREFS_DEFAULT_VALUES.lignes) {
    let top = cPrefs.ligne(otype)
    if ( top >= 0 ) top += imgHeight
    $(`div#pref-line-${otype}`).css('top', `${top}px`)
  }

  return true
}

get buttonsSaveData(){ return $('.btn-save-analyse-data') }

/**
* Observation du panneau d'accueil (panneau d'information de la partition)
***/
observe(){
  __in(`${this.ref}#observe`)
  super.observe()
  this.buttonsSaveData.on('click', this.onClickSaveButton.bind(this))
  $('.btn-reset-data').on('click', Score.resetForm.bind(Score))
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
  const AnalyseFolder = $('input#analyse_folder_name').val()
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
  $('#analyses').val('none')
  if ( Score.current && folder == Score.current.folder_name ) {
    message("C'est l'analyse courante !")
  } else {
    // Score.resetForm()
    await openAnalyse(folder, {setCurrent: true})
  }
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
  if(!CURRENT_ANALYSE)return erreur("Il faut au préalable définir l'analyse.")

  // Pour mettre les préférences à enregistrer
  const Prefs = Score.current.preferences
  const scorePrefs = Prefs.data
  // On compare avec les valeurs par défaut pour ne prendre que celles
  // qui sont différentes.
  const cPrefs = PREFS_DEFAULT_VALUES

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
  for (var k in cPrefs.binary) {
    const dsection = cPrefs.binary[k]
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

  for ( var otype in cPrefs.lignes) {
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
  Prefs.data = scorePrefs
  Score.current.save()

  /**
  * Modifications immédiates à faire en cas de changement de préférences
  ***/
  if ( oldUseSegmentLine != newUseSegmentLine ) {
    AObjectToolbox.setBoutonSegment()
    Score.current.repositionneAllSystems()
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
  const score_path = $('#analyse_partition_path').val().trim()
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
