'use strict';

class Line {
  constructor(top) {
    this.top = top - 20;
  }
  build(){
    var obj = document.createElement('DIV')
    obj.className = "hline"
    obj.style.top = `${this.top}px`
    document.body.appendChild(obj)
    this.obj = obj
    this.observe()
  }
  observe(){
    $(this.obj).draggable({axis:'y'})
    const dataMenu = [
      {name: "Supprimer…", method: this.onRemoveLine.bind(this)}
    ]
    new ContextMenu($(this.obj), dataMenu)
  }

/**
* Suppression de la ligne
***/
onRemoveLine(ev){
  $(this.obj).remove()
}

} // /class Line
