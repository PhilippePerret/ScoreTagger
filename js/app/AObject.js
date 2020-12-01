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
    const systemsData = score.data.pages[0]
    // On va prendre le système le plus prêt de top
    var dist = null
    var iSystem = null
    for ( var i = 0, len = systemsData.length; i < len; ++i){
      var topSystem   = systemsData[i]
      var distWithTop = Math.abs(topSystem - top)
      console.log("iSystem: %i, distance: %i", i, distWithTop)
      if ( iSystem === null || dist > distWithTop ) {
        iSystem = i; dist = distWithTop;
      }
    }

    // 280 : pour les accords
    var ajout ;
    switch(objetProps.type){
      case 'harmony': ajout = 0; break;
      case 'modulation': ajout = -300; break;
      case 'chord': ajout = -260; break;
      case 'cadence': ajout = 32; break;
    }
    var real_top = systemsData[iSystem] + ajout // pour le moment, 100 pixel au-dessus

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
