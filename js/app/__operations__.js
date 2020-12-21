'use strict'
/** ---------------------------------------------------------------------
*   Opérations principales sous forme de segments de programme
*
*** --------------------------------------------------------------------- */
window.demarrerApplication = async function(){
  __start("Démarrage de l'application", "demarrerApplication")
  await App.loadPreferences()
  await UI.insertHTMLElements()
  await UI.setInterface() // Sans score ici
  Panneau.observe()
  __end("Fin du démarrage de l'application", "demarrerApplication", {output:false})
}
/**
* Segment de l'ouverture d'une partition (Score).
*
* Noter qu'il sera joué dans le ready SI la partition
* courante est définie et existe.
*
* +options+ pour le moment, ça n'est pas utilisé
*
* Retourne l'instance Score de la partition (oui, on pourrait la récupérer
* tout simplement par Score.current)
***/
window.openAnalyse = async function openAnalyse(folder, options = {
  setCurrent: false
  }){
  __start("Ouverture de l'analyse", "openAnalyse [segment]", {folder: folder})
  const script = options.setCurrent ? 'set_current_and_load' : 'get_data'
  const retourAjax = await Ajax.send(`${script}.rb`,{current_analyse: folder})
  if(!retourAjax.data){ return erreur("Analyse introuvable") }
  __add("Données de l'analyse remontées : " + JSON.stringify(retourAjax.data))
  const score = await Score.initCurrentWithData(retourAjax.data)
  HomePane.setAllValuesInHomePane(score.data)
  await UI.setInterface()
  __end("Fin de l'ouverture de l'analyse","openAnalyse [segment]", {output:false})
  return score
}

/**
* Segment de programme qui prépare la table d'analyse en vue de l'affichage
* de l'analyse de +score+.
* Notes
* -----
*   - la partition doit avoir été préparée avant.
***/
window.prepareTableAnalyse = async function prepareTableAnalyse(){
  __start("Préparation de la table d'analyse", "prepareTableAnalyse [segment]")
  document.body.style.width = null
  AObjectToolbox.inited || AObjectToolbox.init()
  TableAnalyse.observed || TableAnalyse.prepareAndObserve()
  __end("Fin de la préparation de la table d'analyse",{output: false})
}

/**
* Segment de programme qui affiche l'analyse (la dessine) sur la table
* d'analyse.
* Notes
* -----
*   - Il doit être joué après avoir préparé la table d'analyse grâce au segment
*     précédent
*   - Il est appelé après la méthode précédente si les préférences déterminent
*     qu'il faut afficher la table d'analyse à l'ouverture.
***/
window.drawAnalyse = async function drawAnalyse(score, options = {}){
  __start("Dessin de l'analyse sur la table d'analyse", "drawAnalyse [segment]")
  TableAnalyse.resetAll()
  score.drawFirstPage()
  const allsystems = await score.loadSystemsPrepared()
  await score.instanciateAllSystems(allsystems)
  await score.loadAllImageSystems()
  await score.poseAllSystems()
  score.isPrepared || score.calcPositionAllSystems()
  await score.positionneAndDrawSystems()
  score.setNumerosFirstMesures()
  TableAnalyse.drawPageDelimitors()
  score.pref_apercu_tonal && TableAnalyse.drawApercuTonal()
  await score.finDrawing()
  __end("Fin du dessin de l'analyse",{output: false})
}
