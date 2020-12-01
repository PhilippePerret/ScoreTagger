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
  }
}
