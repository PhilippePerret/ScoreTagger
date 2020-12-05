'use strict';
/** ---------------------------------------------------------------------
  *   Classe Preferences
  *
*** --------------------------------------------------------------------- */
class Preferences {

constructor(score) {
  this.score = score
}

/**
* Méthode qui récupère les valeurs de préférences dans les champs
* Note : pour le moment, ces valeurs se trouvent sur la page d'accueil
***/
getValuesInFields(){
  // TODO Faire le travail
  return this.getData()
}

/**
* Pour obtenir les données à enregistrer
*
* On n'enregistre que les données vraiment définies
***/
getData(){
  var h = {}
  const props = ['lignes','first_page','space_between_systems']
  props.forEach( prop => {
    if ( undefined != this[`_${prop}`] ) Object.assign(h, {[prop]: this[prop]})
  })
  return h
}

/**
* Pour définir les données de la partition courante
***/
setData(h = {}){
  this._lignes      = h.lignes
  this._first_page  = h.first_page
  this._space_between_systems = h.space_between_systems
}

/** ---------------------------------------------------------------------
*   PRÉFÉRENCES proprement dites
*
*** --------------------------------------------------------------------- */

/**
* Distance entre systèmes
*
* Attention, il ne s'agit pas de la distance entre le 'bottom' d'un système et
* le 'top' du suivant, mais entre la ligne de pédale du système et la ligne
* de segment (la plus en haut) du suivant
***/

get space_between_systems(){
  return this._space_between_systems || 20
}

/**
* Définition de la position des lignes pour poser les objets d'analyse
* en dessous et au-dessus de la partition
***/
get lignes(){
  return this._lignes || {
      segment:      -(40 + 17) // ou garder pour mode analyse structurelle ?
    , modulation:   -(20 + 20)
    , chord:        -(0 + 17)
    , harmony:      0
    , cadence:      20
    , pedale:       40
  }
}

/**
* Définition de la position et de l'aspect des éléments de la première
* page (titre, compositeur, etc.)
***/
get first_page(){
  return this._first_page || {
      title: {top: 40, left: 100}
    , composer: {top: 60, left: 100}
    , analyst: {top: 80, right: 40}
    , date: {top: 20, right: 40}
    , first_system_top: 200
  }
}


} // class Preferences
