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
      UI.insert('panneau-home', 'div#panneau-home')
      .then(UI.insert.bind(UI, 'form_data_analyse', 'div#form_data_analyse'))
      .then(UI.insert.bind(UI, 'form_infos_score_analyse', 'div#form_infos_score_analyse'))
      .then(UI.insert.bind(UI, 'form_preferences', 'div#form_preferences'))
      .then(UI.insert.bind(UI,'panneau-crop', 'div#panneau-crop'))
      .then(UI.insert.bind(UI,'panneau-analyse', 'div#panneau-analyse'))
      .then(UI.insert.bind(UI,'AObject_Toolbox', 'div#container-aobject-toolbox'))
      .then(UI.insert.bind(UI,'panneau-export', 'div#panneau-export'))
      .then(Score.initialize.bind(Score))
      .then(this.setPanneauCourant.bind(this))
      .then(ok)
    })
  }
  static setPanneauCourant(){
    return new Promise((ok,ko) => {
      const Prefs = Score.current.preferences
      const panneau = Prefs.binary('startup.analyse_on_startup') ? 'analyse' : 'home'
      Panneau.current = Panneau.get(panneau)
      Panneau.current.open()
      ok()
    })
  }
  // Quand tout est prêt
  static start(){
    // console.clear()

    // On règle l'interface en fonction des données
    UI.setInterface()

    console.log("On peut commencer !")

    // Pour lancer des procédures directement au cours de l'implémentation

    // Pour essai du code ruby (_scripts_/_essai_.rb)
    // UI.run_script_essai()
  }

}
