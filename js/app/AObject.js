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
      // , system:     this.system.minid
    , s: this.system.minid
    // // , top:        this.top
    // NON : maintenant, on ne mémorise plus la valeur top de l'objet, car
    // il doit se placer sur la "ligne de pose" normale pour son otype ou
    // celle rectifiée définie dans this.data.line
    // , t: this.top
    // , line:       this.data.line // si on a changé l'objet de ligne de pose
    , p: this.data.line // si on a changé l'objet de ligne de pose
    // , left:       this.data.left
    , l: this.data.left
    // , width:      this.data.width
    , w: this.data.width
    // NON :  comme pour le top ci-dessus, on essaie d'enregistrer le minium
    //        de valeur pour utiliser au maximum les valeurs conventionnelles.
    // // , height:     this.data.height
    // , h: this.data.height
    // , objetProps: this.objetProps
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
  console.warn("Vérifier les nouvelles valeurs.", newValues)
  $(this.obj).html(newObject.innerHTML)
}

/**
* Actualisation (après modification dans la boite d'édition)
*
* Note : on actualise l'intérieur pour ne pas avoir à supprimer et remettre
*        les observers.
***/
update(prop, newValue){
  console.debug("Update propriété '%s' de %s avec la valeur '%s'",prop, this.ref, String(newValue))
  this.data[prop] = newValue
  $(this.obj).html(this.build().innerHTML)
}

/**
* Construction de l'objet d'analyse
*
* @note : il n'est pas écrit dans cette méthode
***/
build(){
  // console.debug("Construction de l'objet : ", this.data)
  // On a besoin du score courant
  const oProps = this.objetProps
  const score = Score.current
      , top   = this.system.topPerTypeObjet(oProps.otype, this.data.line)
      , left  = this.data.left

  // On renseigne this.top qui servira par exemple pour la lecture de l'analyse
  this.top = top

  /**
  * On récupère le DIV qui est renvoyé par le constructeur du texte final
  ***/
  const div = AObjectToolbox.finalTextFor(oProps)

  // ID, zoom, position et taille
  const dobj = {
      id:`ao-${this.data.id}`
    , top: TableAnalyse.byScaleFactor(top)
    , left: left
    , zoom: `${TableAnalyse.ScoreScale}%;`
  }
  this.data.width   && Object.assign(dobj, {width: this.data.width})

  div.setAttribute('style', px(dobj, true))

  if ( ['chord','harmony','pedale'].includes(this.otype) ) {
    div.appendChild(DCreate('DIV', {class:`trait${this.data.width > 60 ?'':' hidden'}`}))
  }

  this._obj = div

  this.observe()

  return div // utile pour update
}

repositionne(){
  this.top = this.system.topPerTypeObjet(this.otype, this.data.line)
}

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
  new ContextMenu(this.obj, dataCMenu, {onclick: this.toggleSelect.bind(this)})
}

onMouseDown(ev){
  if (ev.ctrlKey||ev.metaKey||ev.shiftKey||ev.altKey) return true;
  this.moving = true
  this.offsetXStart = ev.clientX
  this.leftInit = this.data.left
  // console.debug("Démarrage du drag : ", ev)
  window.onmousemove = this.onMouseMove.bind(this)
  window.onmouseup = this.onMouseUp.bind(this)
  $(this.obj).on('mouseup', this.onMouseUp.bind(this))
}
// Déplacement
onMouseMove(ev){
  if ( this.moving ) {
    const decalage = TableAnalyse.byScaleFactor(ev.clientX - this.offsetXStart)
    var newLeft = this.leftInit + decalage
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
  return stopEvent(ev)
}

/**
* Méthode appelée par le menu contextuel pour changer l'objet de ligne
* de pose, exceptionnellement
* +which+ 1: ligne supérieure, -1: ligne inférieur
***/
onChangeLignePose(which, ev){
  console.debug("-> onChangeLignePose(which=%i)", which)
  if ( !this.data.line ) this.data.line = LINES_POSE.indexOf(this.otype) + 1
  this.data.line += which
  console.debug("Nouvelle ligne de pose : ", this.data.line, LINES_POSE[this.data.line])
  this.repositionne()
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

}
