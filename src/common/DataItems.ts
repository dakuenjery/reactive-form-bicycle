import { create, all } from 'mathjs'
import { resolveDeps } from '@/common/DepsHandler'
import isFunction from 'lodash/isFunction'
import isObject from 'lodash/isObject'
import filter from 'lodash/filter'
import keyBy from 'lodash/keyBy'
import mapKeys from 'lodash/mapKeys'
import defaults from 'lodash/defaults'
import get from 'lodash/get'
import last from 'lodash/last'
import forEach from 'lodash/forEach'

const mathjs = create(all)

mathjs.import!({
  roundAs(value: number, step: number): number {
    const d = 1 / step
    const precision = mathjs.log10!(d)
    const n = mathjs.max!(mathjs.floor!(precision), 0)
    return mathjs.round!(value, n)
  }
}, {})

export interface IUpdateReq {
  type: 'reset' | 'update'
  excludeItems?: string[]
}

export interface IDataItem<T> {
  id: string
  availableValues?: T[]
  default?: (() => T) | T // TODO: Promise<T>
  dependsOn?: string[]
  compute?: (values: any) => T // TODO: Promise<T>
  formula?: string
  update?: IUpdateReq
}

export interface IState {
  [key: string]: any
}

export interface ICommitArg {
  prop: string
  value: any
}

class CompiledItem<T> {
  id: string
  availableValues: T[]
  dependsOn: string[]
  updatePath: string[] = []
  formula: string
  update: IUpdateReq
  isValueAvailable: (state: IState, value: T) => boolean
  defaultValue: (state: IState) => T
  compute: (state: IState) => T

  constructor(base: IDataItem<T>) {
    this.id = base.id
    this.availableValues = base.availableValues ?? []
    this.formula = base.formula ?? ''

    this.update = defaults(base.update, { type: 'update' })

    if (base.formula) {
      const { deps, f } = buildFormula(base.formula)

      this.dependsOn = deps
      this.compute = f
    } else {
      this.dependsOn = base.dependsOn ?? []
      this.compute = base.compute ?? (_ => undefined as any)
    }

    this.isValueAvailable = (state: IState, value: T) =>
      this.availableValues.includes(value)

    if (isFunction(base.default))
      this.defaultValue = base.default
    else
      this.defaultValue = _ => base.default as T
  }
}

export class DataObject {
  properties: { [key: string]: CompiledItem<any> }

  constructor(items: CompiledItem<any>[]) {
    this.properties = keyBy(items, x => x.id)
  }

  buildDefaultState(): IState {
    const obj: any = {}

    forEach(this.properties, (value, key) => {
      obj[key] = value.defaultValue(obj)
    })

    return obj
  }

  update(id: string, value: any, state: IState): ICommitArg[] {
    state = this.createState(state)

    try {
      const commits: ICommitArg[] = []
      const prop = this.properties[id]

      this.commit(id, value, state, commits)

      if (prop.update.type === 'update')
        this.innerUpdate(prop, state, commits)
      else if (prop.update.type === 'reset')
        this.innerReset(prop, state, commits)
      else
        console.warn(`Unknown update type '${prop.update.type}'for property '${id}'`)

      return commits
    } catch (e) {
      console.error(`Error update. Prop: ${id}`, e)
      return []
    }
  }

  recompute(id: string, state: IState): ICommitArg {
    try {
      state = this.createState(state)
      const value = this.properties[id].compute(state)
      return { prop: id, value }
    } catch (e) {
      console.error(`Error update. Prop: ${id}`, e)
      return { prop: id, value: undefined }
    }
  }

  private commit(prop: string, value: any, state: IState, commits: ICommitArg[]) {
    state[`$${prop}`] = value
    commits.push({ prop, value })
  }

  private innerUpdate(prop: CompiledItem<any>, state: IState, commits: ICommitArg[]) {
    const updateProps = prop.updatePath.map(x => this.properties[x])

    for (const p of updateProps) {
      const value = p.compute(state)
      this.commit(p.id, value, state, commits)
    }
  }

  private innerReset(prop: CompiledItem<any>, state: IState, commits: ICommitArg[]) {
    const excludeItems = [...(prop.update.excludeItems ?? []), prop.id]
    const updateProps = filter(this.properties, x => !excludeItems.includes(x.id))

    for (const p of updateProps)
      commits.push({ prop: p.id, value: p.defaultValue(state) })
  }

  private createState(state: IState): IState {
    return mapKeys(state, (_, key) => `$${key}`)
  }
}

export function buildDataObject(items: IDataItem<any>[]): DataObject {
  const compiledItems = items.map(x => new CompiledItem(x))

  const deps = compiledItems.map(x => ({
    id: x.id,
    dependsOn: x.dependsOn ?? [],
    exclude: x.update?.excludeItems ?? []
  }))

  const updatePathMap = resolveDeps(deps)

  for (const item of compiledItems) {
    const updatePath = updatePathMap[item.id].dependencies
    item.updatePath = updatePath
  }

  return new DataObject(compiledItems)
}

function buildFormula(formula: string) {
  const node = mathjs.parse!(formula)
  const nodeNames = node.filter(x => x.isSymbolNode && x.name?.startsWith('$'))
    .map(x => x.name?.substring(1))

  const f = node.compile()

  return {
    deps: [...new Set(nodeNames)] as string[],
    f: (state: IState) => {
      try {
        const v = f.evaluate(state)

        if (isObject(v))
          return last(get(v, 'entries'))
        else
          return v
      } catch (e) {
        console.warn(e)
        return undefined
      }
    }
  }
}
