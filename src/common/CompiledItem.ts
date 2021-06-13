import {
  defaults,
  isFunction,
  isObject,
  get,
  last,
  isNil,
} from 'lodash'
import math from './Math'

import {
  UpdateReq,
  isFuncDef,
  ComputeBase,
  IContext,
  IDataItem,
  isFormula
} from './DataTypes'

const DEFAULT_COMPUTE_BASE = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  func: (_: any) => undefined as any,
  dependsOn: []
}

export class CompiledItem<T> {
  id: string
  availableValues: T[]
  update: UpdateReq
  defaultValue: (state: IContext) => T
  compute: ComputeBase<T>

  constructor(base: IDataItem<any>) {
    this.id = base.id
    this.availableValues = base.availableValues ?? []
    this.update = defaults(base.update, { type: 'update' })

    if (isFunction(base.default))
      this.defaultValue = base.default

    else
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.defaultValue = _ => base.default as T

    this.compute = DEFAULT_COMPUTE_BASE

    if (!isNil(base.compute)) {
      if (isFormula(base.compute))
        this.compute = buildFormula(base.compute)
      else if (isFuncDef(base.compute))
        this.compute = base.compute
    }
  }
}

function buildFormula(formula: string): ComputeBase<any> {
  const node = math.parse!(formula)
  const nodeNames = node.filter(x => x.isSymbolNode && x.name?.startsWith('$'))
    .map(x => x.name?.substring(1))

  const f = node.compile()

  return {
    dependsOn: [...new Set(nodeNames)] as string[],
    func: (ctx: IContext) => {
      const v = f.evaluate(ctx)

      if (isObject(v))
        return last(get(v, 'entries'))
      else
        return v
    }
  }
}
