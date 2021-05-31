import { create, all } from 'mathjs'

test('simple expression', () => {
  const m = create(all)

  const value = m.evaluate!('a + b^c', { a: 100, b: 3, c: 2 })
  expect(value).toBe(109)
})
