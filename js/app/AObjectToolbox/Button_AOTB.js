'use strict';
/** ---------------------------------------------------------------------
*   Classe ButtonAOTB
*   -----------------
*   Gestion des boutons de la boite à outils
*
*** --------------------------------------------------------------------- */
class ButtonAOTB {
/** ---------------------------------------------------------------------
  *   CLASSE
  *
*** --------------------------------------------------------------------- */
static get(buttonId){ return this.table[buttonId]}

static add(button){
  if (undefined === this.table) this.table = {}
  Object.assign(this.table, {[button.buttonId]: button})
}
/** ---------------------------------------------------------------------
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */
constructor(bgroup, data) {
  this.bgroup = bgroup
  this.data   = data
  this.id     = this.data.id
  this.constructor.add(this)
}
get ref(){
  return this._ref || (this._ref = `[Button '${this.id}' de Group '${this.bgroup.gtype}']`)
}

/**
* Méthode appelée quand on clique sur le bouton, qui peut appartenir
* indifféremment au groupe des boutons principaux (et déclencher alors
* l'affichage du groupe en question) ou appartenir à un groupe "normal" et
* déclencher alors le changement du text final ou de l'objet peut-être édité
* Mais on appelle indifféremment la méthode 'activate' du groupe qui est
* différente pour les deux cas.
*
* Noter que c'est la méthode activate du groupe qui sélectionne le bouton (pour
* pouvoir désélectionner le bouton courant)
***/
onActivate(ev){
  const my = this
  this.bgroup.activate(my)
  return stopEvent(ev)
}

/**
* Construction et observation du bouton, une fois pour toutes
***/
build_and_observe(){
  console.debug("%s -> build_and_observe", this.ref)
  this.build()
  this.observe()
}

build(){
  this.obj = DCreate('BUTTON', this.buttonAttributes)
  this.bgroup.obj.appendChild(this.obj)
}
observe(){
  $(this.obj).on('click', this.onActivate.bind(this))
}

show(){this.obj.classList.remove('hidden')}
hide(){this.obj.classList.add('hidden')}

select(){this.obj.classList.add('selected')}
deselect(){this.obj.classList.remove('selected')}


/**
* Retourne les attributs du bouton (mais en même temps, est-ce nécessaire
* d'en mettre autant maintenant qu'on fonctionne vraiment par classe ?)
***/
get buttonAttributes(){
  return {
      id:   this.buttonId
    , type: 'button'
    , class:'obb'
    , text: this.buttonInner
    , 'data-value': (this.data.value||this.id)
    , 'data-type-aobject': this.bgroup.gtype
  }
}


/** ---------------------------------------------------------------------
*   Deep Method de construction
*
*** --------------------------------------------------------------------- */
get buttonInner(){
  return this.data.img
            ? `<img src="img/${this.data.img}.png" class="aobjet-button-img" />`
            : this.data.text
}

/**
* Properties
***/
get buttonId(){return this._butid || (this._butid = `${this.bgroup.gtype}-${this.id}`)}

}
