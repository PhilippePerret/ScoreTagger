'use strict'


// Le panneau d'analyse est placé dans la constante TableAnalyse
class PanneauAnalyse extends Panneau {
  constructor() {
    super('analyse')
    this.currentNote = 'c'
  }

/**
* Réinitialise tout, comme par exemple au chargement d'une autre analyse
* @produit :
*   Détruit tous les systèmes courants
***/
resetAll(){
  $(this.systemsContainer).html('')
}

onActivate(){
  const score = Score.current
  const my = this
  console.debug("-> PanneauAnalyse#onActivate")
  document.body.style.width = null
  if(!this.observed){
    this.propsAObjectToolbox = new PropsAObjectToolbox()
    this.propsAObjectToolbox.setInterfaceForType('chord')
    this.propsAObjectToolbox.observe()
    this.observe()
  }

  if ( !score.isDrawn){
    /**
    * Si la partition n'est pas encore dessinée, il faut le faire
    * @rappel : la partition est présentée en un seul tenant maintenant,
    * quelle que soit sa longueur.
    ***/
    this.resetAll()
    this.drawFirstPage()
    score.draw().then(() => {
      my.drawPageDelimitors.call(my)
      this.pref_apercu_tonal && my.drawApercuTonal.call(my)
    })
  }

  this.pref_auto_save && score.startAutosave()

  console.debug("<- PanneauAnalyse#onActivate")
}

onDesactivate(){
  if ( this.pref_auto_save ) {
    Score.current.autosave() // une dernière fois
    Score.current.stopAutosave()
  }
}

get pref_auto_save(){return Score.current.preferences.binary('analyse.autosave') }
get pref_apercu_tonal(){return Score.current.preferences.binary('export.apercu_tonal') }

/**
* Construction des titre, compositeur, etc. en fonction des données et
* des préférences
***/
drawFirstPage(){
  console.log("-> PanneauAnalyse#drawFirstPage")
  const score = Score.current
  let divHeight = 0
  SCORE_ANALYZE_PROPS.forEach(prop => {
    if ( ! score.data[prop] ) return ;
    else {
      var elements = []
      if (['analyst','analyze_year'].includes(prop)){
        const libelle = prop == 'analyst' ? 'analyste' : 'année'
        elements.push(DCreate('SPAN', {class:'libelle', text:libelle}))
      }
      elements.push(DCreate('SPAN', {class:'value', text:score.data[prop]}))
      const dome = DCreate('DIV', {id: `score-${prop}`, class:`oeuvre-${prop}`,
        inner:elements})
      this.systemsContainer.append(dome)
      $(dome).css(with_pixels(score.preferences.first_page(prop)))
    }
  })
}

/**
* Méthode qui dessine les délimiteurs de pages en fonction de la hauteur
* complète de l'analyse
***/
drawPageDelimitors(){
  console.debug("-> drawPageDelimitors")
  const heightContainer = $(this.systemsContainer).height()
  console.debug("heightContainer = %i", heightContainer)
  var top = 0
  var ipage = 0
  while ( top < heightContainer ) {
    top += HEIGHT_PAGE
    if ( top > heightContainer ) break ;
    ++ ipage ;
    const line = DCreate('DIV', {class:'page-separator', style:`top:${top}px`, inner:[
      DCreate('SPAN', {class:'page_number', text: String(ipage)})
    ]})
    this.systemsContainer.appendChild(line)
    console.debug("Dessin d'un séparateur de page à %i", top)
  }
}

/**
* Pour dessiner, en annexe (i.e. à la fin de la partition analysée), un
* aperçu tonal, avec les tons voisins et les accidents
***/
drawApercuTonal(){
  const score = Score.current
  let tuneStr ;
  var vprov ; // pour mettre une valeur provisoire

  if ( ! score.data.tune ) {
    message("Pour obtenir un aperçu tonal en annexe d'analyse, il faut définir la tonalité de la pièce.<br>Je considère qu'elle est en F#m.")
    tuneStr = 'F#m'
  } else {
    tuneStr = score.data.tune
  }

  console.clear()

  const dTune = tuneStr.split('')
  let noteTune  = dTune.shift().toUpperCase()
  let alterTune = dTune.shift()
  if ( alterTune == 'd') alterTune = '#'
  let natureTune
  if ( ['#','b'].includes(alterTune) ) {
    natureTune = dTune.shift()
  } else {
    natureTune = alterTune
    alterTune = null
  }
  natureTune = natureTune || 'M'
  const isTonMajeur = natureTune == 'M'
  console.debug({note: noteTune, alter: alterTune, nature: natureTune})

  const TuneIndTon = TUNE_TO_INDICE_TON[noteTune]
  console.debug("TuneIndTon = %i", TuneIndTon)
  // L'indice demi-ton du ton
  const indiceDemitonTune = TUNE_TO_INDICE[noteTune]
  console.debug("indiceDemitonTune de %s = ", tuneStr, indiceDemitonTune)

  /**
  * Calcul du relatif (différent en majeur et en mineur)
  ***/
  console.debug("INDICE_TON_TO_TUNE = ", INDICE_TON_TO_TUNE)

  let RelatifIndTon ;
  if ( isTonMajeur ) {
    vprov = TuneIndTon - 2
    RelatifIndTon = vprov < 0 ? 7 - vprov : vprov
  } else {
    vprov = TuneIndTon + 2
    RelatifIndTon = vprov > 6 ? vprov - 7 : vprov
  }
  console.debug("RelatifIndTon = %i", RelatifIndTon)
  const noteRel = INDICE_TON_TO_TUNE[RelatifIndTon]
  console.debug("noteRel = %s", noteRel)
  // L'indice demi-ton du relatif
  const indiceDemitonRel = TUNE_TO_INDICE[noteRel]
  console.debug("indiceDemitonRel = %i", indiceDemitonRel)

  // Quelle distance y a-t-il entre le ton et le relatif normal ?
  var dist
  if ( indiceDemitonRel > indiceDemitonTune) {
    dist = indiceDemitonRel - indiceDemitonTune
  } else {
    dist = indiceDemitonTune - indiceDemitonRel
  }
  console.debug("Distance Ton <-> relatif naturel = % i", dist)
  // Faut-il altérer le relatif ?
  let alterRel
    , natureRel = natureTune == 'M' ? 'm' : 'M' ;
  if ( dist == 3 && !alterTune ) {
    // <= Tierce mineure entre les deux notes pures et pas d'altération au ton
    // => rien à faire
    alterRel = null
  } else if ( alterTune && dist == 3 ) {
    // Par exemple LA#m et DO# ou LAbm DOb
    alterRel = String(alterTune)
  } else {
    if ( isTonMajeur ) {
      // Si la tonalité est majeure, le relatif sera une tierce en dessous
      if ( alterTune == '#' && dist == 4 ) {
        // Rien à faire
        alterRel = 'x' // Par exemple LA# et FAx
      } else if (dist == 4 && !alterTune ) {
        alterRel = '#' // P.e. LA => FA#m
      }
    } else {
      // <= Le ton est mineur
      if ( dist == 4 && !alterTune ){
        alterRel = 'b' // p.e. FAm => Ab
      }
    }
  }
  console.debug("Ton relatif = %s", `${noteRel}${alterRel||''}${natureRel}`)

  /**
  * Traitement de la sous-dominante
  ***/
  vprov = TuneIndTon + 3
  const SDomIndTon = vprov < 7 ? vprov : 7 - vprov
  const noteSDom = INDICE_TON_TO_TUNE[SDomIndTon]
  const natureSDom = String(natureTune)
  let alterSDom ;
  if ( noteTune == 'F' ) {
    if ( alterTune == '#' ) { alterSDom = null }
    else if (alterTune == 'b') { alterSDom = 'bb' }
    else { alterSDom = 'b'}
  } else {
    alterSDom = String(alterTune)
  }
  console.debug("Sous-dominante = %s", `${noteSDom}${alterSDom||''}${natureSDom}`)

  /**
  * Traitement de la dominante
  ***/
  vprov = TuneIndTon + 4
  const DomIndTon = vprov < 7 ? vprov : 7 - vprov
  const noteDom = INDICE_TON_TO_TUNE[DomIndTon]
  const natureDom = 'M'
  let alterDom ;
  if ( noteTune == 'B' ) {
    if ( alterTune == '#' ) { alterDom = 'x' }
    else if (alterTune == 'b') { alterDom = null }
    else { alterDom = '#'}
  } else {
    alterDom = String(alterTune)
  }
  console.debug("Dominante = %s", `${noteDom}${alterDom||''}${natureDom}`)

  const filenames = {
      'Tune': this.filenameForTune(noteTune, alterTune, natureTune)
    , 'Rel':  this.filenameForTune(noteRel, alterRel, natureRel)
    , 'SDom': this.filenameForTune(noteSDom, alterSDom, natureSDom)
    , 'Dom':  this.filenameForTune(noteDom, alterDom, natureDom)
  }

  // On charge le sous-panneau des tons voisins
  UI.insert('sous_panneau_annexe.html', '#systems-container')
  .then( () => {
    const TONS_VOISIN_NOMS = ['Tune', 'Rel', 'SDom', 'Dom']
    TONS_VOISIN_NOMS.forEach(ton => {
      $(`img#ton-${ton}-gamme`)[0].src = `img/tunes/${filenames[ton]}`
    })

    // TODO : calculer plutôt le top de la prochaine page 
    $('#annexe').css('top', ASystem.top_last_system + 200)
  })
}

filenameForTune(note, alter, nature){
  if ( alter == '#' ) { alter = 'd' }
  return `${note}${alter || ''}${nature == 'M' ? '' : 'm'}.jpg`
}

observe(){
  const score = Score.current
  super.observe()
  // Pour appeler la méthode onClickOnTableAnalyse, notamment pour désélection-
  // ner tous les objets sélectionnés
  $(this.systemsContainer).on('click', this.onClickOnTableAnalyse.bind(this))
  this.observed = true

  this.voyantSave.on('click', score.autosave.bind(score))
}

/**
* Quand on clique sur la table d'analyse (conteneur de systèmes)
***/
onClickOnTableAnalyse(ev){
  if ( ev.target.id != 'systems-container' ) return stopEvent(ev);
  AObject.selection.deselectAll()
}

/**
* Méthode qui maintenant calcule, "à blanc" (*) la position du système
* de données initiales +iniData+ (qui contient l'index de page, l'index
* de système, etc.)
***/
calcSystemPos(system){
  const debug = false
  const score = system.score || Score.current
  debug && console.debug("\n=== CALCUL TOP DU SYSTÈME %s ===", system.minid)
  var fromY ;

  // On récupère la taille du système
  system.data.rHeight = system.rHeight = $(`img#image-system-${system.minid}`).height()

  /**
  * Calcul de la hauteur totale complète du système
  ***/
  system.data.fullHeight = system.fullHeight = system.calcFullHeight(this.firstTopLineType)

  if ( system.index == 0 ) {
    // Tout premier système
    system.data.top = system.top = score.preferences.first_page.first_system_top
    debug && console.debug("Première page, this.top = %i", system.top)
  } else {
    // Le système précédent (au-dessus)
    const prevSystem = system.prevSystem
    fromY = prevSystem.bottom_limit
    debug && console.debug("fromY (prevSystem.bottom_limit) = %i", prevSystem.bottom_limit)

    // La distance entre système (Space Between Systems)
    const SBS = score.preferences.space_between_systems
    debug && console.debug("space_between_systems = %i", SBS)

    // La page sur laquelle on se trouve
    let current_page = Math.floor(fromY / HEIGHT_PAGE) + 1
    debug && console.debug("Page courante : %i", current_page)

    // La ligne basse de cette page, la ligne à ne pas franchir
    const page_bottom_limit = current_page * HEIGHT_PAGE
    debug && console.debug("bottom_limit de page %i = %i", current_page, page_bottom_limit)

    // Si le système et ses objets inférieurs dépassent le bord bas, on
    // doit passer le système sur la page suivante
    debug && console.debug("Hauteur totale (fullHeight) = %i", system.fullHeight)
    debug && console.debug("fromY + SBS + fullHeight / page_bottom_limit", fromY + SBS + system.fullHeight, page_bottom_limit)
    if ( fromY + SBS + system.fullHeight < page_bottom_limit ) {
      // <= La limite n'est pas franchie (on a la place)
      // => On pose le système dans le flux normal, à distance définie
      // Note : on parle ici du top de l'image du système, donc il faut
      // ajouter la distance avec la ligne supérieure maximale, la ligne
      // de segment
      // => On ne modifie pas le fromY
    } else {
      // <= La limite est franchie
      // => Il faut mettre le système sur la page suivante
      // => On modifie le formY
      fromY = page_bottom_limit
    }

    system.top
      = system.data.top
      = fromY + SBS - score.preferences.ligne(this.firstTopLineType)
    debug && console.debug("this.top final = %i", system.top)

  }
}

/**
* La première ligne à prendre en compte
***/
get firstTopLineType(){
  return this.pref_no_ligne_segment ? 'modulation' : 'segment'
}

get pref_no_ligne_segment(){
  return false === Score.current.preferences.binary('export.user_segment_line')
}

get systemsContainer(){
  return this._cont || (this._cont = document.querySelector('#systems-container'))
}

get voyantSave(){
  return this._voyantsave || (this._voyantsave = $('span#voyant_save'))
}

}
