import mapKeys from 'lodash/mapKeys'
import keyBy from 'lodash/keyBy'
import reduce from 'lodash/reduce'
import without from 'lodash/without'
import { mapValues } from 'lodash'

enum NodeColor {
  White,
  Grey
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

  dfs(rootId, nodeColors, adj, visitOrderArr)

  return {
    id: rootId,
    dependencies: visitOrderArr.reverse().slice(1),
    ignored: []
  }
}

function dfs(id: string, colors: ColorMap, adj: AdjMap, orderArr: string[]) {
  colors[id] = NodeColor.Grey

  for (const itemId of adj[id]!) {
    const itemColor = colors[itemId]!

    if (itemColor === NodeColor.White)
      dfs(itemId, colors, adj, orderArr)
  }

  orderArr.push(id)
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
      const depsSet = adjObj[dep]
      depsSet.add(id)
    }
  }

  return mapValues(adjObj, set => [...set])
}
