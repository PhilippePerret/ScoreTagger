'use strict'
class OTypeButtonsGroupAOTB extends ButtonsGroupAOTB {
constructor() {
  super('otype')
}


get id(){return this._id || (this._id = this.data.id)}
get selected(){return this._selected || (this._selected = this.data.selected)}
// Surclasse la méthode de ButtonsGroupAOTB
get data(){return this._data || (this._data = AOBJETS_TOOLBOX_OTYPE_BUTTONS)}

/**
* Pour écraser la fonction originale entendu qu'on n'active pas ce groupe
* de bouton : il est toujours visible et toujours accessible.
***/
activate(button){
  console.debug("-> activate groupe OType avec le bouton : ", button)
  // console.debug("Button ref = %s, data : ", button.ref.propValue, button.data)
  // On active le groupe de bouton voulu
  AObjectToolbox.BGroup(button.data.id).activate()
}

}// class OTypeButtonsGroupAOTB
