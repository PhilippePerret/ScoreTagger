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
static add(system){
  if (undefined == this.items) this.items = {}
  Object.assign(this.items, { [system.index]: system})
}

  constructor(data) {
    this.data = data
    this.minid    = data.minid    // p.e. "2-6" ("<page>-<index+1>")
    this.index    = data.index    // l'index absolu du system (0-start)
    this.indexInPage = data.indexInPage
    this.top      = data.top  // pas forcément défini à l'instanciation
    this.page     = data.page // numéro de page (1-start)
    this.fullHeight = data.fullHeight
    this.rHeight  = data.rHeight
    this.modified = false
    this.score    = Score.current
    this.constructor.add(this)
  }

/**
* Méthode de sauvegarde du system
*
* Un système est sauvé avec ses données générales et ses objets dans
* un fichier séparé, dans le dossier <analyse>/systems/data/
***/
save(){
  const my = this
  console.info("Sauvegarde du système %s…", this.minid)
  Ajax.send('save_system.rb', {data: this.data2save}).then(ret => {
    console.info("Système %s sauvé avec succès.", this.minid)
    my.modified = false
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
* Méthode qui reçoit le clic sur le système
***/
onClick(ev){
  if ( ev.target.className == 'system' ) {
    this.createNewAObjet(ev)
  }
}

/**
* Dessine tous les objets d'analyse du système
***/
draw(){
  if ( !this.data.aobjects || this.data.aobjects.length == 0) return ;
  this.data.aobjects.forEach(data_aobjet => {
    new AObject(data_aobjet).build()
  })
}

/**
* Pour créer un nouvel objet d'analyse (AObject)
***/
createNewAObjet(ev){
  const objProps = AObject.getObjetProps()
  const odata = {
      id: AObject.newId()
    , left: ev.offsetX - 10
    , top: this.topPerTypeObjet(objProps.type)
    , objetProps: objProps
    , system: this
  }
  AObject.create(odata)
  this.modified = true
}

  /**
  * Pour ajouter l'objet au système.
  * Ça consiste à :
  *   - ajouter l'élément DOM de l'objet
  *   - ajouter l'instance à la liste des objets
  * +aobj+  Instance de l'objet
  ***/
  append(aobj){
    if ( undefined == this.aobjets ) this.aobjets = []
    this.obj.appendChild(aobj.obj)
    this.aobjets.push(aobj)
  }

  /**
  * Construction du système sur la partition
  ***/

  build(){
    const my = this
    my.imageLoaded = false
    const img = DCreate('IMG', {id: `image-system-${this.minid}`, class:'system', 'data-id': this.minid, src: this.imageSrc})
    const div = DCreate('DIV', {id: this.id, class:'system', 'data-id': this.minid, inner:[img]})
    // div.appendChild(img)
    this.container.appendChild(div)
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
  }

  observe(){
    /**
    * L'observation, principalement, permet de créer les objets d'analyse
    * en cliquant sur le système concerné
    ***/
    $(this.obj).on('click', this.onClick.bind(this))
  }

  /**
  * Position des lignes du système
  * Chaque propriété retourne la position en pixel
  ***/

  /**
  * Retourne le top de l'objet d'analyse dans le conteneur du système en
  * fonction de son type +otype+.
  * Quand la valeur est négative, on doit placer l'objet au-dessus du système
  * le top est donc la valeur enregistrée en préférences. En revanche, lorsque
  * la hauteur de la ligne du type est positive ou nulle, c'est que l'objet se
  * trouve SOUS le système. Pour obtenir son top exact, il faut donc ajouter
  * à la valeur de préférence la hauteur réelle (rHeight) du système
  ***/
  topPerTypeObjet(otype){
    let tpto = Score.current.preferences.lignes[otype]
    if ( tpto >= 0 ) tpto += this.rHeight
    return tpto
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
calcFullHeight() {
  const lprefs = Score.current.preferences.lignes
  return (0 - lprefs.segment + this.rHeight + lprefs.pedale + 17)
}
calcBottomLimit(){
  return this.top + this.fullHeight
}


}
