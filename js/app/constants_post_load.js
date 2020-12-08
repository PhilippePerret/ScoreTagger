'use strict'
/** ---------------------------------------------------------------------
  *   Définition des constantes après chargement
  *
*** --------------------------------------------------------------------- */


const TableAnalyse = Panneau.get('analyse')

const TUNE_TO_INDICE_TON = {
  'C': 0,
  'D': 1,
  'E': 2,
  'F': 3,
  'G': 4,
  'A': 5,
  'B': 6
}
// Pour que 4 return 'G', 2 retourne 'E', etc.
const INDICE_TON_TO_TUNE = {}
for(var t in TUNE_TO_INDICE_TON){
  Object.assign(INDICE_TON_TO_TUNE, {[TUNE_TO_INDICE_TON[t]]: t})
}
const TUNE_TO_INDICE = {
  'C': 0,
  'D': 2,
  'E': 4,
  'F': 5,
  'G': 7,
  'A': 9,
  'B': 11
}
const INDICE_TO_TUNE = {
  0:'C',
  1:'C#',
  2:'D',
  3:'D#',
  4:'E',
  5:'F',
  6:'F#',
  7:'G',
  8:'G#',
  9:'A',
  10:'A#',
  11:'B'
}
