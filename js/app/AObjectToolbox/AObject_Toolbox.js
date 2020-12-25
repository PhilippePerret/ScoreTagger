'use strict'

/** ---------------------------------------------------------------------
*   Classe
    -------
      AObjectToolbox (AOTB)
*** --------------------------------------------------------------------- */
class AObjectToolbox {

/** ---------------------------------------------------------------------
  *   PUBLIC METHODS
  *
*** --------------------------------------------------------------------- */

/**
* Initialisation de la boite, à l'ouverture de la table d'analyse
***/
static init(){
  __in('AObjectToolbox::init()')
  this.build()
  this.inited = true
  __out('AObjectToolbox::init()', {inited: AObjectToolbox.inited})
}

/**
* Méthode qui actualise l'aperçu de l'objet qui permet de voir à quoi
* ressemblera l'objet en fonction des boutons pressés (des paramètres choisis)
*
* Si un objet d'analyse est édité, on l'actualise aussi
***/
static updateOverview(){
  __in('AObjectToolbox::updateOverview')
  this.OverviewContainer.html('')
  const newObject = this.finalTextFor(this.getValues())
  this.OverviewContainer.append(newObject)
  this.editedObject && this.editedObject.updateAll(newObject, this.getValues())
  __out('AObjectToolbox::updateOverview')
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
* +objProps+  Propriétés pour construire l'objet
***/
static finalTextFor(objProps){
  const smd = {} // pour SmartDebug
  Object.assign(smd, objProps) // idem
  __in('AObjectToolbox::finalTextFor', Object.assign(smd, {skip: true}))
  const otype = objProps.otype
  if ( undefined === this.formatters ) this.formatters = {}
  this.formatters[otype] || Object.assign(this.formatters, {[otype]: new AObjectFormatter(otype)})
  const formed = this.formatters[otype].format(objProps)
  __out('AObjectToolbox::finalTextFor', {skip: true})
  return formed
}

/**
* Méthode qui permet d'éditer le bouton +aobjet+ (instance AObject)
*
* Lorsque c'est une édition, on affiche en plus les boutons de positionnement
* qui permettent de définir la largeur, la position x, la ligne de pose, etc.
***/
static editAObject(aobjet){
  __in('AObjectToolbox::editAObject', {objet: aobjet})
  this.editedObject = aobjet
  this.setInterfaceForAObject(aobjet)
  __out('AObjectToolbox::editAObject')
}

static uneditAObject(aobjet){
  __in('AObjectToolbox::uneditAObject', {objet: aobjet})
  this.setInterfaceForType('chord')
  $(this.container).find('#edited-aobject-id').html('')
  this.editedObject = null
  __out('AObjectToolbox::uneditAObject')
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
  return MainGButtonAOTB.get(this.OTypeButtons.selected.value).getValues()
}

/**
* Méthode qui prépare l'interface pour l'objet +aobjet+
***/
static setInterfaceForAObject(aobjet){
  __in('AObjectToolbox::setInterfaceForAObject', {objet:aobjet})
  // Indiquer visuellement l'objet édité
  $(this.container).find('#edited-aobject-id').html(aobjet.id)
  // Préparer les boutons
  this.setInterfaceForType(aobjet.otype, aobjet)
  __out('AObjectToolbox::setInterfaceForAObject')
}

/**
* Prépare l'interface pour le type d'objet +otype+, peut-être avec les
* valeurs de l'objet +oData+
***/
static setInterfaceForType(otype, aobjet){
  __in('AObjectToolbox::setInterfaceForType', {otype:otype, objet:aobjet})
  // console.debug("-> setInterfaceForType(otype='%s', aobjet=)", otype, aobjet)
  this.OTypeButtons.setSelected(ButtonAOTB.get(`otype-${otype}`))
  MainGButtonAOTB.get(otype).configureToolbox(aobjet && aobjet.objetProps)
  const widthable  = ['pedale','chord','harmony','segment','cadence'].includes(otype)
  const heightable = ['modulation','segment'].includes(otype)
  this.buttonWidth[widthable?'show':'hide']()
  this.buttonHeight[heightable?'show':'hide']()
  this.editObjectCoordonnates(aobjet) // même si aobjet n'est pas défini
  __out('AObjectToolbox::setInterfaceForType')
}

/**
* Mise en édition des coordonnées (*) de l'objet +aobjet+ ou masque l'interface
* de choix des coordonnées
* (*) Principalement car d'autres propriétés peuvent également être modifiées
***/
static editObjectCoordonnates(aobjet){
  $('div#div-coordonates')[aobjet?'removeClass':'addClass']('hidden')
  if ( aobjet ) {
    // Coordonnées x, y, w, et h (selon le type)
    this.buttonPosX.set(aobjet.data.left)
    this.buttonPosY.set(aobjet.data.top || 0)
    this.buttonWidth.set( aobjet.data.width || parseInt($(aobjet.obj).width(),10) )
    this.buttonHeight.set( aobjet.data.height || parseInt($(aobjet.obj).height(),10) )
    // Menu pour placer sur une autre ligne de pose
    this.menuLignePose.val(aobjet.data.line || LINES_POSE.indexOf(aobjet.otype))
  }
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
  __in('AObjectToolbox::build()')
  const my = this
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

  // On prépare les boutons de coordonnées
  // Les boutons à incrémentation
  this.buttonPosX = new IncButton({container:'#aobj-pos-x', onchange:this.onChangeX.bind(this)})
  this.buttonPosX.build()
  this.buttonPosY = new IncButton({container:'#aobj-pos-y', onchange:this.onChangeY.bind(this)})
  this.buttonPosY.build()
  this.buttonWidth = new IncButton({container:'#aobj-pos-w', onchange:this.onChangeW.bind(this)})
  this.buttonWidth.build()
  this.buttonHeight = new IncButton({container:'#aobj-pos-h', onchange:this.onChangeH.bind(this)})
  this.buttonHeight.build()

  // On prépare le menu qui permet de changer de ligne de pose
  this.menuLignePose = $('select#ligne-pose')
  for (var iline = 0, len = LINES_POSE.length; iline < len; ++ iline) {
    var otype = LINES_POSE[iline]
    var hname = AOBJETS_TOOLBOX_OTYPE_BUTTONS.items[otype].text
    this.menuLignePose.prepend(DCreate('OPTION', {value:iline, text:hname}))
  }

  // Le bouton pour détruire l'objet
  $('#btn-destroy-aobject').on('click', this.removeObjet.bind(this))

  // On sélectionne les accords en simulant le clic sur le bouton "Accord"
  $(ButtonAOTB.get('otype-chord').obj).click()

  __out('AObjectToolbox::build()')
}

// Pour supprimer l'objet (définitivement)
static removeObjet(ev){
  if ( Score.current.preferences.binary('analyse.confirm_destroy') || confirm("Es-tu certain de vouloir détruire cet objet d'analyse ?")){
    AObject.remove(this.editedObject)
  }
}

static onChangeX(newValue){
  this.editedObject.update('left', Number(newValue))
}
static onChangeY(newValue){
  this.editedObject.update('top', Number(newValue))
}
static onChangeW(newValue){
  this.editedObject.update('width', Number(newValue))
}
static onChangeH(newValue){
  this.editedObject.update('height', Number(newValue))
}
static onChangeLignePose(ev){
  const newVal = Number($(this.menuLignePose).val())
  this.editedObject.update('line', newVal)
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

/**
* Observation de la boite d'outils en général
***/
static observe(){
  __in('AObjectToolbox::observe')
  $(this.menuLignePose).on('change', this.onChangeLignePose.bind(this))
  __out('AObjectToolbox::observe')
}

/** ---------------------------------------------------------------------
*   Properties Methods
*
*** --------------------------------------------------------------------- */
static get container(){
  return this._conteneur || (this._conteneur = this.getContainer() )
}
static getContainer(){return DGet('div#aobject-toolbox')}

}// AObjectToolbox
