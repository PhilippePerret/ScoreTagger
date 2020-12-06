'use strict';
/**
  Class Prefs
  -----------
  Gestion des préférences

**/
class Prefs {
  // Charger les préférences
  static load(){
    Ajax.send('system/prefs/load.rb').then(ret => {
      this.data = ret.prefs_data
    }).catch(onError)
  }

  // Sauver les préférences
  static save(quiet = true){
    Ajax.send('system/prefs/save.rb',{prefs_data: this.data})
    .then(ret => {
      if (! quiet ) onAjaxSuccess(ret)
    })
  }

  // Retourne la préférence de clé +key+ ou la valeur par défaut +default+
  static get(key, defaultValue){
    return this.data[key] || defaultValue
  }

  static set(key, value){
    if ( this.data[key] == value ) return
    if ( this.timerSave ) this.stopTimerSave()
    Object.assign(this.data, {[key]: value})
    this.runTimerSave()
  }

  static stopTimerSave(){
    clearTimeout(this.timerSave)
    delete this.timerSave
  }

  /**
    On met un timer pour sauver les préférences dans dix secondes
    Si une valeur est définie entre temps, on renonce et on renvoie la
    sauvegarde à 10 secondes plus tard
  **/
  static runTimerSave(){
    this.timerSave = setTimeout(this.save.bind(this), 10 * 1000)
  }
}
