'use strict';
/** ---------------------------------------------------------------------
*   CONSTANTS POUR LES AOBJETS
*
*** --------------------------------------------------------------------- */

/**
* Données de tous les boutons
*
* Pour savoir comment est constitué cette donnée, cf. AOBJETS_TOOLBOX_BUTTONS
* en annexe du manuel développeur.
***/
const AOBJETS_TOOLBOX_OTYPE_BUTTONS = {
  id: 'otype'
, order: ['chord','harmony','modulation','cadence','segment','pedale']
, selected: 'chord'
, items: {
      /* note : mettre dans l'ordre des lignes, de haut en bas */
      'segment':    {id:'segment',    text: 'Segment',    visible:['segment']}
    , 'modulation': {id:'modulation', text: 'Modulation', visible:['chord',['alteration', null, 'n'],['harmony',['I','II','III','IV','V','VI','VII','0'],'0'],['nature',['Maj','min'],'Maj']]}
    , 'chord':      {id: 'chord',     text: 'Accord',     visible:['chord','alteration','nature']}
    , 'harmony':    {id:'harmony',    text: 'Harmonie',   visible:[ ['alteration', ['n','d','b'], 'n'], 'harmony',['nature',['Maj','min'],'Maj'],'renv']}
    , 'cadence':    {id:'cadence',    text: 'Cadence',    visible:['cadence']}
    , 'pedale':     {id:'pedale',     text: 'Pédale',     visible:['degre','alteration']}
  }
}
const AOBJETS_TOOLBOX_BUTTONS_GROUPS = {
  'note': {
      id:'note'
    , order: ['c','d','e','f','g','a','b', '0']
    , selected: 'c'
    , items: {
        'c': {id:'c', text:'do'}
      , 'd': {id:'d', text:'ré'}
      , 'e': {id:'e', text:'mi'}
      , 'f': {id:'f', text:'fa'}
      , 'g': {id:'g', text:'sol'}
      , 'a': {id:'a', text:'la'}
      , 'b': {id:'b', text:'si'}
      , '0': {id:'0', text:'&nbsp;', value:''}
    }//items
  }
  , 'degre': {
      id:'degre'
    , order: ['1','2','3','4','5','6','7', '0']
    , selected: '1'
    , items: {
        '1': {id:'1', text:'1'}
      , '2': {id:'2', text:'2'}
      , '3': {id:'3', text:'3'}
      , '4': {id:'4', text:'4'}
      , '5': {id:'5', text:'5'}
      , '6': {id:'6', text:'6'}
      , '7': {id:'7', text:'7'}
      , '0': {id:'0', text:'&nbsp;', value:''}
    }//items
  }// type 'degre'
  , 'chord':{
      id: 'chord'
    , order: ['C','D','E','F','G','A','B','0']
    , selected: 'C'
    , items:{
        'C': {id:'C', img:'chord/C'}
      , 'D': {id:'D', img:'chord/D'}
      , 'E': {id:'E', img:'chord/E'}
      , 'F': {id:'F', img:'chord/F'}
      , 'G': {id:'G', img:'chord/G'}
      , 'A': {id:'A', img:'chord/A'}
      , 'B': {id:'B', img:'chord/B'}
      , '0': {id:'0', text:'&nbsp;'}
    }// /items
  }// type 'chord'
  , 'alteration':{
      id: 'alteration'
    , order: ['n','d','b','x','t']
    , selected: 'n'
    , items: {
        'n': {id:'n', text:'♮', value:''}
      , 'd': {id:'d', img:"alteration/diese", alt:'♯' /* alt = juste pour garder le signe */}
      , 'b': {id:'b', img:"alteration/bemol", alt:'♭' /* idem */}
      , 'x': {id:'x', img:"alteration/dbl-dieses"}
      , 't': {id:'t', img:"alteration/dbl-bemols"}
    } // items
  }// type 'alterations'
  , 'harmony':{
      id: 'harmony'
    , order: ['I','VII','V','VdV','II','II-av','II-ap','IV','IV-av','IV-ap','VI','I64','Rel','VII-av','VII-ap','I-av','I-ap','V-av','V-ap','VI-av','VI-ap','III', 'III-av','III-ap','0']
    , selected: 'I'
    , items:{
        '0':      {id:'0',      text:'&nbsp;',        value:'', default:{nature:'Maj'}}
      , 'I':      {id:'I',      img:'harmony/I',      default:{nature:'Maj'}}
      , 'I-av':   {id:'I-av',   img:'harmony/I-av',   default:{nature:'Maj'}}
      , 'I-ap':   {id:'I-ap',   img:'harmony/I-ap',   default:{nature:'Maj'}}
      , 'I64':    {id:'I64',    img:'harmony/I-quarte-et-sixte', default:{nature:'Maj'}}
      , 'II':     {id:'II',     img:'harmony/II',     default:{nature:'m7'}}
      , 'II-av':  {id:'II-av',  img:'harmony/II-av',  default:{nature:'m7'}}
      , 'II-ap':  {id:'II-ap',  img:'harmony/II-ap',  default:{nature:'m7'}}
      , 'III':    {id:'III',    img:'harmony/III'}
      , 'III-av': {id:'III-av', img:'harmony/III-av'}
      , 'III-ap': {id:'III-ap', img:'harmony/III-ap'}
      , 'IV':     {id:'IV',     img:'harmony/IV',     default:{nature:'Maj'}}
      , 'IV-av':  {id:'IV-av',  img:'harmony/IV-av',  default:{nature:'Maj'}}
      , 'IV-ap':  {id:'IV-ap',  img:'harmony/IV-ap',  default:{nature:'Maj'}}
      , 'V':      {id:'V',      img:'harmony/V',      default:{nature:'7'}}
      , 'V-av':   {id:'V-av',   img:'harmony/V-av',   default:{nature:'7'}}
      , 'V-ap':   {id:'V-ap',   img:'harmony/V-ap',   default:{nature:'7'}}
      , 'VI':     {id:'VI',     img:'harmony/VI',     default:{nature:'min'}}
      , 'VI-av':  {id:'VI-av',  img:'harmony/VI-av',  default:{nature:'min'}}
      , 'VI-ap':  {id:'VI-ap',  img:'harmony/VI-ap',  default:{nature:'min'}}
      , 'VII':    {id:'VII',    img:'harmony/VII',    default:{nature:'7dim'}}
      , 'VII-av': {id:'VII-av', img:'harmony/VII-av', default:{nature:'7dim'}}
      , 'VII-ap': {id:'VII-ap', img:'harmony/VII-ap', default:{nature:'7dim'}}
      //
      , 'VdV':    {id:'VdV',    img:'harmony/VdeV',   default:{nature:'7'}}
      , 'Rel':    {id:'Rel',    img:'harmony/Rel'}
    }// /items
  }// type 'harmony'
  , 'nature':{
      id:'nature'
    , order: ['Maj','min', 'm7','7','7dim','5dim', '6aug','6nap']
    , selected: 'Maj'
    , items: {
        'Maj':  {id:'Maj',    img:'chiffrage/Major'}
      , 'min':  {id:'min',    img:'chiffrage/minor'}
      , 'm7':   {id:'m7',     img:'chiffrage/m7'}
      , '7':    {id:'7',      img:'chiffrage/7tieme'}
      , '7dim': {id:'7dim',   img:'chiffrage/7dim'}
      , '5dim': {id:'5dim',   img:'chiffrage/5dim'}
      , '6aug': {id:'6aug',   img:'chiffrage/6aug'}
      , '6nap': {id:'6nap',   img:'chiffrage/6nap'}
    }// /items
  }// type 'nature'
  , 'renv':{ // renversements
      id:'renv'
    , order: ['0','1','2','3','4']
    , selected: '0'
    , items: {
        '0': {id:'0', text: '&nbsp;'}
      , '1': {id:'1', img: 'chiffrage/3-bass'}
      , '2': {id:'2', img: 'chiffrage/5-bass'}
      , '3': {id:'3', img: 'chiffrage/7-bass'}
      , '4': {id:'4', img: 'chiffrage/9-bass'}
    } // /items
  }// type 'renv'
  , 'cadence':{
      id:'cadence'
    , order: ['CP','CI','DC','CR','PG','CB','CF','TP']
    , selected: 'CP'
    , items:{
          'CP': {id:'CP', img:'cadence/Cad-parfaite'}
        , 'CI': {id:'CI', img:'cadence/Cad-imparfaite'}
        , 'DC': {id:'DC', img:'cadence/Cad-demi'}
        , 'CR': {id:'CR', img:'cadence/Cad-rompue'}
        , 'PG': {id:'PG', img:'cadence/Cad-plagale'}
        , 'CB': {id:'CB', img:'cadence/Cad-baroque'}
        , 'CF': {id:'CF', img:'cadence/Cad-faureenne'}
        , 'TP': {id:'TP', img:'cadence/Cad-picarde'}
    }// /items
  }// type 'cadence'
  , 'segment':{
      id: 'segment'
    , order: ['up','down']
    , selected: 'up'
    , items: {
        'up':   {id:'up',   text:'⎴'}
      , 'down': {id:'down', text:'⎵'}
    } // /items
  }// type 'segment'
}

const LINES_POSE = Object.keys(AOBJETS_TOOLBOX_OTYPE_BUTTONS.items).reverse()
