/* eslint-disable no-use-before-define */
import { buildAdjMap, resolveDepDfs } from '@/common/DepsHandler'

test('build depsOn map', () => {
  const adj = buildAdjMap(TEST_DATA)
  expect(adj).toEqual(TEST_DATA_DEPS_ON)
})

test('resolve stop_price dfs', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDepDfs('stop_price', adj)
  expect(dep.dependencies).toEqual(['stop_pts', 'profit_ratio'])
})

test('resolve enter_price dfs', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDepDfs('enter_price', adj)
  expect(dep.dependencies).toEqual(['take_pts', 'take_price', 'stop_pts', 'profit_ratio', 'stop_price'])
})

test('resolve price_step dfs', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDepDfs('price_step', adj)
  expect(dep.dependencies).toEqual(['take_pts', 'take_price', 'stop_pts', 'profit_ratio', 'stop_price'])
})

test('resolve stop_pts dfs', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDepDfs('stop_pts', adj)
  expect(dep.dependencies).toEqual(['profit_ratio', 'stop_price'])
})

test('resolve a dfs', () => {
  const adj = buildAdjMap(TEST_DATA_2)
  const dep = resolveDepDfs('a', adj)
  expect(dep.dependencies).toEqual([...'cfbedg'])
})

const TEST_DATA_DEPS_ON = {
  enter_price: ['stop_pts', 'take_pts'],
  stop_price: ['stop_pts'],
  take_price: ['take_pts'],
  price_step: ['stop_pts', 'take_pts'],
  pts_cost: [],
  stop_pts: ['stop_price', 'profit_ratio'],
  take_pts: ['take_price', 'profit_ratio'],
  profit_ratio: [],
}

const TEST_DATA = [
  {
    id: 'enter_price',
    dependsOn: [],
  },
  {
    id: 'stop_price',
    dependsOn: ['stop_pts'],
  },
  {
    id: 'take_price',
    dependsOn: ['take_pts'],
  },
  {
    id: 'price_step',
    dependsOn: [],
  },
  {
    id: 'pts_cost',
    dependsOn: [],
  },
  {
    id: 'stop_pts',
    dependsOn: ['enter_price', 'stop_price', 'price_step'],
  },
  {
    id: 'take_pts',
    dependsOn: ['enter_price', 'take_price', 'price_step'],
  },
  {
    id: 'profit_ratio',
    dependsOn: ['stop_pts', 'take_pts'],
  },
]

const TEST_DATA_2 = [
  {
    id: 'a',
    dependsOn: ['c', 'e']
  },
  {
    id: 'b',
    dependsOn: ['a', 'd']
  },
  {
    id: 'c',
    dependsOn: ['a', 'f']
  },
  {
    id: 'd',
    dependsOn: ['b']
  },
  {
    id: 'e',
    dependsOn: ['b', 'c', 'f']
  },
  {
    id: 'f',
    dependsOn: ['c']
  },
  {
    id: 'g',
    dependsOn: ['c', 'f', 'd']
  }
]
