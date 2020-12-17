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

/**
* Méthode principale, appelée lorsque l'on clique sur un bouton principal
* pour choisir un otype et qui agence la boite d'outils pour présenter les
* seuls boutons utiles.
*
* Si +oData+ est défini, ce sont les données de l'objet d'analyse qui doit
* être édité.
***/
configureToolbox(oData){
  BGroupAOTB.hideAllGroups()
  this.bGroupsData.forEach(dbgroup => dbgroup[0].show({only:dbgroup[1], selected:dbgroup[2]}))
  oData && this.setValues(oData)
}

/**
* Retourne la table des valeurs à considérer pour le type d'objet d'analyse
* donné.
***/
getValues(){
  var d = {otype: this.otype}
  this.bGroups.forEach(bgroup => Object.assign(d, {[bgroup.gtype]: bgroup.selected.value}))
  return d
}

/**
* Règle les boutons visibles avec les données +oData+
***/
setValues(oData){
  __in("MainGButtonAOTB#setValues()", oData)
  this.bGroups.forEach(bgroup => bgroup.select(oData[bgroup.gtype]))
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
  return this._bgroupsdata || (this._bgroupsdata = this.getBGroupsData())
}

get bGroups(){
  return this._bgroups || (this._bgroups = this.getBGroups())
}

/**
* Private methods
***/

/**
* Retourne les instances des groupes de boutons pour le type d'objet
***/
getBGroups(){
  var ary = []
  this.bGroupsData.forEach(dgroup => ary.push(dgroup[0]))
  return ary
}

/**
* Retourne les données absolues pour les groupes de boutons du type d'objet
* courant
***/
getBGroupsData(){
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
