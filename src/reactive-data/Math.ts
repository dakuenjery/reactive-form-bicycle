import { create, all } from 'mathjs'

const mathjs = create(all)

mathjs.import!({
  roundAs(value: number, step: number): number {
    const d = 1 / step
    const precision = mathjs.log10!(d)
    const n = mathjs.max!(mathjs.floor!(precision), 0)
    return mathjs.round!(value, n)
  }
}, {})

export default mathjs
