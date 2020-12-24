'use strict'

class PanneauExport extends Panneau {
  constructor() {
    super('export')
  }

  onActivate(){
    this.observe()
  }

  observe(){
    super.observe()
  }


  showHelp(){
    message("Je dois afficher l'aide pour l'analyse")
  }


}
