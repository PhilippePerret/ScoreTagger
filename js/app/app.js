'use strict';

class App {

  // Quand la page est chargée
  static loadPreferences(){
    __in('App::loadPreferences')
    return new Promise((ok,ko) => {
      __add("Pas de préférences application pour le moment.")
      __out('App::loadPreferences')
      ok()
    })
  }
  // Quand tout est prêt
  static start(){
    return new Promise((ok,ko) => {
      __in("App::start")
      // console.clear()

      // On règle l'interface en fonction des données
      UI.setInterface()

      // Préparation des panneaux
      Panneau.init()

      __add("On peut commencer !", "App::start")

      // Pour lancer des procédures directement au cours de l'implémentation

      // Pour essai du code ruby (_scripts_/_essai_.rb)
      // UI.run_script_essai()

      __out('App::start')

      ok()
    })
  }

static onEndStartup(){
  return new Promise((ok,ko)=>{
    __end("Fin du démarrage de l'application")
    ok()
  })
}

}
