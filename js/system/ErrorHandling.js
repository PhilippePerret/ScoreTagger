'use strict'
/** ---------------------------------------------------------------------
*   Gestion des erreurs
*
*** --------------------------------------------------------------------- */
window.onerror = function(){
  // __d()
  console.trace()
  console.error(arguments)
  erreur("Une erreur est survenue. Merci de consulter la console.")
}
