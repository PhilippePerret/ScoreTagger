'use strict'
/** ---------------------------------------------------------------------
  *   Pour la fabrication d'un bouton d'incrémentation, avec
  *   un champ affichant la valeur
*** --------------------------------------------------------------------- */
class IncButton {
  constructor(data) {
    this.data = data
    this.value = this.data.defaultValue || this.data.value || 0
    if ( undefined === this.data.min ) this.data.min = null
    if ( undefined === this.data.max ) this.data.max = null
  }
  onPlus(ev){
    var val = 1
    return this.incValue(ev, val)
  }
  onMoins(ev){
    var val = -1
    return this.incValue(ev, val)
  }
  incValue(ev, upto){
    if ( ev.shiftKey ){ upto = upto * 10 }
    const valprov = this.value + upto
    if (this.data.min !== null && valprov < this.data.min){return false}
    if (this.data.max !== null && valprov > this.data.max){return false}
    this.setValue(this.value + upto)
    // Si une fonction est à appeler au changement, il faut l'appeler
    if ('function' == typeof(this.onChange)){
      this.onChange.call(null, this.value)
    }
  }
  setValue(v){
    this.spanValue.innerHTML = this.value
  }

  build(){
    const div = DCreate('DIV',{class:'incbutton', inner: [
      DCreate('SPAN', {class:'incbutton-value', text: this.value}),
      DCreate('SPAN', {class:'arrow top', text:'▲'}),
      DCreate('SPAN', {class:'arrow bottom', text:'▼'})
    ]})
    if ('string' == typeof(this.data.container)){ this.data.container = document.querySelector(this.data.container)}
    this.data.container.appendChild(div)
    this.obj = div
    this.observe()
  }

  observe(){
    $(this.obj).find('.arrow.top').on('click', this.onPlus.bind(this))
    $(this.obj).find('.arrow.bottom').on('click', this.onMoins.bind(this))
  }

  get spanValue(){return this._spanvalue || (this._spanvalue = $(this.obj).find('.incbutton-value')[0])}
}
