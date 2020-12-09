'use strict'

const ROSE_DES_VENTS = ['top','left','bottom','right']

class PanneauHome extends Panneau {
  constructor() {
    super('home')
  }

  onActivate(){
    console.debug("Home activé")
    if (!this.observed){
      this.prepare()
      this.observe()
    }
    document.body.style.width = '1040px'
  }

/**
* Préparation de la page d'accueil
*
* Cette prépartion consiste à disposer les éléments sur la
* page témoin pour pouvoir définir les positions des lignes
* et des éléments comme les titres, etc.
***/
prepare(){
  const score   = Score.current
  const cPrefs  = score.preferences
  // Les titres, auteurs, etc.
  /**
  * Les titre, compositeurs, etc.
  *   1. On place les valeurs qui sont peut-être déjà connues
  *   2. On positionne les éléments suivant les dimensions données ou par
  *      défaut.
  ***/
  SCORE_ANALYZE_PROPS.forEach(prop => {
    score.data[prop] && $(`.oeuvre-${prop} span.value`).html(score.data[prop])
  })
  Object.keys(PREFS_DEFAULT_VALUES.first_page).forEach(prop => {
    const dprop = cPrefs.first_page(prop)
    let dcss = {}
    ROSE_DES_VENTS.forEach(pos => {
      dprop[pos] && Object.assign(dcss, { [pos]: dprop[pos]})
    })
    $(`div#pref-${prop}`)
      .css(dcss)
      .draggable({stop: this.onStopMoveScoreProp.bind(this, prop)})
  })

  /**
  * Toutes les préférences checkbox (binary)
  ***/
  for(var k in PREFS_DEFAULT_VALUES.binary){
    const section = PREFS_DEFAULT_VALUES.binary[k]
    const div = DCreate('DIV', {class:'prefs-section-checkbox'})
    const titre = DCreate('DIV', {text:section.titre, class:"prefs-section-checkbox-titre"})
    div.appendChild(titre)
    for ( var kp in section.items ) {
      const ditem = section.items[kp]
      const dinput = {type:'checkbox', id:`cb-${kp}`}
      const value = score.preferences.binary(`${k}.${kp}`)
      value && Object.assign(dinput, {checked: true})
      const cb = DCreate('DIV', {class:'prefs-checkbox-container', inner:[
          DCreate('INPUT', dinput)
        , DCreate('LABEL', {for:`cb-${kp}`, text:ditem.name})
      ]})
      div.appendChild(cb)
    }
    $('#preferences-binaires').append(div)
  }

  /**
  * Toutes les préférences diverses
  ***/
  for (var k in PREFS_DEFAULT_VALUES.divers){
    const dpref = PREFS_DEFAULT_VALUES.divers[k]
    const div = DCreate('DIV', {id: `div-pref-${k}`, class:'row pref-divers', inner:[
        DCreate('SPAN', {class:'libelle', text: dpref.name})
      , DCreate('SPAN', {class:'value', inner: [
          DCreate('INPUT', {type:'text', id:`pref-divers-${k}`, value: cPrefs.divers(k)})
        ]})
      , DCreate('SPAN', {class:'unity', text: (dpref.unity || '')})
    ]})
    $('div#preferences-divers').append(div)
  }

  // Position du premier système
  $('#temoin-first-system').css('top', `${cPrefs.first_page('first_system_top')}px`)
  $('img#img-system-temoin')[0].src = 'img/system-exemple.jpg'
  $('img#img-system-temoin').on('load', ev => {

    // On prend la hauteur de l'image
    const imgHeight = $('img#img-system-temoin').height()
    console.debug("Hauteur de l'image du système témoin = %ipx", imgHeight)

    // On définit le top des lignes d'objets d'analyse
    for ( var otype in PREFS_DEFAULT_VALUES.lignes) {
      let top = cPrefs.ligne(otype)
      if ( top >= 0 ) top += imgHeight
      $(`div#pref-line-${otype}`)
        .css('top', `${top}px`)
        .draggable({axis:'y'})
    }
  })

}// prepare

observe(){
  super.observe()
  $('.btn-save-analyse-data').on('click', this.onClickSaveButton.bind(this))
  $('#btn-load-analyse-data').on('click', this.onClickLoadButton.bind(this))
  $('#btn-prepare-score').on('click', this.onClickPrepareButton.bind(this))

  // Boutons pour enregistrer les préférences et revenir
  // aux préférences par défaut
  // Note : une class car plusieurs boutons
  $('button.btn-save-preferences').on('click', this.onClickSavePreferences.bind(this))
  $('button.btn-revenir-prefs-default').on('click', this.onClickRevenirPrefsDefault.bind(this))

  this.observed = true
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
  console.log("Placement de la propriété %s à %i", prop, left)
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
    console.debug("Comparaison de %i (ancienne) et %i (nouvelle)", valPref, valCur)
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
    PropsAObjectToolbox.setBoutonSegment()
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

  onClickLoadButton(ev){
    console.info("Je dois charger les données de l'analyse")

  }

  showHelp(){
    message("Je dois afficher l'aide pour l'analyse")
  }


}
