'use strict';

class PanneauCrop extends Panneau {
  constructor() {
    super('crop')
  }

  onActivate(){
    super.onActivate()
    if ( undefined == Score.current ) {
      Score.current = new Score()
    }
    const score = Score.current
    if ( ! score.score_ini_path ) {
      this.ask_for_score_ini_path()
    } else {
      this.show_score_ini()
    }
  }

  observe(){
    super.observe()
    console.log("J'ai observé le panneau de découpe")
  }


  // Affiche le div qui permet d'entrer le chemin d'accès à la partition
  // initiale (donc non découpée)
  ask_for_score_ini_path(){
    this.observeButtonSetScoreIni()
    this.obj.find('div#score-container').addClass('hidden')
    this.obj.find('div#path_define_container').removeClass('hidden')
  }
  show_score_ini(){
    this.obj.find('div#path_define_container').addClass('hidden')
    this.obj.find('div#score-container').removeClass('hidden')
    $('img#score-ini')[0].src = Score.current.scoreIniPath
    message("Clic and Drag pour placer les lignes de découpe de la partition, puis clique sur le bouton “Découper”.")
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
}
