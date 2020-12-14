'use strict';
/** ---------------------------------------------------------------------
*   Classe ButtonsGroupAOTB
*   -----------------------
*   Pour la gestion des groupes de boutons (un groupe de boutons est un
*   groupe comme les boutons d'harmonie, ou les boutons d'altération, etc.)
*   Leur instance s'obtiennent grâce à AObjectToolbox.buttonsGroup('<otype>')
*
*   Attention, le groupe de bouton des types, groupe spécial au-dessus des
*   autres, possède sa propre classe héritée de celle-ci :
*     OtypeButtonsGroupAOTB
*
*** --------------------------------------------------------------------- */
class ButtonsGroupAOTB {

static get(buttonsOtype) { return this.table[buttonsOtype] }

/**
* Méthode qui masque tous les groupes de boutons
***/
static maskAllGroups(){
  console.debug("-> maskAllGroups")
  this.items.forEach( item => item.hide() )
  // this.items.forEach(item => item.hide())
}

static add(buttonsGroup){
  if ( undefined === this.items ) {this.table = {}; this.items = []}
  this.items.push(buttonsGroup)
  Object.assign(this.table, {[buttonsGroup.otype]: buttonsGroup})
}

/** ---------------------------------------------------------------------
*   INSTANCE
*
*** --------------------------------------------------------------------- */
constructor(otype) {
  this.otype = otype
  otype == 'otype' || this.constructor.add(this)
}

/** ---------------------------------------------------------------------
* Public Methods
***/

/**
* Masquer ce groupe de boutons
***/
hide(){ this.obj.classList.add('hidden') }

/**
* Afficher le groupe de boutons
*
* Si +buttons+ est défini, c'est la liste des ID-simples des seuls boutons
* boutons à afficher. Sinon, on affiche tous les boutons
***/
show(buttons){
  this.obj.classList.remove('hidden')
  if ( buttons ) {
    this.hideAllButtonsBut(buttons)
  } else {
    this.showAllButtons()
  }
}

showAllButtons(){
  this.buttons.forEach(button => button.show())
}
hideAllButtonsBut(buttons){
  this.buttons.forEach(button => button.hide())
  buttons.forEach(buttonSId => ButtonAOTD.get(`${this.otype}-${buttonSId}`).show() )
}

/**
* Méthode pour sélectionner le bouton +button+ dans le groupe de bouton
* courant. La méthode désélectionne aussi le bouton actuellement sélectionné.
* +button+ Instance ButtonAOTB
***/
selectButton(button){
  this.selected && this.selected.deselect()
  button.select()
  this.selected = button
}

/**
* Méthode appelée quand on clique sur le bouton du type this.otype correspondant
* à ce groupe de boutons.
* Elle définit l'interface, c'est-à-dire les boutons à voir et à masquer
*
* Si +selectedButton+ est défini, on sélectionne ce bouton-là
***/
activate(selectedButton){
  console.debug("-> activate", this)
  this.constructor.maskAllGroups()
  this.show()
  this.dataVisible.forEach(dtype => {
    console.log("Traitement de dtype = ", dtype)
    var [otype, buttons, selected] = (dt => {
      if ( 'string' == typeof(dt) ) return [dt, null, null]
      else return dt
    })(dtype)
    const buttonsGroup = ButtonsGroupAOTB.get(otype)
    selected == null || ButtonAOTB.get(`${otype}-${selected}`)
    buttonsGroup.show(buttons)
    buttonsGroup.selectButton(selectedButton || selected || this.defaultButton)
  })
}

/** ---------------------------------------------------------------------
*   Building Methods
*   Méthodes de construction
*** --------------------------------------------------------------------- */

/**
* Méthode pour construire le groupe de bouton
***/
build(){
  this.tableButtons = {}
  this.buttons = []
  var css = ['buttons-grp-aotb']
  this.otype != 'otype' && css.push('buttons-grp-type', 'hidden')
  this.obj = DCreate('DIV', {id:`buttons-grp-${this.otype}`, class:css.join(' ')})
  AObjectToolbox.container.appendChild(this.obj)
  for( var butId in this.items ) {
    const butInstance = new ButtonAOTB(this, this.items[butId])
    Object.assign(this.tableButtons, {[butId]: butInstance})
    this.buttons.push(butInstance)
    butInstance.build()
  }
}
/** ---------------------------------------------------------------------
*   Buttons Methods
*
*** --------------------------------------------------------------------- */

/**
* Gestion du bouton sélectionné
* Si un bouton est sélectionné (au clic) et qu'un objet est édité, il faut
* actualisé l'aspect de l'objet sélectionné
***/
get selected(){ return this._selected }
set selected(button_aotb){
  this._selected = button_aotb
  AObjectToolbox.editedObject && AObjectToolbox.editedObject.update(button_aotb.ref)
}

/**
* RETOURNE le bouton de nom +buttonName+ (c'est l'identifiant dans les
* data.items)
*
***/
button(buttonName){
  return this.buttons[buttonName]
}


/**
* RETOURNE les données absolues de AOBJETS_TOOLBOX_BUTTONS du otype
***/
get data(){
  return AOBJETS_TOOLBOX_BUTTONS[this.otype]
}
/**
* RETOURNE les données de visibilité des éléments
* C'est-à-dire la donnée :visible quand le type est choisi
* Cette donnée contient une liste Array ou chaque élément est soi le
* string du otype dont il faut montrer les boutons, soit une liste Array
* avec [<otype>, [<boutons ids>], <bouton selected>]
***/
get dataVisible(){
  return AOBJETS_TOOLBOX_BUTTONS.otype.items[this.otype].visible
}

/**
* Retourne l'identifiant du bouton par défaut
***/
get defaultButton(){
  return this._defbut || (this._defbut = ButtonAOTB.get(`${this.otype}-${this.data.selected}`))
}

/**
* RETOURNE les items i.e. les boutons du groupe, tels que définis dans les
* data
***/
get items(){return this.data.items}
}// ButtonsGroupAOTB
