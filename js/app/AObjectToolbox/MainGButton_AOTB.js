'use strict'
/** ---------------------------------------------------------------------
*   Class MainGButtonAOTB
*   ---------------------
*   Gestion des boutons de type principaux

*** --------------------------------------------------------------------- */
class MainGButtonAOTB {
/** ---------------------------------------------------------------------
  *   CLASSE
  *
*** --------------------------------------------------------------------- */
static get(otype){ return this.table[otype]}

static add(mainButton){
  if (undefined === this.table) this.table = {}
  Object.assign(this.table, {[mainButton.otype]: mainButton})
}

/** ---------------------------------------------------------------------
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */
constructor(data) {
  this.data   = data
  this.otype  = data.id // 'modulation', 'pedale', etc.
  this.constructor.add(this)
}

activate(withObjet){
  console.debug("Je dois activer le mainGButton:", this)
  BGroupAOTB.hideAllGroups()
  this.bGroupsData.forEach(dbgroup => dbgroup[0].show({only:dbgroup[1], selected:dbgroup[2]}))
}


/**
* Retourne les données BGroups du bouton principal
* C'est un Array où chaque élément, inspiré de la propriété :visible, contient :
*   [
*     <instance BGroupAOTB>,
*     <NULL = tous | liste ids boutons à sélectionner>,
*     <instance ButtonAOTB du sélectionné par défaut> (toujours défini)
*   ]
***/
get bGroupsData(){
  return this._bgroups || (this.bgroups = this.getBGroups())
}


/**
* Private methods
***/


getBGroups(){
  var aryBGroups = []
  this.data.visible.forEach(dvis => {
    let [gtype, onlyButtons, selected] = (dt => {
      if ( 'string' == typeof(dt) ) return [dt, null, null]
      else return dt
    })(dvis)
    selected = selected || AOBJETS_TOOLBOX_BUTTONS_GROUPS[gtype].selected
    selected = ButtonAOTB.get(`${gtype}-${selected}`)
    aryBGroups.push([AObjectToolbox.bGroup(gtype), onlyButtons, selected])
  })
  return aryBGroups
}


}// class
