'use strict';
/** ---------------------------------------------------------------------
  *   Classe ASystem
  *   --------------
  *   Gestion des systèmes de la partition
  *
*** --------------------------------------------------------------------- */

class ASystem {

static get(index){
  return this.items[index]
}
static getByMinId(minid){
  return this.itemsByMinId[minid]
}

/**
* C'est cette méthode qui se charge du positionnement dynamique des systèmes
* courant, en écartant les systèmes si nécessaire.
***/
static repositionneAll(){
  __in("ASystem::repositionneAll")
  const my = this
  const score = Score.current
  /**
  * Plutôt que la notion de "top courant", on prend celle de "baseline" qui
  * correspond à la ligne sur laquelle se trouve le top du système, de l'image,
  * et par conséquent du DIV qui contient le système et ses [objets d'analyse]
  ***/
  var curBaseline = score.preferences.first_page('first_system_top').top
  /**
  * Pour le numéro de page, qui est affecté forcément au cours de cette opéra-
  * tion de positionnement. On crée aussi la toute première page
  ***/
  var curPageNumber = 1
  Page.get(1) // ça crée l'instance Page
  this.items.forEach(system => {
    system.pageNumber = curPageNumber
    system.calcReferenceLinesFrom(curBaseline)
    system.setTop(system.topSystemLine)
    false && this.drawLigneReperes(system) // DEBUG (dessine les lignes)
    curBaseline   = system.realBotLine + score.preferences.divers('space_between_systems')
    curPageNumber = system.pageNumber
  })
  __out("ASystem::repositionneAll")
}

/**
* Uniquement pour le débug, on dessine sur la table d'analyse les
* lignes de délimitation des systèmes à savoir :
*   - la ligne supérieure (bleue)
*   - la ligne de bord haut du système (mauve)
*   - la ligne de bord bas du système hors objets (verte)
*   - la ligne de bord bas du système avec objets (rouge)
***/
static drawLigneReperes(system){
  TableAnalyse.addLigneRepere(system.topLine, {color:'blue'})
  var next = system.topSystemLine
  if ( next == system.topLine ) next += 3
  TableAnalyse.addLigneRepere(next, {color:'purple'})
  TableAnalyse.addLigneRepere(system.botSystemLine, {color:'green'})
  next = system.realBotLine
  if ( next == system.botSystemLine ) next += 3
  TableAnalyse.addLigneRepere(next, {color:'red'})
}

static add(system){
  if (undefined == this.items){this.items = []; this.itemsByMinId = {}}
  this.items.push(system)
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

/**
* Pour marquer le système modifié
**/
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
    , left: ev.offsetX - 10
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
* On en profite pour définir la ligne supérieure et la ligne inférieure
* utilisée actuellement par le système (pour le réglage de la position dynami-
* que des systèmes)
***/
addObjet(obj, options = {recalculer: false}){
  this.aobjets.push(obj)
}

/**
* Détruit un objet (et recalcule la position des systèmes en cas de changement
* de hauteur max ou min)
***/
removeObjet(obj){

}

/**
* Construction du système sur la partition
***/
build(){
  const my = this
  const score = Score.current
  const Prefs = score.preferences
  // my.imageLoaded = false
  const img = DCreate('IMG', {id: `image-system-${my.minid}`, class:'system', 'data-id': my.minid})
  img.src = this.preloadedImg.src
  const div = DCreate('DIV', {id: this.id, class:'system', 'data-id': my.minid, inner:[img]})

  // === PLACEMENT DU DIV DU SYSTÈME DANS LA PAGE ===
  my.container.appendChild(div)

  // Hauteur du système (rappel : les images ont été préchargées)
  my.rHeight = my.data.rHeight = $(img).height()

  /**
  * Pour le numéro de mesure
  * Il sera masqué par Score.draw si les préférences le demandent
  ***/
  const numMes = DCreate('SPAN', {class:'numero-mesure', text:my.numero_first_mesure||'-'})
  div.appendChild(numMes)
  $(numMes).on('click', this.onClickNumeroMesure.bind(this))

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
}

setTop(top){
  this.top = top || this.top
  this.positionne()
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
+otypeRef+  {String} En général, l'otype de l'objet, mais pour le segment par
            exemple, il devient 'segment_down' pour indiquer que c'est un
            segment sous la portée.

* +line+    Si cette valeur est définie (elle est en général undefined), elle
*           détermine l'indice de la ligne de pose (segment, modulation, chord,
*           etc.) sur laquelle doit être pausée l'objet, de bas en haut, en
*           commençant à 1 (pour 'pedale')
***/
topPerTypeObjet(otypeRef, line){
  __in(`${this.ref}#topPerTypeObjet`, {otypeRef:otypeRef, line:line, skip:true})
  if ( undefined != line ) { otypeRef = LINES_POSE[line - 1] }
  let rTop = Score.current.preferences.ligne(otypeRef)
  // console.log({
  //   system: this.ref,
  //   otype: otype, line: line, rTop: rTop, rHeight: this.rHeight
  // })
  // Si c'est une valeur positive, donc en dessous du système, il faut
  // ajouter la hauteur du système pour connaitre son vrai 'top'
  if ( rTop >= 0 ) rTop += this.rHeight
  __out(`${this.ref}#topPerTypeObjet`, {rTop:rTop, skip:true})
  return rTop
}

/**
* Données générales
***/

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

/* ------------------
* MÉTHODES DE CALCUL
* ------------------ */

/**
* Méthode qui calcule les lignes de référence du système.
*
* Rappel de leur nom et leur position :
*   topLine         Ligne la plus haute
*   topSystemLine   Bord haut du système
*   botSystemLine   Bord bas du système
*   bottomLine      Ligne la plus basse
*   realBottomLine  Limite extrême du système & objet
*
* Cette méthode prend en compte la délimitation des pages et
* vérifie que le système ne se retrouvera pas entre deux pages
*
***/
calcReferenceLinesFrom(top){
  if (undefined === this.higestObject) this.calcHighestAndLowestObjects() ;
  this.topLine        = top
  this.topSystemLine  = this.topLine + this.maxTop
  this.botSystemLine  = this.topSystemLine + this.rHeight
  this.realBotLine    = this.topSystemLine + this.maxBottom
  false && this.debugAllMesures() // DEBUG

  /**
  * Si le système dépasse le bord de page courant, il faut le
  * passer sur la page suivante.
  ***/
  if ( this.realBotLine > this.page.bottom ) {
    this.pageNumber ++
    this.calcReferenceLinesFrom(this.page.top + 20)
  }
}

/**
* Les valeurs de page du système (son numéro de page, avec sa hauteur et son bas)
***/
get page(){ return Page.get(this.pageNumber)}
get pageNumber(){return this._pagenum}
set pageNumber(n){this._pagenum = n}

/**
* Pour débugguer les valeurs de mesure obtenues après calcul de la position
* du système
***/
debugAllMesures(){
  console.log(`${this.ref} Nombre d'objets : ${this.aobjets.length}`)
  console.log(`${this.ref} highestObject :`, this.highestObject)
  console.log(`${this.ref} lowestObject :`, this.lowestObject)
  const l = ['pageNumber','pageTop','pageBottom','topLine','topSystemLine','botSystemLine','realBotLine','maxTop','maxBottom']
  l.forEach(p => console.log(`${this.ref}.${p} = %i`, this[p]))
}

/**
* Méthode pour déterminer l'objet le plus haut (highestObject) et l'objet
* le plus bas (lowestObject) du système.
***/
calcHighestAndLowestObjects(){
  var maxTop = 0
  var maxBot = this.rHeight
  this.highestObject = null // pour savoir qu'ils ont été calculés (si non existant)
  this.lowestObject  = null // idem
  this.aobjets.forEach(objet => {
    const objTop = objet.relativeTop
    if ( objTop < maxTop ) {
      // <= Le nouvel objet est plus haut que le plus haut des objets
      // => Il devient l'objet le plus haut
      maxTop = Number(objTop)
      this.highestObject = objet
    } else if ( objTop + objet.height > maxBot ) {
      // <= L'objet est plus bas que le plus bas des objets du système
      // => Il devient l'objet le plus bas
      maxBot = objTop + objet.height
      this.lowestObject = objet
    }
  })
  return {high: maxTop, low: maxBot}
}
get maxTop(){
  return this.highestObject ? - this.highestObject.relativeTop : 0
}
get maxBottom(){
  const lo = this.lowestObject
  return lo ? lo.relativeTop + lo.height : this.rHeight
}

}// class ASystem
