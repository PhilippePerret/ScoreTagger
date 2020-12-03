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
    const o = this.owner
    console.log("aobject: ", o)
    console.log("o.obj", o.obj)
    this.obj.find('.aobj-id').html(o.id)
    this.buttonPosX.set(o.data.left)
    this.buttonPosY.set(o.data.top)
    this.buttonWidth.set( o.data.width || parseInt(o.obj.width(),10) )
    this.selectNote.val(o.objetProps.note)
    this.selectAlteration.val(o.objetProps.alteration)
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
    this.buttonPosX = new IncButton({container:'#aobj-pos-x', onchange:this.onChangeX.bind(this)})
    this.buttonPosY = new IncButton({container:'#aobj-pos-y', onchange:this.onChangeY.bind(this)})
    this.buttonWidth = new IncButton({container:'#aobj-pos-w', onchange:this.onChangeW.bind(this)})
    this.buttonPosX.build()
    this.buttonPosY.build()
    this.buttonWidth.build()
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
  static onChangeX(newValue){
    this.owner.data.left = Number(newValue)
    this.owner.update('left')
  }
  static onChangeY(newValue){
    this.owner.data.top = Number(newValue)
    this.owner.update('top')
  }
  static onChangeW(newValue){
    this.owner.data.width = Number(newValue)
    this.owner.update('width')
  }
}
