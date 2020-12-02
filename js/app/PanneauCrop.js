'use strict';

class PanneauCrop extends Panneau {
  constructor() {
    super('crop')
  }

  onActivate(){
    const score = Score.current
    if ( ! score.data.score_ini_path ) {
      this.ask_for_score_ini_path()
    } else {
      this.show_score_ini()
    }
  }

  onDesactivate(){
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
    Score.current.crop(codes, this.confirmCrop.bind(this))
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
  }


  // Affiche le div qui permet d'entrer le chemin d'accès à la partition
  // initiale (donc non découpée)
  ask_for_score_ini_path(){
    message("Vous devez définir le chemin d'accès à la partition (image) initiale.")
  }
  show_score_ini(){
    $('img#score-ini')[0].src = `_score_/${CURRENT_ANALYSE}/pages/page-1.jpg`
    message("Clic and Drag pour placer les lignes de découpe de la partition, puis clique sur le bouton “Découper”.")
    this.observeBody()
    this.observeButtonCrop()
  }


  // Méthode permettant de définir le path absolu de la partition
  onSetScoreIniPath(ev){
    const score_ini_path = $('input#score-ini-path').val().trim()
    if ( score_ini_path != '' ) {
      Score.current.setPathIni(score_ini_path, this.afterDefineScorePathIni.bind(this))
    } else {
      erreur("Il faut donner le chemin d'accès absolu à la partition non découpée.")
    }
  }

  // Méthode appelée quand on a défini le chemin d'accès de la partition
  // avec succès. On va pouvoir la découper.
  afterDefineScorePathIni(ev){
    this.show_score_ini()
  }




// - private -
observeButtonSetScoreIni(){
  if ( !this.buttonSetScoreIniIsObserved ) {
    $('button#btn-set-score-ini-path').bind('click', this.onSetScoreIniPath.bind(this))
    this.buttonSetScoreIniIsObserved = true
  }
}
observeButtonCrop(){
  if ( !this.buttonCropIsObserved ) {
    $('button#btn-crop').bind('click', this.onCrop.bind(this))
    this.buttonCropIsObserved = true
  }
}
observeBody(){
  console.debug("-> PanneauCrop#observeBody")
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
