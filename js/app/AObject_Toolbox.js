'use strict'
/**
* Class AObjectToolbox
* --------------------
* Boite pour éditer un objet d'analyse quelconque (quand on clique dessus)
***/
class AObjectToolbox {
  static show(aobject){
    this.owner = aobject // l'objet analyse sélectionné
    this.obj.removeClass('hidden')
    this.isPrepared || this.prepare()
    this.setValues()
  }
  static hide(){ this.obj.addClass('hidden') }

  static reset(){
    this.owner && this.owner.unedit()
    this.owner = null
    delete this.owner
    this.hide()
  }

  static setValues(){
    console.log("aobject: ", this.owner)
    this.obj.find('.aobj-id').html(this.owner.id)
  }

  // Pour supprimer l'objet (définitivement)
  static removeObjet(ev){
    console.log("Je dois détruire l'objet")
  }

  static get obj(){return this._obj || (this._obj = $('#aobject-toolbox'))}

  static prepare(){
    // Les boutons à incrémentation
    this.buttonPosX = new IncButton({container:'#aobj-pos-x'})
    this.buttonPoxY = new IncButton({container:'#aobj-pos-y'})
    this.buttonPosX.build()
    this.buttonPoxY.build()

    // Observation
    this.observe()
    this.isPrepared = true
  }

  static observe(){
    $('#btn-destroy-aobject').on('click', this.removeObjet.bind(this))
  }
}
