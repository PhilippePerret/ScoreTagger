'use strict';
/** ---------------------------------------------------------------------
*   CONSTANTS POUR LES AOBJETS
*
*** --------------------------------------------------------------------- */

/**
* Données de tous les boutons
***/
const AOBJETS_TOOLBOX_BUTTONS = {
  'otype': {
    id: 'otype'
  , order: ['chord','harmony','modulation','cadence','segment','pedale']
  , selected: 'chord'
  , items: {
        'chord':      {id: 'chord',     text: 'Accord'}
      , 'harmony':    {id:'harmony',    text: 'Harmonie'}
      , 'modulation': {id:'modulation', text: 'Modulation'}
      , 'cadence':    {id:'cadence',    text: 'Cadence'}
      , 'segment':    {id:'segment',    text: 'Segment'}
      , 'pedale':     {id:'pedale',     text: 'Pédale'}
    }
  }
  , 'note': {
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
  }// type 'note'
  , 'alteration':{
      id: 'alteration'
    , order: ['n','d','b']
    , selected: 'n'
    , items: {
        'n': {id:'n', text:'♮', value:''}
      , 'd': {id:'d', text:'♯'}
      , 'b': {id:'b', text:'♭'}
    } // items
  }// type 'alterations'
  , 'harmony':{
      id: 'harmony'
    , order: ['I','VII','V','VdV','II','II-av','II-ap','IV','IV-av','IV-ap','VI','Rel','VII-av','VII-ap','I-av','I-ap','V-av','V-ap','VI-av','VI-ap','III', 'III-av','III-ap','0']
    , selected: 'I'
    , items:{
        '0':      {id:'none',   text:'&nbsp;'}
      , 'I':      {id:'I',      img:'harmony/I'}
      , 'I-av':   {id:'I-av',   img:'harmony/I-av'}
      , 'I-ap':   {id:'I-ap',   img:'harmony/I-ap'}
      , 'II':     {id:'II',     img:'harmony/II'}
      , 'II-av':  {id:'II-av',  img:'harmony/II-av'}
      , 'II-ap':  {id:'II-ap',  img:'harmony/II-ap'}
      , 'III':    {id:'III',    img:'harmony/III'}
      , 'III-av': {id:'III-av', img:'harmony/III-av'}
      , 'III-ap': {id:'III-ap', img:'harmony/III-ap'}
      , 'IV':     {id:'IV',     img:'harmony/IV'}
      , 'IV-av':  {id:'IV-av',  img:'harmony/IV-av'}
      , 'IV-ap':  {id:'IV-ap',  img:'harmony/IV-ap'}
      , 'V':      {id:'V',      img:'harmony/V'}
      , 'V-av':   {id:'V-av',   img:'harmony/V-av'}
      , 'V-ap':   {id:'V-ap',   img:'harmony/V-ap'}
      , 'VI':     {id:'VI',     img:'harmony/VI'}
      , 'VI-av':  {id:'VI-av',  img:'harmony/VI-av'}
      , 'VI-ap':  {id:'VI-ap',  img:'harmony/VI-ap'}
      , 'VII':    {id:'VII',    img:'harmony/VII'}
      , 'VII-av': {id:'VII-av', img:'harmony/VII-av'}
      , 'VII-ap': {id:'VII-ap', img:'harmony/VII-ap'}
      //
      , 'VdV':    {id:'VdV',    img:'harmony/VdeV'}
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
      , '6nap': {id:'6nap',   img:'harmony/II-6nap'}
    }// /items
  }// type 'nature'
  , 'renversement':{
      id:'renversement'
    , order: ['0','1','2','3','4']
    , selected: '0'
    , items: {
        '0': {id:'0', text: '&nbsp;'}
      , '1': {id:'1', img: 'chiffrage/3-bass'}
      , '2': {id:'2', img: 'chiffrage/5-bass'}
      , '3': {id:'3', img: 'chiffrage/7-bass'}
      , '4': {id:'4', img: 'chiffrage/9-bass'}
    } // /items
  }// type 'renversement'
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
