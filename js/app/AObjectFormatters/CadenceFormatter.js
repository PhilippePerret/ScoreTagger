'use strict'
/** ---------------------------------------------------------------------
*   Formateur pour les accords
*
*** --------------------------------------------------------------------- */
class CadenceFormatter extends ObjectFormatter {
constructor() {
  super('cadence')
}

get mainMark(){
  return this.getHumanPropValue('cadence', this.props.cadence)
}

} // class
