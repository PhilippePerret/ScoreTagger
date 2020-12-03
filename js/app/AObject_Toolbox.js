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

  // On met les valeurs de l'objet d'analyse dans ses champs
  static setValues(){
    console.log("aobject: ", this.owner)
    const o = this.owner
    this.obj.find('.aobj-id').html(o.id)
    this.selectNote.val(o.objetProps.note)
  }

  // Pour supprimer l'objet (définitivement)
  static removeObjet(ev){
    if ( confirm("Es-tu certain de vouloir détruire cet élément ?")){
      AObject.remove(this.owner)
    }
  }

  static get obj(){return this._obj || (this._obj = $('#aobject-toolbox'))}

  static prepare(){
    // Les boutons à incrémentation
    this.buttonPosX = new IncButton({container:'#aobj-pos-x'})
    this.buttonPoxY = new IncButton({container:'#aobj-pos-y'})
    this.buttonPosX.build()
    this.buttonPoxY.build()
    this.selectNote = $('#aobj-note')
    this.selectAlteration = $('#aobj-alteration')

    // Observation
    this.observe()
    this.isPrepared = true
  }

  static observe(){
    $('#btn-destroy-aobject').on('click', this.removeObjet.bind(this))
    this.selectNote.on('change', this.changeNote.bind(this))
    this.selectAlteration.on('change', this.changeAlteration.bind(this))
  }

  static changeNote(){
    this.owner.objetProps.note = this.selectNote.val();
    this.owner.update()
  }
  static changeAlteration(){
    this.owner.objetProps.alteration = this.selectAlteration.val();
    this.owner.update()
  }
}
