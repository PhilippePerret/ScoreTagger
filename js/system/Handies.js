'use strict';

// Méthode à utiliser en catch des promesses
function onError(err){
  console.error(err)
  erreur("Une erreur est survenue, consulter la console.")
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
