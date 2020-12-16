'use strict'
/** ---------------------------------------------------------------------
*   Formateur pour les accords
*
*** --------------------------------------------------------------------- */
class ChordFormatter extends ObjectFormatter {
constructor() {
  super('chord')
}

get mainMark(){
  return this.getHumanPropValue('chord', this.props.chord)
}

} // class
