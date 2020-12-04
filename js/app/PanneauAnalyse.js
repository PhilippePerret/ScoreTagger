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
    // // DEBUG POUR ESSAYER DE TROUVER LE MILIEU
    // const topLine = DCreate('DIV', {id: 'topline', class:"absolute bgred",
    //   style: 'top:0px;height:1px;width:100%;'
    // })
    // 
    // // Les Tops absolus des pages
    // document.querySelector('#systems-container').appendChild(topLine)
    // const bottomPage = DCreate('DIV',{id:'toplinenp', class:"absolute bggreen",
    //   style: `top:${TOP_PAGE - 1}px;height:1px;width:100%;`
    // })
    // document.querySelector('#systems-container').appendChild(bottomPage)
    //
    // for(var i = 0; i < 5 ; ++ i){
    //   var lpage = DCreate('DIV',{id:`pageline-${i}`, class:"absolute bgblue",
    //     style: `top:${TOP_PAGE * i}px;height:1px;width:100%;`
    //   })
    //   document.querySelector('#systems-container').appendChild(lpage)
    //   var lpagebas = DCreate('DIV',{id:`pagelinebas-${i}`, class:"absolute bggreen",
    //     style: `top:${(TOP_PAGE * (i+1)) - 1}px;height:1px;width:100%;`
    //   })
    //   document.querySelector('#systems-container').appendChild(lpagebas)
    // }
    // document.querySelector('#systems-container').style.height = '200cm'
    // return
    // // /DEBUG

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
