'use strict';

const TABS = ['home','crop','analyse','export'];

class UI {

static init(){
  return new Promise((ok,ko)=>{
    ok()
  })
}

/**
* Insertion des éléments HTML (briques)
***/
static insertHTMLElements(){
  __in("UI::insertHTMLElements")
  return UI.insert('panneau-home','div#panneau-home')
  .then(UI.insert.bind(UI, 'form_data_analyse', 'div#form_data_analyse'))
  .then(UI.insert.bind(UI, 'form_infos_score_analyse', 'div#form_infos_score_analyse'))
  .then(UI.insert.bind(UI, 'form_preferences', 'div#form_preferences'))
  .then(UI.insert.bind(UI,'panneau-crop', 'div#panneau-crop'))
  .then(UI.insert.bind(UI,'panneau-analyse', 'div#panneau-analyse'))
  .then(UI.insert.bind(UI,'AObject_Toolbox', 'div#container-aobject-toolbox'))
  .then(UI.insert.bind(UI,'panneau-export', 'div#panneau-export'))
  .then(ASync_out("UI::insertHTMLElements"))
}

/**
* Méthode qui règle l'interface en fonction des données connues
* Par exemple, les onglets ne seront pas accessibles si aucun dossier
* d'analyse n'est choisi.
***/
static setInterface(){
  __in("UI::setInterface")
  const score = Score.current
  return new Promise((ok,ko) => {
    DGet('button#btn-panneau-crop')   .disabled = !score
    DGet('button#btn-panneau-analyse').disabled = !score
    DGet('button#btn-panneau-export') .disabled = !score
    const ShowAnalyse = score && score.preferences.binary('startup.analyse_on_startup')
    const panneauName = ShowAnalyse ? 'analyse' : 'home'
    __add("Il faut afficher le panneau " + panneauName)
    Panneau.show(panneauName)
      .then(ASync_out("UI::setInterface"))
      .then(ok)
  })
}

static observe(){
  __in("UI::observe")
  return new Promise((ok,ko)=>{
    __out("UI::observe")
    ok()
  })
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
