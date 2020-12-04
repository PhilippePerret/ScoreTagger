'use strict'

class PanneauAnalyse extends Panneau {
  constructor() {
    super('analyse')
    this.currentNote = 'c'
  }

  onActivate(){
    document.body.style.width = null
    if(!this.observed){
      this.propsAObjectToolbox = new PropsAObjectToolbox()
      this.propsAObjectToolbox.observe()
      this.observe()
    }
    if (!this.isDrawn){
      // On affiche la partition (ses systèmes)
      this.loadSystems().then(this.drawSystems.bind(this))
    }
  }
  onUnactivate(){
    // TODO Surveiller que ce soit bien enregistré
  }

  observe(){
    super.observe()
    $('img#expanded-score-current-page').bind('click', this.onClickScore.bind(this))
    // On construit le bouton d'incrément de page
    this.buttonIncrementPage = new IncButton({container:'#analyse-container-page-number', min: 0, value: 1})
    this.buttonIncrementPage.build()
    this.buttonIncrementPage.onChange = this.onChangePage.bind(this)
    this.observed = true
  }

  loadSystems(){
    return Ajax.send('get_data_pages.rb')
  }
  drawSystems(ret){
    if (ret.error) return erreur(ret.error)
    if (ret.data_pages){
      // console.debug("ret.data_pages:", ret.data_pages)
      var index = 0
      for ( var ipage in ret.data_pages ){
        const dpage = ret.data_pages[ipage]
        const data_cutlines = dpage.cutlines
        // console.log("data_cutlines:", data_cutlines)
        for ( var isys = 0, len = data_cutlines.length - 1; isys < len ; ++ isys  ) {
          this.drawSystem(ipage, 1 + Number(isys), data_cutlines[isys], index ++)
        }
      }
    } else {
      message("Aucune donnée de système n'est défini…")
    }
    this.isDrawn = true
  }

  drawSystem(ipage, isystem, dcutline, index){
    Object.assign(dcutline, {ipage: ipage, isystem: isystem, index: index})
    new ASystem(dcutline).build()
  }

  // On appelle cette méthode pour changer la page (ça fait tout)
  set current_page(num){
    this.buttonIncrementPage.value = num
  }
  get current_page() { this.buttonIncrementPage.value }

  // Méthode appelée quand on change le numéro de page, pour analyser une
  // autre page
  onChangePage(num){
    message("Je dois afficher la page #"+num)
  }

  onClickScore(ev){
    console.info("Click sur le score à", ev.offsetY, ev.offsetX)
    if ( ev.target.id == "expanded-score-current-page") {
      AObject.create(ev)
    } else {
      message("Ce n'est pas vraiment un clic sur la partition")
    }
  }

  get container(){
    return this._cont || (this._cont = document.querySelector('#score-analyse-container'))
  }
}
