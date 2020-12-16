'use strict'
/** ---------------------------------------------------------------------
*   Formateur pour les accords
*
*** --------------------------------------------------------------------- */
class ModulationFormatter extends ObjectFormatter {
constructor() {
  super('modulation')
}

finalDiv(){
  // On doit ajouter encore un div pour dessiner la ligne vertical qui
  // rejoint le système
  this.builtDiv.appendChild(DCreate('DIV', {class:'vline'}))
  return this.builtDiv
}

get mainMark(){
  return this.getHumanPropValue('chord', this.props.chord)
}

get harmony(){
  if ( this.props.harmony != '0' ) {
    return `<span class="rel">${this.getHumanPropValue('harmony', this.props.harmony)}</span>`
  }
  return ""
}

} // class
