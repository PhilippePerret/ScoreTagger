'use strict';

class App {

  // Quand la page est chargée
  static initialisation(){
    return new Promise((ok,ko) => {
      console.log("Initialisation en cours…")
      // On instancie le score courant (l'instance doit toujours exister)
      // L'instanciation charge les données (ou pas)
      // Score.current = new Score()
      UI.init()
      UI.insert('tab-home', 'div#tab-home')
      .then(UI.insert.bind(UI,'tab-crop', 'div#tab-crop'))
      .then(UI.insert.bind(UI,'tab-analyse', 'div#tab-analyse'))
      .then(UI.insert.bind(UI,'tab-export', 'div#tab-export'))
      .then(this.setPanneauCourant.bind(this))
      .then(this.finInitialisation.bind(this))
      .then(ok)
    })
  }
  static setPanneauCourant(){
    return new Promise((ok,ko)=>{
      Panneau.current = Panneau.get('home')
      Panneau.current.open()
      ok()
    })
  }

  static finInitialisation(){
    return new Promise((ok,ko)=>{
      if (CURRENT_ANALYSE){
        Ajax.send('get_data.rb').then(ret => {
          if (ret.error) erreur(ret.error)
          else {
            Score.current = new Score(ret.data)
            Score.current.dispatchData()
          }
          ok()
        })
      } else {
        ok()
      }
    })
  }

  // Quand tout est prêt
  static start(){
    // console.clear()
    console.log("On peut commencer !")
    // Pour lancer des procédures directement au cours de l'implémentation

    // Pour essai du code ruby (_scripts_/_essai_.rb)
    // UI.run_script_essai()
  }

}
