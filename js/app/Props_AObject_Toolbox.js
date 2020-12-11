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

static setBoutonSegment(){
  const useSegment = true === Score.current.preferences.binary('export.use_segment_line')
  UI.showIf($('button#otype-segment'), useSegment)
}


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
  * Si la ligne "segment" ne doit pas être utilisée, on masque son bouton
  ***/
  this.constructor.setBoutonSegment()

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
get renversementButtons(){
  return this._renvbuttons || (this._renvbuttons = this.container.find('div#objets div#objets-renversements'))
}
get segmentButtons(){
  return this._segmentbuttons || (this._segmentbuttons = this.container.find('div#objets div#objets-segments'))
}

/**
* Règle l'interface en fonction du type choisi et parfois de la valeur
* générale de ce type choisi. Par exemple, si on choisit le type "harmony",
* seuls les boutons correspondant à l'harmonie sont affichés. Si l'on choisit
* l'harmonie 'V', la nature '7' (7e de dominante) est sélectionnée.
***/
setInterfaceForType(ot){
  // console.debug(`-> setInterfaceForType(ot = ${ot})`)
  this.currentOType = ot

  const DataType = AOBJETS_TOOLBOX_BUTTONS.otype.items[ot]
  // console.debug("DataType: ", DataType)
  // On commence par masquer tous les groupes de boutons (noter que le
  // groupe principal 'otype' ne possède pas cette classe.)
  $('.grp-buttons-type').addClass('hidden')
  // Ensuite, on réaffiche seulement les groupes visibles
  DataType.visible.forEach(type => {
    $(`#objets-${type}s`).removeClass('hidden')
  })

  // TODO il faut actualiser l'aperçu du texte
  return // pour le moment

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
    UI.addClassIf(button, value === null, 'invisible')
    if ( ! (value === null) ) {
      button.html(value)
      button.attr('data-value', value)
    }
  }
  /**
  * Si c'est le type 'cadence', il faut l'indiquer dans le div contenant
  * les boutons pour changer leur taille
  ***/
  UI.addClassIf(this.noteButtons, ot=='cadence', 'cadence')

  /**
  * Si c'est le type modulation, il faut :
  *   - sélection "sans degré harmonique"
  *   - masquer les boutons de nature autre que "Maj" et "min"
  *   - sélectionner la nature "Maj"
  */
  let butNoHarm;
  if ( POAButton.items ) {
    butNoHarm = POAButton.get('harmony-none')
    butNoHarm.hideIf(ot=='harmony')
  }
  if ( ot == 'modulation' ) {
    if (POAButton.items){
      butNoHarm.select()
      POAButton.select('nature-Maj')
    }
  } else if ( ot == 'harmony' ) {
    POAButton.select('harmony-I')
  }
  // Pour le type 'modulation', on doit désactiver toutes les natures
  // sauf 'Maj' et 'min'
  $('*[data-type-aobject="nature"]').each((i, button) => {
    const isInvi = (ot != 'modulation') || ['nature-Maj','nature-m'].includes(button.id)
    UI.addClassIf(button, !isInvi, 'invisible')
  })

  this.updateOverview()
}

getValues(){
  let d = {}
  const DataOType = AOBJETS_TOOLBOX_BUTTONS.otypes.items[this.currentOType]
  // console.debug("DataOType = ", DataOType)
  // On ne prend que les valeurs des types visibles
  DataOType.visible.forEach(ktype => {
    Object.assign(d, {[ktype]: $(`button[data-type-aobject="${ktype}"].obb.selected`).data('value')})
  })
  console.debug("<- getValues avec ", d)
  return d
}

/**
* Actualiser l'aperçu dans l'interface qui permet de voir à quoi ressemblera
* le texte de l'objet sur la partition quand on change les valeurs de
* l'interface.
***/
updateOverview(){
  const vals = this.getValues()
  $('#aobject_apercu').html(this.constructor.buildFinalText(vals))
}

/**
* Méthode qui construit le texte final en fonction des données choisies
* ou enregistrées.
* Cette méthode est utilisée aussi bien pour l'aperçu que pour la construction
* de l'objet sur la partition.
***/
static buildFinalText(data){
  var mark ;
  const objProps = data;
  const otype = objProps.type
  const DataButtons = AOBJETS_TOOLBOX_BUTTONS[otype]
  const DataNature  = AOBJETS_TOOLBOX_BUTTONS.nature

  switch(otype){
    case 'harmony':
      mark = objProps.harmony
      mark = `<img src="img/${DataButtons.items[mark].img}.png" class="objet-prop-img harmony" />`
      break;
    default: mark = objProps.note
  }
  mark = `<span class="nom">${mark}</span>`
  if ( objProps.alteration != '' ) { mark += `<span class="alte">${objProps.alteration}</span>` }
  if (objProps.nature != 'Maj') {
    mark += `<img class="objet-prop-img nature" src="img/${DataNature.items[objProps.nature].img}.png" />`
  }
  if (otype == 'modulation' && objProps.harmony != 'none') {
    mark += `<span class="rel">(${objProps.harmony})</span>`
  }
  if ( otype == 'harmony' && data.renv != 0) {
    mark += ` <span class="renv">${$(`button#renversement-${data.renv}`).html()}</span>`
  }
  return mark

}

/**
* Retourne le otype courant
***/
get currentOType(){
  return $('button[data-type-aobject="type"].obb.selected').data('value')
}

/**
  * Pour sélectionner le bouton de type +type+ et de valeur +value+
* Rappel : l'identifiant d'un bouton est créé à partir de :
* 'type-value' (sauf pour les cadences, actuellement)
***/
selectButton(type, value){
  console.debug("-> selectButton(type=%s, value=%s)", type, value)
  POAButton.get(`${type}-${value}`).select()
}

deselectAllButton(type){
  DGet(`button[data-type-aobject="${type}"].selected`)
    .classList.remove('selected')
}

}// /class

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
    this.select(/* keep = */ ev.shiftKey)

    /**
    * Pour choisir la meilleure valeur par défaut pour le type
    * choisi.
    * Désactivation possible par les préférences
    * Si
    *   - le otype courant est l'harmonie
    * Et que
    *   - le bouton cliqué est un bouton d'harmonie
    * Alors
    *   - il faut checker la bonne nature par défaut
    *
    ***/
    if ( this.pref_auto_choose_best_value ){
      if (this.toolbox.currentOType == 'harmony' && this.type == 'harmony'){
        const dButton = AOBJETS_TOOLBOX_BUTTONS.harmony
        const selectionDefaut = dButton.items[this.value].default
        if ( selectionDefaut ) {
          for (var k in selectionDefaut){
            this.toolbox.selectButton(k, selectionDefaut[k])
          }
        }
      }
    }//Si les préférences le demandent

    /**
    * Si le type est 'harmony'
    * Et que le bouton cliqué est un bouton d'harmony
    * Et que la touche Majuscule est pressée
    * Alors c'est un accord "Janus". Le premier accord (celui déjà choisi)
    * concerne la tonalité précédente (courante), le second accord (celui
    * pressé maintenant) concerne la tonalité à voir
    ***/
    if (this.toolbox.currentOType == 'harmony' && this.type == 'harmony'){

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

  get pref_auto_choose_best_value(){
    return Score.current.preferences.binary('analyse.autochoose_values')
  }
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
        '0': null, 'c':'Cad. Parf', 'd':'Cad. Imp', 'e':'½ Cad.', 'f':'Cad. Plag', 'g':'Cad. Romp', 'a':'Cad. Faur', 'b':'Cad. Bar'
      }
  }
  , pedale: {
      note: {
        '0': null, 'c':'1', 'd':'5', 'e':'4', 'f':'2', 'g':'3', 'a':'6', 'b':'7'
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
