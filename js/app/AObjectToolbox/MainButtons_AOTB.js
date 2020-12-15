'use strict';
/** ---------------------------------------------------------------------
*   Classe MainButtonsAOBT
*   ----------------------
*   Class (singleton) pour les boutons principaux de création et édition
*   des objets d'analyse
*** --------------------------------------------------------------------- */
class MainButtonsAOTB extends BGroupAOTB {
constructor() {
  super('otype')
}

/**
* Activation du groupe de boutons défini par le bouton principal +button+
*
* Cette méthode surclasse la méthode supérieure qui ne fait qu'activer le
* bouton choisi en modifiant l'aperçu et/ou l'objet édité. Celle-ci, au
* contraire, doit afficher tous les boutons nécessaires.
***/
activate(button){
  console.debug("Je dois activer le groupe de boutons '%s' correspondant à", button.data.id, button)
  // Dans tous les cas où sélectionne le bouton et on déselectionne celui
  // actuellement sélectionné (if any)
  this.setSelected(button)
  /**
  * En fonction du bouton choisi (dont les data définissent les groupes à
  * afficher, les boutons à afficher, etc.)
  * Ici, les groupes de boutons (instances BGroupAOTB) ne sont pas à confondre
  * avec les instances MainButtonAOTB qui définissent les spécificités visibles
  * de chaque otype d'objet.
  ***/
  const mainButton = MainGButtonAOTB.get(button.data.id)
  console.debug("Instance bouton principal ", mainButton)

}

/**
* Les données propres au groupe de boutons principaux (mais construites comme
* les autres groupes)
***/
get data(){return this._data || (this._data = AOBJETS_TOOLBOX_OTYPE_BUTTONS)}
}
