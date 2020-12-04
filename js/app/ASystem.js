'use strict';
/** ---------------------------------------------------------------------
  *   Classe ASystem
  *   --------------
  *   Gestion des systèmes de la partition
  *
*** --------------------------------------------------------------------- */
class ASystem {
  constructor(data) {
    this.data = data
    this.isystem  = data.isystem
    this.ipage    = data.ipage
    this.height   = data.height
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
    const img = DCreate('IMG', {id: this.id})
    img.src = this.imageSrc
    img.setAttribute('data-id', this.minid)
    $('#systems-container').append(img)
    this.obj = img
    this.observe()
  }

  observe(){
    /**
    * L'observation, principalement, permet de créer les objets d'analyse
    * en cliquant sur le système concerné
    ***/
    this.obj.on('click', this.onClick.bind(this))
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
