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
console.info("PAGE_HEIGHT_PX = %i", PAGE_HEIGHT_PX)
const VMARGE_PX = CM2PIXELS * 2

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

    /**
    * J'essaie de placer les systèmes en fonction d'un nombre de systèmes
    * qui pourra être défini sur la page d'accueil
    ***/
    const NombreSystemsPerPage = Score.current.nombre_systems_per_page || 4
    if ( undefined == Score.current.isystem_of_page){
      Score.current.isystem_of_page = -1
      const portionsHeight = parseInt(PAGE_HEIGHT_PX / NombreSystemsPerPage, 10)
      console.log("Hauteur de portion :", portionsHeight)
      ASystem.TopsPortions = []
      for(var i = 0; i < NombreSystemsPerPage; ++ i){
        ASystem.TopsPortions.push( i * portionsHeight )
      }
    }
    ++ Score.current.isystem_of_page
    if ( Score.current.isystem_of_page > NombreSystemsPerPage - 1 ){
      Score.current.isystem_of_page = 0
    }
    console.log("Score.current.isystem_of_page = %i", Score.current.isystem_of_page)
    const topRelThisSystem = ASystem.TopsPortions[Score.current.isystem_of_page]
    console.log("Top relatif de ce système : %i", topRelThisSystem)

    const SpaceBetweenSystems = Score.current.space_between_systems || 80
    this.top = fromY + SpaceBetweenSystems

    const pageNumber = Math.floor(this.top / PAGE_HEIGHT_PX) + 1
    console.log("pageNumber = ", pageNumber)
    const bordTopPage = (pageNumber - 1) * PAGE_HEIGHT_PX
    this.top = bordTopPage + topRelThisSystem
    console.log("Top absolu de ce système : %i", this.top)

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
