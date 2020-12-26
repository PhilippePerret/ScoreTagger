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
  await ( score.isDrawn || drawAnalyse(score) )
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
  const newWidth = $(this.systemsContainer).width()
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
  $('button#btn-repositionne-systems').on('click', ASystem.repositionneAll.bind(ASystem))

  // Pour sauver les systèmes de force (en cliquant sur le voyant)
  this.voyantSave.on('click', score.autosave.bind(score))
}

/**
* Pour ajouter une ligne repère à la hauteur +top+ (à titre de débuggage only)
***/
addLigneRepere(top, options = {}){
  this.systemsContainer.appendChild(DCreate('DIV',{class:'reperage',style:`top:${top}px;border-width:2px;border-color:${options.color||'green'}`}))
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
  return UI.insert('sous_panneau_annexe.html', '#systems-container')
  .then( () => {
    const iTune = new Tune(tuneStr)
    DGet('img#ton-main-gamme').src = iTune.imageScalePath
    DGet('img#ton-relatif-gamme').src = iTune.Relatif.imageScalePath
    DGet('img#ton-sousdom-gamme').src = iTune.SousDominante.imageScalePath
    DGet('img#ton-dominante-gamme').src = iTune.Dominante.imageScalePath
    // Bien placer l'annexe à la fin
    Page.addPageAtTheEnd()
    $('#annexe').css('top', Page.last.top)
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

}// class PanneauAnalyse
