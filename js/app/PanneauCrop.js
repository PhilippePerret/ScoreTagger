'use strict';

class PanneauCrop extends Panneau {
  constructor() {
    super('crop')
  }

  onActivate(){
    document.body.style.width = null ;
    const score = Score.current
    if ( ! score.data.score_ini_path ) {
      this.ask_for_score_ini_path()
    } else {
      this.show_score_ini()
      this.observeBody()
    }
  }

  onDesactivate(){
    console.debug("-> PanneauCrop#onDesactivate")
    $('.hline').remove()
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
    console.debug("Tops classés obtenus : ", tops)
    var codes = []
    var len, i;
    for(i = 0, len = tops.length - 1; i < len; ++ i){
      const i_plus1 = 1 + Number(i)
      var iPlus1Str = String(i_plus1)
      while(iPlus1Str.length < 3){iPlus1Str = "0" + iPlus1Str}
      const top_cur = parseInt(tops[i],10)
      const top_next = parseInt(tops[i_plus1],10)
      var h = top_next - top_cur ;
      codes.push({top: top_cur, height: h})
    }
    console.debug("codes: ", codes)
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

  onClickBody(ev){
    console.debug("-> onClickBody")
    // On ne doit rien faire si le target est une ligne (qu'on déplace)
    // console.log(ev)
    if (ev.target.classList.contains('hline')) {
      console.debug("C'est une ligne qui est cliquée, on ne fait rien.")
      return false
    } else if (ev.target.tagName == 'BUTTON') {
      console.debug("C'est un bouton qui est cliqué, on ne fait rien.")
      return false
    }
    console.debug("Placement d'une ligne à ", ev.offsetY)
    new Line(ev.offsetY).build()
  }

  observe(){
    super.observe()
    this.buttonPageNumber = new IncButton({container:'#crop-page-number', min:1, value:1, onchange: this.showPage.bind(this)})
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
    $('img#score-ini')[0].src = `_score_/${CURRENT_ANALYSE}/score/images/pages/page-${ipage}.jpg`
    message("Clic and Drag pour placer les lignes de découpe de la partition, puis clique sur le bouton “Découper”.")
    this.current_page = Number(ipage)
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
    $('body').bind('click', this.onClickBody.bind(this))
    this.bodyObserved = true
  }
}
unobserveBody(){
  if (this.bodyObserved){
    $('body').unbind('click', this.onClickBody.bind(this))
    this.bodyObserved = false
  }
}
}
