'use strict';
class ButtonAOTB {
/** ---------------------------------------------------------------------
  *   CLASSE
  *
*** --------------------------------------------------------------------- */

/**
* RETOURNE l'instance ButtonAOTB du bouton d'identifiant +buttonId+
***/
static get(buttonId) { return this.table[buttonId] }

static add(button){
  if ( undefined === this.table ) { this.table = {} ; this.items = [] }
  Object.assign(this.table, {[button.buttonId]: button})
  this.items.push(button)
}

/** ---------------------------------------------------------------------
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */
constructor(buttonsGroup, buttonData) {
  this.buttonsGroup = buttonsGroup
  this.otype  = buttonsGroup.otype
  this.data   = buttonData
  this.constructor.add(this)
}

/**
* Pour afficher le bouton
***/
show(){ this.obj.classList.remove('hidden') }
hide(){ this.obj.classList.add('hidden') }

/**
* Les références du bouton, pour savoir ce qu'il peut changer dans l'objet
***/
get ref(){
  return {propName:this.buttonsGroup.otype, propValue:this.data.id}
}

/**
* Quand on clique sur le bouton, on change sa classe et on le met
* en sélection courante de son groupe de bouton.
* (note : le mettre en sélection courante de son groupe de bouton peut aussi
*  entrainer l'aspect de l'objet édité if any)
***/
onClick(ev){
  console.debug("-> onClick", this)
  this.select()
  this.buttonsGroup.activate(this)
  this.buttonsGroup.selected && this.buttonsGroup.selected.deselect()
  this.buttonsGroup.selected = this
  return stopEvent(ev)
}

/**
* Construction du bouton
***/
build(){
  this.obj = DCreate('BUTTON', this.buttonAttributes)
  this.buttonsGroup.obj.appendChild(this.obj)
  this.observe()
}
/**
* Retourne les attributs du bouton (mais en même temps, est-ce nécessaire
* d'en mettre autant maintenant qu'on fonctionne vraiment par classe ?)
***/
get buttonAttributes(){
  return {
      id:this.buttonId
    , type:'button'
    , class:'obb'
    , text:this.buttonInner
    , 'data-value': (this.data.value||this.data.id)
    , 'data-type-aobject': this.otype
  }
}

observe(){
  $(this.obj).on('click', this.onClick.bind(this))
}

select(){
  this.obj.classList.add('selected')
}
deselect(){
  this.obj.classList.remove('selected')
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
get buttonId(){return this._butid || (this._butid = `${this.otype}-${this.data.id}`)}
}// ButtonAOTB
