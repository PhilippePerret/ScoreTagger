'use strict';
/** ---------------------------------------------------------------------
  *   Class Panneau
  *   --------------
  *   Pour la gestion facile des panneaux
  *
*** --------------------------------------------------------------------- */
const PANNEAU_NAMES = ['home','crop','analyse','export'];

class Panneau {
/** ---------------------------------------------------------------------
  *   CLASSE
  *
*** --------------------------------------------------------------------- */
static init(){
  __in('Panneau::init')
  const my = this
  PANNEAU_NAMES.forEach(pName => my.get(pName).observe())
  const Prefs = Score.current.preferences
  const panneau = Prefs.binary('startup.analyse_on_startup') ? 'analyse' : 'home'
  __add(`Panneau à afficher (préférences) : ${panneau}`, 'Panneau::init')
  my.current = my.get(panneau)
  my.current.open()
  __out('Panneau::init')
}

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
static async setCurrent(panneau){
  if ( 'string' == typeof(panneau)) panneau = this.get(panneau)
  __in(`Panneau::setCurrent('${panneau.ref}')`)
  this.current && (await this.current.close())
  this._current = panneau
  await this.current.open()
  __out(`Panneau::setCurrent(${panneau.name})`)
}
// alias de setCurrent
static show(panneau){ return this.setCurrent(panneau) }

static onClickOnglet(ongletId, ev){
  this.setCurrent(this.get(ongletId))
  return stopEvent(ev)
}

/**
* Observation des panneaux
**/
static observe(){
  PANNEAU_NAMES.forEach(paneId => {
    $(`button#btn-panneau-${paneId}`).on('click', this.onClickOnglet.bind(this, paneId))
  })
}

/** ---------------------------------------------------------------------
  *   INSTANCE PANNEAU
  *
*** --------------------------------------------------------------------- */
constructor(tabName) {
  this.name = tabName
}

get ref(){return this._ref || (this._ref = `panneau[name=${this.name}]`)}

async open(){
  __in(`${this.ref}#open`)
  this.obj.removeClass('hidden')
  this.onglet.addClass('activated')
  this.onActivate && (await this.onActivate())
  __out(`${this.ref}#open`)
}

async close(){
  __in(`${this.ref}#close`)
  this.onDesactivate && (await this.onDesactivate())
  this.obj.addClass('hidden')
  this.onglet.removeClass('activated')
  __out(`${this.ref}#close`)
}

  observe(){
    __in(`${this.ref}#observe (super)`)
    $(`aside#tabs-buttons button#btn-panneau-${this.name}.tabbutton`).on('click', this.onClick.bind(this))
    __out(`${this.ref}#observe (super)`)
  }

  onClick(ev){
    __start(`Clic sur le bouton “${this.name}”`, 'Panneau#onClick')
    this.constructor.setCurrent(this)
    __out(`${this.ref}#onClick`)
  }

  get obj(){return this._obj ||(this._obj = $(`div#panneau-${this.name}`))}

  get onglet(){return this._onglet || (this._onglet = $(`button#btn-panneau-${this.name}`))}
}
