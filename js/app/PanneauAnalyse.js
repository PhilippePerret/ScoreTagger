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
  this.currentNote = 'c'
}

async onActivate(){
  __in(`${this.ref}#onActivate`)
  const score = Score.current
  await prepareTableAnalyse()
  score.isDrawn || (await drawAnalyse(score))
  score.pref_auto_save && score.startAutosave()
  __out(`${this.ref}#onActivate`)
}

onDesactivate(){
  if ( Score.current.pref_auto_save ) {
    Score.current.autosave() // une dernière fois
    Score.current.stopAutosave()
  }
}

prepareAndObserve(){
  this.prepare()
  this.observe()
}
/**
* Préparation du panneau d'analyse
*
* Maintenant, tous les boutons sont construits à la volée
***/
prepare(){
  const newWidth = this.toScaleFactor($(this.systemsContainer).width())
  $(this.systemsContainer).css('width', px(newWidth))
}


observe(){
  const score = Score.current
  super.observe()
  // Pour appeler la méthode onClickOnTableAnalyse, notamment pour désélection-
  // ner tous les objets sélectionnés
  $(this.systemsContainer).on('click', this.onClickOnTableAnalyse.bind(this))
  this.observed = true

  // Pour jouer l'analyse
  $('button#btn-play-analyse').on('click', score.analyse.play.bind(Score.current.analyse))

  // Pour repositionner tous les éléments
  $('button#btn-repositionne-systems').on('click', this.repositionneAll.bind(this))

  // Pour sauver les systèmes de force (en cliquant sur le voyant)
  this.voyantSave.on('click', score.autosave.bind(score))
}


/**
* Retourne la valeur réelle de la position (x, y, h ou w) +v+ en fonction
* du "scale factor" (cf. "Scale Factor" dans l'annexe du manuel développeur)
* La méthode `toScaleFactor` fait le contraire.
***/
byScaleFactor(v){
  return v
  // return parseInt( v / this.ScaleFactor, 10)
}
toScaleFactor(v){
  return v
  // return parseInt( v * this.ScaleFactor, 10)
}
/**
* Cf. "Scale Factor" dans l'annexe de la documentation.
* Si la partition est zoomée de 150% dans les préférences, ce "scale factor"
* sera de 1.5
***/
get ScaleFactor(){
  return this._scalefactor || (this._scalefactor = this.ScoreScale / 100)
}
get ScoreScale(){
  return Score.current.preferences.divers('score_scale')
}

/**
* Méthode qui dessine les délimiteurs de pages en fonction de la hauteur
* complète de l'analyse
***/
drawPageDelimitors(){
  __in(`${this.ref}#drawPageDelimitors`)
  const heightContainer = $(this.systemsContainer).height()
  var top = 0
  var ipage = 0
  while ( top < heightContainer ) {
    top += HEIGHT_PAGE
    ++ ipage ;
    const line = DCreate('DIV', {class:'page-separator', style:`top:${top}px`, inner:[
      DCreate('SPAN', {class:'page_number', text: String(ipage)})
    ]})
    this.systemsContainer.appendChild(line)
  }
  this.topLastPage = top
  __out(`${this.ref}#drawPageDelimitors`, {topLastPage: this.topLastPage})
}

/**
* Pour dessiner, en annexe (i.e. à la fin de la partition analysée), un
* aperçu tonal, avec les tons voisins et les accidents
***/
drawApercuTonal(){
  __in(`${this.ref}#drawApercuTonal`)
  const score = Score.current
  let tuneStr ;
  var vprov ; // pour mettre une valeur provisoire

  if ( ! score.data.tune ) {
    message("Pour obtenir un aperçu tonal en annexe d'analyse, il faut définir la tonalité de la pièce.<br>Je considère qu'elle est en F#m.")
    tuneStr = 'F#m'
  } else {
    tuneStr = score.data.tune
  }

  // On charge le sous-panneau de l'annexe
  UI.insert('sous_panneau_annexe.html', '#systems-container')
  .then( () => {
    const iTune = new Tune(tuneStr)
    DGet('img#ton-main-gamme').src = iTune.imageScalePath
    DGet('img#ton-relatif-gamme').src = iTune.Relatif.imageScalePath
    DGet('img#ton-sousdom-gamme').src = iTune.SousDominante.imageScalePath
    DGet('img#ton-dominante-gamme').src = iTune.Dominante.imageScalePath
    // Bien placer l'annexe à la fin
    $('#annexe').css('top', this.topLastPage)
    __out(`${this.ref}#drawApercuTonal`)
  })
}


/**
* Quand on clique sur la table d'analyse (conteneur de systèmes)
***/
onClickOnTableAnalyse(ev){
  if ( ev.target.id != 'systems-container' ) return stopEvent(ev);
  AObject.selection.deselectAll()
}

/**
* Méthode appelée quand on clique sur le bouton pour repositionner les systèmes
* ainsi que l'annexe.
* Note : en plus, la méthode donne des indications sur les données
***/
repositionneAll(ev){
  __in(`${this.ref}#repositionneAll`)
  var prevSys = null
  Score.current.systems.forEach(system => {
    system.prevSystem = prevSys
    system.top || this.calcSystemPos(system, /* debug = */ true)
    system.positionne()
    prevSys = system
  })
  // On redessine les délimiteurs de page
  $('.page-separator').remove()
  this.drawPageDelimitors()
  // On repositionne l'annexe
  $('#annexe').css('top', this.topLastPage)

  __out(`${this.ref}#repositionneAll`)
}

/**
* Méthode qui maintenant calcule, "à blanc" (*) la position du système
* de données initiales +iniData+ (qui contient l'index de page, l'index
* de système, etc.)
***/
calcSystemPos(system, debug = false){
  __in(`${this.ref}#calcSystemPos`, {system:system, debug:debug})
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
    system.data.top = system.top = score.preferences.first_page('first_system_top')
    debug && console.debug("Première page, this.top = %i", system.top)
  } else {
    // Le système précédent (au-dessus)
    const prevSystem = system.prevSystem
    fromY = prevSystem.bottom_limit
    debug && console.debug("fromY (prevSystem.bottom_limit) = %i", prevSystem.bottom_limit)

    // La distance entre système (Space Between Systems)
    const SBS = score.preferences.divers('space_between_systems')
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
  __out(`${this.ref}#calcSystemPos`)
}

/**
* La première ligne à prendre en compte
***/
get firstTopLineType(){
  return this.pref_no_ligne_segment ? 'modulation' : 'segment'
}

get systemsContainer(){
  return this._cont || (this._cont = document.querySelector('#systems-container'))
}

get voyantSave(){
  return this._voyantsave || (this._voyantsave = $('span#voyant_save'))
}

}
