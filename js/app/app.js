'use strict';

class App {

  // Quand la page est chargée
  static initialisation(){
    return new Promise((ok,ko) => {
      console.log("Initialisation en cours…")
      UI.init()
      UI.insert('tab-home', 'div#tab-home')
      .then(UI.insert.bind(UI,'tab-crop', 'div#tab-crop'))
      .then(UI.insert.bind(UI,'tab-analyse', 'div#tab-analyse'))
      .then(UI.insert.bind(UI,'tab-export', 'div#tab-export'))
      .then(ok)
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
