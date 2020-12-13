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
  divers: {
    score_scale: {name:"Taille de la partition sur la table", value:150, unity:'%'}
  , space_between_systems: {name:"Espace entre les systèmes (hors ligne)", value:20, unity: 'pixels'}
  , frequence_animation: {name:"Durée entre deux appararitions d'objets (animation)", value: 2, unity: 'seconds'}

  }
  // Les checkboxs (valeurs binaires, d'où le nom)
  , binary: {
      startup: {
        titre: "Démarrage"
      , items: {
            analyse_on_startup: {name: "Afficher l'onglet Analyse au démarrage", value: false}

        }
      }
    , analyse: {
        titre: "Analyse de la partition"
      , items: {
            autosave: {name:"Sauvegarde automatique pendant l'analyse", value: true}
          , autochoose_values: {name: "Toujours sélectionner les valeurs par défaut", value: true}
          , select_just_created: {name: "Sélectionner l'objet nouvellement créé", value: true}
        }
      }
    , score: {
        titre: "La partition"
      , items: {
          numero_mesure: {name: "Numéroter la première mesure des systèmes", value: true}
        }
      }
    , export: {
        titre: "Finalisation de la partition analysée"
      , items: {
            use_segment_line: {name: "Utiliser la ligne de segment", value: true}
          , apercu_tonal: {name: "Produire un aperçu tonal (ton voisins, en annexe)", value: true}
        }
      }
  }
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
    , divers: {}
    , binary: {}
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

/**
* Pour obtenir une valeur binaire (checkbox)
*
* +key+ ressemble à "<section>.<key>", par exemple "startup.analyse_on_startup"
***/
binary(key){
  if ( undefined === this.data.binary[key] ) {
    return this.getBinaryDefault(key)
  } else {
    return this.data.binary[key]
  }
}

/**
* Pour obtenir une des valeurs 'divers', souvent une valeur nombrale
***/
divers(key){
  return this.data.divers[key] || this.getDiversDefault(key)
}



getBinaryDefault(key){
  const [mainkey, subkey] = key.split('.')
  try {
    return PREFS_DEFAULT_VALUES.binary[mainkey].items[subkey].value
  } catch (e) {
    console.error("Problème avec la préférence binaire '%s' :", key, e)
    return false
  }
}
getDiversDefault(key){
  return PREFS_DEFAULT_VALUES.divers[key].value
}


} // class Preferences
