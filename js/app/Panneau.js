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
      case 'home':
        if ( undefined == this.items['home']){ Object.assign(this.items, {home: new PanneauHome()}) }
        return this.items['home']
      case 'crop':
        if ( undefined == this.items['crop'] ) {Object.assign(this.items, {crop: new PanneauCrop()})}
        return this.items['crop']
      case 'analyse':
        if ( undefined == this.items['analyse']){ Object.assign(this.items, {analyse: new PanneauAnalyse()}) }
        return this.items['analyse']
      case 'export':
        if ( undefined == this.items['export']){ Object.assign(this.items, {export: new PanneauExport()}) }
        return this.items['export']
      default:
        if ( undefined == this.items[tabName]){ Object.assign(this.items, {[tabName]: new Panneau(tabName)}) }
        return this.items[tabName]
    }
  }
  static get current(){return this._current}
  static set current(v){this._current = v}
  static setCurrent(panneau){
    if ( 'string' == typeof(panneau)) panneau = this.get(panneau)
    this.current.close()
    this.current = panneau
    this.current.open()
  }

  static onClickOnglet(ev){
    const ongletId = $(ev.target).data('id')
    this.setCurrent(this.get(ongletId))
  }

  /**
    * Instance *
  ***/

  constructor(tabName) {
    this.name = tabName
  }
  open(){
    this.obj.removeClass('hidden')
    this.onglet.addClass('activated')
    this.onActivate && this.onActivate()
  }

  close(){
    this.onDesactivate && this.onDesactivate()
    this.obj.addClass('hidden')
    this.onglet.removeClass('activated')
  }

  observe(){
  }

  onClick(ev){
    this.constructor.setCurrent(this)
  }

  get obj(){return this._obj ||(this._obj = $(`div#tab-${this.name}`))}

  get onglet(){return this._onglet || (this._onglet = $(`button#btn-tab-${this.name}`))}
}
