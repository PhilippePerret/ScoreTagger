'use strict'
/** ---------------------------------------------------------------------
*   Class SmartDebug
*   ----------------
*   Pour faciliter le débuggage en encombrant un minimum la console.

__start("<message>", "<methode>", params)
    Point de démarrage d'un débuggage

__in("<methode>", params)
    Entrée dans une méthode, en donnant les paramètres +params+

__add("<message>", params)
    Pour ajouter des données en cours de route

__out("<méthode>", params)
    Sortie de la méthode, en conservant les paramètres +params+

__end("<message fin>", params)
    Pour mettre une fin (reset la liste)


__d({<options>})
    Pour sortir un débug à un moment donné

*** --------------------------------------------------------------------- */
function __start(message, methodName, params){
  SmartDebug.start(message, methodName, params)
}
function __in(methodName, params){
  SmartDebug.addEntry(methodName, params)
}
function __add(message, methodName, params){
  methodName = methodName ? ` [in ${methodName}]` : '' ;
  SmartDebug.add('ARGS', `${message}${methodName}`, params)
}
function __out(methodName, params){
  SmartDebug.addExit(methodName, params)
}
function __end(message){
  SmartDebug.end(message)
}
function __d(options){
  SmartDebug.output(options)
}

class SmartDebug {
static start(message, methodName, params){
  this.reset()
  this.add('START', message)
  this.add('IN', methodName, params)
}
static addEntry(mname, params){
  this.add('IN', mname, params)
}
static addExit(mname, params){
  this.add('OUT', mname, params)
}
// Ne sert à rien pour le moment
static end(message, params){
  this.add('END', message, params)
  this.reset()
}
/**
* Méthode principale pour sortir le débuggage
***/
static output(options = {}){
  // console.clear()
  this.items.forEach(lined => {
    if ( lined.type == 'OUT' && options.no_out ) return ;
    if ( lined.type == 'IN'  && options.no_in  ) return ;
    var m = []
    if ( lined.type == 'IN') m.push(' -i->')
    else if ( lined.type == 'OUT') m.push('<-o- ')
    else if ( lined.type == 'ARGS') m.push(' -=-')
    m.push(lined.content)
    m = m.join(' ')
    console.debug(m)
    if ( false == (lined.no_args === true || undefined === lined.params) ) {
      console.debug(lined.params)
    }
  })
}


/** ---------------------------------------------------------------------
*   PRIVATE METHODS
*
*** --------------------------------------------------------------------- */

static add(type, mname, params){
  if ( undefined === this.items ) { this.items = [] }
  this.items.push({type:type, content: mname, params: params})
}

static reset(){
  this.items = []
}

}// class SmartDebug
