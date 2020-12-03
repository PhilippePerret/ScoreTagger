'use strict';
const ENG_NOTE_TO_ITA_NOTE = {
    'c':'do', 'd':'ré', 'e':'mi', 'f':'fa', 'g':'sol', 'a':'la', 'b':'si'
  }

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
    * Pour créer un objet
  ***/
  static create(ev){
    const aobj = new AObject({id: this.newId(), top: parseInt(ev.offsetY,10), left: parseInt(ev.offsetX - 20,10)})
    aobj.build()
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

  /**
  * Retourne les données de tous les objets d'analyse
  ***/

  static getAllObjectsData(){
    var alldata = []
    if ( this.items ) {
      for (var k in this.items ) { alldata.push(this.items[k].getData2save()) }
    }
    console.debug("alldata:", alldata)
    return alldata
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
    const note = $('button[data-type-aobject="note"].obb.selected')[0].getAttribute('data-value')
    const alteration = $('button[data-type-aobject="alteration"].obb.selected')[0].getAttribute('data-value')
    const type = $('button[data-type-aobject="otype"].obb.selected')[0].getAttribute('data-value')
    const harmony = $('button[data-type-aobject="harmony"].obb.selected')[0].getAttribute('data-value')
    const nature = $('button[data-type-aobject="nature"].obb.selected')[0].getAttribute('data-value')
    const cadence = $('button[data-type-aobject="cadence"].obb.selected')[0].getAttribute('data-value')
    const segment = $('button[data-type-aobject="segment"].obb.selected')[0].getAttribute('data-value')
    return { note:note, type:type, harmony:harmony, nature:nature, alteration:alteration, segment:segment }
  }


  /**
    * data:
    *   id:   Identifiant (nombre)
    *   top:  Hauteur de départ
    *
  ***/

  constructor(data) {
    this.data = data
    this.id = this.data.id
    this.constructor.add(this)
  }

  /**
  * Les données de l'objet qu'il faut sauvegarder
  ***/
  getData2save(){
    return {
        id:     this.id
      , system: this.system
      , page:   this.page // purement indicatif
      , top:    this.top
      , left:   this.data.left // indépendant de l'affichage
      , width:  this.data.width // indépendant de l'affichage
      , type:   this.objetProps.type
      , value:  this.objetProps[this.objetProps.type]
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
          this.obj.find('.trait')[`${method}Class`]('hidden')
        }
        // On laisse filer pour la suite
      case 'left':
      case 'top':
        this.obj.css(what, this.data[what]);
        break;
      default:
        switch(this.objetProps.type){
          case 'modulation': this.updateAsModulation();break;
          case 'chord':
          case 'harmony':
            this.updateAsWithTrait();break;
          default: this.obj.html(this.mark)
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

    const systemsData = score.data.pages[score.current_page].systems_data

    const oProps = this.objetProps = this.constructor.getObjetProps()
    // Les propriétés d'objet sélectionnés
    // console.debug("objetProps:", this.objetProps)

    // Le DIV PRINCIPAL qui sera ajouté au document (appelé aussi TAG)
    const div_id = `ao-${this.data.id}`
    var css = ['aobjet', oProps.type]
    if ( oProps.type == 'segment' ) { css.push(oProps.segment) }
    const div = DCreate('DIV', {id: div_id, text:null, class: css.join(' ')})


    /**
    * On recherche à quel système appartient l'objet
    * On renseigne par la même occasion la propriété 'this.system' qui
    * permettra de replace l'objet enregistré.
    ***/
    var iSystem = null
    if ( undefined === this.system ) {
      var mindist = null
      for ( var isys in systemsData ){
        const medline = systemsData[isys].median_line
        const dist    = Math.abs(medline - top)
        if ( iSystem === null || mindist > dist ) {
          iSystem = isys; mindist = dist;
          this.system = (score.current_first_system || 0) + isys
        }
      }
    } else {
      // Si c'est un objet enregistré précédemment
      iSystem = this.system - (score.current_first_system || 0)
    }

    /**
    * On calcule le top véritable en fonction du type
    ***/
    const sysTop = systemsData[iSystem].top
    const sysBot = systemsData[iSystem].top + systemsData[iSystem].height
    const real_top = this.realTopPerType(this.objetProps.type, sysTop, sysBot)
    // console.log("real_top", real_top)

    this.data.top = real_top

    div.setAttribute('style', `top:${real_top}px;left:${left}px;`)
    // On ajoute l'objet d'analyse au container d'analyse (le div qui
    // sera imprimé)
    Panneau.get('analyse').container.appendChild(div)

    this._obj = $(div)

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
      default: this.obj.html(this.mark)
    }
    this.observe()
  }

  buildAsModulation(){
    const elements = [
      DCreate('DIV', {class:'ton', text: this.mark}),
      DCreate('DIV', {class:'vline'})
    ]
    this.obj.append(elements)
  }
  updateAsModulation(){
    this.obj.find('.ton').html(this.mark)
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
    this.obj.append(elements)
  }
  updateAsWithTrait(){
    this.obj.find('.text').html(this.mark)
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
      case 'modulation': mark = ENG_NOTE_TO_ITA_NOTE[objProps.note].toUpperCase(); break;
      case 'segment': return '';
      default: mark = objProps.note.toUpperCase()
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

  // Retourne le top vrai, en fonction du type de l'objet
  realTopPerType(otype, sysTop, sysBot){
    switch(otype){
      case 'harmony':     return sysBot + 10; // TODO <= prefs
      case 'modulation':  return sysTop - 50; // TODO <= prefs
      case 'chord':       return sysTop - 20; // TODO <= prefs
      case 'cadence':     return sysBot + 50; // TODO <= prefs
      case 'segment':
        if (this.objetProps.segment == "up") {return sysTop - 70;/* TODO idem */}
        else { return sysBot + 70 /* TODO idem */}
    }
  }

  observe(){
    // La rendre déplaçable sur l'axe des x
    const my = this
    this.obj.draggable({
      axis:'x',
      stop: my.onChangeXByDrag.bind(my)
    })
    // Le rendre sensible au click pour le sélectionner
    this.obj.on('click', this.toggleSelect.bind(this))
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
    this.obj.addClass('selected')
  }
  unsetSelected(){
    this.obj.removeClass('selected')
  }

  get type(){
    return this._type || (this._type = this.data.type)
  }
  get obj(){return this._obj}

}
