'use strict'
/** ---------------------------------------------------------------------
*   Pour la fabrication d'un bouton d'incrémentation, avec
*   un champ affichant la valeur
*
*   Procédure
*   ---------
*     - Mettre un conteneur dans la page, avec la classe 'incbutton' et
*       et un attribut 'label' si nécessaire
*         <span id="mon-incbutton" class="incbutton" label="Valeur"></span>
*     - Instancier un incButton :
*       const monBouton = new IncButton({
*         container: '#mon-incbutton',
*         min: valeur minimum
*         max: valeur maximale
*         value: valeur courante
*         values: {Array} Les valeurs à utiliser si ça n'est pas un
*       })
*     - Construire le bouton au moment voulu
*         monBouton.build()
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
    if ('string' == typeof(this.data.container)){ this.data.container = document.querySelector(this.data.container)}
    const conteneur = this.data.container

    // Si le conteneur définit l'attribut 'label' on doit en faire un
    // label
    const labelTxt = this.data.container.getAttribute('label')
    if ( labelTxt ) {
      conteneur.appendChild(DCreate('LABEL', {text: labelTxt}))
    }

    const elements = [
      DCreate('SPAN', {class:'incbutton-value', text: this.value}),
      DCreate('SPAN', {class:'arrow top', text:'▲'}),
      DCreate('SPAN', {class:'arrow bottom', text:'▼'})
    ]
    const div = DCreate('DIV',{class:'incbutton', inner:elements})
    conteneur.appendChild(div)

    conteneur.classList.remove('incbutton')
    conteneur.classList.add('incbutton-container')

    this.obj = div
    this.observe()
  }

  observe(){
    $(this.obj).find('.arrow.top').on('click', this.onPlus.bind(this))
    $(this.obj).find('.arrow.bottom').on('click', this.onMoins.bind(this))
  }

  get spanValue(){return this._spanvalue || (this._spanvalue = $(this.obj).find('.incbutton-value')[0])}
}
