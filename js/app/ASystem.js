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
    if ( undefined == this.items ) this.items = {}
    Object.assign(this.items, { [system.index]: system})
  }

  constructor(data) {
    this.data = data
    this.index    = data.index // l'index absolu du system
    this.isystem  = data.isystem
    this.ipage    = data.ipage
    this.height   = data.height
    this.score    = Score.current
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
    this.container.appendChild(img)
    this.obj = img
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
    var fromY
    if ( this.index == 0 ) {
      // Tout premier système

      this.top = this.score.preferences.first_page.first_system_top

    } else {

      var prev_system = ASystem.get(this.index - 1)
      fromY = prev_system.bottom_limit

      // La distance entre système (Space Between Systems)
      const SBS = this.score.preferences.space_between_systems

      // La page sur laquelle on se trouve
      let current_page = Math.floor(fromY / HEIGHT_PAGE) + 1

      // La ligne basse de cette page, la ligne à ne pas franchir
      const bottom_limit = current_page * HEIGHT_PAGE

      // Si le système et ses objets inférieurs dépassent le bord bas, on
      // doit passer le système sur la page suivante
      if ( fromY + SBS + this.hauteur_totale < bottom_limit ) {
        // <= La limite n'est pas franchie (on a la place)
        // => On pose le système dans le flux normal, à distance définie
        // Note : on parle ici du top de l'image du système, donc il faut
        // ajouter la distance avec la ligne supérieure maximale, la ligne
        // de segment
        this.top = fromY + SBS + this.lprefs.ligne_segment
      } else {
        // <= La limite est franchie
        // => Il faut mettre le système sur la page suivante
        this.top = bottom_limit + this.lprefs.ligne_segment
      }

    }

    // On position le système
    this.obj.style.top = `${this.top}px`

    // On met toujours le container à cette hauteur + une marge
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

  get ligne_segment(){return this._lseg || (this._lseg = this.top - this.lprefs.ligne_segment)}
  get ligne_modulation(){return this._lmod || (this._lmod = this.top - this.lprefs.ligne_modulation)}
  get ligne_accord(){return this._lacc || (this._lacc = this.top - this.lprefs.ligne_accord)}
  get ligne_harmonie(){return this._lhar || (this._lhar = this.bottom + this.lprefs.ligne_harmonie)}
  get ligne_cadence(){return this._lcad || (this._lcad = this.bottom + this.lprefs.ligne_cadence)}

  // La hauteur totale du système courant
  // Cette propriété n'a pas besoin de connaitre this.top
  get hauteur_totale(){return this._htot || (this._htot = this.lprefs.ligne_segment + this.height + this.lprefs.ligne_cadence + 20)}

  // La limite vraiment inférieure du système, tout compris
  // Cette propriété a besoin de connaitre this.top
  get bottom_limit(){return this._bottom_limit || (this._bottom_limit = this.ligne_cadence + 20)}

  // Raccourci
  get lprefs(){return this.score.preferences.lignes}

  /**
  * Données générales
  ***/

  get bottom(){
    return this._bottom || (this._bottom = this.top + this.height)
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
}
