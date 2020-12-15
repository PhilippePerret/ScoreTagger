'use strict'
/***
  Classe abstraite BGroupAOTB
  (pour "Buttons Group of AObject Toolbox")
***/
class BGroupAOTB {
constructor(gtype) {
  this.gtype = gtype // p.e. 'chord' ou 'alteration' ou 'degre'
}
get ref(){
  return this._ref || (this._ref = `[Groupe boutons '${this.gtype}']`)
}

/**
* Pour masquer ou afficher le groupe de boutons
***/
show(){this.obj.classList.remove('hidden')}
hide(){this.obj.classList.add('hidden')}

/**
* Appelée quand le bouton +button+ du groupe est enclenché (cliqué)
*
* Noter que cette méthode, surclassée par MainButtonsAOTB, ne fait ici que :
*   - sélectionner le bouton en question
*   - modifier l'aperçu
*   - modifier l'objet édité s'il y en a un
*
* +button+    Instance ButtonAOTB du bouton pressé
*
***/
activate(button){
  this.setSelected(button)
}

/**
* Définit le bouton du groupe qui est sélectionné
***/
setSelected(button){
  this.selected && this.selected.deselect()
  button.select()
  this.selected = button
}

/**
* Construction de la rangée de boutons du groupe
*
* Note : fonctionne autant pour le groupe des boutons principaux que pour
* les autres groupes.
***/
build(){
  const my = this
  console.debug("%s -> build()", my.ref)

  // On place le conteneur du groupe de bouton dans l'interface (car on en
  // a besoin pour placer les boutons)
  AObjectToolbox.container.appendChild(this.obj)

  // La construction du groupe de boutons consiste principalement à construire
  // ses boutons, dans l'ordre défini par data.order
  my.data.order.forEach( btnId => {
    const but = new ButtonAOTB(my, my.data.items[btnId])
    but.build_and_observe()
  })
}

/**
* Retourne les données du groupe de bouton
*
* Note : les boutons principaux surclassent cette propriété pour prendre
* les données dans une autre constante.
***/
get data(){
  return this._data || (this._data = AOBJETS_TOOLBOX_BUTTONS_GROUPS[this.gtype])
}

get obj(){
  return this._obj || (this._obj = this.buildDivGroup())
}

/**
* Deep méthodes de construction
***/
buildDivGroup(){
  var css = ['buttons-grp-aotb']
  // this.gtype != 'otype' && css.push('buttons-grp-type', 'hidden')
  this.gtype != 'otype' && css.push('buttons-grp-type')
  return DCreate('DIV', {id:`buttons-grp-${this.gtype}`, class:css.join(' ')})
}

}// BGroupAOTB
