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
  console.clear()
  console.debug("-> Initialisation de AObjectToolbox")
  this.initFormatters()
  this.build()
  this.initInterface()
}

/**
* Initialisation de tous les formateurs d'objet
***/
static initFormatters(){
  this.ObjectFormatters = {
      'chord':      new ChordFormatter()
    , 'harmony':    new HarmonyFormatter()
    , 'modulation': new ModulationFormatter()
    , 'cadence':    new CadenceFormatter()
    , 'segment':    new SegmentFormatter()
    , 'pedale':     new PedaleFormatter()
  }
}
/**
* Méthode qui actualise l'aperçu de l'objet qui permet de voir à quoi
* ressemblera l'objet en fonction des boutons pressés (des paramètres choisis)
***/
static updateOverview(){
  this.OverviewContainer.html('')
  this.OverviewContainer.append(this.finalTextFor(this.getValues()))
}

/**
* Le container de l'aperçu du bouton
***/
static get OverviewContainer(){
  return this._overview || (this._overview = $('div#aobject_apercu'))
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
  return this.ObjectFormatters[objProps.otype].format(objProps)
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
* Récupère les valeurs dans la boite à outils en fonction des boutons
* pressés.
* Pour récupérer ces valeurs, on prend chaque bouton sélectionné de chaque
* groupe de boutons (boutons principaux compris).
***/
static getValues(){
  /**
  * On récupère l'instance MainGButton du type d'objet courant pour pouvoir
  * lui demander de relever les données.
  * On passe par lui car il connait tous les groupes qu'il faut relever.
  ***/
  const otype = this.OTypeButtons.selected.value
  const mainGButton = MainGButtonAOTB.get(otype)
  console.log("mainGButton.getValues() = ", mainGButton.getValues())
  return mainGButton.getValues()
}

/**
* Méthode qui prépare l'interface pour le type +otype+ ('chord', 'modulation',…)
***/
static initInterface(){
  console.warn("On doit initier la boite à outils des objets d'analyse")
}

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
  this.BGroup('segment').prepare()
}

/** ---------------------------------------------------------------------
*   Properties Methods
*   Méthodes pour obtenir des valeurs de propriété
*** --------------------------------------------------------------------- */


/** ---------------------------------------------------------------------
*   Build Methods
*   Méthodes de construction
*** --------------------------------------------------------------------- */

/**
* Construction de la boite d'outils
*
* Produit :
*   this.OTypeButtons     Instance du groupe des boutons principaux
*   this.BGroups          Tables des instances de groupes de boutons de chaque
*                         gtype.
***/
static build(){
  const my = this
  console.clear()
  console.debug("-> AObjectToolbox.build()")
  // On construit le groupe des boutons principaux d'otype
  this.OTypeButtons = new MainButtonsAOTB()
  this.OTypeButtons.build()
  // On construit tous les autres boutons, en les masquant
  my.BGroups = {}
  Object.keys(AOBJETS_TOOLBOX_BUTTONS_GROUPS).forEach( kgroup => {
    const bgroup = new BGroupAOTB(kgroup)
    bgroup.build()
    bgroup.hide()
    Object.assign(my.BGroups, {[kgroup]: bgroup})
  })
  // On prépare les instances MainGButtonAOTB
  Object.values(AOBJETS_TOOLBOX_OTYPE_BUTTONS.items).forEach(dmainbutton => {
    new MainGButtonAOTB(dmainbutton)
  })

  // On sélectionne les accords en simulant le clic sur le bouton "Accord"
  $(ButtonAOTB.get('otype-chord').obj).click()
}

/**
* Retourne l'instance générale BGroupAOTB du groupe de gtype +gtype+
***/
static bGroup(gtype) { return this.BGroups[gtype] }

/** ---------------------------------------------------------------------
*   Deep Methods
*
* Méthodes qui ne servent en général qu'une seule fois
*** --------------------------------------------------------------------- */

// /**
// * Retourne l'instance {ButtonsGroupAOTB} de nom +name+ ('note','degre',…)
// ***/
// static BGroup(name){
//   console.log("BGroup(%s)", name, this.BGroups)
//   return this.BGroups[name]
// }

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
