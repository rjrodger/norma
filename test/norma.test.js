/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


// mocha norma.test.js

var util   = require('util')
var assert = require('assert')

var _     = require('underscore')
var norma = require('..')



describe('norma', function(){

  it('happy', function(){
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( 'si', ["a",1] )))
    assert.equal( "[ 'a', undefined ]", util.inspect( norma( 'si?', ["a"] )))
    assert.equal( "[ undefined, 1 ]", util.inspect( norma( 's?i', [1] )))
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( 's i', ["a",1] )))
    assert.equal( "[ 'a', undefined ]", util.inspect( norma( 's i?', ["a"] )))
    assert.equal( "[ undefined, 1 ]", util.inspect( norma( 's? i', [1] )))
    assert.equal( "[ 1.1 ]", util.inspect( norma( 'n', [1.1] )))
    assert.equal( "[ 'b', 2, foo: 'b', bar: 2 ]", util.inspect( norma( 'foo:s bar:i', ["b",2] )))
    assert.equal( "{ foo: 'b', bar: 2 }", util.inspect( norma( '{foo:s bar:i}', ["b",2] )))
  })


  it('no-match', function(){
    try {
      util.inspect( norma( 'i', [1.1] ))
      assert.fail();
    }
    catch(e){ assert.ok(e.message.indexOf('invalid')) }

    assert.equal( "null", util.inspect( norma( 'i', {onfail:'null'}, [1.1] )))
  })


  it('bad-parse', function(){
    try { norma( 'q' ) } catch(e) { assert.equal('norma: not a type character: "q"; spec:"q", col:1, line:1',e.message) }
  })


  it('alternates', function(){
    assert.equal( "[ 'c', true ]", util.inspect( norma( 's|i b', ["c",true] )))
    assert.equal( "[ 3, false ]", util.inspect( norma( 's|i b', [3,false] )))
    assert.equal( "[ 'd' ]", util.inspect( norma( 's|i|b', ['d'] )))
    assert.equal( "[ 4 ]", util.inspect( norma( 's|i|b', [4] )))
    assert.equal( "[ true ]", util.inspect( norma( 's|i|b', [true] )))
  })


  it('commas', function(){
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( 's,i', ["a",1] )))
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( 's, i', ["a",1] )))
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( 's ,i', ["a",1] )))
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( 's , i', ["a",1] )))
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( ' s , i', ["a",1] )))
    assert.equal( "[ 'a', 1 ]", util.inspect( norma( ' s , i ', ["a",1] )))
  })


  it('misc-objects', function(){
    assert.equal( "[ /a/ ]", util.inspect( norma( 'r', [/a/] )))
    assert.equal( "[ 1, /a/ ]", util.inspect( norma( 'ir', [1,/a/] )))
    assert.equal( "[ Mon Feb 10 2014 23:29:53 GMT+0000 (GMT) ]", util.inspect( norma( 'd', [new Date("2014-02-10T23:29:53.281Z")] )))
    assert.equal( "[ Mon Feb 10 2014 23:29:53 GMT+0000 (GMT), 9.9 ]", util.inspect( norma( 'dn', [new Date("2014-02-10T23:29:53.281Z"),9.9] )))

    function test_args(){
      assert.equal( "[ { '0': 999 } ]", util.inspect( norma( 'g', [arguments] )))
    }
    test_args(999)

    assert.equal( "[ null ]", util.inspect( norma( 'N', [null] )))
    assert.equal( "[ undefined ]", util.inspect( norma( 'U', [void 0] )))

    assert.equal( "[ NaN ]", util.inspect( norma( 'A', [NaN] )))
    assert.equal( "[ Infinity ]", util.inspect( norma( 'Y', [Infinity] )))


    assert.equal( "[ [Error: a] ]", util.inspect( norma( 'e', [new Error('a')] )))
    assert.equal( "[ [TypeError: b] ]", util.inspect( norma( 'e', [new TypeError('b')] )))

  })


  it('curry', function(){
    var n1 = norma('s')
    assert.equal( "[ 'foo' ]", util.inspect( n1( ['foo'] )))
    assert.equal( "[ 'bar' ]", util.inspect( n1( ['bar'] )))
  })


  it('dot', function(){
    assert.equal( "[ 'foo' ]", util.inspect( norma( '.', ['foo'] )))
    assert.equal( "[ 1 ]", util.inspect( norma( '.', [1] )))
    assert.equal( "[ true, 1, 'a' ]", util.inspect( norma( 'b.s', [true,1,'a'] )))
  })


  it('star', function(){
    assert.equal( "[ 'a' ]", util.inspect( norma( 's*', ['a'] )))
    assert.equal( "[ 'a', 'a' ]", util.inspect( norma( 's*', ['a','a'] )))
    assert.equal( "[ 'a', 1, 2, 3 ]", util.inspect( norma( 'si*', ['a',1,2,3] )))
    assert.equal( "[ 'a', 1, 2, 3, true ]", util.inspect( norma( 's.*b', ['a',1,2,3,true] )))
  })

})
