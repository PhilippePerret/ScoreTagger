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
  __end("Fin du démarrage de l'application", "demarrerApplication")
  await output() // pour voir le débug
}
/**
* Segment de l'ouverture d'une partition (Score).
*
* Noter qu'il sera jouer dans Score.initialize ci-dessus SI la partition
* courante est définie et existe vraiment.
*
* +options+ pour le moment, ça n'est pas utilisé
***/
window.openAnalyse = async (folder, options = {}) => {
  __in("openAnalyse [segment]")
  const script = options.setCurrent ? 'set_current_and_load' : 'get_data'
  var data = await Ajax.send(`${script}.rb`,{current_analyse: folder}).data
  if ( data ) {
    __add("Données analyse ", data)

  } else {
    erreur("Cette analyse est introuvable.")
  }
  // .then(Score.initializeWithData.bind(Score))
  // .then(ASync_out("openAnalyse [segment]"))
  // .catch(err => {
  //   // On passe ici quand l'analyse n'a pas été trouvée (est-ce que ça
  //   // n'interrompt pas le flux ?)
  //   console.log("err = ", err)
  // })
  __out("openAnalyse [segment]")
}
