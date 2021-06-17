import {
  mapValues,
  without,
  mapKeys,
  difference
} from 'lodash'

type Dictionary<T> = { [index: string]: T }

export type AdjMap = Dictionary<string[]>

export interface IDependsOn {
  id: string
  dependsOn: string[]
  exclude?: string[]
}

export interface IDeps {
  id: string
  dependencies: string[]
  ignored: string[]
}

export function resolveDeps(items: IDependsOn[]) {
  const adjMap = buildAdjMap(items)

  const updatePaths = items.map((x) => {
    const adj = excludeAdj(adjMap, x.exclude)
    return resolveDep(x.id, adj)
  })

  return mapKeys(updatePaths, x => x.id)
}

function excludeAdj(adj: AdjMap, exclude: string[] = []): AdjMap {
  return mapValues(adj, x => without(x, ...exclude))
}

export function resolveDep(id: string, adj: AdjMap): IDeps {
  const resolved: string[] = []

  let unresolved: string[] = [id]

  while (unresolved.length > 0) {
    const elem = unresolved.shift()!
    resolved.push(elem)

    const children = adj[elem]
    const notHandled = difference(children, resolved)
    unresolved = uniqPush(unresolved, notHandled)
  }

  return {
    id,
    dependencies: resolved.slice(1),
    ignored: unresolved
  }
}

function uniqPush(arr: string[], elems: string[]): string[] {
  return [...new Set([...arr, ...elems])]
}

export function buildAdjMap(pdeps: IDependsOn[]): AdjMap {
  const adjObj = pdeps.reduce((obj: any, deps) => {
    obj[deps.id] = new Set<string>()
    return obj
  }, {})

  for (const { id, dependsOn } of pdeps) {
    for (const dep of dependsOn) {
      try {
        const depsSet = adjObj[dep]
        depsSet.add(id)
      } catch (e) {
        throw new Error(`Could not find dependency ${dep}`)
      }
    }
  }

  return mapValues(adjObj, set => [...set])
}
