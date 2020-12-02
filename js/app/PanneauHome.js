'use strict'

class PanneauHome extends Panneau {
  constructor() {
    super('home')
  }

  onActivate(){
    console.debug("Home activé")
    if (!this.observed){this.observe()}
    document.body.style.width = '1040px'
  }

  observe(){
    super.observe()
    $('#btn-save-analyse-data').on('click', this.onClickSaveButton.bind(this))
    $('#btn-load-analyse-data').on('click', this.onClickLoadButton.bind(this))
    this.observed = true
    console.debug("Home observée")
  }

  onClickSaveButton(ev){
    Score.current.getValuesAndSave()
  }

  onClickLoadButton(ev){
    console.info("Je dois charger les données de l'analyse")

  }

  showHelp(){
    message("Je dois afficher l'aide pour l'analyse")
  }


}
