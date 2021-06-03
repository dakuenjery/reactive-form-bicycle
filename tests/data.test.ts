/* eslint-disable no-use-before-define */
import { buildDataObject, DataObject, IState, ICommitArg } from '@/common/DataItems'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
import defaults from 'lodash/defaults'

const TEST_DATA_DEPS_ON = {
  enter_price: [],
  lots: [],
  stop_price: ['stop_pts', 'price_step', 'enter_price', 'lots'],
  take_price: ['take_pts', 'price_step', 'enter_price', 'lots'],
  price_step: [],
  stop_pts: ['enter_price', 'stop_price', 'price_step'],
  take_pts: ['enter_price', 'take_price', 'price_step'],
}

const TEST_DATA_UPD_PATHS = {
  enter_price: ['take_price', 'take_pts', 'stop_price', 'stop_pts'],
  lots: ['take_price', 'take_pts', 'stop_price', 'stop_pts'],
  stop_price: ['stop_pts'],
  take_price: ['take_pts'],
  price_step: ['take_price', 'take_pts', 'stop_price', 'stop_pts'],
  stop_pts: ['stop_price'],
  take_pts: ['take_price'],
}

const TEST_DATA_DEFAULTS = {
  enter_price: undefined,
  lots: 1,
  stop_price: undefined,
  take_price: undefined,
  price_step: 1,
  stop_pts: 10,
  take_pts: 30,
}

const TEST_DATA = [
  {
    id: 'enter_price'
  },
  {
    id: 'lots',
    default: 1
  },
  {
    id: 'stop_price',
    formula: `
      offset = roundAs($stop_pts * $price_step, $price_step)
      $enter_price + offset * sign($lots) * -1
    `
  },
  {
    id: 'take_price',
    formula: `
      offset = roundAs($take_pts * $price_step, $price_step)
      $enter_price + offset * sign($lots)
    `
  },
  {
    id: 'price_step',
    default: 1
  },
  {
    id: 'stop_pts',
    default: 10,
    formula: `
      ceil(abs($enter_price - $stop_price) / $price_step)
    `
  },
  {
    id: 'take_pts',
    default: 30,
    formula: `
      ceil(abs($enter_price - $take_price) / $price_step)
    `
  }
]

test('DataObject depends', () => {
  const dataObj = buildDataObject(TEST_DATA)
  const obj = buildObjDeep(dataObj, 'dependsOn')
  expect(obj).toEqual(TEST_DATA_DEPS_ON)
})

test('DataObject updatePath', () => {
  const dataObj = buildDataObject(TEST_DATA)
  const obj = buildObjDeep(dataObj, 'updatePath')
  expect(obj).toEqual(TEST_DATA_UPD_PATHS)
})

test('default state', () => {
  const dataObj = buildDataObject(TEST_DATA)
  const state = dataObj.buildDefaultState()

  expect(state).toEqual(TEST_DATA_DEFAULTS)
})

describe('update', () => {
  const dataObj = buildDataObject(TEST_DATA)
  const state = dataObj.buildDefaultState()

  const commits = dataObj.update('enter_price', 100, state)
  commit(state, commits)

  test('enter_price := 100', () => {
    const expected = defaults({
      enter_price: 100,
      stop_price: 90,
      take_price: 130
    }, TEST_DATA_DEFAULTS)

    expect(state).toEqual(expected)
  })

  test('lots := -1', () => {
    const commits = dataObj.update('lots', -1, state)
    commit(state, commits)

    const expected = defaults({
      lots: -1,
      stop_price: 110,
      take_price: 70
    }, state)

    expect(state).toEqual(expected)
  })

  test('take_pts := 50', () => {
    const commits = dataObj.update('take_pts', 50, state)
    commit(state, commits)

    const expected = defaults({
      take_pts: 50,
      take_price: 50
    }, state)

    expect(state).toEqual(expected)
  })

  test('enter_price := 1000', () => {
    const commits = dataObj.update('enter_price', 1000, state)
    commit(state, commits)

    const expected = defaults({
      enter_price: 1000,
      stop_price: 1010,
      take_price: 950
    }, state)

    expect(state).toEqual(expected)
  })

  test('price_step := 10', () => {
    const commits = dataObj.update('price_step', 10, state)
    commit(state, commits)

    const expected = defaults({
      price_step: 10,
      stop_price: 1100,
      take_price: 500
    }, state)

    expect(state).toEqual(expected)
  })

  test('take_price := 700', () => {
    const commits = dataObj.update('take_price', 700, state)
    commit(state, commits)

    const expected = defaults({
      take_price: 700,
      take_pts: 30
    }, state)

    expect(state).toEqual(expected)
  })
})

function commit(state: IState, commits: ICommitArg[]) {
  commits.forEach(({ prop, value }) => {
    state[prop] = value
  })
}

function buildObjDeep(dataObj: DataObject, path: string) {
  const obj: any = {}

  forEach(dataObj.properties, (value, key) => {
    obj[key] = get(value, path)
  })

  return obj
}
