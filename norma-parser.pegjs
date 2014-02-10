
{
  var slotstack = []
}
start
  = ws? forceobj:'{'? ws? slot (sep? slot)* sep? '}'? ws? { 
    slotstack.object = !!forceobj
    return slotstack 
  }

ws
  = [ \t\r\n]

sep
  = ws? ','? ws?

slot
  = n:name? t:type m:mod? { slotstack.push({name:n, type:t, mod:m}) }


name
 = h:[a-zA-Z] t:[a-zA-Z0-9]* ':' { return h+t.join('') } 

mod
  = '?' {return '?' }

type
  = t:(typeatom ('|' typeatom)*) { return {mark:t[0],or:t[1]} }

typeatom
  = string    { return 's' }
  / integer   { return 'i' }
  / number    { return 'n' }
  / boolean   { return 'b' }
  / function  { return 'f' }
  / array     { return 'a' }
  / regexp    { return 'r' }
  / date      { return 'd' }
  / object    { return 'o' }
  / badtype   

string
  = 's'

integer
  = 'i'

number
  = 'n'

boolean
  = 'b'

function
  = 'f'

array
  = 'a'

regexp
  = 'r'

object
  = 'o'

date
  = 'd'

badtype
  = t:[^}] { error('not a type character: "'+t+'"') }

/*
arguments
  = 'r'

error
  = 'e'


null
  = 'N'

undefined
  = 'U'

nan
  = 'A'

*/
