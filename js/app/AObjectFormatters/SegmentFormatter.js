'use strict'
/** ---------------------------------------------------------------------
*   Formateur pour les accords
*
*** --------------------------------------------------------------------- */
class SegmentFormatter extends ObjectFormatter {
constructor() {
  super('segment')
}

get mainMark(){
  return "" // Peut-être qu'on pourra avoir l'option d'un texte ou d'une lettre
}

} // class
