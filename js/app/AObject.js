'use strict';
class AObject {

  /**
    * Pour créer un objet
  ***/
  static create(ev){

    const score = Score.current

    // Le div qui sera ajouté au document
    var div = document.createElement('DIV')

    // Les propriétés d'objet sélectionnés
    const objetProps = this.getObjetProps()
    console.debug("objetProps:", objetProps)

    // La marque à écrire
    var mark ;
    if (objetProps.type == 'harmony'){
      mark = objetProps.harmony
    } else {
      mark = objetProps.note.toUpperCase()
    }
    if ( objetProps.alteration != '♮' ) { mark += objetProps.alteration }
    if (objetProps.nature != 'Maj') {
      mark += ` ${objetProps.nature}`
    }
    div.innerHTML = mark
    div.className = "aobjet"
    const top = ev.offsetY
    // Pour le moment, on travaille sur la page 1 (index 0) mais il faudra
    // plus tard pouvoir faire autre chose
    const systemsData = score.data.pages[score.current_page].systems_data
    // On va prendre le système le plus prêt de top
    var mindist = null
    var iSystem = null
    for ( var isys in systemsData ){
      const medline = systemsData[isys].median_line
      const dist    = Math.abs(medline - top)
      console.log("iSystem: %i, distance: %i (mini actuelle: %i)", isys, dist, mindist)
      if ( iSystem === null || mindist > dist ) {
        iSystem = isys; mindist = dist;
      }
    }

    // 280 : pour les accords
    var ajout ;
    const systemTop = systemsData[iSystem].top
    const systemBot = systemsData[iSystem].top + systemsData[iSystem].height
    const real_top = ( otype => {
      switch(otype){
        case 'harmony':     return systemBot + 10; // TODO <= prefs
        case 'modulation':  return systemTop - 50; // TODO <= prefs
        case 'chord':       return systemTop - 20; // TODO <= prefs
        case 'cadence':     return systemBot + 50; // TODO <= prefs
      }
    })(objetProps.type)
    console.log("real_top", real_top)

    // Position horizontale, un peu à gauche de la souris
    const left = ev.offsetX - 20

    div.setAttribute('style', `top:${real_top}px;left:${left}px;`)
    document.body.appendChild(div)

    // La rendre déplaçable sur l'axe des x
    $(div).draggable({axis:'x'})
    // La rendre éditable (pour changer sa note, son type, etc.)
  }

  /**
    * Retourne les propriétés de l'objet
  ***/
  static getObjetProps(){
    const note = $('button[data-type-aobject="note"].obb.selected')[0].getAttribute('data-value')
    const alteration = $('button[data-type-aobject="alteration"].obb.selected')[0].getAttribute('data-value')
    const type = $('button[data-type-aobject="otype"].obb.selected')[0].getAttribute('data-value')
    const harmony = $('button[data-type-aobject="harmony"].obb.selected')[0].getAttribute('data-value')
    const nature = $('button[data-type-aobject="nature"].obb.selected')[0].getAttribute('data-value')
    const cadence = $('button[data-type-aobject="cadence"].obb.selected')[0].getAttribute('data-value')
    return { note:note, type:type, harmony:harmony, nature:nature, alteration:alteration }
  }



  constructor(data) {
    this.data = data
  }

  // Return la marque à écrire sur la partition en fonction du type
  get mark(){

  }
  get type(){
    return this._type || (this._type = this.data.type)
  }

}
