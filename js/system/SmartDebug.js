'use strict'
/** ---------------------------------------------------------------------
*   Class SmartDebug
*   ----------------
*   Pour faciliter le débuggage en encombrant un minimum la console.
version 0.1.4

__start("<msg>", "<methode>", pms)
    Point de démarrage d'un débuggage

__in("<methode>", pms)
    Entrée dans une méthode, en donnant les paramètres +pms+

__add("<msg>", pms)
    Pour ajouter des données en cours de route

__out("<méthode>", pms)
    Sortie de la méthode, en conservant les paramètres +pms+

__end("<msg fin>", "<methode name>", pms)
    Pour mettre une fin (reset la liste)


__d({<options>})
    Pour sortir un débug à un moment donné

ASync_out("<method name>", {<params>})
    Méthode un peu spéciale à utiliser dans une succession de .then pour
    marquer la fin d'une méthode

# 0.1.5
  Ajout de la méthode asynchrone ASync_out

# 0.1.4
  Ajout du paramètres :skip qui, s'il est à true, permet de "zapper" la ligne
  au rapport, mais l'enregistre quand même pour pouvoir l'afficher avec
  SmartDebug.output(/ * force = * / true )

# 0.1.3
  Paramètres :output pour provoquer une sortie de la trace dans les méthodes
  __in, __out et __end
  Paramètres :reset dans les méthodes __in, __out et __end pour réinitialiser
  la trace à partir d'un moment voulu.

# 0.1.2
  Possibilité de déclencher la sortie depuis les paramètres de __end
  (output: true)

# 0.1.1
  Première version


*** --------------------------------------------------------------------- */

function __add(msg, nmeth, pms){
  nmeth = nmeth ? ` [in ${nmeth}]` : '' ;
  SmartDebug.add('ARGS', `${msg}${nmeth}`, pms)
}

window.ASync_out = (mth, pms) => { return window.__out.bind(window, mth, pms) }


class SmartDebug {
static start(msg, nmeth, pms){
  this.reset()
  this.add('START', msg)
  nmeth && this.add('IN', nmeth, pms)
}
static addEntry(mname, pms){
  this.add('IN', mname, pms)
}
static addExit(mname, pms){
  this.add('OUT', mname, pms)
}
// Ne sert à rien pour le moment
static end(msg, nmeth, pms = {}){
  msg = msg || ""
  nmeth && (msg = `${msg} [in ${nmeth}]`.trim())
  this.add('END', msg, pms)
}
/**
* Méthode principale pour sortir le débuggage
***/
static output(options){
  // console.clear()
  options = options || {}
  this.items.forEach(lined => {
    if ( lined.type == 'OUT' && options.no_out ) return ;
    if ( lined.type == 'IN'  && options.no_in  ) return ;
    if ( lined.skip && !options.force ) return ;
    var m = []
    if ( lined.type == 'IN') m.push(' -i->')
    else if ( lined.type == 'OUT') m.push('<-o- ')
    else if ( lined.type == 'ARGS') m.push(' -=-')
    m.push(lined.content)
    m = m.join(' ')

    // --- Écritude ---
    if ( lined.type == 'IN' ) console.group()
    console.debug(m)
    if ( false == (lined.no_args === true || null === lined.pms) ) {
      console.debug(lined.pms)
    }
    if ( lined.type == 'OUT') console.groupEnd()
  })
  // console.trace()
}


/** ---------------------------------------------------------------------
*   PRIVATE METHODS
*
*** --------------------------------------------------------------------- */

static add(type, mname, pms){
  const [output, reset, fpms] = this.studyParams(pms)
  if ( undefined === this.items) { this.items = [] }
  this.items.push({type:type, content: mname, pms: fpms})
  output  && this.output(fpms)
  reset   && this.reset()
}

static reset(){
  this.items = []
}


static studyParams(pms){
  if ( !pms ) return [false, false, null]
  const reset   = pms.reset === true
  const output  = pms.output === true
  delete pms.reset
  delete pms.output
  Object.keys(pms).length || (pms = null)
  return [output, reset, pms]
}

}// class SmartDebug

window.__start  = SmartDebug.start.bind(SmartDebug)
window.__end    = SmartDebug.end.bind(SmartDebug)
window.__in     = SmartDebug.addEntry.bind(SmartDebug)
window.__out    = SmartDebug.addExit.bind(SmartDebug)
window.__d      = SmartDebug.output.bind(SmartDebug)
