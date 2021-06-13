/* eslint-disable no-use-before-define */
import {
  buildAdjMap,
  resolveDep,
  resolveDepDfs,
  buildDepsMap
} from '@/common/DepsHandler'

test('build depsOn map', () => {
  const adj = buildAdjMap(TEST_DATA)
  expect(adj).toEqual(TEST_DATA_DEPS_ON)
})

test('resolve stop_price', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDep('stop_price', adj)
  expect(dep.dependencies).toEqual(['stop_pts', 'profit_ratio', 'take_pts', 'take_price'])
})

test('resolve enter_price', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDep('enter_price', adj)
  expect(dep.dependencies)
    .toEqual(['stop_price', 'take_price', 'stop_pts', 'take_pts', 'profit_ratio'])
})

test('resolve profit', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDep('profit_ratio', adj)
  expect(dep.dependencies)
    .toEqual(['take_pts', 'take_price'])
})

test('resolve price_step', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDep('price_step', adj)
  expect(dep.dependencies)
    .toEqual(['stop_price', 'take_price', 'stop_pts', 'take_pts', 'profit_ratio'])
})

test('resolve stop_pts', () => {
  const adj = buildAdjMap(TEST_DATA)
  const dep = resolveDep('stop_pts', adj)
  expect(dep.dependencies)
    .toEqual(['stop_price', 'profit_ratio', 'take_pts', 'take_price'])
})

const TEST_DATA_DEPS_ON = {
  enter_price: ['stop_price', 'take_price', 'stop_pts', 'take_pts'],
  stop_price: ['stop_pts'],
  take_price: ['take_pts'],
  price_step: ['stop_price', 'take_price', 'stop_pts', 'take_pts'],
  pts_cost: [],
  stop_pts: ['stop_price', 'profit_ratio'],
  take_pts: ['take_price', 'profit_ratio'],
  profit_ratio: ['take_pts'],
}

const TEST_DATA = [
  {
    id: 'enter_price',
    dependsOn: [],
  },
  {
    id: 'stop_price',
    dependsOn: ['stop_pts', 'enter_price', 'price_step'],
  },
  {
    id: 'take_price',
    dependsOn: ['take_pts', 'enter_price', 'price_step'],
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
    dependsOn: ['enter_price', 'take_price', 'price_step', 'profit_ratio'],
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

test('cycle test', () => {
  const adj = buildAdjMap(TEST_DATA_3)
  const dep = resolveDep('f', adj)
  expect(dep.dependencies)
    .toEqual('')
})

const TEST_DATA_3 = [
  {
    id: 'f',
    dependsOn: []
  },
  {
    id: 'b',
    dependsOn: ['f']
  },
  {
    id: 'g',
    // dependsOn: ['f']
    dependsOn: ['f', 'd']
  },
  {
    id: 'a',
    dependsOn: ['b']
  },
  {
    id: 'd',
    dependsOn: ['b', 'g']
  },
  {
    id: 'c',
    dependsOn: ['d']
  },
  {
    id: 'e',
    dependsOn: ['d']
  },
  {
    id: 'i',
    dependsOn: ['g']
  },
  {
    id: 'h',
    dependsOn: ['i', 'e']
  }
]
