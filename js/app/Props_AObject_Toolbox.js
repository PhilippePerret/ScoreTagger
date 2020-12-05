'use strict';
/** ---------------------------------------------------------------------
  *   Class PropsAObjecToolbox
  *   ------------------------
  *
  * Pour la gestion de la boite qui permet de choisir les propriétés
  * de l'objet d'analyse (accord, modulation, etc.)
  *
  * On trouve en bas de ce module la constante REALVALS_PER_TYPE qui définit
  * les valeurs en fonction du type (otype)
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
    /**
    * Un observer sur les boutons de type pour régler les valeurs réelles
    ***/
    this.container.find('*[data-type-aobject="otype"]').on('click', this.onChangeType.bind(this))

  }

  /**
  * Méthode appelée quand on clique sur un bouton de type
  ***/
  onChangeType(ev){
    const otype = $(ev.target).data('value')
    this.setInterfaceForType(otype)
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
  get segmentButtons(){
    return this._segmentbuttons || (this._segmentbuttons = this.container.find('div#objets div#objets-segments'))
  }

  // Méthode qui affiche ou masque les éléments en fonction du type
  // d'objet voulu.
  setInterfaceForType(ot){
    // console.debug(`-> setInterfaceForType(ot = ${ot})`)
    this.currentOType = ot
    const deflistCad = ['harmony','segment']
    new DOM(this.noteButtons).showIf(!['harmony'].includes(ot))
    new DOM(this.alterButtons).showIf(!['cadence'].includes(ot))
    new DOM(this.segmentButtons).showIf(ot == 'segment')
    new DOM(this.natureButtons).showIf(!['cadence','segment'].includes(ot))
    new DOM(this.harmonyButtons).showIf(['harmony','modulation'].includes(ot))

    const ens = REALVALS_PER_TYPE[ot] || REALVALS_PER_TYPE.default
    // Les valeurs vraies
    const notesValues = ens.note || REALVALS_PER_TYPE.default.note
    for(var k in notesValues){
      const button = $(`button#note-${k}`)
      const value  = notesValues[k]
      if ( value === null ) {
        button.addClass('invisible')
      } else {
        button.removeClass('invisible')
        button.html(value)
        button.attr('data-value', value)
      }
    }
    // Les altérations vraies
    const alterValues = ens.alteration || REALVALS_PER_TYPE.default.alteration
    for(var k in alterValues){
      const button = $(`button#alteration-${k}`)
      const value  = alterValues[k]
      if ( value === null ) {
        button.addClass('invisible')
      } else {
        button.removeClass('invisible')
        button.html(value)
        button.attr('data-value', value)
      }
    }
    /**
    * Si c'est le type modulation, il faut :
    *   - sélection "sans degré harmonique"
    *   - masquer les boutons de nature autre que "Maj" et "min"
    */
    let butNoHarm;
    if ( POAButton.items ) {
      butNoHarm = POAButton.get('harmony-none')
      butNoHarm.hideIf(ot=='harmony')
    }
    if ( ot == 'modulation' ) {
      if (POAButton.items) butNoHarm.select()
    } else if ( ot == 'harmony' ) {
      POAButton.select('harmony-I')
    }
    // Pour le type 'modulation', on doit désactiver toutes les natures
    // sauf 'Maj' et 'min'
    $('*[data-type-aobject="nature"]').each((i, button) => {
      console.debug("button", button)
      const visu = (ot != 'modulation') || ['nature-Maj','nature-m'].includes(button.id)
      $(button)[(visu?'remove':'add') + 'Class']('invisible')
    })
    this.updateOverview()
  }

  getValues(){
    const note = $('button[data-type-aobject="note"].obb.selected')[0].getAttribute('data-value')
    const alteration = $('button[data-type-aobject="alteration"].obb.selected')[0].getAttribute('data-value')
    const type = $('button[data-type-aobject="otype"].obb.selected')[0].getAttribute('data-value')
    const harmony = $('button[data-type-aobject="harmony"].obb.selected')[0].getAttribute('data-value')
    const nature = $('button[data-type-aobject="nature"].obb.selected')[0].getAttribute('data-value')
    const segment = $('button[data-type-aobject="segment"].obb.selected')[0].getAttribute('data-value')
    return { note:note, type:type, harmony:harmony, nature:nature, alteration:alteration, segment:segment }
  }
  /**
  * Actualiser l'aperçu qui permet de voir à quoi ressemblera l'objet au
  * niveau de son contenu textuel
  ***/
  updateOverview(){
    const vals = this.getValues()
    var aper = ""
    if (vals.type == 'harmony'){
      aper = vals.harmony
    } else {
      aper = vals.note
    }
    if ( !['cadence'].includes(vals.type)){
      aper += vals.alteration
    }

    if (!['segment'].includes(vals.type)) {
      if ( vals.nature!='Maj') {
        aper += vals.nature
      }
    }
    if ( vals.type == 'modulation') {
      if (vals.harmony != 'none') aper += ` <span class="small">(${vals.harmony})</span>`
    }
    $('#aobject_apercu').html(`<span class="small">${vals.type} : </span>${aper}`)
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
    * Si
    *   - le otype courant est l'harmonie
    * Et que
    *   - le bouton cliqué est un bouton d'harmonie
    * Alors
    *   - il faut checker la bonne nature par défaut
    *
    ***/
    if (this.toolbox.currentOType == 'harmony' && this.type == 'harmony'){
      switch(this.value){
        case 'I': case 'IV': this.toolbox.selectButton('nature', 'Maj');break;
        case 'VI':  this.toolbox.selectButton('nature', 'm');break;
        case 'V':   this.toolbox.selectButton('nature', '7');break;
        case 'II':  this.toolbox.selectButton('nature','m7');break;
        case 'VII': this.toolbox.selectButton('nature', '7dim');break;
      }
    }

    Panneau.get('analyse').propsAObjectToolbox.updateOverview()

  }

  select(){
    // On désélectionne tous les autres du même type
    this.toolbox.deselectAllButton(this.type)
    // On met le bouton en exergue
    this.obj.addClass('selected')
  }

  hideIf(condition){
    this.obj[(condition?'add':'remove')+'Class']('invisible')
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




const REALVALS_PER_TYPE = {
  default: {
      note: {
        '0': null, 'c':'c', 'd':'d', 'e':'e', 'f':'f', 'g':'g', 'a':'a', 'b':'b'
      }
    , alteration: {
        'n': '', 'd': '♯', 'b': '♭'
      }
    }
  , chord: {
      note: {
        '0': null, 'c':'C', 'd':'D', 'e':'E', 'f':'F', 'g':'G', 'a':'A', 'b':'B'
      }
  }
  , modulation: {
      note: {
        '0': null, 'c':'DO', 'd':'RÉ', 'e':'MI', 'f':'FA', 'g':'SOL', 'a':'LA', 'b':'SI'
      }
  }
  , cadence: {
      note: {
        '0': null, 'c':'C. Parf', 'd':'C. Imp', 'e':'½ C.', 'f':'C. Plag', 'g':'C. Romp', 'a':'C. Faur', 'b':'C. Bar'
      }
  }
  , segment: {
      note: {
        '0': '', 'c':'A', 'd':'B', 'e':'C', 'f':'D', 'g':'E', 'a':'F', 'b':'G'
      }
    , alteration: {
        'n': '', 'd': '’', 'b': '”'
      }
    }
}
