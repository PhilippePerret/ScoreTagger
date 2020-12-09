'use strict';

class PanneauCrop extends Panneau {
  constructor() {
    super('crop')
  }

  onActivate(){
    console.debug("-> PanneauCrop#onActivate")
    this.isObserved || this.observe()
    document.body.style.width = null ;
    const score = Score.current
    this.show_score_ini()
    console.debug("<- PanneauCrop#onActivate")
  }

  onDesactivate(){
    console.debug("-> PanneauCrop#onDesactivate")
    this.removeAllCutLines()
    this.unobserveBody()
    console.debug("<- PanneauCrop#onDesactivate")
  }

/**
* Méthode appelée quand on clique sur le bouton "Découper" pour découper
* la partition originale
***/
onCrop(ev){
  message("Je découpe la partition… merci de patienter (ça peut prendre un moment).")
  var tops = []
  document.querySelectorAll('.hline').forEach(line => {
    tops.push( line.offsetTop + 20)
  })
  tops.sort((a,b) => a - b);
  var codes = []
  var cutLinesTops = []
  var len, i;
  for(i = 0, len = tops.length; i < len; ++ i){
    const i_plus1 = 1 + Number(i)
    var iPlus1Str = String(i_plus1)
    while(iPlus1Str.length < 3){iPlus1Str = "0" + iPlus1Str}
    const top_cur = parseInt(tops[i],10)
    const top_next = parseInt(tops[i_plus1],10)
    var h = top_next - top_cur ;
    // On ne prend pas les portions trop courts, elles correspondent à
    // des "blancs" entre les systèmes. En revanche, on garde toutes les
    // lignes de coupe en mémoire.
    cutLinesTops.push({top: top_cur, blanc: h < 150})
    if ( h < 150 ) continue ;
    codes.push({top: top_cur, height: h})
  }
  // On prend les lignes verticales
  const vlines = {
      left: this.vlineLeft.position().left
    , right: this.vlineRight.position().left + 20
  }
  if ( codes.length > 0 ) {
    // <= Des lignes de coupe ont été définies
    // => Procéder à la découpe
    Score.current.cutPage(this.current_page, codes, cutLinesTops, vlines, this.confirmCrop.bind(this))
  } else {
    erreur("Aucune ligne de coupe n'est définie.")
  }
}

  confirmCrop(retour){
    console.debug(retour)
    message("La partition a été découpée avec succès.")
    message("Tu peux activer l'onglet “Analyse” pour procéder à son analyse.")
  }

  /**
    * Méthode évènement appelée quand on clique sur le body, avec la
    * partition originale affichée
  ***/

  onClickScore(ev){
    console.debug("-> onClickScore")
    if ( ev.target.id != 'score-ini' ) return false
    this.drawCutLine({top: ev.offsetY})
  }

  observe(){
    super.observe()
    this.buttonPageNumber = new IncButton({container:'#crop-page-number', min:1, max:Score.current.data.page_count, value:1, onchange: this.showPage.bind(this)})
    this.buttonPageNumber.build()
    this.vlineLeft.draggable({axis: 'x'})
    this.vlineRight.draggable({axis: 'x'})
    this.isObserved = true
  }

  // Affiche le div qui permet d'entrer le chemin d'accès à la partition
  // initiale (donc non découpée)
  ask_for_score_ini_path(){
    message("Vous devez définir le chemin d'accès à la partition (image) initiale.")
  }
  show_score_ini(){
    this.showPage(1)
    // On règle à chaque fois le nombre de page max, car on a pu charger
    // une autre analyse.
    this.buttonPageNumber.max = Score.current.data.page_count
    this.observeBody()
    this.observeButtonCrop()
  }

  showNextPage(){
    this.showPage(this.current_page + 1)
  }
  showPrevPage(){
    if ( this.current_page == 1 ) {
      message("C'est la première page !")
    } else {
      this.showPage(this.current_page - 1)
    }
  }

  /**
  * Demande d'affichage de la page +ipage+ sur la table de coupe
  ***/
  showPage(ipage){
    this.current_page = Number(ipage)
    Ajax.send('get_data_page.rb', {num: this.current_page})
    .then(this.drawPage.bind(this, ipage))
  }

/**
* Pour "dessiner" vraiment la page sur la table de coupe
***/
drawPage(ipage, ret){
  console.debug("-> drawPage. Retour d'ajax pour la page %i : ", ipage, ret)
  this.removeAllCutLines()
  $('img#score-ini')[0].src = `_score_/${CURRENT_ANALYSE}/score/images/pages/page-${ipage}.jpg`
  $('img#score-ini').on('load', ev => {
    const img = $('img#score-ini')
    const h = img.height()
    const w = img.width()
    this.vlineLeft.css('height', `${h}px`)
    this.vlineRight.css({height:`${h}px`, left:`${w - 5}px`})
    // Rectifier en fonction des données enregistrées
    ret.data_page && this.positionneVLines(ret.data_page.vlines)
  })
  ret.data_page && this.drawCutLines(ret.data_page.all_cutlines || ret.data_page.cutlines)
}

  get vlineLeft(){
    return this._vlineleft || (this._vlineleft = $('div#vline-left'))
  }
  get vlineRight(){
    return this._vlineright || (this._vlineright = $('div#vline-right'))
  }

/**
* Pour redessiner des lignes de coupe si elles existent déjà
***/
drawCutLines(cutlines){
  cutlines.forEach(dline => this.drawCutLine(dline))
}
// Pour dessiner une ligne de coupe
drawCutLine(dline){
  new Line(dline.top).build()
}
removeAllCutLines(){
  $('.hline').remove()
}

positionneVLines(vlines){
  console.debug("-> positionneVLines avec", vlines)
  this.vlineLeft.css('left', `${vlines.left}px`)
  this.vlineRight.css('left', `${vlines.right - 20}px`)
}

// - private -
observeButtonCrop(){
  if ( !this.buttonCropIsObserved ) {
    $('button#btn-crop').bind('click', this.onCrop.bind(this))
    this.buttonCropIsObserved = true
  }
}
observeBody(){
  if (!this.bodyObserved){
    $('body').bind('click', this.onClickScore.bind(this))
    this.bodyObserved = true
  }
}
unobserveBody(){
  if (this.bodyObserved){
    $('body').unbind('click', this.onClickScore.bind(this))
    this.bodyObserved = false
  }
}
}
