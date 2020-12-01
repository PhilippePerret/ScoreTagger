'use strict';

const TABS = ['home','crop','analyse','export'];

class UI {
  static init(){
    this.prepare()
    this.observe()
  }
  static prepare(){
    // Garder toujours ce bouton pour pouvoir essayer du code
    // this.divTools.appendChild(DCreate('BUTTON',{id:'btn-try', class:'fleft', text:'Essayer…'}))
  }

  static observe(){
    // Garder toujours cette observation du bouton pour essayer du code
    // this.listenClick(DGet('#btn-try'), this.run_script_essai.bind(this))
    // On observe les boutons des onglets
    TABS.forEach(tab => Panneau.get(tab).observe())
    Panneau.current = Panneau.get('home')
  }

  // Pour faire des tests en ruby
  static run_script_essai(){
    Ajax.send('_essai_.rb').then(onAjaxSuccess).catch(onError)
  }

  /**
    ---------------------------------------------------------------------
      ÉLÉMENTS
    ---------------------------------------------------------------------
  **/
  static get homeTab(){return $('section#tabs div#tab-home')}
  static get cropTab(){return $('section#tabs div#tab-crop')}
  static get analyseTab(){return $('section#tabs div#tab-analyse')}
  static get exportTab(){return $('section#tabs div#tab-export')}

  /** ---------------------------------------------------------------------
      MÉTHODES PUBLIQUES

      !!! NE RIEN TOUCHER CI-DESSOUS !!!
  --------------------------------------------------------------------- **/

  // Observer le clic sur l'élément DOM +button+ en actionnant la méthode
  // +method+
  static listenClick(button, method){
    this.listen(button,'click',method)
  }
  // Inverse de la précédente
  static unlistenClick(button, method){
    this.unlisten(button,'click',method)
  }

  static listen(button, evType, method){
    button.addEventListener(evType,method)
  }
  static unlisten(button, evType, method){
    button.removeEventListener(evType,method)
  }


  /**
    Méthode qui insert la brique html de chemin relatif +fname+ (dans ./html)
    dans le container +container+.
  **/
  static insert(fname, container = document.body){
    return new Promise((ok,ko)=>{
      Ajax.send('system/get-brique.rb', {rpath: fname})
      .then(ret => {
        // console.log("ret:", ret)
        if (ret.error) return ko(ret.error)
        if ( 'string' == typeof container ) { container = document.querySelector(container) }
        container.insertAdjacentHTML('beforeend', ret.brique)
        ok(ret)
      })
    })
  }
}
