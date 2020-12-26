'use strict'
/** ---------------------------------------------------------------------
*   Class SmartDebug
*   ----------------
*   Pour faciliter le débuggage en encombrant un minimum la console.
    version 0.2.0

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
    Si pms contient {output: true}, on écrit la trace


__d({<options>})
    Pour sortir un débug à un moment donné

ASync_out("<method name>", {<params>})
    Méthode un peu spéciale à utiliser dans une succession de .then pour
    marquer la fin d'une méthode

# 0.2.0
  Ajout de la méthode pratique 'runSegment'

# 0.1.6
  On tient compte du fait que les méthodes __start et __end peuvent ne pas
  définir le nom de la méthode en second paramètre, mais directement la table
  d'options.

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

/**
* Méthode pour protéger un segment dans un try… catch
***/
window.runSegment = function runSegment(operation, methodName, method, output){
  try {
    __start(`Début de ${operation}`, methodName)
    __in(methodName)
    return method.call(null)
  } catch (e) {
    console.error(e)
    erreur("Une erreur est survenue, consultez la console.")
  } finally {
    __out(methodName)
    __end(`Fin de ${operation}`, methodName, {output:output})
  }
}


function __add(msg, nmeth, pms){
  nmeth = nmeth ? ` [in ${nmeth}]` : '' ;
  SmartDebug.add('ARGS', `${msg}${nmeth}`, pms)
}

window.ASync_out = (mth, pms) => { return window.__out.bind(window, mth, pms) }


class SmartDebug {
static start(msg, nmeth, pms){
  if ( 'object' == typeof(nmeth)) {
    pms   = nmeth
    nmeth = null
  }
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
static end(msg, nmeth, pms = {}){
  if ( 'object' == typeof(nmeth)) {
    pms   = nmeth
    nmeth = null
  }
  nmeth && this.add('OUT', nmeth, pms)
  this.add('END', msg, pms)
}
/**
* Méthode principale pour sortir le débuggage
***/
static output(options){
  // console.clear()
  options = options || {}
  this.items.forEach(lined => {
    const TypeIN  = lined.type == 'IN'
    const TypeOUT = lined.type == 'OUT'
    if ( TypeOUT && options.no_out ) return ;
    if ( TypeIN  && options.no_in  ) return ;
    if ( lined.pms && lined.pms.skip && !options.force ) return ;
    var m = []
    if ( TypeIN) m.push('o->')
    else if ( TypeOUT) m.push('<-o')
    else if ( lined.type == 'ARGS') m.push('=-')
    m.push(lined.content)
    m = m.join(' ')

    const ShowParams = false == (lined.no_args === true || null === lined.pms)

    // --- Écriture ---
    TypeIN && console.group()
    ShowParams && TypeOUT && console.debug(lined.pms)
    console.debug(m)
    ShowParams && TypeIN && console.debug(lined.pms)
    TypeOUT && console.groupEnd()
    // --- /fin écriture
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

/**
* Pour finir une chaine de .then en affichant le segment :
* methode()
*   .then(method)
*   .then(method)
*   .then(output)
*   .catch(onError)
***/
window.output = SmartDebug.output.bind(SmartDebug)
