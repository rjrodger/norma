/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var util = require('util')

var _ = require('underscore')


var parser = require('./norma-parser')

var defopts = {
  onfail:'throw'
}

var specmap = {}


function norma( spec, options, rawargs ) {
  if( _.isArguments(options) || _.isArray(options ) ) {
    rawargs = options
    options = null
  }
  options = null == options ? defopts : _.extend({},defopts,options)


  var specdef = specmap[spec]

  if( null == specdef ) {
    try {
      var respec = parser.parse( spec )
    }
    catch(e) {
      throw new Error('norma: '+e.message+'; spec:"'+spec+'", col:'+e.column+', line:'+e.line)
    }

    var reindex = []
    var index   = 1
    var restr = ['^']
    var i = 0
    respec.forEach(function(entry){
      restr.push('(')

      if( entry.type.or && 0 < entry.type.or.length ) {
        var count = 1

        restr.push('(')
        restr.push(entry.type.mark)
        restr.push(')')

        entry.type.or.forEach(function(or){
          restr.push('|')
          restr.push('(')
          restr.push(or[1])
          count++
          restr.push(')')
        })

        reindex[i]={index:index}
        index += count
      }

      else {
        restr.push(entry.type.mark)
        reindex[i]={index:index}
      }

      restr.push(entry.mod || '')
      reindex[i].mod = entry.mod
      restr.push(')')
      index++
      i++
    })
    restr.push('$')

    var re = new RegExp(restr.join(''))
    specdef = specmap[spec] = {re:re,respec:respec,reindex:reindex}
  }

  
  if( null == rawargs ) {
    return function(rawargs){
      return processargs(rawargs)
    }
  }
  else return processargs(rawargs)

  function processargs( rawargs ) {
    var args = Array.prototype.slice.call(rawargs||[])
    var argdesc = describe( args )

    var outslots = specdef.re.exec(argdesc)
    if( !outslots ) {
      if( 'throw' == options.onfail ) {
        throw new Error('norma: invalid arguments; expected: "'+spec+'", was: "'+argdesc+'"; values:'+args)
      }
      else return null;
    }

    var out = specdef.respec.object ? {} : []
    var offset = 0
    for(var i = 0, j = 0, k = 0; i < specdef.reindex.length; i++ ) {
      var indexspec = specdef.reindex[i]
      var val = void 0

      if( !specdef.respec.object ) {
        out[k] = val
      }
      
      if( null != indexspec.index) {
        var m = outslots[indexspec.index]
        var found = '' != m
        if( found ) {
          var iname = specdef.respec[i].name
          var istar = '*' === specdef.respec[i].mod

          if( 1 == m.length ) {
            val = args[j]
            j++

            if( !specdef.respec.object ) {
              out[k] = val
            }

            if( null != iname ) {
              if( istar ) {
                (out[iname] = (out[iname] || [])).push(val)
              }
              else {
                out[specdef.respec[i].name] = val
              }
            }

            k++
          }
          else if( 1 < m.length ) {
            for( var mI = 0; mI < m.length; mI++ ) {
              val = args[j]
              j++

              if( !specdef.respec.object ) {
                out[k] = val
              }

              if( null != iname ) {
                (out[iname] = (out[iname] || [])).push(val)
              }

              k++
            }
          }
        }
        else {
          if( !specdef.respec.object ) {
            out[k] = void 0
          }
          k++
        }
      }
    }

    return out;
  }
}



function describe(args) {
  var desc = []

  args.forEach(function(arg){
    if( _.isString(arg) ) {
      desc.push('s')
    }
    // integer
    else if( (!isNaN(arg) && ((arg | 0) === parseFloat(arg))) ) {
      desc.push('i')
    }
    else if( _.isNaN(arg) ) {
      desc.push('A')
    }
    else if( Infinity === arg ) {
      desc.push('Y')
    }
    else if( _.isNumber(arg) ) {
      desc.push('n')
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
    else if( _.isRegExp(arg) ) {
      desc.push('r')
    }
    else if( _.isDate(arg) ) {
      desc.push('d')
    }
    else if( _.isArguments(arg) ) {
      desc.push('g')
    }
    else if( util.isError(arg) ) {
      desc.push('e')
    }
    else if( _.isNull(arg) ) {
      desc.push('N')
    }
    else if( _.isUndefined(arg) ) {
      desc.push('U')
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

