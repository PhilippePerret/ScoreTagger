'use strict'
/** ---------------------------------------------------------------------
*   Formateur pour les accords
*
*** --------------------------------------------------------------------- */
class HarmonyFormatter extends ObjectFormatter {
constructor() {
  super('harmony')
}

get mainMark(){
  if ( ! this.props.harmony ) {
    console.error("Valeur de 'harmony' non définie dans un objet de type 'harmony'…")
    return '[?]'
  }
  return this.getHumanPropValue('harmony', this.props.harmony)
}

get mainMarkFormatted(){
  return `<div class="mark">${this.fullMark}</div>`
}

get renversement(){
  if ( this.props.renv != 0){
    return this.getHumanPropValue('renv', this.props.renv)
  } else return ""
}

} // class
