'use strict'
/** ---------------------------------------------------------------------
  Class incButton
  ---------------
  version 1.0.3
*   Pour la fabrication d'un bouton d'incrémentation, avec
*   un champ affichant la valeur

  # 1.0.3
    La méthode publique 'set' ne provoque plus l'actualisation du propriétaire
    (entendu qu'elle permet de régler dans un premier temps les valeurs
    initiales du propriétaire)

  # 1.0.2
    Ajout des méthodes publiques 'min' et 'max' pour redéfinir de l'extérieur
    les valeurs max et min.

  # 1.0.0
    Première implémentation complète de la classe.
*
*   Procédure
*   ---------
*     - Mettre un conteneur dans la page, avec la classe 'incbutton' et
*       et un attribut 'label' si nécessaire
*         <span id="mon-incbutton" class="incbutton" label="Valeur"></span>
*     - Instancier un incButton :
*       const monBouton = new IncButton({
*         container: '#mon-incbutton',
*         onChange:  {function} La méthode à appeler quand ça change
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
    this.onChange = data.onChange || data.onchange
    if ( undefined === this.data.min ) this.data.min = null
    if ( undefined === this.data.max ) this.data.max = null
  }

  /**
  * ---------------------------------------------------------------------
  * *** Méthodes publiques ***
  ***/

  // Méthode publique
  set(val){ this.setValue(val, /* update = */ false) }

  // Pour fixer la valeur supérieure
  set max(v){ this.data.max = v }
  get max(){ return this.data.max}
  // Pour fixer la valeur inférieure
  set min(v){ this.data.min = v }
  get min(){ return this.data.min }

  hide(){this.container.classList.add('hidden')}
  show(){this.container.classList.remove('hidden')}

  // /méthodes publiques
  // ---------------------------------------------------------------------

  incValue(ev, upto){
    if ( ev.shiftKey ){ upto = upto * 10 }
    if ( ev.metaKey ) { upto = upto * 2  }
    const valprov = this.value + upto
    if (this.data.min !== null && valprov < this.data.min){return false}
    if (this.data.max !== null && valprov > this.data.max){return false}
    this.setValue(parseInt(this.value+upto, 10))
    // Si une fonction est à appeler au changement, il faut l'appeler
    this.onChange && this.onChange.call(null, this.value)
  }
  setValue(v, update = true){
    this.value = v
    this.spanValue.innerHTML = this.value
    update && this.onChange && this.onChange.call(null, this.value)
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
    // $(this.obj).find('.arrow.top').on('click', this.onPlus.bind(this))
    // $(this.obj).find('.arrow.bottom').on('click', this.onMoins.bind(this))
    // Pour pouvoir agir sur le bouton en maintenant la souris
    $(this.obj).find('.arrow.top').on('mousedown', this.onMouseDownOnPlus.bind(this))
    $(this.obj).find('.arrow.bottom').on('mousedown', this.onMouseDownOnMoins.bind(this))
    $(this.obj).find('.arrow.top').on('mouseup', this.onMouseUpOnPlus.bind(this))
    $(this.obj).find('.arrow.bottom').on('mouseup', this.onMouseUpOnMoins.bind(this))
  }
  onMouseDownOnPlus(ev){
    this.onPlus(ev)
    this.addTimeoutTimer(setTimeout(this.runLoopOnPlus.bind(this,ev),900))
  }
  onMouseDownOnMoins(ev){
    this.onMoins(ev)
    this.addTimeoutTimer(setTimeout(this.runLoopOnMoins.bind(this,ev),900))
  }
  runLoopOnPlus(ev){
    this.addIntervalTimer(setInterval(this.onPlus.bind(this, ev), 100))
    this.clearAllTimeoutTimers()
  }
  runLoopOnMoins(ev){
    this.addIntervalTimer(setInterval(this.onMoins.bind(this, ev), 100))
    this.clearAllTimeoutTimers()
  }
  onMouseUpOnPlus(ev){
    this.clearAllTimers()
  }
  onMouseUpOnMoins(ev){
    this.clearAllTimers()
  }
  addTimeoutTimer(timer){
    if (undefined == this.timeoutTimers) this.timeoutTimers = []
    this.timeoutTimers.push(timer)
  }
  addIntervalTimer(timer){
    if (undefined == this.intervalTimers) this.intervalTimers = []
    this.intervalTimers.push(timer)
  }
  clearAllTimers(){
    this.clearAllIntervalTimers()
    this.clearAllTimeoutTimers()
  }
  clearAllIntervalTimers(){
    if (undefined == this.intervalTimers) return
    this.intervalTimers.forEach(timer => {
      clearInterval(timer)
      timer = null
    })
    this.intervalTimers = []
  }
  clearAllTimeoutTimers(){
    if ( undefined == this.timeoutTimers ) return
    this.timeoutTimers.forEach(timer => {
      clearTimeout(timer)
      timer = null
    })
    this.timeoutTimers = []
  }
  onPlus(ev){
    var val = 1
    return this.incValue(ev, val)
  }
  onMoins(ev){
    var val = -1
    return this.incValue(ev, val)
  }

  get spanValue(){return this._spanvalue || (this._spanvalue = $(this.obj).find('.incbutton-value')[0])}
  // Le container, PAS un set jQuery, MAIS un DOM Element
  get container(){return this._container || (this._container = DGet(`#${this.data.container.id}`))}

}
