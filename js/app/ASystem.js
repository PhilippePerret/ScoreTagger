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
    this.index    = data.index // l'index absolu du system
    this.isystem  = data.isystem
    this.ipage    = data.ipage
    this.score    = Score.current
    this.modified = false
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
    Ajax.send('save_system.rb', {data: this.data2save}).then(ret => {
      if (ret.error) return erreur(ret.error)
      console.info("Système %s sauvé avec succès.", this.minid)
      my.modified = false
    })
  }

  get data2save(){
    var data_aobjects = []
    if ( this.aobjets ) {
      this.aobjets.forEach(aobj => data_aobjects.push(aobj.data2save))
    }
    return {
        minid: this.minid
      , index: this.index
      , top: this.top
      , rheight: this.rHeight
      , aobjects: data_aobjects
    }
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
  * Pour créer un nouvel objet
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
    // const img = DCreate('IMG', {class:'system', 'data-id': this.minid, src: this.imageSrc})
    const div = DCreate('DIV', {id: this.id, class:'system', 'data-id': this.minid, inner:[
      DCreate('IMG', {class:'system', 'data-id': this.minid, src: this.imageSrc})
    ]})
    // div.appendChild(img)
    this.container.appendChild(div)
    this.obj = div
    this.positionne()
    this.observe()
  }

  /**
  * Positionnement du système
  *
  * Ce positionnement doit être fait de telle sorte qu'un système (avec
  * ses objets) ne chevauche jamais une page.
  ***/
  positionne(){
    const debug = true
    debug && console.debug("\n=== POSITIONNEMENT SYSTÈME %s ===", this.minid)
    var fromY
    if ( this.index == 0 ) {
      // Tout premier système

      this.top = this.score.preferences.first_page.first_system_top
      debug && console.debug("Première page, this.top = %i", this.top)

    } else {

      const prev_system = ASystem.get(this.index - 1)
      fromY = prev_system.bottom_limit
      debug && console.debug("fromY (prev_system.bottom_limit) = %i", prev_system.bottom_limit)

      // La distance entre système (Space Between Systems)
      const SBS = this.score.preferences.space_between_systems
      debug && console.debug("space_between_systems = %i", SBS)

      // La page sur laquelle on se trouve
      let current_page = Math.floor(fromY / HEIGHT_PAGE) + 1
      debug && console.debug("Page courante : %i", current_page)

      // La ligne basse de cette page, la ligne à ne pas franchir
      const bottom_limit = current_page * HEIGHT_PAGE
      debug && console.debug("bottom_limit de page %i = %i", current_page, bottom_limit)

      // Si le système et ses objets inférieurs dépassent le bord bas, on
      // doit passer le système sur la page suivante
      debug && console.debug("Hauteur totale (fullHeight) = %i", this.fullHeight)
      debug && console.debug("fromY + SBS + fullHeight / bottom_limit", fromY + SBS + this.fullHeight, bottom_limit)
      if ( fromY + SBS + this.fullHeight < bottom_limit ) {
        // <= La limite n'est pas franchie (on a la place)
        // => On pose le système dans le flux normal, à distance définie
        // Note : on parle ici du top de l'image du système, donc il faut
        // ajouter la distance avec la ligne supérieure maximale, la ligne
        // de segment
        // => On ne modifie pas le fromY
      } else {
        // <= La limite est franchie
        // => Il faut mettre le système sur la page suivante
        // => On modifie le formY
        fromY = bottom_limit
      }
      this.top = fromY + SBS - this.topPerTypeObjet('segment')
      debug && console.debug("this.top final = %i", this.top)
    }

    // On position le système
    this.obj.style.top = `${this.top}px`

    // On met toujours le container à cette hauteur + une marge
    this.container.style.height = `${this.top + 500}px`

  }

  /**
  * Retourne la hauteur totale du système, depuis sa ligne de segment
  * supérieure jusqu'à sa ligne de pédale, en tenant compte de sa hauteur
  * de système propre et des valeurs de préférences.
  ***/
  get fullHeight(){
    return this._fullheight || (this._fullheight = this.calcFullHeight())
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

  /**
  * La hauteur du système
  * ---------------------
  * Il faut tenir compte du fait que l'image est diminuée dans l'affichage
  * pour tenir dans un div de 19cm. La hauteur dont il faut tenir compte — pour
  * le placement et la position des éléments) est donc la hauteur réelle,
  * affichée.
  ***/
  get rHeight(){
    return this._hreal || (this._hreal = $(this.obj).height())
  }

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
    return this._id || (this._id = `system-p${this.ipage}-s${String(this.isystem).padStart(2,'0')}` )
  }
  get minid(){
    return this._minid || (this._minid = `${this.ipage}-${this.isystem}`)
  }
  get container(){
    return this._cont || (this._cont = $('#systems-container')[0])
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
