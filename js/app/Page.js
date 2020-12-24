'use strict';
/** ---------------------------------------------------------------------
  Class Page
  ----------
  Petite classe pour gérer les pages (connaitre leur top, leur bottom,
  etc.)
  La propriété 'page' d'un système retourne l'instance de sa page.
*** --------------------------------------------------------------------- */

// Nombre de pixels pour un centimètre
const CM2PIXELS = 37.795280352161
const VMARGE_PX = CM2PIXELS * 2
// Hauteur exacte d'une page
const HEIGHT_PAGE = 1065 // (= 28,7cm => marge de 0.5 cm)
const PAGE_HEIGHT_PX = parseInt(CM2PIXELS * 28.7, 10)

class Page {

/**
* Obtenir l'instance {Page} de la page de numéro page_number
* L'instancier si nécessaire
***/
static get(page_number){
  this.table || (this.table = {})
  this.table[page_number] || this.add(new Page(page_number))
  return this.table[page_number]
}
static add(page){
  this.table || (this.table = {})
  Object.assign(this.table, {[page.number]: page})
}

/**
* Méthode pour ajouter une page à la fin
*
* Pour le moment, c'est pour ajouter la page d'annexe, mais plus tard, on
* pourra imaginer que ce sera pour d'autres pages d'annexe, avec explications
* textuelles, etc.
***/
static addPageAtTheEnd(){
  // Note : il suffit de la demander pour la créer
  this.get(this.last.number + 1)
}

/**
* Retourne l'instance de la dernière page
***/
static get last(){
  const lastNumber = Object.keys(this.table)[this.count - 1]
  return this.get(lastNumber)
}
/**
* Méthode qui dessine les délimiteurs de toutes les pages
***/
static drawPageDelimitors(){
  Object.values(this.table).forEach(page => page.drawDelimitor())
}
/**
* Retourne le nombre total de pages
***/
static get count(){return Object.keys(this.table).length}
/** ---------------------------------------------------------------------
      INSTANCE
--------------------------------------------------------------------- ***/

constructor(number) {
  this.number = number
  this.constructor.add(this)
}

/**
* Méthode dessinant sur la table d'analyse la ligne repère de la page
***/
drawDelimitor(){
  TableAnalyse.systemsContainer.appendChild(
    DCreate('DIV', {class:'page-separator', style:`top:${this.bottom}px`, inner:[
      DCreate('SPAN', {class:'page_number', text: `${this.number}/${Page.count}`})
    ]})
  )
}

get top(){ return this._top || ( this._top = this.calcTop() ) }
get bottom(){ return this._bottom || ( this._bottom = this.calcBottom() ) }

/** ---------------------------------------------------------------------
  *   Méthodes de calcul
  *
*** --------------------------------------------------------------------- */
calcTop(){
  return parseInt((this.number - 1) * HEIGHT_PAGE, 10)
}
calcBottom(){
  return parseInt(this.number * HEIGHT_PAGE, 10)
}

}
