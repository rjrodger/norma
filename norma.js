/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";

var _ = require('underscore')

var parser = require('./norma-parser')

function norma( spec, rawargs ) {
  var args = Array.prototype.slice.call(rawargs||[])

  var respec = parser.parse( spec )
  
  var reindex = []
  var index   = 1
  var restr = ['^']
  var i = 0
  respec.forEach(function(entry){
    restr.push('(')

    if( entry.type.or ) {
      index++

      restr.push('(')
      restr.push(entry.type.mark)
      reindex[i]=index++
      restr.push(')')

      entry.type.or.forEach(function(or){
        restr.push('|')
        restr.push('(')
        restr.push(or[1])
        reindex[i]=index++
        restr.push(')')
      })
    }
    else {
      restr.push(entry.type.mark)
      reindex[i]=index++
    }
    restr.push(entry.mod || '')
    restr.push(')')
    i++
  })
  restr.push('$')

  //console.log(restr.join(''))

  var re = new RegExp(restr.join(''))
  var argdesc = describe( args )

  var outslots = re.exec(argdesc)
  if( !outslots ) return null;

  var out = respec.object ? {} : []
  for(var i = 0, j = 0; i < reindex.length; i++ ) {
    var k = reindex[i]
    var val = '' == outslots[k] ? void 0 : args[j]
    if( !respec.object ) {
      out[i] = val
    }
    if( null != val ) {
      if( null != respec[i].name ) {
        out[respec[i].name] = val
      }
      j++
    }
  }

  return out;
}



function describe(args) {
  var desc = []

  args.forEach(function(arg){
    if( _.isString(arg) ) {
      desc.push('s')
    }
    else if( _.isNumber(arg) ) {
      desc.push('i')
    }
    else if( _.isBoolean(arg) ) {
      desc.push('b')
    }
    else if( _.isFunction(arg) ) {
      desc.push('f')
    }
    else if( _.isArray(arg) ) {
      desc.push('a')
    }
    else if( _.isObject(arg) ) {
      desc.push('o')
    }
    else {
      desc.push('q')
    }
  })

  return desc.join('')
}



module.exports = norma




console.dir( norma( 'si', ["a",1] ))
console.dir( norma( 'si?', ["a"] ))
console.dir( norma( 's?i', [1] ))
console.dir( norma( 's i', ["a",1] ))
console.dir( norma( 's i?', ["a"] ))
console.dir( norma( 's? i', [1] ))
console.dir( norma( 'foo:s bar:i', ["b",2] ))
console.dir( norma( '{foo:s bar:i}', ["b",2] ))
console.dir( norma( 's|i b', ["c",true] ))
console.dir( norma( 's|i b', [3,false] ))
console.dir( norma( 's|i|b', ['d'] ))
console.dir( norma( 's|i|b', [4] ))
console.dir( norma( 's|i|b', [true] ))
console.dir( norma( 's,i', ["a",1] ))
console.dir( norma( 's, i', ["a",1] ))
console.dir( norma( 's ,i', ["a",1] ))
console.dir( norma( 's , i', ["a",1] ))
console.dir( norma( ' s , i', ["a",1] ))
console.dir( norma( ' s , i ', ["a",1] ))
