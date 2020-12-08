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
    score.draw().then(this.drawPageDelimitors.bind(this))
  }

  score.startAutosave()

  console.debug("<- PanneauAnalyse#onActivate")
}

onDesactivate(){
  Score.current.autosave() // une dernière fois
  Score.current.stopAutosave()
}


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



observe(){
  super.observe()
  // Pour appeler la méthode onClickOnTableAnalyse, notamment pour désélection-
  // ner tous les objets sélectionnés
  $(this.systemsContainer).on('click', this.onClickOnTableAnalyse.bind(this))
  this.observed = true
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
  * Calcul de la taille complète du système
  ***/
  system.data.fullHeight = system.fullHeight = system.calcFullHeight()

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

    system.top = system.data.top = fromY + SBS - score.preferences.ligne('segment')
    debug && console.debug("this.top final = %i", system.top)

  }
}

get systemsContainer(){
  return this._cont || (this._cont = document.querySelector('#systems-container'))
}

}
