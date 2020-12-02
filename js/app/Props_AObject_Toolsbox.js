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
    // On observe tous les boutons obb
    this.container.find('button.obb').bind('click', this.onClickButtonOBB.bind(this))
  }

  onClickButtonOBB(ev){
    const but = ev.target
    const bid = but.id
    const typeButton = but.getAttribute('data-type-aobject')
    $(but).unbind('click', this.onClickButtonOBB.bind(this))
    $(but).draggable()
    this.selectTypeButton(typeButton, but)
    if ( typeButton == 'otype') {
      this.setInterfaceForType(but.getAttribute('data-value'))
    }
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
  setInterfaceForType(otype){
    if ( otype == 'harmony' ) {
      this.harmonyButtons.removeClass('hidden')
      this.noteButtons.addClass('hidden')
      this.alterButtons.addClass('hidden')
      this.cadenceButtons.addClass('hidden')
      this.natureButtons.removeClass('hidden')
    } else if ( otype == 'cadence' ){
      this.cadenceButtons.removeClass('hidden')
      this.natureButtons.addClass('hidden')
      this.harmonyButtons.addClass('hidden')
      this.noteButtons.addClass('hidden')
      this.alterButtons.addClass('hidden')
    } else {
      this.harmonyButtons.addClass('hidden')
      this.noteButtons.removeClass('hidden')
      this.alterButtons.removeClass('hidden')
      this.cadenceButtons.addClass('hidden')
      this.natureButtons.removeClass('hidden')
    }
  }
  selectTypeButton(type, cbutton){
    DGet(`button[data-type-aobject="${type}"].selected`).classList.remove('selected')
    cbutton.classList.add('selected')
  }
}

/** ---------------------------------------------------------------------
  *   Class POAButton
  *   ---------------
  *   Classe pour gérer chaque bouton
*** --------------------------------------------------------------------- */
class POAButton {
  constructor() {

  }
}
