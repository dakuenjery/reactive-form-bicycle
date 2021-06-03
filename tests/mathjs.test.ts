import { create, all } from 'mathjs'
import round from 'lodash/round'

test('simple expression', () => {
  const m = create(all)

  const value = m.evaluate!('a + b^c', { a: 100, b: 3, c: 2 })
  expect(value).toBe(109)
})

test('tree expression', () => {
  const m = create(all)
  const node = m.parse!('a + b^c')

  const nodeNames = node.filter(x => x.isSymbolNode)
    .map(x => x.name)

  expect(nodeNames).toEqual(['a', 'b', 'c'])

  const f = node.compile()

  const value = f.evaluate({ a: 100, b: 3, c: 2 })
  expect(value).toEqual(109)
})

test('tree expression 2', () => {
  const m = create(all)
  const node = m.parse!('a + b^c - 19')

  const nodeNames = node.filter(x => x.isSymbolNode)
    .map(x => x.name)

  expect(nodeNames).toEqual(['a', 'b', 'c'])

  const f = node.compile()

  const value = f.evaluate({ a: 100, b: 3, c: 2 })
  expect(value).toEqual(90)
})

test('tree expression 3', () => {
  const m = create(all)
  const node = m.parse!(`
    v1 = $a + $b
    v2 = v1*$c
  `)

  const nodeNames = node
    .filter(x => x.isSymbolNode && x.name?.startsWith('$'))
    .map(x => x.name)

  expect(nodeNames).toEqual(['$a', '$b', '$c'])

  const f = node.compile()

  const value = f.evaluate({ $a: 2, $b: 3, $c: 4 })
  expect(value.entries[1]).toEqual(20)
})

describe('roundAs', () => {
  const m = create(all)

  m.import!({
    roundAs(value: number, step: number): number {
      const d = 1 / step
      const precision = m.log10!(d)
      const n = m.floor!(precision)

      return m.round!(value, n)

      // if (precision === n) {
      //   return m.round!(value, n)
      // } else {
      //   const p = d / Math.pow(10, n)
      //   const nn = m.ceil!(precision)
      //   const v = m.round!(value * p, nn) / p
      //   const vv = m.round!(v, n)
      //   return vv
      // }
    }
  }, {})

  // ${ 'roundAs(3535.37, 0.05)' } | ${ 3535.35 }
  // ${ 'roundAs(3535.34, 0.05)' } | ${ 3535.35 }
  // ${ 'roundAs(3535.99, 0.05)' } | ${ 3536 }

  test.each`
    expr | result
    ${'roundAs(100.49, 0.1)'} | ${100.5}
    ${'roundAs(1004.962, 1)'} | ${1005}
    ${'roundAs(1.95319, 0.001)'} | ${1.953}
    ${'roundAs(1.95319, 0.0001)'} | ${1.9532}
  `('$expr -> $result', ({ expr, result }) => {
    const value = m.evaluate!(expr)
    expect(value).toEqual(result)
  })
})

test('variables', () => {
  const m = create(all)

  const value = m.evaluate!(`
    v1 = a + b
    v1 * c
  `, { a: 2, b: 3, c: 4 })

  expect(value.entries[1]).toEqual(20)
})
