'use strict'
/***
  Classe abstraite BGroupAOTB
  (pour "Buttons Group of AObject Toolbox")
***/
class BGroupAOTB {
/** ---------------------------------------------------------------------
*   CLASSE
*
*** --------------------------------------------------------------------- */
static hideAllGroups(){
  this.items.forEach(bgroup => bgroup.hide())
}
/**
* Ajouter le groupe de bouton +bgroup+ (seule le groupe de boutons principaux
* ne sont pas ajouter)
* ATTENTION : ne pas produire de table, this.items permet juste de passer en
* revue tous les groupes, par exemple pour les masquer (cf. 'hideAllGroups'
* ci-dessus). Pour récupérer un group, utiliser AObjectToolbox.bGroup(<gtype>)
***/
static add(bgroup){
  if ( undefined === this.items ) this.items = []
  this.items.push(bgroup)
}
/** ---------------------------------------------------------------------
*   INSTANCE
*
*** --------------------------------------------------------------------- */
constructor(gtype) {
  this.gtype = gtype // p.e. 'chord' ou 'alteration' ou 'degre'
  this.gtype == 'otype' || this.constructor.add(this)
}
get ref(){
  return this._ref || (this._ref = `[Groupe boutons '${this.gtype}']`)
}

/**
* Pour masquer ou afficher le groupe de boutons
* L'argument +options+ permet de définir :
*   only:       La liste des seuls boutons à afficher (null pour tous)
*   selected:   L'instance du Bouton à sélectionner
***/
show(options = {}){
  this.obj.classList.remove('hidden')
  if ( options.only ) {
    this.hideAllButtons()
    options.only.forEach(bId => ButtonAOTB.get(`${this.gtype}-${bId}`).show())
  } else this.showAllButtons()
  options.selected && this.setSelected(options.selected)
}
hide(){this.obj.classList.add('hidden')}

/**
* Permet de masquer/afficher tous les boutons du groupe (pour n'en afficher que certains)
***/
showAllButtons(){
  $(this.obj).find('button.obb').removeClass('hidden')
}
hideAllButtons(){
  $(this.obj).find('button.obb').addClass('hidden')
}

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
* Contrairement à 'select', cette méthode attend une instance de bouton
***/
setSelected(button){
  this.selected && this.selected.deselect()
  button.select()
  this.selected = button
}

/**
* Sélection le bouton de valeur +vbutton+
* Contrairement à la méthode setSelected qui attend une instance de bouton,
* cette méthode permet de sélectionner un bouton du groupe en donnant seulement
* sa valeur.
***/
select(vbutton){
  this.setSelected(ButtonAOTB.get(`${this.gtype}-${vbutton}`))
}

/**
* Construction de la rangée de boutons du groupe
*
* Note : fonctionne autant pour le groupe des boutons principaux que pour
* les autres groupes.
***/
build(){
  const my = this
  __in(`${my.ref}#build`)

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
