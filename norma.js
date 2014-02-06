/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var parser = require('./norma-parser')

function norma( spec, rawargs ) {
  var args = Array.prototype.slice.call(rawargs||[])

  var respec = parser.parse( spec )
  console.dir(respec)

  var restr = ['^']
  respec.forEach(function(entry){
    restr.push('(')
    restr.push(entry.type)
    restr.push(entry.mod || '')
    restr.push(')')
  })
  restr.push('$')

  return restr.join('')
}


module.exports = norma




console.dir( norma( 'si' ) )
console.dir( norma( 'si?' ) )
console.dir( norma( 's?i' ) )
