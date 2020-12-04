'use strict'

class PanneauHome extends Panneau {
  constructor() {
    super('home')
  }

  onActivate(){
    console.debug("Home activé")
    if (!this.observed){this.observe()}
    document.body.style.width = '1040px'
  }

  observe(){
    super.observe()
    $('#btn-save-analyse-data').on('click', this.onClickSaveButton.bind(this))
    $('#btn-load-analyse-data').on('click', this.onClickLoadButton.bind(this))
    $('#btn-prepare-score').on('click', this.onClickPrepareButton.bind(this))
    this.observed = true
    console.debug("Home observée")
  }

  /**
  * Quand on clique le bouton pour préparer la partition, c'est-à-dire
  * en faire des pages exploitables par la découpe.
  * Par la même occasion, cette méthode enregistre le chemin d'accès au
  * fichier original qui vient peut-être d'être défini.
  ***/
  onClickPrepareButton(ev){
    const score_path = $('#analyse_partition_path').val().trim()
    if ( score_path == "" ) return erreur("Il faut définir le chemin d'accès à la partition ou au dossier contenant les pages classées de la partition.")
    message("Préparation de la partition…")
    Ajax.send('prepare_score.rb', {score_path: score_path})
    .then(ret => {
      if (ret.error) return erreur(ret.error)
      // On peut passer à la découpe
      message(`Partition préparée (nombre de pages : ${ret.page_count}). Tu peux passer à la découpe.`)
      Panneau.get('crop').open()
    })
  }

  onClickSaveButton(ev){
    Score.current.getValuesAndSave()
  }

  onClickLoadButton(ev){
    console.info("Je dois charger les données de l'analyse")

  }

  showHelp(){
    message("Je dois afficher l'aide pour l'analyse")
  }


}
