
import Norma, { StructErr } from '../src/norma'

const I = (x) => console.dir(x, { depth: null })
const S = (t: any, d?: any) => new Norma.Struct(t, d)
const V = Norma.validate
const P = Norma.parse
const VP = (n, s) => { let g: any[] = []; let o = V(n, P(s), g); return { o, g } }


describe('norma', () => {

  test('happy', () => {
    expect(Norma).toBeDefined()
    expect(Norma.validate).toBeDefined()
  })


  test('struct-type', () => {
    expect(S(String).type).toBe('string')
    expect(S(Number).type).toBe('number')
    expect(S(Boolean).type).toBe('boolean')
  })


  test('validate-scalar', () => {

    let log: StructErr[]

    expect(V('a', S(String), log = [])).toBe('a')
    expect(log).toEqual([])

    expect(V(1, S(String), log = [])).toBe(1)
    expect(log).toEqual([{ err: 'not-type', path: '', type: 'string', was: 1 }])

    expect(V(1, S(Number), log = [])).toBe(1)
    expect(log).toEqual([])

    expect(V('a', S(Number), log = [])).toBe('a')
    expect(log).toEqual([{ err: 'not-type', path: '', type: 'number', was: 'a' }])
  })


  test('validate-map', () => {

    let log: StructErr[]

    expect(V({ a: 1, b: 'x' }, S({
      a: S(Number), b: S(String)
    }), log = [])).toEqual({ a: 1, b: 'x' })
    expect(log).toEqual([])

    expect(V({ a: 1, b: 2 }, S({
      a: S(Number), b: S(String)
    }), log = [])).toEqual({ a: 1, b: 2 })
    expect(log).toEqual([{ err: 'not-type', path: 'b', type: 'string', was: 2 }])


    expect(V({ a: 1, b: { c: 'x' } }, S({
      a: S(Number), b: S({ c: S(String) })
    }), log = [])).toEqual({ a: 1, b: { c: 'x' } })
    expect(log).toEqual([])

    expect(V({ a: 1, b: { c: 2 } }, S({
      a: S(Number), b: S({ c: S(String) })
    }), log = [])).toEqual({ a: 1, b: { c: 2 } })
    expect(log).toEqual([{ err: 'not-type', path: 'b.c', type: 'string', was: 2 }])

  })



  test('validate-arr', () => {

    let log: StructErr[]

    expect(V([1, 2], S([S(Number)]), log = [])).toEqual([1, 2])
    expect(log).toEqual([])

    expect(V([1, 'x', 2, 'y'], S([S(Number)]), log = [])).toEqual([1, 'x', 2, 'y'])
    expect(log).toEqual([
      {
        "err": "not-type",
        "path": "[1]",
        "type": "number",
        "was": "x",
      },
      {
        "err": "not-type",
        "path": "[3]",
        "type": "number",
        "was": "y",
      },
    ])
  })


  test('validate-default', () => {

    let log: StructErr[]

    expect(V(undefined, S(String, 'a'), log = [])).toBe('a')
    expect(log).toEqual([])

    expect(V(undefined, S({}, {}), log = [])).toEqual({})
    expect(log).toEqual([])

    expect(V(undefined, S([], []), log = [])).toEqual([])
    expect(log).toEqual([])

    expect(V({}, S({ a: S(Number, 1) }, {}), log = [])).toEqual({ a: 1 })
    expect(log).toEqual([])
  })

  test('parse', () => {
    expect(P({})).toMatchObject({ type: 'map', def: {} })
    expect(P([])).toMatchObject({ type: 'arr', def: [] })
    expect(P('a')).toMatchObject({ type: 'string', def: 'a' })
    expect(P(String)).toMatchObject({ type: 'string', def: undefined })

    expect(P({ a: 1 }))
      .toMatchObject({ type: 'map', map: { a: { type: 'number', def: 1 } } })

    expect(P({ a: 1, b: { c: true } }))
      .toMatchObject({
        type: 'map', map: {
          a: { type: 'number', def: 1 },
          b: {
            type: 'map', def: {}, map: {
              c: { type: 'boolean', def: true }
            }
          }
        }
      })

    expect(P([1]))
      .toMatchObject({ type: 'arr', def: [], arr: [{ type: 'number', def: 1 }] })
  })


  test('parse-validate', () => {
    let log: StructErr[]

    // I(P({ a: 1 }))
    // I(V({}, P({ a: 1 }), log = []))
    // I(log)

    expect(VP({ b: 'x' }, { a: 1, b: String }))
      .toMatchObject({ o: { a: 1, b: 'x' }, g: [] })

    expect(VP({ b: 2 }, { a: 1, b: String }))
      .toMatchObject({
        o: { a: 1, b: 2 }, g: [{
          "err": "not-type",
          "path": "b",
          "type": "string",
          "was": 2,
        }]
      })

    expect(VP(
      { b: { c: [{ x: 1 }, { x: 2 }] } },
      { a: 1, b: { c: [{ x: Number }] } }))
      .toMatchObject({ o: { a: 1, b: { c: [{ x: 1 }, { x: 2 }] } }, g: [] })

  })
})
