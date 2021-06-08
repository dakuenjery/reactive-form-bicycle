import {
  mapValues,
  without,
  isArray,
  mapKeys,
  union,
  keyBy,
  reduce,
  difference
} from 'lodash'

// import mapValues from 'lodash/mapValues'

enum NodeColor {
  White,
  Grey,
  Black,
  Red
}

type Dictionary<T> = { [index: string]: T }

export type AdjMap = Dictionary<string[]>
type ColorMap = Dictionary<NodeColor>

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
  const depsMap = buildAdjMap(items)

  const updatePaths = items.map((x) => {
    const adj = excludeAdj(depsMap, x.exclude)
    return resolveDepDfs(x.id, adj)
  })

  return mapKeys(updatePaths, x => x.id)
}

function excludeAdj(adj: AdjMap, exclude: string[] = []): AdjMap {
  return mapValues(adj, x => without(x, ...exclude))
}

export function resolveDepDfs(rootId: string, adj: AdjMap): IDeps {
  const nodeColors = buildColoredMap(adj)
  const visitOrderArr: string[] = []
  const inOrder: string[] = []

  dfs(rootId, nodeColors, adj, inOrder, visitOrderArr)

  return {
    id: rootId,
    dependencies: visitOrderArr.reverse().slice(1),
    ignored: []
  }
}

function dfs(id: string, colors: ColorMap, adj: AdjMap, inOrder: string[], postOrder: string[]) {
  colors[id] = NodeColor.Grey
  inOrder.push(id)

  for (const itemId of adj[id]!) {
    const itemColor = colors[itemId]!

    if (itemColor === NodeColor.White)
      dfs(itemId, colors, adj, inOrder, postOrder)
    // else if (itemColor === NodeColor.Grey)
    // throw new CycleError(itemId, inOrder)
  }

  if (colors[id] === NodeColor.Grey) {
    colors[id] = NodeColor.Black
    postOrder.push(id)
  }
}

export function resolveDepBfs(id: string, adj: AdjMap /*, depsMap: AdjMap */): IDeps {
  const resolved: string[] = []

  let unresolved: string[] = [id]
  let shifts = unresolved.length

  while (unresolved.length > 0 && shifts > -1) {
    shifts -= 1
    const elem = unresolved.shift()!
    // const deps = depsMap[elem]!

    // if (!containsAll(resolved, deps)) {
    //   unresolved.push(elem)
    //   continue
    // }

    // resolved = uniqPush(resolved, elem)
    resolved.push(elem)

    const children = adj[elem]

    const notHandled = difference(children, resolved)
    unresolved = uniqPush(unresolved, notHandled)
    shifts = unresolved.length
  }

  return {
    id,
    dependencies: resolved.slice(1),
    ignored: unresolved
  }
}

class CycleError extends Error {
  constructor(itemId: string, inOrder: string[]) {
    const msg = inOrder.reduce((acc, x) => {
      let sep = '->'

      if (acc === '')
        sep = ''

      if (x === itemId)
        sep = ' |> '

      return `${acc}${sep}${x}`
    }, '')

    super(`${msg}->${itemId})`)
  }
}

function containsAll(arr: string[], target: string[]): boolean {
  return target.every(x => arr.includes(x))
}

function uniqPush(arr: string[], elems: string[] | string): string[] {
  if (isArray(elems))
    return [...new Set([...arr, ...elems])]
  else
    return [...new Set([...arr, elems])]
}

function buildColoredMap(adj: AdjMap): ColorMap {
  return mapValues(adj, () => NodeColor.White)
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

export function buildDepsMap(pdeps: IDependsOn[]): AdjMap {
  return pdeps.reduce((obj: any, deps) => {
    obj[deps.id] = deps.dependsOn
    return obj
  }, {})
}
