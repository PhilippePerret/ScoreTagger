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
  // Pour le moment, par une boucle
  this.timer = setInterval(this.showNextObjet.bind(this), this.score.preferences.frequence_animation * 1000)
}
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
}

showNextObjet(){
  const objet = this.objets.pop()
  if ( objet ) {
    console.log("objet:", objet)
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
