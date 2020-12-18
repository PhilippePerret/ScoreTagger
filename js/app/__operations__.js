'use strict'
/** ---------------------------------------------------------------------
*   Opérations principales sous forme de segments de programme
*
*** --------------------------------------------------------------------- */
window.demarrerApplication = async function(){
  __start("Démarrage de l'application", "demarrerApplication")
  await App.loadPreferences()
  await UI.init()
  await UI.insertHTMLElements()
  await UI.setInterface() // Sans score cette fois
  await output()
  // console.log("fin")

}
window.XXXXdemarrerApplication = function(){
  __start("Démarrage de l'application", "demarrerApplication")
  App.loadPreferences()
  .then(  UI.init.bind(UI)  )
  .then(  UI.insertHTMLElements.bind(UI)  )
  .then(  Score.initialize.bind(Score)  ) // charge la partition si elle existe
  .then(  UI.setInterface.bind(UI)  )
  .then(  UI.observe.bind(UI) ) // ne fait rien, pour le moment
  .then(  App.onEndStartup.bind(App) )
  .then(  ASync_out("demarrerApplication")  )
  .then(  output ) // pour voir le débug
  .catch( onError)
}

/**
* Segment de l'ouverture d'une partition (Score).
*
* Noter qu'il sera jouer dans Score.initialize ci-dessus SI la partition
* courante est définie et existe vraiment.
*
* +options+ pour le moment, ça n'est pas utilisé
***/
window.loadAndPrepareScore = options => {
  __in("loadAndPrepareScore [segment]")
  return Ajax.send('get_data.rb')
  .then(Score.initializeWithData.bind(Score))
  .then(ASync_out("loadAndPrepareScore [segment]"))
  .catch(err => {
    // On passe ici quand l'analyse n'a pas été trouvée (est-ce que ça
    // n'interrompt pas le flux ?)
    console.log("err = ", err)
  })
}
