'use strict';
/** ---------------------------------------------------------------------
*   Class Analyse
*
*** --------------------------------------------------------------------- */
class Analyse {
constructor(score) {
  this.score = score
}
/**
* Pour jouer l'analyse courante
***/
play(){
  this.objetsIni = this.getAllObjectSorted()
  this.objets = [...this.objetsIni]
  this.objets.reverse()
  this.startPlay()
  // Pour le moment, par une boucle (ensuite, on pourra fonctionner par touche)
  this.timer = setInterval(this.showNextObjet.bind(this), this.score.preferences.divers('frequence_animation') * 1000)
}
/**
* Méthode appelée au lancement de l'animation pour préparer l'interface
***/
startPlay(){
  $('body').css('background-color', 'white')
  // On masque la marge des outils et des onglets pour ne garder que le
  // bouton d'interruption de l'animation
  $('div.marge-tools').addClass('hidden')
  // On masque les boutons d'onglet
  $('aside#tabs-buttons').addClass('hidden')
  // On affiche le bouton d'interruption de l'animation
  // On augmente la taille de la partition
  $('div#systems-container').css('zoom', '150%')
  // Pour savoir quand on change de système et pouvoir ajuster le scroll
  // de fenêtre
  this.current_system = null
}
/**
* Méthode appelée à la fin de l'animation pour arrêter l'animation et
* remettre l'interface dans son état normal.
***/

endPlay(){
  if (this.timer){
    // On arrête le timer s'il existe
    clearInterval(this.timer)
    this.timer = null
  }
  // Remettre la classe normale (celle pour l'animation supprimait
  // le background et quelques petites choses)
  this.objetsIni.forEach(objet => {
    objet.obj.classList.remove('animate')
  })
  // Les éléments visibles/invisibles
  $('body').css('background-color', '')
  $('div.marge-tools').removeClass('hidden')
  $('div#systems-container').css('zoom', '')
  $('aside#tabs-buttons').removeClass('hidden')
}

showNextObjet(){
  const objet = this.objets.pop()
  if ( objet ) {
    // console.log("objet:", objet)
    if ( objet.system.index != this.current_system ){
      this.current_system = objet.system.index
      // console.debug("Passage au système %i", this.current_system)
      // location.hash = `#system-${objet.system.minid}`
      // window.scrollTo(0, window.pageYOffset - 120)
      // const hsys = $(`#system-${objet.system.minid}`).position().top
      const speed = 500
      $('html, body').animate( { scrollTop: $(`#system-${objet.system.minid}`).position().top }, speed )
    }
    objet.showSlowly()
  } else {
    this.endPlay()
  }
}

/**
* Pour prendre chaque objet dans l'ordre
*
* On en profite pour les masquer.
*
***/
getAllObjectSorted(){
  var o = []
  this.score.systems.forEach( system => {
    const objetsSorted = this.sortObjets(system.aobjets)
    objetsSorted.forEach( objet => {
      objet.hide()
      // On ajoute la classe 'animate' qui corrige quelques petites choses
      // comme par exemple le fond
      objet.obj.classList.add('animate')
      o.push(objet)
    })
  })
  return o
}

/**
* Méthode qui permet de classer les objets du système
***/
sortObjets(objets){
  return objets.sort((a,b) => {
    if ( a.left < b.left ){
      return -1
    } else if ( a.left > b.left ) {
      return 1
    } else {
      return a.top > b.top ? -1 : 1
    }
  })
}


}// /class Analyse
