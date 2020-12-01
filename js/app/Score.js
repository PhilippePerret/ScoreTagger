'use strict';

class Score {
  static get current(){ return this._current }
  static set current(v){ this._current = v }


  constructor() {
    this.scoreIniPath = null // chemin d'accès à la partition originale
  }


  /**
    * Méthode permettant de définir le chemin d'accès absolu à la partition
  ***/

  setPathIni(path, callback){
    Ajax.send('define_score_ini_path.rb',{path: path})
    .then(ret =>{
      if (ret.error) { erreur(ret.error)}
      else {
        message("Chemin d'accès défini, on peut poursuivre.")
        this.scoreIniPath = path
        callback.call()
      }
    })
  }
}
