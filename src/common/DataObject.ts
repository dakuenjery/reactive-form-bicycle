/* eslint-disable no-console */
import { resolveDeps, IDependsOn } from '@/common/DepsHandler'
import {
  filter,
  keyBy,
  forEach,
  isArray
} from 'lodash'

import {
  IState,
  ICommitArg,
  IDataItem,
  IContext
} from './DataTypes'

import { CompiledItem } from './CompiledItem'

export class DataObject {
  properties: { [key: string]: CompiledItem<any> }

  constructor(items: IDataItem<any>[]) {
    const compiledItems = buildItems(items)
    this.properties = keyBy(compiledItems, x => x.id)
  }

  buildDefaultState(): IState {
    const obj: any = {}

    forEach(this.properties, (value, key) => {
      obj[key] = value.defaultValue(obj)
    })

    return obj
  }

  update(id: string, value: any, state: IState): ICommitArg[] {
    const ctx = createContext(id, state)

    try {
      const commits: ICommitArg[] = []
      const prop = this.properties[id]

      this.commit(id, value, ctx, commits)

      if (prop.update.type === 'update')
        this.innerUpdate(prop, ctx, commits)
      else if (prop.update.type === 'reset')
        this.innerReset(prop, ctx, commits)
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
      const ctx = createContext(id, state)
      const value = this.properties[id].compute.func(ctx)
      return { prop: id, value }
    } catch (e) {
      console.error(`Error update. Prop: ${id}`, e)
      return { prop: id, value: undefined }
    }
  }

  private commit(prop: string, value: any, ctx: IContext, commits: ICommitArg[]) {
    ctx.set(`$${prop}`, value)
    commits.push({ prop, value })
  }

  private innerUpdate(prop: CompiledItem<any>, ctx: IContext, commits: ICommitArg[]) {
    const updateProps = prop.update.path!.map(x => this.properties[x])

    for (const p of updateProps) {
      try {
        const value = p.compute.func(ctx)
        this.commit(p.id, value, ctx, commits)
      } catch (e) {
        console.warn(`Error evaluate ${p.id}`, e)
        this.commit(p.id, undefined, ctx, commits)
      }
    }
  }

  private innerReset(prop: CompiledItem<any>, ctx: IContext, commits: ICommitArg[]) {
    const excludeItems = [...(prop.update.excludeItems ?? []), prop.id]
    const updateProps = filter(this.properties, x => !excludeItems.includes(x.id))

    for (const p of updateProps)
      commits.push({ prop: p.id, value: p.defaultValue(ctx) })
  }
}

function createContext(root: string, state: IState): IContext {
  const ctx = new Map<string, any>()

  forEach(state, (v, k) => {
    ctx.set(`$${k}`, v)
  })

  ctx.set('$$root', root)

  return ctx
}

function buildItems(items: IDataItem<any>[]): CompiledItem<any>[] {
  const compiledItems = items.map(x => new CompiledItem(x))

  const deps = compiledItems.map(createDepends)

  const updatePathMap = resolveDeps(deps)

  for (const item of compiledItems) {
    const updatePath = updatePathMap[item.id].dependencies

    if (item.update.path === undefined)
      item.update.path = updatePath
  }

  return compiledItems
}

function createDepends(x: CompiledItem<any>): IDependsOn {
  let dependsOn = x.compute.dependsOn ?? []
  let exclude = x.update.excludeItems ?? []

  if (isArray(x.update.path)) {
    dependsOn = []
    exclude = []
  }

  return {
    id: x.id,
    dependsOn,
    exclude
  }
}
