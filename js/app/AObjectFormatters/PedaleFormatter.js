'use strict'
/** ---------------------------------------------------------------------
*   Formateur pour les accords
*
*** --------------------------------------------------------------------- */
class PedaleFormatter extends ObjectFormatter {
constructor() {
  super('pedale')
}

get mainMark(){
  return this.getHumanPropValue('degre', this.props.degre)
}

} // class
