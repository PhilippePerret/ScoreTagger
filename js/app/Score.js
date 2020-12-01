'use strict';

class Score {
  static get current(){ return this._current || (this._current = new Score())}
  static set current(v){ this._current = v }


  constructor() {
    this.scoreIniPath = null // chemin d'accès à la partition originale
    this.getData()
  }

  get data(){ return this._data }

  getData(){
    Ajax.send('get_data.rb')
    .then(ret => {
      console.log("ret:", ret)
      this._data = ret.data
    })
  }

  /**
    * Méthode qui lance la découpe de la partition originale d'après
    * les lignes de découpe définies dans +cropLinesData+
  ***/
  crop(cropLinesData, callback){
    Ajax.send('crop_score_ini.rb', {data: cropLinesData, score_ini_path: this.scoreIniPath})
    .then(callback)
  }

  /**
    * Méthode permettant de définir le chemin d'accès absolu à la partition
  ***/

  setPathIni(path, callback){
    Ajax.send('define_score_ini_path.rb',{path: path})
    .then(ret =>{
      if (ret.error) { erreur(ret.error)}
      else {
        this.scoreIniName = ret.score_ini_name
        this.scoreIniPath = `_score_/${ret.score_ini_name}`
        callback.call()
      }
    })
  }
}
