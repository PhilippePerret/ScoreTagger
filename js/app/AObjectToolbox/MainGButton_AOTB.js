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

}
