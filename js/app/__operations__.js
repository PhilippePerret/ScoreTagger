'use strict'
/** ---------------------------------------------------------------------
*   Opérations principales sous forme de segments de programme
*
*** --------------------------------------------------------------------- */
window.output = SmartDebug.output.bind(SmartDebug)

window.demarrerApplication = function(){
  __start("Démarrage de l'application", "demarrerApplication")
  App.loadPreferences()
  .then(  UI.init.bind(UI)  )
  .then(  UI.insertHTMLElements.bind(UI)  )
  .then(  Score.initialize.bind(Score)  )
  .then(  UI.setInterface.bind(UI)  )
  .then(  UI.observe.bind(UI) ) // ne fait rien, pour le moment
  .then(  App.onEndStartup.bind(App) )
  .then(  ASync_out("demarrerApplication")  )
  .then(  output ) // pour voir le débug
  .catch( onError)
}
