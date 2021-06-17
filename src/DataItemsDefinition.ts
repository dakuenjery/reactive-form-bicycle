import { IDataItem, IContext } from './reactive-data'

export const DataItems: IDataItem<any>[] = [
  {
    id: 'instrument',
    update: {
      type: 'reset'
    }
  },
  {
    id: 'trade_type',
    availableValues: ['long', 'short'],
    compute: {
      dependsOn: ['lots'],
      func: (values: IContext) => {
        const lots: number = values.get('$lots')

        if (lots === 0 || lots === undefined)
          return undefined

        return lots > 0 ? 'long' : 'short'
      }
    }
  },
  {
    id: 'enter_price',
  },
  {
    id: 'stop_price',
    compute: `
      offset = roundAs($stop_pts * $price_step, $price_step)
      $enter_price + offset * sign($lots) * -1
    `
  },
  {
    id: 'take_price',
    compute: `
      offset = roundAs($take_pts * $price_step, $price_step)
      $enter_price + offset * sign($lots)
    `
  },
  {
    id: 'lots',
    default: 0,
    update: {
      type: 'update',
      excludeItems: ['stop_pts', 'take_pts']
    }
  },

  {
    id: 'price_step',
    default: 1.0
  },
  {
    id: 'pts_cost',
    default: 1.0
  },
  {
    id: 'stop_pts',
    default: 0,
    compute: `
      ceil(abs($enter_price - $stop_price) / $price_step)
    `,
  },
  {
    id: 'take_pts',
    default: 0,
    compute: `
      f1() = ceil(abs($enter_price - $take_price) / $price_step)
      f2() = ceil($stop_pts * $profit_ratio)

      equalText($$root, "profit_ratio") ? f2() : f1()
    `,
  },
  {
    id: 'profit_ratio',
    default: 0,
    compute: `
      s = $stop_pts
      t = $take_pts

      s > 0 ? t/s : 0
    `
  },
]
