'use strict';
/** ---------------------------------------------------------------------
*   Class Selection
*   ---------------
* Une class qui permet de gérer les sélections d'un élément quelconque
* Il suffit de faire :
*   Soit ma classe MaClasse() qui doit gérer des sélections
*   MaClasse.selection = new Selection()
*   Ensuite on peut faire
*     MaClasse.selection.add(un élément, ev)
*     MaClasse.selection.remove(un élément, ev)
* Note : il faut toujours envoyer un évènement qui définit shiftKey pour
*         savoir si la touche majuscule est tenu
* Les éléments (instances) de l'objet propriétaire doivent définir les
* méthodes 'setSelected' et 'unsetSelected' qui définissent ce qui doit
* être fait à la sélection et à la déselection (sauf le isSelected qui
* est géré par cette class Selection)
*
* Si le propriétaire définit une méthode onSelect et:ou onDeselect, elles
* sont appelées à la sélection/désélection avec en argument l'item
*** --------------------------------------------------------------------- */
class Selection {
  constructor(owner) {
    this.owner = owner
    this.items = []
  }
  add(item, ev){
    if ( !ev.shiftKey ) {
      this.items.forEach( i => this.deselect(i) )
    }
    this.items.push(item)
    this.select(item)
  }
  remove(ritem, ev){
    const newliste = []
    this.items.forEach(item => {
      if(item.id == ritem.id){
        item.isSelected = false
        item.unsetSelected()
      } else {
        newliste.push(item)
      }
    })
    this.items = newliste
  }
  set(items, ev){
    this.items = items
  }

  // * private *

  select(item){
    item.isSelected = true
    item.setSelected()
    this.owner.onSelect && this.owner.onSelect(item)
  }
  deselect(item){
    item.isSelected = false
    item.unsetSelected()
    this.owner.onDeselect && this.owner.onDeselect(item)
  }
  deselectAll(){
    this.items.forEach(item => this.deselect(item))
    this.items = []
  }
}
