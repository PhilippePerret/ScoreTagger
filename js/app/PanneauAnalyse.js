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
    ++ ipage ;
    const line = DCreate('DIV', {class:'page-separator', style:`top:${top}px`, inner:[
      DCreate('SPAN', {class:'page_number', text: String(ipage)})
    ]})
    this.systemsContainer.appendChild(line)
    console.debug("Dessin d'un séparateur de page à %i", top)
  }
  this.topLastPage = top
}

/**
* Pour dessiner, en annexe (i.e. à la fin de la partition analysée), un
* aperçu tonal, avec les tons voisins et les accidents
***/
drawApercuTonal(){
  console.debug("-> drawApercuTonal")
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
    console.debug("<- drawApercuTonal")
  })
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
