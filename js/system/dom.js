'use strict';

/**
  Reçoit une définition des propriétés, par exemple :
  [
      {name:'id', hname: "#", type:'hidden'}
    , {name:'prenom', hname, 'Prénom'}
    , ...
  ]
  … et retourne un +container+ avec les champs de formulaires désirés
  +container+ peut être créé simplement par DCreate('DIV')
**/

function DGet(selector, container){
  container = container || document
  return container.querySelector(selector)
}

/**
  Retourne une ligne div contenant un libellé et une valeur
**/
function DCreateDivLV(libelle, valeur, attrs){
  attrs = attrs || {}
  var dataLibelle = {class:'libelle', text:libelle}
  var dataValue   = {class:'value', text:valeur}
  if (attrs.libelleSize){
    libsize = attrs.libelleSize
    delete attrs.libelleSize
    Object.assign(dataLibelle, {style:`width:${libsize};`})
  }
  let div = DCreate('DIV', attrs)
  div.appendChild(DCreate('SPAN',dataLibelle))
  div.appendChild(DCreate('SPAN',dataValue))
  return div
}

function DCreate(tagName,attrs){
  attrs = attrs || {}
  var o = document.createElement(tagName);
  for(var attr in attrs){
    var value = attrs[attr]
    switch (attr) {
      case 'text': o.innerHTML = value; break;
      case 'inner': o.appendChild(value); break;
      case 'css': case 'class': o.className = value ; break;
      default: o.setAttribute(attr, value)
    }
  }
  return o;
}
