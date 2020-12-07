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
  const cPrefs = Score.current.preferences
  // Les titres, auteurs, etc.
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
  $('#btn-save-preferences').on('click', this.onClickSavePreferences.bind(this))
  $('#btn-revenir-prefs-default').on('click', this.onClickRevenirPrefsDefault.bind(this))

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
    const valPref = cPrefs[otype] ;
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
