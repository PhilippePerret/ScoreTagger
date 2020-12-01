'use strict';
/** ---------------------------------------------------------------------
  *   Class Panneau
  *   --------------
  *   Pour la gestion facile des panneaux
  *
*** --------------------------------------------------------------------- */
class Panneau {

  /**
    * Classe *
  ***/
  static get(tabName){
    if (undefined == this.items){this.items = {}}
    switch (tabName) {
      case 'crop':
        if ( undefined == this.items['crop'] ) {Object.assign(this.items, {crop: new PanneauCrop()})}
        return this.items['crop']
      case 'analyse':
        if ( undefined == this.items['analyse']){ Object.assign(this.items, {analyse: new PanneauAnalyse()}) }
        return this.items['analyse']
      default:
        if ( undefined == this.items[tabName]){ Object.assign(this.items, {[tabName]: new Panneau(tabName)}) }
        return this.items[tabName]
    }
  }
  static get current(){return this._current}
  static set current(v){this._current = v}
  static setCurrent(panneau){
    this.current.close()
    this.current = panneau
    this.current.open()
  }
  /**
    * Instance *
  ***/

  constructor(tabName) {
    this.name = tabName
  }
  open(){
    this.obj.removeClass('hidden')
  }

  close(){
    if ( 'function' == typeof(this.onDesactivate) ) this.onDesactivate.call(this)
    this.obj.addClass('hidden')
  }

  observe(){
    $(`button#btn-tab-${this.name}`).bind('click', this.onClick.bind(this))
  }

  onClick(ev){
    this.constructor.setCurrent(this)
    this.onActivate()
  }

  get obj(){return this._obj ||(this._obj = $(`div#tab-${this.name}`))}

}
