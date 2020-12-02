'use strict'

class PanneauAnalyse extends Panneau {
  constructor() {
    super('analyse')
    this.currentNote = 'c'
  }

  onActivate(){
    document.body.style.width = null
    if(!this.observed){this.observe()}
    this.numPage = 1 // Pour le moment
  }

  observe(){
    super.observe()
    $('button#analyse-help-button').bind('click', this.showHelp.bind(this))
    // On observe tous les boutons obb
    $('button.obb').bind('click', this.onClickButtonOBB.bind(this))
    $('img#score-expanded').bind('click', this.onClickScore.bind(this))
    // On construit le bouton d'incrément de page
    this.buttonIncrementPage = new IncButton({container:'#analyse-container-page-number', min: 0})
    this.buttonIncrementPage.build()
    this.buttonIncrementPage.onChange = this.onChangePage.bind(this)
    this.observed = true
  }

  get numPage(){ return this.buttonIncrementPage.value }

  // On appelle cette méthode pour changer la page (ça fait tout)
  set numPage(num){
    this.buttonIncrementPage.value = num
    this.setPage(num)
  }

  setPage(num){
    DGet('#expanded-score-current-page').src = `_score_/${CURRENT_ANALYSE}/analyses/page-${num}.jpg`
    console.log("Données", Score.current.data.pages[num])
    const systemsData = Score.current.data.pages[num].systems_data;
    for(var isys in systemsData){
      const sysData = systemsData[isys]
      const top = `${sysData.median_line}px`
      const line = DCreate('DIV', {class:'hline'})
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
    if ( ev.target.id == "score-expanded") {
      AObject.create(ev)
    } else {
      message("Ce n'est pas vraiment un clic sur la partition")
    }
  }

  onClickButtonOBB(ev){
    const but = ev.target
    const bid = but.id
    const typeButton = but.getAttribute('data-type-aobject')
    $(but).unbind('click', this.onClickButtonOBB.bind(this))
    $(but).draggable()
    this.selectTypeButton(typeButton, but)
    if ( typeButton == 'otype') {
      this.setInterfaceForType(but.getAttribute('data-value'))
    }
  }
  setInterfaceForType(otype){
    const divNotesButtons = $('div#objets div#objets-notes');
    const divHarmonyButtons = $('div#objets div#objets-harmonies');
    const divAlterationButtons = $('div#objets div#objets-alterations');
    const divCadencesButtons = $('div#objets div#objets-cadences')
    const divNaturesButtons = $('div#objets div#objets-natures')
    if ( otype == 'harmony' ) {
      divHarmonyButtons.removeClass('hidden')
      divNotesButtons.addClass('hidden')
      divAlterationButtons.addClass('hidden')
      divCadencesButtons.addClass('hidden')
      divNaturesButtons.removeClass('hidden')
    } else if ( otype == 'cadence' ){
      divCadencesButtons.removeClass('hidden')
      divNaturesButtons.addClass('hidden')
      divHarmonyButtons.addClass('hidden')
      divNotesButtons.addClass('hidden')
      divAlterationButtons.addClass('hidden')
    } else {
      divHarmonyButtons.addClass('hidden')
      divNotesButtons.removeClass('hidden')
      divAlterationButtons.removeClass('hidden')
      divCadencesButtons.addClass('hidden')
      divNaturesButtons.removeClass('hidden')
    }
  }
  selectTypeButton(type, cbutton){
    DGet(`button[data-type-aobject="${type}"].selected`).classList.remove('selected')
    cbutton.classList.add('selected')
  }

  showHelp(){
    message("Je dois afficher l'aide pour l'analyse")
  }


}
