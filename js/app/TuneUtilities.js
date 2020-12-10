'use strict';
/** ---------------------------------------------------------------------
  *   Utilitaires pour gérer les tonalités
  *   Et notamment la class Tune
*** --------------------------------------------------------------------- */

const TUNE_TO_INDICE_TON = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 }
// Pour que 4 retourne 'G', 2 retourne 'E', etc.
const INDICE_TON_TO_TUNE = {}
for(var t in TUNE_TO_INDICE_TON){
  Object.assign(INDICE_TON_TO_TUNE, {[TUNE_TO_INDICE_TON[t]]: t})
}
const INDICE_TO_TUNE = {
  0:'C', 1:'C#', 2:'D', 3:'D#', 4:'E', 5:'F', 6:'F#', 7:'G', 8:'G#', 9:'A',
  10:'A#', 11:'B' }
const TUNE_TO_INDICE = {}
for (var k in INDICE_TO_TUNE) {
  Object.assign(TUNE_TO_INDICE, {[INDICE_TO_TUNE[k]]: k})
}

class Tune {
/**
* On instancie une tonalité (Tune) à l'aide de sa "désignation", c'est-à-dire
* une marque comme 'C#m'. Soit : une lettre pour la note, une altération si
* elle existe ('#' ou 'd', 'b'), un mode s'il existe ('m', 'M' ou rien => 'M')
*
***/
constructor(mark) {
  this.mark = mark
  console.debug("Instanciation d'un Tune à l'aide de l'empreinte '%s'", mark)
  this.parseEmpreinte(this.mark)
}

get note()  {return this._note}
get alter() {return this._alter}
get mode()  {return this._mode}

// L'image de la gamme
get imageScaleName(){
  return this._scaleimg || (this._scaleimg = `${this.note}${this.falter}${this.fmode}.jpg`)
}
get imageScalePath(){ return `img/tunes/${this.imageScaleName}`}

get falter(){return this.alter || ''}
get fmode() {return this.isTonMajeur ? '' : 'm'}

// L'indice de ton et de demi-ton
get indiceTon(){ return TUNE_TO_INDICE_TON[this.note] }
get indiceDemiTon(){ return TUNE_TO_INDICE[this.note] }

// => Les trois instances {Tunes} du relative, de la sous-dominante et
//    de la dominante
get Relatif(){ return this._reltune || (this._reltune = this.calcRelative() )}
get SousDominante(){ return this._sousdom || (this._sousdom = this.calcSousDominante())}
get Dominante(){ return this._dom || (this._dom = this.calcDominante())}

get isTonMajeur(){return this.mode == 'M'}

parseEmpreinte(mark){
  var dtune = mark.split('');
  this._note = dtune.shift().toUpperCase()
  if (dtune.length == 0) { this._alter = null; this._mode = 'M' }
  else {
    switch(dtune[0]){
      case 'm':
        this._alter = null
        this._mode  = 'm'
        break
      case 'M':
        this._alter = null
        this._mode  = 'M'
        break
      case '#':
      case 'd':
        this._alter = 'd'
        break
      case 'b':
        this._alter = 'b'
        break
      default:
        throw(`Impossible d'analyser le deuxième signe de l'empreinte de tonalité ${this.mark}…`)
    }
    if (!this._mode) this._mode  = dtune[1] == 'm' ? 'm' : 'M'
  }
  console.debug("Résultat parsing : note='%s', alter=%s, mode='%s', isTonMajeur ? %s", this.note, this.alter, this.mode, this.isTonMajeur ? 'oui' : 'non')
}

/**
* Méthode qui calcule le ton relatif et retourne son instance Tune
***/
calcRelative(){
  const my = this
  let IndTonRel
  var vprov
  if ( this.isTonMajeur ) {
    vprov = this.indiceTon - 2
    IndTonRel = vprov < 0 ? 7 + vprov : vprov
  } else { // ton mineur
    vprov = this.indiceTon + 2
    IndTonRel = vprov > 6 ? vprov - 7 : vprov
  }
  const noteRel = INDICE_TON_TO_TUNE[IndTonRel]
  const indiceDemiton = TUNE_TO_INDICE[noteRel]

  /**
  * Pour le mode majeur ou mineur du relatif, c'est tout simplement
  * le contraire du ton
  ***/
  const modeRel = this.isTonMajeur ? 'm' : 'M' ;

  /**
  * On a la note, mais maintenant il va falloir savoir
  * si elle est altérée pour avoir exactement une tierce
  * mineure entre le relatif mineur et le relatif majeur
  ***/
  var dist = ((idt) => {
    if ( idt > this.indiceDemiTon) {return idt - this.indiceDemiTon}
    else {return this.indiceDemiTon - idt}
  })(indiceDemiton)
  let alterRel
  if ( dist == 3 && !this.alter ) { alterRel = null }
  else if ( this.alter && dist == 3 ) {
    // Par exemple LA#m / DO# ou LAbm / DOb
    alterRel = String(this.alter)
  } else {
    if ( this.isTonMajeur ) {
      // Si la tonalité est majeure, le relatif sera une tierce en dessous
      if ( this.alter == 'd' && dist == 4 ) {
        // Rien à faire
        alterRel = 'x' // Par exemple LA# et FAx
      } else if (dist == 4 && !this.alter ) {
        alterRel = 'd' // P.e. LA => FA#m
      }
    } else {
      // <= Le ton est mineur
      if ( dist == 4 && !this.alter ){
        alterRel = 'b' // p.e. FAm => Ab
      }
    }
  }
  const empRel = `${noteRel}${alterRel||''}${modeRel}`
  console.debug("Relatif trouvé : %s", empRel)
  return new Tune(empRel)
} //calcRelative

/**
* Méthode de calcul de la sous-dominante du ton courant. Retourne son
* instance Tune
***/

calcSousDominante(){
  var vprov = this.indiceTon + 3
  const noteSDom = INDICE_TON_TO_TUNE[vprov < 7 ? vprov : 7 - vprov]
  const modeSDom = String(this.mode)
  const alterSDom = (my => {
    if ( my.note == 'F' ) {
      if ( my.alter == 'd' ) { return null }
      else if (my.alter == 'b') { return 'bb' }
      else { return 'b' }
    } else { return my.alter }
  })(this)

  const empSDom = `${noteSDom}${alterSDom||''}${modeSDom}`
  console.debug("Sous-dominante = %s", empSDom)
  return new Tune(empSDom)
} //calcSousDominante

/**
* Calcul de la sous-dominante du ton courante
***/
calcDominante(){
  var vprov = this.indiceTon + 4
  const noteDom = INDICE_TON_TO_TUNE[vprov < 7 ? vprov : 7 - vprov]
  const modeDom = 'M'
  const alterDom = (my => {
    if ( my.note == 'B' ) {
      if ( my.alter == 'd' ) { return 'x' }
      else if (my.alter == 'b') { return null }
      else { return 'd'}
    } else { return my.alter }
  })(this)
  
  const empDom = `${noteDom}${alterDom||''}${modeDom}`
  console.debug("Dominante = %s", empDom)
  return new Tune(empDom)
} //calcDominante


}// /class Tune
