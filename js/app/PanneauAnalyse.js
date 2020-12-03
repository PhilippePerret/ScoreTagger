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
    this.numPage = 1 // Pour le moment
  }
  onUnactivate(){
    // TODO Surveiller que ce soit bien enregistré
  }

  observe(){
    super.observe()
    $('img#expanded-score-current-page').bind('click', this.onClickScore.bind(this))
    // On construit le bouton d'incrément de page
    this.buttonIncrementPage = new IncButton({container:'#analyse-container-page-number', min: 0})
    this.buttonIncrementPage.build()
    this.buttonIncrementPage.onChange = this.onChangePage.bind(this)
    this.observed = true
  }

  get numPage(){ return this.buttonIncrementPage.value }
  get dataPage(){
    return Score.current.data.pages[this.numPage]
  }
  // On appelle cette méthode pour changer la page (ça fait tout)
  set numPage(num){
    this.buttonIncrementPage.value = num
    this.setPage(num)
  }

  setPage(num){
    Score.current.current_page = num // Pour AObject notamment
    DGet('#expanded-score-current-page').src = `_score_/${CURRENT_ANALYSE}/analyses/page-${num}.jpg`
    // this.showMedianLines();

  }


  /**
    * Méthode qui affiche les lignes médianes servant à estimer l'appartenance
    * d'un élément
  ***/
  showMedianLines(){
    const systemsData = this.dataPage.systems_data;
    for(var isys in systemsData){
      const sysData = systemsData[isys]
      console.log("sysData", sysData)
      const top = `${sysData.median_line}px`
      const line = DCreate('DIV', {class:'hline medline'})
      document.body.appendChild(line)
      line.style.top = top
    }
  }

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
