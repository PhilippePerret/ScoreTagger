'use strict'
/** ---------------------------------------------------------------------
*   Classe Formatter
*   ----------------
*   Classe abstraite pour tous les formateurs
*** --------------------------------------------------------------------- */
class AObjectFormatter {
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
  var inner = []
  inner.push(this.finalContent)
  this.isWithTrait  && inner.push(this.divTrait)
  return this.builtDiv(inner)
}

builtDiv(inner){
  return DCreate('DIV', {class:this.css, inner:inner})
}

get finalContent(){
  return DCreate('DIV', {class:'mark', text: this.fullText})
}

/**
* Le Div qui permet de "tirer un trait" après la marque (accord, harmony) ou
* avant (cadence) ou en dessous (modulation).
**/
get divTrait(){
  var css = ['trait']
  if ( this.gtype != 'modulation' && this.props.width < 60 ) css.push('hidden')
  return DCreate('DIV', {class:css.join(' ')})
}
get isWithTrait(){
  return ['modulation','chord','pedale','cadence'].includes(this.gtype)
}

get fullText(){
  var c = ""
  c += this.mainMark
  c += this.alteration
  c += this.nature
  c += this.harmony
  c += this.renversement
  return c
}

// À surveiller, ça peut produire une erreur
get mainMark(){
  var mainKey = this.gtype
  if ( this.gtype == 'modulation' ) this.mainKey = 'chord'
  else if (this.gtype == 'pedale' ) this.mainKey = 'degre'
  else if (this.gtype == 'segment') this.mainKey = 'degre'
  return this.getHumanPropValue(mainKey, this.props[mainKey])
}

get css(){
  var ary = ['aobjet', this.gtype]
  if ( this.gtype == 'segment') { ary.push(this.props.segment)}
  return ary.join(' ')
}

get alteration(){
  return this.getHumanPropValue('alteration', this.props.alteration, 'n')
}

get nature(){
  return this.getHumanPropValue('nature', this.props.nature, 'Maj')
}

get harmony(){
  const harm = this.getHumanPropValue('harmony', this.props.harmony, '0')
  if ( harm == '' || this.gtype == 'harmony' ) return harm
  return `<span class="rel">${harm}</span>`
}

get renversement(){
  return this.getHumanPropValue('renv', this.props.renv, 0)
}

/**
* RETOURNE la valeur "humaine", pour affichage, du bouton de otype +otype+
* et d'identifiant +id+.
* Si c'est une image, retourne le code HTML de l'image, si c'est un texte
* retourne le span contenant le texte.
*
* +otype+   {String} Type de l'objet ('harmony', 'chord', etc.)
* +id+      {String} Identifiant prope au bouton (p.e. 'II', 'c', 'min')
* +noneValue+ {Any} Si l'identifiant est égal à cette valeur, on renvoie un
*               String vide.
*
***/
getHumanPropValue(otype, id, noneValue){
  if ( !id || id == noneValue ) return ''
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
