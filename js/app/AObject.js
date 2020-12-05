'use strict';
/**
* Pour les accords (chord) et les marques harmoniques (harmony), la
* largeur minimale que doit avoir le div de l'objet pour que le trait
* apparaisse (en pixel). Par exemple pour faire "C ------"
***/
const MIN_WIDTH_OBJET_WITH_TRAIT = 40

class AObject {

  static newId(){
    if (undefined === this.lastId) this.lastId = 0 ;
    return ++ this.lastId;
  }

  static add(item){
    if (undefined == this.items) this.items = {};
    Object.assign(this.items, {[item.id]: item})
  }
  /**
  * Création d'un nouvel objet d'analyse
  *
  ***/
  static create(odata){
    const aobj = new AObject(odata)
    aobj.build()
    odata.system.append(aobj)
  }

  /**
  * Pour détruire un objet
  ***/
  static remove(item){
    this.selection.remove(item)
    if (undefined != this.items) {
      delete this.items[item.id]
    }
    item.obj.remove()
  }

  // On peut utiliser AObject.selection.add ou AObject.selection.remove pour
  // ajouter ou supprimer des éléments à la sélection
  static get selection(){return this._selection||(this._selection = new Selection(this))}
  static onSelect(item) { item.edit() }
  static onDeselect(item){
    AObjectToolbox.reset()
  }

  /**
    * Retourne les propriétés de l'objet
  ***/
  static getObjetProps(){
    return Panneau.get('analyse').propsAObjectToolbox.getValues()
  }


  /**
    * data:
    *   id:     Identifiant (nombre)
    *   top:    Hauteur de départ
    *   left:   Décalage x
    *   objetProps: Les propriétés d'objet, telles que définie dans la toolbox
    *
  ***/

  constructor(data) {
    this.data = data
    this.id = this.data.id
    this.system = this.data.system
    this.objetProps = data.objetProps
    this.constructor.add(this)
  }

  /**
  * Les données de l'objet qu'il faut sauvegarder
  ***/
  get data2save(){
    return {
        id:         this.id
      , system:     this.system.minid
      , top:        this.top
      , left:       this.data.left
      , width:      this.data.width
      , objetProps: this.objetProps
    }
  }

  /**
  * Actualisation (après modification dans la boite d'édition)
  ***/
  update(what){
    switch(what){
      case 'width':
        if(['chord','harmony'].includes(this.objetProps.type)){
          const method = this.data.width > MIN_WIDTH_OBJET_WITH_TRAIT ? 'remove' : 'add'
          $(this.obj).find('.trait')[`${method}Class`]('hidden')
        }
        // On laisse filer pour la suite
      case 'left':
      case 'top':
        $(this.obj).css(what, this.data[what]);
        break;
      default:
        switch(this.objetProps.type){
          case 'modulation': this.updateAsModulation();break;
          case 'chord':
          case 'harmony':
            this.updateAsWithTrait();break;
          default: this.obj.innerHTML = this.mark
        }
    }
  }
  /**
    * Construction de l'objet d'analyse
    *
  ***/
  build(){
    // On a besoin du score courant
    const score = Score.current
        , top   = this.data.top
        , left  = this.data.left

    const oProps = this.objetProps
    // Les propriétés d'objet sélectionnés
    // console.debug("objetProps:", this.objetProps)

    // Le DIV PRINCIPAL qui sera ajouté au document (appelé aussi TAG)
    const div_id = `ao-${this.data.id}`
    var css = ['aobjet', oProps.type]
    if ( oProps.type == 'segment' ) { css.push(oProps.segment) }
    const div = DCreate('DIV', {id: div_id, text:null, class: css.join(' ')})

    div.setAttribute('style', `top:${top}px;left:${left}px;`)

    this._obj = div

    /**
    * En fonction du type (modulation, cadence, etc) on peut avoir à
    * ajouter des éléments
    ***/
    switch(this.objetProps.type){
      case 'modulation':
        this.buildAsModulation();
        break;
      case 'chord':
      case 'harmony':
        this.buildAsWithTrait();
        break;
      default: $(this.obj).html(this.mark)
    }
    this.observe()
  }

  buildAsModulation(){
    const elements = [
      DCreate('DIV', {class:'ton', text: this.mark}),
      DCreate('DIV', {class:'vline'})
    ]
    $(this.obj).append(elements)
  }
  updateAsModulation(){
    $(this.obj).find('.ton').html(this.mark)
  }

  /**
  * Pour les accords et les harmonies, on ajoute un tiret possible à partir
  * d'une certaine longueur
  ***/
  buildAsWithTrait(){
    const elements = [
      DCreate('DIV', {class:'text', text: this.mark}),
      DCreate('DIV', {class:`trait${this.data.width > 60 ?'':' hidden'}`})
    ]
    $(this.obj).append(elements)
  }
  updateAsWithTrait(){
    $(this.obj).find('.text').html(this.mark)
  }


  edit(){
    this.isEdited = true
    AObjectToolbox.show(this)
  }
  unedit(){ this.isEdited = false }

  // Return la marque à écrire sur la partition en fonction du type
  get mark(){
    var mark ;
    const objProps = this.objetProps;
    const otype = objProps.type
    switch(otype){
      case 'harmony': mark = objProps.harmony; break;
      default: mark = objProps.note
    }
    mark = `<span class="nom">${mark}</span>`
    if ( objProps.alteration != '♮' ) { mark += `<span class="alte">${objProps.alteration}</span>` }
    if (objProps.nature != 'Maj') {
      mark += `<span class="nat">${objProps.nature}</span>`
    }
    if (otype == 'modulation' && objProps.harmony != 'none') {
      mark += `<span class="rel">(${objProps.harmony})</span>`
    }
    return mark
  }

  observe(){
    // La rendre déplaçable sur l'axe des x
    const my = this
    $(this.obj).draggable({
      axis:'x',
      stop: my.onChangeXByDrag.bind(my)
    })
    this.obj.style.position = 'absolute' //draggable ajoute 'relative'
    // Le rendre sensible au click pour le sélectionner
    $(this.obj).on('click', this.toggleSelect.bind(this))
  }

  onChangeXByDrag(ev, ui){
    this.data.left = parseInt(ui.position.left, 10)
    if ( this.isEdited ) AObjectToolbox.buttonPosX.set(this.data.left)
  }

  toggleSelect(ev){
    this.isSelected ? this.deselect(ev) : this.select(ev)
  }
  select(ev){
    this.constructor.selection.add(this,ev)
  }
  deselect(ev){
    this.constructor.selection.remove(this,ev)
  }
  setSelected(){
    $(this.obj).addClass('selected')
  }
  unsetSelected(){
    $(this.obj).removeClass('selected')
  }

  get type(){
    return this._type || (this._type = this.data.type)
  }
  get obj(){return this._obj}

}
