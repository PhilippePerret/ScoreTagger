'use strict';

class ChordObject extends AObjects {
constructor(data) {
  super(data)
}

get mark(){return this._mark || (this._mark = this.buildMark())}



buildMark(){
  var m = this.data.note.toUpperCase()
  if ( this.data.alteration != '♮') { m += this.data.alteration }
  if ( this.data.nature != 'Maj') { m += ` ${this.data.nature}`}
  return m
}

}
