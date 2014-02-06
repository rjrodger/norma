
{
  var slotstack = []
}
start
  = slot+ { return slotstack }


slot
  = t:type m:mod { slotstack.push({type:t,mod:m}) }
  / t:type { slotstack.push({type:t}) }


mod
  = '?' {return '?' }

type
  = string  { return 's' }
  / integer { return 'i' }

string
  = 's'

integer
  = 'i'

