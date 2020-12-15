'use strict';
/** ---------------------------------------------------------------------
*   Classe ButtonsGroupAOTB
*   -----------------------
*   Pour la gestion des groupes de boutons (un groupe de boutons est un
*   groupe comme les boutons d'harmonie, ou les boutons d'altération, etc.)
*   Leur instance s'obtiennent grâce à AObjectToolbox.buttonsGroup('<gtype>')
*
*   Attention, le groupe de bouton des types, groupe spécial au-dessus des
*   autres, possède sa propre classe héritée de celle-ci :
*     OtypeButtonsGroupAOTB
*
*** --------------------------------------------------------------------- */
class ButtonsGroupAOTB {

/**
* Méthode qui masque tous les groupes de boutons
***/
static maskAllGroups(){
  console.debug("-> maskAllGroups")
  Object.values(AObjectToolbox.BGroups).forEach( item => item.hide() )
}

/** ---------------------------------------------------------------------
*   INSTANCE
*
*** --------------------------------------------------------------------- */
constructor(gtype) {
  this.gtype = gtype
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
  console.debug("[Groupe de boutons %s]-> show(buttons =)", this.gtype, buttons)
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
  buttons.forEach(buttonSId => ButtonAOTD.get(`${this.gtype}-${buttonSId}`).show() )
}

/**
* Méthode pour sélectionner le bouton +button+ dans le groupe de bouton
* courant. La méthode désélectionne aussi le bouton actuellement sélectionné.
* +button+ Instance ButtonAOTB
***/
selectButton(button){
  console.debug("[Groupe de boutons %s]-> selectButton(button=)", this.gtype, button)
  this.selected && this.selected.deselect()
  button.select()
  this.selected = button
}

/**
* Sélectionne le bouton +buttonName+
***/
select(buttonName){
  this.selectButton(ButtonAOTB.get(`${this.gtype}-${buttonName}`))
}

/**
* Méthode appelée quand on clique sur le bouton du type this.gtype correspondant
* à ce groupe de boutons.
* Elle définit l'interface, c'est-à-dire :
*   - les groupes de boutons à voir et à masquer
*   - les boutons de groupe à sélectionner
*
* Si +selectedButton+ est défini, on sélectionne ce bouton-là
***/
activate(selectedButton){
  console.debug("[Groupe boutons %s]-> activate(selectedButton=)", this.gtype, selectedButton)
  this.constructor.maskAllGroups()
  this.show(selectedButton)
  this.buttonsGroups.forEach(group => group.show(/* TODO ici la sélection éventuelle */))
  console.debug("[Groupe boutons %s]<- activate", this.gtype)
}


/**
* Retourne les groupes de boutons de ce gtype sous forme de liste Array de
* d'instances ButtonsGroupAOTB.
* Cette donnée est défini par la propriété :visible du gtype
* ATTENTION : contrairement à la version précédente, les groupes de boutons
* sont bien des instances ButtonsGroupAOTB, mais elles sont propres à ce gtype
* en particulier et aucun autre, dans le sens où sont définis les seuls
* boutons à afficher et la sélection en fonction du groupe
***/
get buttonsGroups(){
  return this._btsgrps || ( this._btsgrps = this.getButtonsGroups())
}
getButtonsGroups(){
  var ary = []
  AOBJETS_TOOLBOX_OTYPE_BUTTONS.items[this.gtype].visible.forEach(dtype => {
    var [gtype, buttons, selected] = (dt => {
      if ( 'string' == typeof(dt) ) return [dt, null, null]
      else return dt
    })(dtype)
    const buttonsGroup = new ButtonsGroupAOTB(gtype)
    selected = selected || AOBJETS_TOOLBOX_BUTTONS_GROUPS[gtype].selected
    buttonsGroup.defaultSelectedButton = ButtonAOTB.get(`${gtype}-${selected}`)
    ary.push(buttonsGroup)
  })
  return ary
}

/** ---------------------------------------------------------------------
*   Building Methods
*   Méthodes de construction
*** --------------------------------------------------------------------- */

/**
* Méthode pour construire le groupe de bouton
***/
build(){
  const my = this
  this.tableButtons = {}
  this.buttons = []
  AObjectToolbox.container.appendChild(this.obj)
  // On construit les boutons dans l'ordre défini par data.order
  this.order.forEach( butId => {
    const butInstance = new ButtonAOTB(my, my.items[butId])
    Object.assign(my.tableButtons, {[butId]: butInstance})
    my.buttons.push(butInstance)
    butInstance.build()
  })
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

// Ordre de classement des boutons
get order(){return this._order || (this._order = this.data.order)}

/**
* RETOURNE les données absolues de AOBJETS_TOOLBOX_BUTTONS du gtype
***/
get data(){
  return this._data || (this._data = AOBJETS_TOOLBOX_BUTTONS_GROUPS[this.gtype])
}

/**
* Retourne l'identifiant du bouton par défaut
***/
get defaultButton(){
  return this._defbut || (this._defbut = ButtonAOTB.get(`${this.gtype}-${this.data.selected}`))
}

/**
* RETOURNE les items i.e. les boutons du groupe, tels que définis dans les
* data
***/
get items(){return this.data.items}
}// ButtonsGroupAOTB
