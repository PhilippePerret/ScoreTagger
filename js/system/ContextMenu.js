'use strict'
/** ---------------------------------------------------------------------
  *   Class ContextMenu
  *   ------------------
  *   Gestion des menus contextuels

Un menu contextuel est un menu qui apparait lorsque l'on tient la souris
pressée sur un élément de l'interface assez longtemps OU lorsque l'on clique
sur l'élément en tenant la touche command (meta).
Un menu apparait alors près de la souris, avec des choix.

@usage

  SOIT l'élément DOM E (ou jQuery)
    On définit qu'il doit réagir à la pression de la souris et faire apparaitre
    un menu contextuel en ajoutant le code :

    new ContextMenu(E, data_menu[ , byPressure = true])

  AVEC
      data_menu = [
          {name: "nom du menu", method: methode_reaction }
        , {name: "nom du menu", method: methode_reaction }
        etc.
      ]

  OPTION
      {
        byPressure:   Si true, le menu apparait quand on reste appuyé sur l'objet
        onclick:      Méthode à appeler si c'est un click "normal", sans meta key
      }
*** --------------------------------------------------------------------- */
class ContextMenu {

constructor(domElement, data_menu, options = {}) {
  this.obj = $(domElement)
  this.data = data_menu
  this.byPressure = options.byPressure
  this.onClick = options.onclick||options.onClick
  this.observe()
}

observe(){
  this.obj
    .on('mousedown', this.onMouseDown.bind(this))
    .on('mouseup', this.onMouseUp.bind(this))
}

show(){
  this.menu.removeClass('hidden')
}
hide(){
  this.menu.addClass('hidden')
}

/**
* Méthode appelée quand on clique sur une ligne. Si on tient la souris
* assez longtemps, un menu apparait
***/
onMouseDown(ev){
  this.forClick = false
  if (this.byPressure) {
    this.timerPression = setTimeout(this.showMenu.bind(this, ev), 500)
  } else if (ev.metaKey) {
    this.showMenu.call(this, ev)
  } else if ( this.onClick ) {
    this.forClick = true
  }
  return stopEvent(ev)
}
onMouseUp(ev){
  if (this.timerPression){
    clearTimeout(this.timerPression)
    this.timerPression = null
  }
  if ( this.forClick ) this.onClick.call(null, ev)
  this.menu && this.hide()
  return stopEvent(ev)
}

/**
* Menu qui apparait quand on a tenu la souris assez longtemps
***/
showMenu(ev){
  this.menu ? this.show() : this.build()
  this.menu.css(px({top:ev.clientY - 40, left: ev.clientX - 40}))
}


/**
* Construction du menu contextuel
***/
build(){
  const m = DCreate('DIV', {class:'context-menu'})
  m.appendChild(this.closeButton())
  this.data.forEach(dmenu => m.appendChild(this.buildItem(dmenu)))
  $('body').append(m)
  this.menu = $(m)
}
// Construction d'un item du menu et on l'observe
buildItem(ditem){
  const my = this
  // const idItem = this.constructor.newId()
  // const i = DCreate('BUTTON', {type:'button', id:idItem, class:'context-item', text:ditem.name})
  const i = DCreate('BUTTON', {type:'button', class:'context-item', text:ditem.name})
  $(i).on('click', ev => {my.hide.call(my); ditem.method.call()})
  return i
}
closeButton(){
  const my = this
  const c = DCreate('DIV', {class:'close-button-container'})
  const b = DCreate('SPAN', {class:'close-button', text: '✖︎'})
  $(b).on('click', my.hide.bind(my))
  c.appendChild(b)
  return c
}


static newId(){
  if ( undefined == this.lastId ) this.lastId = 0
  return `${++ this.lastId}`
}
} // class ContextMenu
