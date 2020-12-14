'use strict'
class OTypeButtonsGroupAOTB extends ButtonsGroupAOTB {
constructor() {
  super('otype')
}

/**
* Pour écraser la fonction originale entendu qu'on n'active pas ce groupe
* de bouton : il est toujours visible et toujours accessible.
***/
activate(button){
  console.debug("-> activate groupe OType avec le bouton : ", button)
  console.debug("Button ref = %s, data : ", button.ref.propValue, button.data)
  // On active le groupe de bouton voulu
  ButtonsGroupAOTB.get(button.ref.propValue).activate()
}

}// class OTypeButtonsGroupAOTB
