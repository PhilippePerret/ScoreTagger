'use strict';
/** ---------------------------------------------------------------------
  *   Classe ASystem
  *   --------------
  *   Gestion des systèmes de la partition
  *
*** --------------------------------------------------------------------- */

// Nombre de pixels pour un centimètre
const CM2PIXELS = 37.795280352161

class ASystem {

  static get(index){
    return this.items[index]
  }
  static add(system){
    console.log("add: ", system)
    if ( undefined == this.items ) this.items = {}
    Object.assign(this.items, { [system.index]: system})
  }

  constructor(data) {
    this.data = data
    this.index    = data.index // l'index absolu du system
    this.isystem  = data.isystem
    this.ipage    = data.ipage
    this.height   = data.height
    this.constructor.add(this)
  }

  /**
  * Méthode qui reçoit le clic sur le système
  ***/
  onClick(ev){
    const y = ev.offsetY // pas vraiment utile
    const x = ev.offsetX
    // TODO Créer l'objet
  }



  build(){
    const img = DCreate('IMG', {id: this.id, class:'system'})
    img.src = this.imageSrc
    img.setAttribute('data-id', this.minid)
    $('#systems-container').append(img)
    this.obj = img
    this.positionne()
    this.observe()
  }

  positionne(){
    var fromY
    if ( this.index > 0 ) {
      var prev_system = ASystem.get(this.index - 1)
      fromY = prev_system.top + prev_system.height
    } else {
      fromY = 0
    }
    this.top = fromY + (Score.current.space_between_systems || 100)
    const bottomForCheck = this.top + this.height
    console.log("bottomForCheck = ", bottomForCheck)
    this.obj.style.top = `${this.top}px`
  }

  observe(){
    /**
    * L'observation, principalement, permet de créer les objets d'analyse
    * en cliquant sur le système concerné
    ***/
    $(this.obj).on('click', this.onClick.bind(this))
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
}
