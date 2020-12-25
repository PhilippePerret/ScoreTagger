'use strict';
/**
* Pour les accords (chord) et les marques harmoniques (harmony), la
* largeur minimale que doit avoir le div de l'objet pour que le trait
* apparaisse (en pixel). Par exemple pour faire "C ------"
***/
const MIN_WIDTH_OBJET_WITH_TRAIT = 40

class AObject {

static newId(){
  if (undefined === this.lastId) this.lastId = 0 ;
  return ++ this.lastId;
}

static add(item){
  if (undefined == this.items) this.items = {};
  Object.assign(this.items, {[item.id]: item})
}

/**
* Création d'un nouvel objet d'analyse
* Retourne l'instance du nouvel objet créé.
***/
static create(odata){
  const aobj = new AObject(odata)
  aobj.build()
  aobj.system.append(aobj)
  return aobj
}

/**
* Pour détruire un objet
***/
static remove(item){
  this.selection.remove(item)
  if (undefined != this.items) {
    delete this.items[item.id]
  }
  item.obj.remove()
}

// On peut utiliser AObject.selection.add ou AObject.selection.remove pour
// ajouter ou supprimer des éléments à la sélection
static get selection(){return this._selection||(this._selection = new Selection(this))}
static onSelect(item) {
  item.edit()
}
static onDeselect(item){
  item.unedit()
}

/**
* Retourne les propriétés de l'objet
* Ici, la méthode sert pour la création du nouvel objet. Elle doit aussi servir
* pour son actualisation.
***/
static getObjetProps() { return AObjectToolbox.getValues() }

/**
* Data:
*   id:     Identifiant (nombre)
*   left:   Décalage x (horizontal)
*   objetProps: Les propriétés d'objet, telles que définie dans la toolbox
*
***/
constructor(data) {
  if ( undefined === data.left ) data = this.fromDataSaved(data)
  this.data = data
  this.id = this.data.id || this.constructor.newId()
  this.system = ASystem.getByMinId(this.data.system)
  this.objetProps = data.objetProps
  this.constructor.add(this)
}

get ref(){return this._ref || (this._ref = `AObject#${this.id}[${this.otype}]`)}

/** ---------------------------------------------------------------------
*   Pour les mesures
*
*** --------------------------------------------------------------------- */
// Position relative haute par rapport au système
// Note : elle est négative si l'objet se trouve au-dessus du système
get relativeTop(){
  return  this.data.top ? this.data.top : this.naturalTop ;
}
// get top(){return this.relativeTop}

/**
* Retourne le top "naturel" en fonction du type. C'est donc le top
* qu'aura l'objet si son top n'a pas été rectifié
***/
get naturalTop(){
  return this._relativetop || (this._relativetop = this.calcTopPerType())
}

// Hauteur de l'objet
get height(){
  return this._height || (this._height = $(this.obj).height())
}
/** ---------------------------------------------------------------------
  *   Apparence de l'objet sur la table
  *
*** --------------------------------------------------------------------- */
/**
* Pour masquer l'objet (pour le moment, pendant la lecture de l'analyse)
***/
hide(){
  this.obj.classList.add('hiddenO')
}
showSlowly(){
  this.obj.classList.remove('hiddenO')
}

/**
* Les données de l'objet qu'il faut sauvegarder
***/
get data2save(){
  return {
      i: this.id || this.constructor.newId()
    , s: this.system.minid
    , p: this.data.line // ligne de pose (si changement)
    , l: this.data.left
    , w: this.data.width
    , o: this.objetProps
  }
}

/**
* Les données sont enregistrées avec des diminutifs, cette méthode permet
* d'obtenir les vrais noms de propriétés
***/
fromDataSaved(data){
  return {
      id: data.i
    , system: data.s
    , left: data.l
    , width: data.w
    , line: data.p
    , objetProps: data.o
  }
}

/**
* Actualisation de toutes les propriétés de note (accord, degré, etc.)
***/
updateAll(newObject, newValues){
  this.modified = true
  this.data.objetProps = newValues
  $(this.obj).html(newObject.innerHTML)
}

/**
* Actualisation (après modification dans la boite d'édition)
*
* Note : on actualise l'intérieur pour ne pas avoir à supprimer et remettre
*        les observers.
***/
update(prop, newValue){
  __in(`${this.ref}#update`, {prop: prop, value: newValue})
  const oldValue = this.data[prop]
  console.log("oldValue = ", `${oldValue}`)
  this.data[prop] = newValue // this.build en a besoin ci-dessous
  switch(prop){
  case 'width' : this.changeWidth(newValue, oldValue || $(this.obj).width()); break
  case 'height': $(this.obj).css('height', px(newValue)); break
  default:
      $(this.obj).html(this.build().innerHTML)
  }
  __out(`${this.ref}#update`)
}

/**
* Pour changer la largeur (width) de l'objet
* Pour une cadence, il faut "reculer" le left, c'est-à-dire allonger par la
* gauche, pas par la droite.
***/
changeWidth(newValue, oldValue){
  if ( this.otype == 'cadence' ) {
    var dif = oldValue - newValue
    this.data.left += dif
    $(this.obj).css('left', px(this.data.left))
  }
  $(this.obj).css('width', px(newValue));
  this.data.width = newValue
  // Faut-il faire apparaitre le trait
  if ( ['chord', 'harmony', 'pedale'].includes(this.otype) ) {
    if ( false == ( (newValue < 60) === (oldValue < 60) ) ) {
      this.setTraitVisibility()
    }
  }
}

setTraitVisibility(){
  if ( this.obj.querySelector('div.trait') ) {
    this.obj.querySelector('div.trait').classList[this.data.width < 60 ? 'add' : 'remove']('hidden')
  }
}
/**
* Construction de l'objet d'analyse
*
* @note : il n'est pas écrit dans cette méthode
***/
build(){
  // console.debug("Construction de l'objet : ", this.data)
  // On a besoin du score courant
  const oProps  = this.objetProps
  const score   = Score.current
      , left    = this.data.left

  /**
  * On récupère le DIV qui est renvoyé par le constructeur du texte final
  ***/
  const div = AObjectToolbox.finalTextFor(oProps)
  div.id = `ao-${this.data.id}`

  // ID, zoom, position et taille
  const dobj = { left: left }
  this.data.width && Object.assign(dobj, {width: this.data.width})

  div.setAttribute('style', px(dobj, true))

  this._obj = div

  this.positionne()
  this.setTraitVisibility()
  this.observe()

  return div // utile pour update (?)
}

positionne(){
  this.repositionne() // pour le moment, la même chose
}

repositionne(){
  $(this.obj).css('top', px(this.relativeTop))
}

/**
* Méthode appelée pour éditer l'objet
***/
edit(){
  this.isEdited = true
  AObjectToolbox.editAObject(this)
}
unedit(){
  AObjectToolbox.uneditAObject(this)
  this.isEdited = false
}

observe(){
  const my = this

  // Attention à ce qu'elles ne vienne pas en conflit avec le menu contextuel
  $(this.obj).on('mousedown', this.onMouseDown.bind(this))

  // Menu context
  const dataCMenu = [
    {name: 'Mettre sur la ligne de pose supérieure', method: this.onChangeLignePose.bind(this, 1)}
  , {name: 'Mettre sur la ligne de pose inférieur', method: this.onChangeLignePose.bind(this, -1)}
  ]
  new ContextMenu(this.obj, dataCMenu)
}

onMouseDown(ev){
  if (ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey) return true;
  if ( this.moving ) return stopEvent(ev)
  this.moving = true
  this.hasBeenMoved = false
  this.offsetXStart = ev.clientX
  this.leftInit = this.data.left
  window.onmousemove = this.onMouseMove.bind(this)
  window.onmouseup = this.onMouseUp.bind(this)
  $(this.obj).on('mouseup', this.onMouseUp.bind(this))
}
// Déplacement
onMouseMove(ev){
  if ( this.moving ) {
    const decalage = ev.clientX - this.offsetXStart
    var newLeft = this.leftInit + decalage
    Math.abs(decalage) > 5 && ( this.hasBeenMoved = true )
    this.data.left = newLeft
    $(this.obj).css('left', px(newLeft))
  }
}
// Fin du déplacement
onMouseUp(ev){
  window.onmousemove = null
  window.onmouseup = null
  $(this.obj).off('mouseup', this.onMouseUp.bind(this))
  this.moving = false
  /**
  * Si l'objet n'a pas été bougé ("vrai" clic de souris), on le sélectionne
  * ou désélectionne.
  * Rappel : on considère qu'il y a eu déplacement si le déplacement a plus
  * de 5 pixels. Ça évite les faux déplacements quand on veut simplement cliquer
  * l'objet mais qu'on "glisse" un peu dessus
  ***/
  this.hasBeenMoved ? this.onMoved() : this.toggleSelect(ev)
  return stopEvent(ev)
}

/**
* Méthode appelée quand on a fini de déplacer l'objet
* Note : il faut au moins un déplacement de 5 pixels
* Note 2 : c'est un déplacement à la souris, pas avec les incButtons
***/
onMoved(){
  this.modified = true
  this.system.modified = true
}

/**
* Méthode appelée par le menu contextuel pour changer l'objet de ligne
* de pose, exceptionnellement
* +which+ 1: ligne supérieure, -1: ligne inférieur
***/
onChangeLignePose(newLignePose, ev){
  __in(`${this.ref}#onChangeLignePose`, {line: newLignePose})
  const naturalLignePose = LINES_POSE.indexOf(this.otype)
  this.data.line = newLignePose != naturalLignePose ? newLignePose : null
  __add("Nouvelle ligne de pose : ", {line:this.data.line, natural: LINES_POSE[this.data.line]})
  this.repositionne()
  __out(`${this.ref}#onChangeLignePose`)
}

onChangeXByDrag(ev, ui){
  this.data.left = parseInt(ui.position.left, 10)
  if ( this.isEdited ) AObjectToolbox.buttonPosX.set(this.data.left)
}

toggleSelect(ev){
  this.isSelected ? this.deselect(ev) : this.select(ev)
}
select(ev){
  this.constructor.selection.add(this,ev)
}
deselect(ev){
  this.constructor.selection.remove(this,ev)
}
setSelected(){
  $(this.obj).addClass('selected')
}
unsetSelected(){
  $(this.obj).removeClass('selected')
}

get left(){return this.data.left}
get otype(){ return this._otype || (this._otype = this.objetProps.otype) }
get obj(){return this._obj}


/** ---------------------------------------------------------------------
  *   CALCUL METHODS
  *
*** --------------------------------------------------------------------- */

/**
* Calcule le top "naturel" de l'objet, en fonction de son type et, parfois
* (comme pour le segment) de sa valeur. Ces valeurs correspondent aux valeurs
* de préférence qu'on peut déterminer sur la première page (page d'accueil de
* l'application).
***/
calcTopPerType(){
  const ot = this.otype == 'segment' && this.objetProps.segment == 'down'
                ? 'segment_down'
                : this.otype
  return this.system.topPerTypeObjet(ot, this.data.line)
}

}// class AObject
