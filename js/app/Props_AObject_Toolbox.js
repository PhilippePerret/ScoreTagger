'use strict';
/** ---------------------------------------------------------------------
*   Class PropsAObjecToolbox
*   ------------------------

Pour la gestion de la boite qui permet de choisir les propriétés
de l'objet d'analyse (accord, modulation, etc.)

Dans l'ordre de héarchie

*** --------------------------------------------------------------------- */
class PropsAObjectToolbox {


static setBoutonSegment(){
  const useSegment = true === Score.current.preferences.binary('export.use_segment_line')
  UI.showIf($('button#otype-segment'), useSegment)
}


// constructor(container) {
//   this.container = $(container||document.body)
// }

// /**
// * Méthode qui permet d'éditer le bouton +aobjet+ (instance AObjet)
// *
// * Lorsque c'est une édition, on affiche en plus les boutons de positionnement
// * qui permettent de définir la largeur, la position x, la ligne de pose, etc.
// ***/
// edit(aobjet){
//   message(`Je dois éditer l'objet ${aobjet.id}`)
//   this.editedObject = aobjet
//   // On doit régler la boite pour cet objet
//   this.setInterfaceForType(aobjet.otype, aobjet.data)
// }

// unedit(aobjet){
//   console.debug("-> unedit", aobjet)
//   // On s'assure que ce soit bien le même objet
//   if ( this.editedObject && aobjet.id == this.editedObject.id) {
//     delete this.editedObject
//     this.setInterfaceForType('chord')
//     /**
//     * Il faut mettre editedObject à null seulement ici, sinon la méthode
//     * setInterfaceForType ne règlerait pas le bouton du type sélectionné
//     ***/
//     this.editedObject = null
//   }
// }
// setInferfaceForAObject(aobjet){
//   this.container.find('#edited-objet-id').html(aobjet.id)
// }

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

/**
* Règle l'interface en fonction du type choisi et parfois de la valeur
* générale de ce type choisi. Par exemple, si on choisit le type "harmony",
* seuls les boutons correspondant à l'harmonie sont affichés. Si l'on choisit
* l'harmonie 'V', la nature '7' (7e de dominante) est sélectionnée.
***/
setInterfaceForType(ot, dataEditedObjet = {}){
  // console.debug(`-> setInterfaceForType(ot = ${ot})`)

  /**
  * On sélectionne le bouton du type car la méthode est appelée aussi bien
  * quand on clique sur ce bouton justement que lorsqu'on met un objet en
  * édition.
  ***/
  if ( dataEditedObjet.objetProps /* i.e. c'est une édition d'objet */) {
    this.container.find('button[data-type-aobject="otype"]').removeClass('selected')
    this.container.find(`button.obb[data-value="${ot}"]`).addClass('selected')
  }

  const DataType = AOBJETS_TOOLBOX_BUTTONS.otype.items[ot]
  // console.debug("DataType: ", DataType)
  // On commence par masquer tous les groupes de boutons (noter que le
  // groupe principal 'otype' ne possède pas cette classe.)
  $('.buttons-grp-type').addClass('hidden')

  // Ensuite, on réaffiche seulement les groupes visibles
  DataType.visible.forEach(dtype => {
    this.setGroupeBoutons(dtype, dataEditedObjet.objetProps)
    return
    if ( 'string' == typeof(type) ) {
      DGet(`#objets-${type}s`).classList.remove('hidden')
    } else {
      let [otype, buttonsIds, selVisibleButId] = type
      /**
      * ID du bouton à sélectionner. On a trois choix possibles, dans l'ordre
      * de priorité :
      *   1.  C'est l'édition d'un objet, dataEditedObjet est défini, on prend
      *       la valeur correspondant.
      *   2.  Le bouton à sélectionner est défini dans :visible
      *   3.  Le bouton à sélectionner est celui par défaut pour le titre,
      *       donc défini dans la propriété :selected
      ***/
      var selectedButtonId
      if ( dataEditedObjet.objetProps /* cas 1. */) {
        selectedButtonId = dataEditedObjet.objetProps[otype]
      }
      selectedButtonId = selectedButtonId || selVisibleButId || AOBJETS_TOOLBOX_BUTTONS[ot].selected
      console.debug("Pour édition : otype=%s, dataEditedObjet:", otype, dataEditedObjet)
      const buttonsGroup  = $(`#objets-${otype}s`)
      buttonsGroup.removeClass('hidden')
      if ( buttonsIds === null ) {
        /**
        * Le fait que +buttonsIds+ soit NULL signifie 1) que tous les boutons
        * du groupe doivent être affichés et 2) qu'un bouton doit être sélec-
        * tionné. On boucle donc sur tous les boutons pour les faire apparaitre
        * tout en sélectionnant le bouton par défaut
        ***/
        const selectButtonId = `${otype}-${selectedButtonId}`
        buttonsGroup.find('button').each((i, button) => {
          button.classList[button.id == selectButtonId ? 'add' : 'remove']('selected')
          button.classList.add('hidden')
        })
      } else {
        /**
        * Sinon, ça signifie que les seuls boutons à afficher sont définis.
        * On commence par tous les masquer.
        ***/
        buttonsGroup.find('button').each((i, button) => button.classList.add('hidden'))
        // Ensuite, on affiche seulement les boutons utiles, en sélectionnant
        // celui qui doit être sélectionné s'il est défini.
        buttonsIds.forEach( buttonId => {
          const button = $(`button#${otype}-${buttonId}`)
          const isSelected = selectedButtonId === buttonId
          button.removeClass('hidden')
          button[0].classList[isSelected?'add':'remove']('selected')
        })
      }
    }
  })

  /**
  * On actualise l'aperçu qui permet de voir à quoi ressemblera l'objet
  ***/
  this.updateOverview()
}

/**
* Règle le groupe de boutons du type +otype+ (en fonction de ses données
* absolues ainsi que de l'objet édité if any).
*
* +dtype+   Soit l'identifiant du otype, soit une liste contenant :
*           [<otype>, [<boutons à afficher>], [selection par défaut]]
***/
setGroupeBoutons(dtype, objetSelectedProps){
  var otype, buttonsVisible, selectionVisible ;
  if ( 'string' == typeof(dtype) ) {
    otype = dtype
  } else {
    [otype, buttonsVisible, selectionVisible] = dtype
  }
  // Les données absolues pour le type +otype+
  const DataType = AOBJETS_TOOLBOX_BUTTONS.otype.items[otype]
  const buttonsGroup = $(`#objets-${otype}s`)
  // On rend le groupe visible
  buttonsGroup.removeClass('hidden')
  // On affiche tous ses boutons
  buttonsGroup.find('button.obb.hidden').removeClass('hidden')
  // Si une liste de boutons limités est définie (buttonsVisible), on masque
  // les autres
  if ( buttonsVisible ) {
    buttonsGroup.find('button.obb').each((i, btn) => {
      if ( ! buttonsVisible.includes($(btn).data('value')) ){
        // console.log("Bouton masqué : ", btn)
        btn.classList.add('hidden')
      }
    })
  }
  /**
  * Le bouton sélectionné
  ***/
  var selectedButton
  if ( objetSelectedProps ) {
    selectedButton = objetSelectedProps[otype]
  } else {
    selectedButton = selectionVisible || AOBJETS_TOOLBOX_BUTTONS[otype].selected
  }
  console.debug("Bouton de type %s à sélection = %s", otype, selectedButton)

}

getValues(){
  let d = {otype: this.currentOType}
  const DataOType = AOBJETS_TOOLBOX_BUTTONS.otype.items[this.currentOType]
  console.debug("this.currentOType=%s, DataOType = ", this.currentOType, DataOType)
  // On ne prend que les valeurs des types visibles
  /**
  * On ne prend que les valeurs visibles
  *
  * Rappel : dans la propriété :visible, on peut trouver soit un string avec
  * l'otype, soit un array avec en premier élément l'otype et en second les
  * seuls boutons affichés.
  ***/
  DataOType.visible.forEach(ktype => {
    const ot = 'string' == typeof(ktype) ? ktype : ktype[0]
    Object.assign(d, {[ot]: $(`button[data-type-aobject="${ot}"].obb.selected`).data('value')})
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
  $('#aobject_apercu').html('')
  $('#aobject_apercu').append(this.constructor.buildFinalText(vals))
}


/**
* Retourne le otype courant
***/
get currentOType(){
  return $('button[data-type-aobject="otype"].obb.selected').data('value')
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

    TableAnalyse.propsAObjectToolbox.updateOverview()

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
