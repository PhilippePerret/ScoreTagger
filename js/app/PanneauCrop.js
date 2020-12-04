'use strict';

class PanneauCrop extends Panneau {
  constructor() {
    super('crop')
  }

  onActivate(){
    this.isObserved || this.observe()
    document.body.style.width = null ;
    const score = Score.current
    this.show_score_ini()
    this.observeBody()
  }

  onDesactivate(){
    this.removeAllCutLines()
    this.unobserveBody()
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
    var len, i;
    for(i = 0, len = tops.length; i < len; ++ i){
      const i_plus1 = 1 + Number(i)
      var iPlus1Str = String(i_plus1)
      while(iPlus1Str.length < 3){iPlus1Str = "0" + iPlus1Str}
      const top_cur = parseInt(tops[i],10)
      const top_next = parseInt(tops[i_plus1],10)
      var h = top_next - top_cur ;
      // On ne prend pas les portions trop courts, elles correspondent à
      // des "blancs" entre les systèmes
      if ( h < 150 ) continue ;
      codes.push({top: top_cur, height: h})
    }
    // Pour procéder à la découpe
    Score.current.cutPage(this.current_page, codes, this.confirmCrop.bind(this))
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
    this.buttonPageNumber = new IncButton({container:'#crop-page-number', min:1, value:1, onchange: this.showPage.bind(this)})
    this.buttonPageNumber.build()
    message("Clic and Drag pour placer les lignes de découpe de la partition, puis clique sur le bouton “Découper”.")
    this.isObserved = true
  }

  // Affiche le div qui permet d'entrer le chemin d'accès à la partition
  // initiale (donc non découpée)
  ask_for_score_ini_path(){
    message("Vous devez définir le chemin d'accès à la partition (image) initiale.")
  }
  show_score_ini(){
    this.showPage(1)
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
  showPage(ipage){
    this.current_page = Number(ipage)
    Ajax.send('get_data_page.rb', {num: this.current_page})
    .then(ret => {
      if ( ret.error ) return erreur(ret.error)
      this.removeAllCutLines()
      $('img#score-ini')[0].src = `_score_/${CURRENT_ANALYSE}/score/images/pages/page-${ipage}.jpg`
      if ( ret.data_page ) this.drawCutLines(ret.data_page.cutlines)
    })
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
