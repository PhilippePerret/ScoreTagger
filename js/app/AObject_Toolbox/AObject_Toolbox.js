'use strict'
/** ---------------------------------------------------------------------
*   Classe
    -------
      AObjectToolbox (AOTB)
*** --------------------------------------------------------------------- */
class AObjectToolbox {

/***
* Public methods
*
***/

/**
* Initialisation de la boite, à l'ouverture de la table d'analyse
***/
static init(){
  console.debug("-> Initialisation de AObjectToolbox")
  this.build()
}

/**
* Méthode qui construit le texte final en fonction des données choisies
* ou enregistrées.
* Cette méthode est utilisée aussi bien pour l'aperçu que pour la construction
* de l'objet sur la partition.
*
* TODO Dans la version finale, faire que chaque type construise lui-même
* son texte final. Il y aura moins de conditions ici.
*
* +objProps+  Propriétés pour construire l'objet
***/
static finalTextFor(objProps){
  console.debug("-> finalTextFor(data=%s)", JSON.stringify(objProps))

  const otype = objProps.otype
  const forModulation = otype == 'modulation'
  const DataButtons = AOBJETS_TOOLBOX_BUTTONS[otype]
  const DataNature  = AOBJETS_TOOLBOX_BUTTONS.nature

  var mark = ((ot) => {
    switch(ot){
      case 'harmony':
      case 'chord':
      case 'cadence':
        return this.getHumanPropValue(otype, objProps[otype])
      case 'modulation':
        return this.getHumanPropValue('chord', objProps.chord)
      case 'pedale':
        return this.getHumanPropValue('degre', objProps.degre)
      case 'segment':
        return ""
      default:
        return this.getHumanPropValue(otype, objProps.note /* OK?… */)
    }})(otype)

  var alter = objProps.alteration;
  if (alter && alter!='n'){mark += this.getHumanPropValue('alteration', alter)}

  if (objProps.nature && objProps.nature != 'Maj') {
    mark += this.getHumanPropValue('nature', objProps.nature)
  }

  if (forModulation && objProps.harmony != '0') {
    mark += `<span class="rel">${this.getHumanPropValue('harmony', objProps.harmony)}</span>`
  }

  if ( otype == 'harmony' && objProps.renv != 0) {
    const DataRenv = AOBJETS_TOOLBOX_BUTTONS.renv
    const renv = objProps.renv
    mark += this.getHumanPropValue('renv', objProps.renv)
  }

  // Quand c'est une modulation, il faut placer la marque dans un div.mark qui
  // permettra de la mettre de travers
  if ( forModulation ) { mark = `<div class="mark">${mark}</div>` }

  /**
  * Le DIV qui sera retourné autant pour l'aperçu que pour l'objet final
  * sur la partition.
  ***/
  let css = ['aobjet', otype]
  if ( otype == 'segment' ) { css.push(objProps.segment) }
  const div = DCreate('DIV', {class:`${css.join(' ')}`, text:mark})

  forModulation && div.appendChild(DCreate('DIV', {class:'vline'}))

  return div
}

/**
* Méthode qui permet d'éditer le bouton +aobjet+ (instance AObject)
*
* Lorsque c'est une édition, on affiche en plus les boutons de positionnement
* qui permettent de définir la largeur, la position x, la ligne de pose, etc.
***/
static editAObject(aobjet){
  this.editedObject = aobjet
  this.setInterfaceForAObject(aobjet)
}

static uneditAObject(aobjet){
  this.setInterfaceForType('chord')
  /**
  * Il faut mettre editedObject à null seulement ici, sinon la méthode
  * setInterfaceForType ne règlerait pas le bouton du type sélectionné
  ***/
  this.editedObject = null
}

// /Fin des méthodes publiques
// ---------------------------------------------------------------------
//

/**
* Méthode qui prépare l'interface pour l'objet +aobjet+
***/
static setInterfaceForAObject(aobjet){
  // Indiquer visuellement l'objet édité
  // TODO
  this.container.find('#edited-objet-id').html(aobjet.id)
  // On prépare l'interface de façon générale
  this.setInterface()
  // Préparer les boutons
  this.setInterfaceForType(aobjet.otype, aobjet.data)
}

static setInterface(){
  /**
  * Si la ligne "segment" ne doit pas être utilisée, on masque son bouton
  ***/
  this.buttonsGroup('segment').prepare()
}

/** ---------------------------------------------------------------------
*   Properties Methods
*   Méthodes pour obtenir des valeurs de propriété
*** --------------------------------------------------------------------- */

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
static getHumanPropValue(otype, id){
  try {
    const dat = AOBJETS_TOOLBOX_BUTTONS[otype].items[id]
    if ( dat.img ) {
      return `<img src="img/${dat.img}.png" class="objet-prop-img ${otype}" />`
    } else {
      return `<span class="${otype}">${dat.text}</span>`
    }
  } catch (e) {
    console.error("Problème fatal dans PropsAObjectToolbox::getHumanPropValue avec otype=%s, id=%s", otype, id)
    console.error("ERREUR : ", e)
    console.error("Pour information, AOBJETS_TOOLBOX_BUTTONS = ", AOBJETS_TOOLBOX_BUTTONS)
    return '[?]'
  }
}

/** ---------------------------------------------------------------------
*   Build Methods
*   Méthodes de construction
*** --------------------------------------------------------------------- */

/**
* Construction de la boite d'outils
***/
static build(){
  // Pour pouvoir récupérer un groupe par this.buttonsGroup(<group name>)
  this.buttonsGroups = {}
  // On construit par groupe de bouton
  for(var otype in AOBJETS_TOOLBOX_BUTTONS){
    if ( otype == 'otype' ) {
      this.buttonsGroups['otype'] = new OTypeButtonsGroupAOTB()
    } else {
      this.buttonsGroups[otype] = new ButtonsGroupAOTB(otype)
    }
    this.buttonsGroups[otype].build()
  }
}

/** ---------------------------------------------------------------------
*   Deep Methods
*
* Méthodes qui ne servent en général qu'une seule fois
*** --------------------------------------------------------------------- */

/**
* Observation de la boite d'outils en général
***/
static observe(){

}

/** ---------------------------------------------------------------------
*   Properties Methods
*
*** --------------------------------------------------------------------- */
static get container(){return this._cont||(this._cont = DGet('div#aobject-toolbox'))}


}// AObjectToolbox
