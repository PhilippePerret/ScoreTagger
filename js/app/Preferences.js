'use strict';
/** ---------------------------------------------------------------------
  *   Classe Preferences
  *
*** --------------------------------------------------------------------- */
// Distance entre les lignes de titre, compositeur, etc. sur la première page
// TODO Il faudrait que ce soit une valeur définissable, mais
// il faut tenir compte du fait qu'elle est utilisée pour définir
// la hauteur des éléments par défaut ci-dessous.
const BASELINE_HEIGHT = 32
// Valeurs par défaut
const PREFS_DEFAULT_VALUES = {
  space_between_systems: 20
  , lignes: {
      segment:      -(40 + 17) // ou garder pour mode analyse structurelle ?
    , modulation:   -(20 + 20)
    , chord:        -(0 + 17)
    , harmony:      0
    , cadence:      20
    , pedale:       40
  }
  , first_page: {
      title: {top:3*BASELINE_HEIGHT, left:60}
    , composer: {top:5*BASELINE_HEIGHT, left:60}
    , composing_year: {top:6*BASELINE_HEIGHT, left:60}
    , analyst: {top:5*BASELINE_HEIGHT, left:420}
    , analyze_year: {top:6*BASELINE_HEIGHT, left:420}
    , incipit:{top:8*BASELINE_HEIGHT, left:60}
    , first_system_top:16*BASELINE_HEIGHT
  }

}
class Preferences {

constructor(score) {
  this.score = score
}

/**
* Pour obtenir les données à enregistrer
*
* On n'enregistre que les données vraiment définies
***/
get data(){
  return this._data || {
      lignes: {}
    , first_page: {}
    , space_between_systems: null
  }
}

/**
* Pour définir les données de la partition courante
***/
set data(h){
  this._data = h
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
  return this.data.space_between_systems || PREFS_DEFAULT_VALUES.space_between_systems
}

/**
* Pour obtenir la hauteur de la ligne de type +type+ ou
* sa valeur par défaut.
***/
ligne(type){
  return this.data.lignes[type] || PREFS_DEFAULT_VALUES.lignes[type]
}

/**
* Pour obtenir une valeur de première page
***/
first_page(prop){
  return this.data.first_page[prop] || PREFS_DEFAULT_VALUES.first_page[prop]
}

} // class Preferences
