'use strict';
/** ---------------------------------------------------------------------

  MÉTHODES PRATIQUES
  ------------------
  Version 1.1.0

# 1.1.0
  Modification de la méthode with_pixels -> px
  + Elle peut recevoir maintenant, dans les objets, des valeurs qui ont
    déjà leur unité et ne seront pas transformées. Pour ne pas avoir à
    compliquer la définition de l'attribut style lorsqu'il y a d'autres
    valeurs comme des zooms, des polices, etc.
# 1.0.2
  Ajout de la méthode 'px'
*** --------------------------------------------------------------------- */

// Méthode à utiliser en catch des promesses
function onError(err){
  console.error(err)
  erreur("Une erreur est survenue, consulter la console.")
}

/**
* Pour ajouter les pixels aux valeurs numériques (*) :
*
* (String)  "12" => "12px"
* (Number)  12 => "12px"
* (Object)  {top: 24, left: 34} => {top: "24px", left: "34px"}
*
* Si +asStyle+ est true, on retourne la donnée sous forme d'attribut style
* c'est-à-dire {top:24, left:34} => "top:24px;left:34px;"
* (ça n'est bien entendu valable que pour les Object(s))
*
* (*) Et seulement aux valeurs numériques, c'est-à-dire qu'on peut
*     laisser des propriétés déjà réglées sans problème.
***/
function px(vals, asStyle = false){
  if ('string' == typeof(vals) || 'number' == typeof(vals)) {
    return `${vals}px`
  } else {
    var newh = {}
    for(var k in vals){
      var val = vals[k]
      Object.assign(newh, { [k]: (isNaN(val) ? val : val+'px') })
    }
    if (asStyle){
      var str = []
      for(var k in newh){str.push(`${k}:${newh[k]};`)}
      return str.join('')
    } else {
      return newh
    }
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
