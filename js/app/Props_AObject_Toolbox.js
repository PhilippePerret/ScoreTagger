'use strict';
/** ---------------------------------------------------------------------
  *   Class PropsAObjecToolbox
  *   ------------------------
  *
  * Pour la gestion de la boite qui permet de choisir les propriétés
  * de l'objet d'analyse (accord, modulation, etc.)
  *
*** --------------------------------------------------------------------- */
class PropsAObjectToolbox {
  constructor(container) {
    this.container = $(container||document.body)
  }

  // Observation de tous les boutons
  observe(){
    // On transforme chaque bouton en instance POAButton pour la gérer plus
    // facilement
    // this.container.find('button.obb').each( ())
    this.container[0].querySelectorAll('button.obb').forEach( button => {
      const b = new POAButton(this, button)
      b.observe()
    })
  }

  get noteButtons(){
    return this._notebuttons || (this._notebuttons = this.container.find('div#objets div#objets-notes'))
  }
  get harmonyButtons(){
    return this._harmonybuttons || (this._harmonybuttons = this.container.find('div#objets div#objets-harmonies'))
  }
  get alterButtons(){
    return this._alterbuttons || (this._alterbuttons = this.container.find('div#objets div#objets-alterations'))
  }
  get cadenceButtons(){
    return this._cadencebuttons || (this._cadencebuttons = this.container.find('div#objets div#objets-cadences'))
  }
  get natureButtons(){
    return this._naturebuttons || (this._naturebuttons = this.container.find('div#objets div#objets-natures'))
  }

  // Méthode qui affiche ou masque les éléments en fonction du type
  // d'objet voulu.
  setInterfaceForType(ot){
    console.debug(`-> setInterfaceForType(ot = ${ot})`)
    this.currentOType = ot
    new DOM(this.noteButtons).showIf(!['harmony','cadence'].includes(ot))
    new DOM(this.alterButtons).showIf(!['harmony','cadence'].includes(ot))
    new DOM(this.cadenceButtons).showIf(ot == 'cadence')
    new DOM(this.natureButtons).showIf(ot != 'cadence')
    new DOM(this.harmonyButtons).showIf(['harmony','modulation'].includes(ot))
    // Si c'est le bouton modulation, il faut sélection "sans degré harmonique"
    // par défaut
    if ( ot == 'modulation' ) {
      POAButton.select('harmony-none')
    } else if ( ot == 'harmony' ) {
      POAButton.select('harmony-I')
    }
  }

  /**
    * Pour sélectionner le bouton de type +type+ et de valeur +value+
  * Rappel : l'identifiant d'un bouton est créé à partir de :
  * 'type-value' (sauf pour les cadences, actuellement)
  ***/
  selectButton(type, value){
    POAButton.get(`${type}-${value}`).select()
  }

  deselectAllButton(type){
    DGet(`button[data-type-aobject="${type}"].selected`)
      .classList.remove('selected')
  }

}

/** ---------------------------------------------------------------------
  *   Class POAButton
  *   ---------------
  *   Classe pour gérer chaque bouton
*** --------------------------------------------------------------------- */
class POAButton {

  static get(id) { return this.items[id] }

  static add(button) {
    if (undefined == this.items ) this.items = {}
    Object.assign(this.items, {[button.id]: button})
  }

  static select(id){ this.get(id).select() }

  constructor(toolbox, obj, data) {
    this.toolbox = toolbox
    this.obj  = $(obj)
    this.id   = obj.id
    this.data = data
    this.constructor.add(this)
  }

  // Méthode appelée quand on clique sur le bouton
  onClick(ev){
    // Sélectionne le bouton (i.e. le met en exergue)
    this.select()

    /**
    * Si le bouton est un 'otype' (harmonie, cadence, accord, etc.) il
    * faut régler l'interface (la toolbox) pour qu'il affiche les bons
    * boutons qui vont avec. Par exemple, si on clique sur le bouton
    * "cadence", il ne faut afficher que les boutons qui permettent de
    * choisir le type de cadence (on masque les notes, etc.)
    ***/
    this.isOType && this.toolbox.setInterfaceForType(this.value)

    /**
    * Si
    *   - le otype courant est l'harmonie
    * Et que
    *   - le bouton cliqué est un bouton d'harmonie
    * Alors
    *   - il faut checker la bonne nature par défaut
    *
    ***/
    if (this.toolbox.currentOType == 'harmony' && this.type == 'harmony'){
      console.log("Je dois régler la nature par défaut pour la valeur ", this.value)
      switch(this.value){
        case 'I': case 'IV': this.toolbox.selectButton('nature', 'Maj');break;
        case 'VI':  this.toolbox.selectButton('nature', 'm');break;
        case 'V':   this.toolbox.selectButton('nature', '7');break;
        case 'II':  this.toolbox.selectButton('nature','m7');break;
        case 'VII': this.toolbox.selectButton('nature', '7dim');break;
      }
    }
  }

  select(){
    // On désélectionne tous les autres du même type
    this.toolbox.deselectAllButton(this.type)
    // On met le bouton en exergue
    this.obj.addClass('selected')
  }

  // Observation du bouton
  observe(){
    this.obj.bind('click', this.onClick.bind(this))
  }

  get isHarmony(){return this.value == 'harmony'}
  get isOType(){return this.type == 'otype'}

  get type(){return this._type || (this._type = this.obj.data('type-aobject'))}
  get value(){return this._value || (this._value = this.obj.data('value'))}
}
