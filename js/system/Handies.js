'use strict';
/** ---------------------------------------------------------------------

  MÉTHODES PRATIQUES
  Version 1.0.2

# 1.0.2
  Ajout de la méthode 'with_pixels'
*** --------------------------------------------------------------------- */

// Méthode à utiliser en catch des promesses
function onError(err){
  console.error(err)
  erreur("Une erreur est survenue, consulter la console.")
}

/**
* Pour ajouter les pixels :
*
* (String)  "12" => "12px"
* (Number)  12 => "12px"
* (Object)  {top: 24, left: 34} => {top: "24px", left: "34px"}
***/
function with_pixels(val){
  if ('string' == typeof(val) || 'number' == typeof(val)) {
    return `${val}px`
  } else {
    var newh = {}
    for(var k in val){
      Object.assign(newh, {[k]: `${val[k]}px`})
    }
    return newh
  }
}

/**
  Méthode à appeler lorsque c'est un retourn ajax qui ne doit pas faire,
  dans un `catch`. La donnée retournée par le script ajax ruby doit contenir
  `error` pour signaler une erreur et/ou `message` pour afficher un message.
**/
function onAjaxSuccess(ret){
  if ( ret.error ) return erreur(ret.error)
  if (ret.message) message(ret.message)
}

function raise(msg){
  erreur(msg)
  throw new Error(msg)
}

const NOW = new Date()

/**
  Retourne le temps en secondes
  @documented
**/
function humanDateFor(timeSeconds){
  if (undefined === timeSeconds){ timeSeconds = new Date()}
  if ('number' != typeof(timeSeconds)) timeSeconds = parseInt(timeSeconds.getTime() / 1000)
  var d = new Date(timeSeconds * 1000)
  return `${String(d.getDate()).padStart(2,'0')} ${(String(d.getMonth()+1)).padStart(2,'0')} ${d.getFullYear()}`;
}

function stopEvent(ev){
  ev.stopPropagation();
  ev.preventDefault();
  return false
}

function dorure(str){return `<span style="color:#e9e330;background-color:blueviolet;padding:1px 6px;">${str}</span>`}
