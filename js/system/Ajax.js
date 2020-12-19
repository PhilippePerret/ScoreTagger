'use strict';
/** ---------------------------------------------------------------------
  Class Ajax
  ----------
  Envoi des requêtes ajax
  Version 0.3.1

  @usage

      Ajax.send("<script.rb>", {data}).then( ret => {
        Traitement du retour si aucune erreur
      })

  @rappel

      Dans le script ruby appelé, on récupère les données transmises par
      {data} à l'aide de Ajax.param(<key>)

  * 0.3.1
      Dans cette version, le retour avec la propriété :error définie
      est traitée ici, inutile d'utiliser tout le temp 'if (ret.error) ...'
      En revanche, il n'y a aucune méthode de traitement particulière lors
      de cette erreur (on pourrait imaginer passer une méthode onError aux
      données transmises)
*** --------------------------------------------------------------------- */
class Ajax {
  /**
    @asyn
    Return une Promise
  **/
  static send(script, hdata = {}){
    Object.assign(hdata, {script: script})
    // Propre à ScoreTagger :
    hdata.current_analyse || Object.assign(hdata, {current_analyse: CURRENT_ANALYSE})
    hdata = this.prepareData(hdata)
    // console.log("Data ajax : ", data)
    return this.proceedSending(hdata).then(this.traiteErrorInRetour.bind(this))
  }

  // static proceedSending(hdata){
  //   return new Promise((ok,ko)=>{
  //     var data = {
  //         url: 'ajax/ajax.rb'
  //       , data: hdata
  //       , success: ok
  //       , error: this.onError.bind(this,ko)
  //     }
  //     $.ajax(data)
  //   })
  // }
  //
  static proceedSending(hdata){
    return new Promise((ok,ko)=>{
      var data = {
          url: 'ajax/ajax.rb'
        , type: 'post'
        , data: hdata
        , success: ok
        , error: this.onError.bind(this,ko)
      }
      $.ajax(data)
    })
  }

  static traiteErrorInRetour(retour){
    return new Promise((ok,ko) => {
      if ( retour.error ) {
        erreur(retour.error)
      } else {
        ok(retour)
      }
    })
  }


  // On transforme toutes les données pour qu'elles respectent leur
  // type
  //    Par exemple, 12 deviendra [12,'number']
  //    "mot" deviendra ["mot",'string']
  //    Et les tables seront marquées comme 'json' et seront jsonisées
  // Cela permet de garder le type de chaque donnée
  static prepareData(h){
    for(var k in h){
      h[k] = JSON.stringify((function(value){
        switch ( typeof value ) {
          case 'string':  return [ value, 'string' ] ;
          case 'number':  return [ value, 'number'] ;//TODO ≠ entre integer et flottant
          case 'object':  return [ JSON.stringify(value), 'json']
          case 'boolean': return [ value, 'boolean']
          default: return [ value, 'undefined' ]
        }
      })(h[k]))
    }
    return h
  }
  static onError(ko, res, status, err){
    console.error("# ERREUR AJAX #")
    console.error("# err = ", err)
    console.error("# res = ", res)
    console.error("# status = ", status)
    ko()
  }
}
