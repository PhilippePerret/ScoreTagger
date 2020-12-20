'use strict';
/** ---------------------------------------------------------------------
  *   Classe ASystem
  *   --------------
  *   Gestion des systèmes de la partition
  *
*** --------------------------------------------------------------------- */

// Nombre de pixels pour un centimètre
const CM2PIXELS = 37.795280352161
const PAGE_HEIGHT_PX = parseInt(CM2PIXELS * 29.7, 10)
const VMARGE_PX = CM2PIXELS * 2

class ASystem {

static get(index){
  return this.items[index]
}
static getByMinId(minid){
  return this.itemsByMinId[minid]
}

static add(system){
  if (undefined == this.items){
    this.items = {}
    this.itemsByMinId = {}
  }
  Object.assign(this.items, { [system.index]: system})
  Object.assign(this.itemsByMinId, { [system.minid]: system})
}

/** ---------------------------------------------------------------------
  *
  *   INSTANCE
  *
*** --------------------------------------------------------------------- */
constructor(data) {
  this.data = data
  this.minid          = data.minid    // p.e. "2-6" ("<page>-<index+1>")
  this.index          = data.index    // l'index absolu du system (0-start)
  this.indexInPage    = data.indexInPage
  this.top            = data.top  // pas forcément défini à l'instanciation
  this.page           = data.page // numéro de page (1-start)
  this.fullHeight     = data.fullHeight
  this.rHeight        = data.rHeight
  this.nombre_mesures = data.nombre_mesures
  // Propriété volatiles
  this._modified = false
  this.score    = Score.current
  this.aobjets  = []
  this.constructor.add(this)
}

get ref(){return this._ref || (this._ref = `ASystem[minid=${this.minid}]`)}

/**
* Méthode de sauvegarde du system
*
* Un système est sauvé avec ses données générales et ses objets dans
* un fichier séparé, dans le dossier <analyse>/systems/data/
***/
save(){
  const my = this
  __in(`${this.ref}#save`)
  Ajax.send('save_system.rb', {data: this.data2save}).then(ret => {
    console.info("Système %s sauvé avec succès.", this.minid)
    my.modified = false
    __out(`${this.ref}#save`, {modified: this.modified})
  })
}

get data2save(){
  var data_aobjects = []
  if ( this.aobjets ) {
    this.aobjets.forEach(aobj => data_aobjects.push(aobj.data2save))
  }
  this.data.aobjects = data_aobjects
  return this.data
}


get modified(){ return this._modified }
set modified(v){
  this._modified = v
  if ( v == true ) {
    __add(`${this.ref} marqué modifié`)
    Score.current.modified = v ;
  }
}
/**
* Méthode qui reçoit le clic sur le système
***/
onClick(ev){
  if ( ev.metaKey ) { // géré par le menu contextuel
    return false
  }
  if ( ev.target.className == 'system' ) {
    this.createNewAObjet(ev)
  }
}

/**
* Méthode appelée quand on clique sur le numéro de la première mesure
***/
onClickNumeroMesure(ev){
  var num = this.nombre_mesures || 3
  num = prompt("Nombre de mesures de ce système :", num)
  if ( num || NaN(num) ) {
    this.nombre_mesures = this.data.nombre_mesures = Number(num)
    this.modified = true
    Score.current.setNumerosFirstMesures()
    message("Le nombre de mesure a été actualisé, ainsi que les numéros de premières mesures.")
  }
}

/**
* Dessine tous les objets d'analyse du système (tous ceux qui ont été
* enregistrés)
* On en profite aussi pour les ajouter à la liste this.aobjets
***/
draw(){
  __in(`${this.ref}#draw`, {aobjets: this.data.aobjects, skip:true})
  if ( !this.data.aobjects || this.data.aobjects.length == 0) return ;
  this.data.aobjects.forEach(dobjet => {
    // Object.assign(dobjet, {})
    const aobjet = new AObject(dobjet)
    aobjet.build()
    // On colle l'objet sur la table d'analyse, accroché au système
    this.obj.appendChild(aobjet.obj)
    // On l'ajoute à la liste des objets du système
    this.addObjet(aobjet)
    // On règle le lastId au cas où
    if ( undefined === AObject.lastId || dobjet.id > AObject.lastId ) {
      AObject.lastId = dobjet.id
    }
  })
  __out(`${this.ref}#draw`, {skip:true})
}

/**
* Pour créer un nouvel objet d'analyse (AObject)
***/
createNewAObjet(ev){
  const objProps = AObject.getObjetProps()
  const odata = {
      id: AObject.newId()
    , left: TableAnalyse.byScaleFactor(ev.offsetX - 10)
    , objetProps: objProps
    , system: this.minid
  }
  const aobj = AObject.create(odata)
  this.pref_select_new_objet && aobj.select({})
  this.modified = true
}

get pref_select_new_objet(){
  return Score.current.preferences.binary('analyse.select_just_created')
}
/**
* Pour ajouter l'objet au système.
* Ça consiste à :
*   - ajouter l'élément DOM de l'objet
*   - ajouter l'instance à la liste des objets
* +aobj+  Instance de l'objet
***/
append(aobj){
  this.obj.appendChild(aobj.obj)
  this.addObjet(aobj)
}

/**
* Méthode pour ajouter l'objet +obj+ au système (liste), à sa création ou
* à son chargement.
***/
addObjet(obj){
  this.aobjets.push(obj)
}

/**
* Construction du système sur la partition
***/
build(){
  const my = this
  const score = Score.current
  const Prefs = score.preferences
  my.imageLoaded = false
  const img = DCreate('IMG', {id: `image-system-${my.minid}`, class:'system', 'data-id': my.minid, src: this.imageSrc})
  const div = DCreate('DIV', {id: this.id, class:'system', 'data-id': my.minid, inner:[img]})
  my.container.appendChild(div)

  /**
  * Pour le numéro de mesure
  * Il sera masqué par Score.draw si les préférences le demandent
  ***/
  const numMes = DCreate('SPAN', {class:'numero-mesure', text:my.numero_first_mesure||'-'})
  div.appendChild(numMes)
  $(numMes).on('click', this.onClickNumeroMesure.bind(this))

  // On place un observer sur l'image pour savoir si elle est chargée
  $(img).on('load', ev => {
    if ( img.complete && img.naturalHeight != 0) {
      my.imageLoaded = true
    }
  })
  this.obj = div
  this.observe()
}

/**
* Positionne le système sur la table d'analyse et dessine ses objets
*
* C'est la méthode utilisée par le premier affichage de la partition.
***/
positionneAndDraw(){
  this.positionne()
  this.draw()
}

/**
* Positionnement du système
* -------------------------
*
* @note   Le top doit avoir déjà été calculé.
* @note   On règle aussi toujours la hauteur du conteneur des systèmes
*         afin de pouvoir exporter en page unique
***/
positionne(){
  this.obj.style.top = `${this.top}px`
  this.container.style.height = `${this.top + 500}px`
  ASystem.top_last_system = this.top
}
repositionne(){
  this.obj.style.top = `${this.top}px`
}

observe(){
  /**
  * L'observation, principalement, permet de créer les objets d'analyse
  * en cliquant sur le système concerné
  ***/
  // $(this.obj).on('click', this.onClick.bind(this))
  $(this.obj).on('mousedown', this.onMouseDown.bind(this))
  $(this.obj).on('mouseup', this.onMouseUp.bind(this))

  const dataCMenu = [
    {name: "Repositionner le système…", method: this.onWantToMoveSystem.bind(this)}
  ]
  new ContextMenu(this.obj, dataCMenu)

}

onMouseDown(ev){
  this.xmousedown = ev.offsetX
}
onMouseUp(ev){
  // Si le clic ne se fait pas au même endroit, on ne fait rien
  if ( this.xmousedown != ev.offsetX ) return stopEvent(ev)
  this.onClick(ev)
}

/**
* Méthode appelée quand on veut déplacer le système
***/
onWantToMoveSystem(ev){
  const my = this
  $(this.obj).draggable({
    axis: 'y',
    stop: ()=>{
      $(my.obj).draggable({disabled: true})
      return stopEvent(ev)
    }
  })
  message("Tu peux déplacer le système.")
}

/**
* Retourne le top de l'objet d'analyse dans le conteneur du système en
* fonction de son type +otype+.
* Quand la valeur est négative, on doit placer l'objet au-dessus du système
* le top est donc la valeur enregistrée en préférences. En revanche, lorsque
* la hauteur de la ligne du type est positive ou nulle, c'est que l'objet se
* trouve SOUS le système. Pour obtenir son top exact, il faut donc ajouter
* à la valeur de préférence la hauteur réelle (rHeight) du système
*
* +line+    Si cette valeur est définie (elle est en général undefined), elle
*           détermine l'indice de la ligne de pose (segment, modulation, chord,
*           etc.) sur laquelle doit être pausée l'objet, de bas en haut, en
*           commençant à 1 (pour 'pedale')
***/
topPerTypeObjet(otype, line){
  __in(`${this.ref}#topPerTypeObjet`, {otype:otype, line:line, skip:true})
  if ( undefined != line ) { otype = LINES_POSE[line - 1] }
  let rTop = Score.current.preferences.ligne(otype)
  console.log({
    system: this.ref,
    otype: otype, line: line, rTop: rTop
  })
  // Si c'est une valeur positive, donc en dessous du système, il faut
  // ajouter la hauteur du système pour connaitre son vrai 'top'
  if ( rTop >= 0 ) rTop += this.rHeight
  __out(`${this.ref}#topPerTypeObjet`, {rTop:rTop, skip:true})
  return rTop
}

  // La limite vraiment inférieure du système, tout compris
  get bottom_limit(){
    return this._bottom_limit || (this._bottom_limit = this.calcBottomLimit())
  }

  /**
  * Données générales
  ***/

  get bottom(){
    return this._bottom || (this._bottom = this.top + this.rHeight)
  }

  get imageSrc(){
    return this._imgsrc || (this._imgsrc = `_score_/${CURRENT_ANALYSE}/systems/images/${this.imageName}`)
  }
  get imageName(){
    return this._imgname || (this._imgname = `${this.id}.jpg`)
  }
  get id(){
    return this._id || (this._id = `system-${this.minid}` )
  }
  // Raccourci vers le conteneur des systèmes de la table d'analyse
  get container(){
    return this._cont || (this._cont = TableAnalyse.systemsContainer)
  }

/**
* Méthodes de calcul
* ------------------
***/
calcFullHeight(firstTopLineType) {
  const cPrefs = Score.current.preferences
  return (0 - cPrefs.ligne(firstTopLineType) + this.rHeight + cPrefs.ligne('pedale') + 17)
}
calcBottomLimit(){
  return this.top + this.fullHeight
}

}
