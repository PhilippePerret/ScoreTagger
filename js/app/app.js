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


static onEndStartup(){
  return new Promise((ok,ko)=>{
    __end("Fin du démarrage de l'application")
    ok()
  })
}

}
