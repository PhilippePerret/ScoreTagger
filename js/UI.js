'use strict';

const TABS = ['home','crop','analyse','export'];

class UI {
  static init(){
    this.prepare()
    this.observe()
  }
  static prepare(){
  }

  static observe(){
    TABS.forEach(tab => Panneau.get(tab))
    // On observe les boutons d'onglet
    $('button.tabbutton').on('click', Panneau.onClickOnglet.bind(Panneau))
  }

  // Pour faire des tests en ruby
  static run_script_essai(){
    Ajax.send('_essai_.rb').then(onAjaxSuccess).catch(onError)
  }

  /** ---------------------------------------------------------------------
      MÉTHODES PUBLIQUES

      !!! NE RIEN TOUCHER CI-DESSOUS !!!
  --------------------------------------------------------------------- **/

  /**
  * Quand on doit ajouter/retirer la class CSS +css+ de l'objet +obj+
  * suivant que +condition+ est vrai ou fausse
  ***/
  static addClassIf(obj, condition, css){
    $(obj)[condition?'addClass':'removeClass'](css)
  }

  /**
  * Affiche ou masque l'objet +obj+ suivant la condition +condition+
  ***/
  static showIf(obj, condition){
    return this.addClassIf(obj, !condition, 'hidden')
  }

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
        if ( 'string' == typeof container ) { container = document.querySelector(container) }
        container.insertAdjacentHTML('beforeend', ret.brique)
        ok(ret)
      })
    })
  }
}
