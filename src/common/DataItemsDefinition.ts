import round from 'lodash/round'

export interface IUpdateReq {
  type: 'reset' | 'update'
  excludeItems?: string[]
}

export interface IDataItem<T> {
  id: string
  availableValues: T[] | undefined
  default: (() => T) | T // TODO: Promise<T>
  dependsOn: string[]
  compute: ((map: ReadonlyMap<string, any>) => T) | undefined // TODO: Promise<T>
  update: IUpdateReq | undefined
}

export const DataItems: IDataItem<any>[] = [
  {
    id: 'instrument',
    availableValues: undefined,
    default: '',
    dependsOn: [],
    compute: undefined,
    update: {
      type: 'reset',
      excludeItems: ['trade_type']
    }
  },
  {
    id: 'trade_type',
    availableValues: ['long', 'short'],
    default: undefined,
    dependsOn: ['lots'],
    compute: (values: any) => {
      const lots: number = values.lots

      if (lots === 0)
        return undefined

      return lots > 0 ? 'long' : 'short'
    },
    update: {
      type: 'reset',
      excludeItems: ['instrument']
    }
  },

  {
    id: 'enter_price',
    availableValues: undefined,
    default: 0,
    dependsOn: [],
    compute: undefined,
    update: {
      type: 'update'
    }
  },
  {
    id: 'stop_price',
    availableValues: undefined,
    default: undefined,
    dependsOn: ['stop_pts', 'enter_price', 'price_step', 'trade_type'],
    compute: (values: any) => {
      const tt: string | undefined = values.trade_type

      if (tt === undefined)
        return undefined

      const price: number = values.enter_price
      const step: number = values.price_step
      const pts: number = values.stop_pts

      const offset = round(pts * step, Math.log(1 / step))
      return price + offset * (tt === 'short' ? 1 : -1)
    },
    update: {
      type: 'update'
    }
  },
  {
    id: 'take_price',
    availableValues: undefined,
    default: undefined,
    dependsOn: ['take_pts', 'enter_price', 'price_step', 'trade_type'],
    compute: (values: any) => {
      const tt: string | undefined = values.trade_type

      if (tt === undefined)
        return undefined

      const price: number = values.enter_price
      const step: number = values.price_step
      const pts: number = values.take_pts

      const offset = round(pts * step, Math.log(1 / step))
      // const offset = Math.ceil(pts * step) * (tt === 'short' ? -1 : 1)
      return price + offset * (tt === 'short' ? -1 : 1)
    },
    update: {
      type: 'update'
    }
  },
  {
    id: 'lots',
    availableValues: undefined,
    default: 0,
    dependsOn: [],
    compute: undefined,
    update: {
      type: 'update',
      excludeItems: ['stop_pts', 'take_pts']
    }
  },

  {
    id: 'price_step',
    availableValues: undefined,
    default: 1.0,
    dependsOn: [],
    compute: undefined,
    update: {
      type: 'update'
    }
  },
  {
    id: 'pts_cost',
    availableValues: undefined,
    default: 1.0,
    dependsOn: [],
    compute: undefined,
    update: {
      type: 'update'
    }
  },
  {
    id: 'stop_pts',
    availableValues: undefined,
    default: 0,
    dependsOn: ['enter_price', 'stop_price', 'price_step'],
    compute: (values: any) => {
      const price: number = values.enter_price
      const stop: number = values.stop_price
      const step: number = values.price_step

      return Math.ceil(Math.abs(price - stop) / step)
    },
    update: {
      type: 'update'
    }
  },
  {
    id: 'take_pts',
    availableValues: undefined,
    default: 0,
    dependsOn: ['enter_price', 'take_price', 'price_step'],
    compute: (values: any) => {
      const price: number = values.enter_price
      const take: number = values.take_price
      const step: number = values.price_step

      return Math.ceil(Math.abs(price - take) / step)
    },
    update: {
      type: 'update'
    }
  },
]
