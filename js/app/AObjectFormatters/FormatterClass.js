'use strict'
/** ---------------------------------------------------------------------
*   Classe Formatter
*   ----------------
*   Classe abstraite pour tous les formateurs
*** --------------------------------------------------------------------- */
class ObjectFormatter {
/** ---------------------------------------------------------------------
  *   CLASSE
  *
*** --------------------------------------------------------------------- */
static add(formatter){
  if(undefined == this.table) this.table = {}
  Object.assign(this.table, {[formatter.gtype]: formatter})
}
static get(fid){return this.table[fid]}

/** ---------------------------------------------------------------------
*   INSTANCE
*
*** --------------------------------------------------------------------- */
constructor(gtype) {
  this.gtype = gtype // par exemple 'alteration', 'segment', 'degre'
  ObjectFormatter.add(this)
}

/**
* Méthode principale qui retourne l'objet formaté en fonction des données
* +withData+
*
***/
format(withData){
  this.props = withData
  return this.finalDiv()
}

finalDiv(){
  return this.builtDiv
}

get builtDiv(){
  return DCreate('DIV', {class: this.css, text: this.finalContent})
}

get finalContent(){
  return this.mainMarkFormatted
}

get fullMark(){
  var c = this.mainMark
  c += this.alteration
  c += this.nature
  c += this.harmony
  c += this.renversement
  return c
}

get mainMarkFormatted(){
  return this.fullMark
}

get css(){
  var ary = ['aobjet', this.gtype]
  if ( this.gtype == 'segment') { ary.push(this.props.segment)}
  return ary.join(' ')
}

get alteration(){
  var alter = this.props.alteration
  if ( alter && alter != 'n' ) return this.getHumanPropValue('alteration', alter)
  return ""
}

get nature(){
  var nat = this.props.nature
  if ( nat && nat != 'Maj' ) return this.getHumanPropValue('nature', nat)
  return ""
}

// Sera surclassé par le formatter modulationFormatter
get harmony(){
  return ""
}

// Sera surclassé dans HarmonyFormatter
get renversement(){
  return ""
}

/**
* RETOURNE la valeur "humaine", pour affichage, du bouton de otype +otype+
* et d'identifiant +id+.
* Si c'est une image, retourne le code HTML de l'image, si c'est un texte
* retourne le span contenant le texte.
*
* +otype+   {String} Type de l'objet ('harmony', 'chord', etc.)
* +id+      {String} Identifiant prope au bouton (p.e. 'II', 'c', 'min')
*
***/
getHumanPropValue(otype, id){
  try {
    const dat = AOBJETS_TOOLBOX_BUTTONS_GROUPS[otype].items[id]
    if ( dat.img ) {
      return `<img src="img/${dat.img}.png" class="objet-prop-img ${otype}" />`
    } else {
      return `<span class="${otype}">${dat.text}</span>`
    }
  } catch (e) {
    console.error("Problème fatal dans ObjectFormatter#getHumanPropValue avec otype=%s, id=%s", otype, id)
    console.error("ERREUR : ", e)
    console.error("Pour information, AOBJETS_TOOLBOX_BUTTONS_GROUPS = ", AOBJETS_TOOLBOX_BUTTONS_GROUPS)
    return '[?]'
  }
}

}
