import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import { DataItems, IDataItem, IUpdateReq } from '@/common/DataItemsDefinition'
import { resolveDeps, resolveDepDfs, buildAdjMap } from '@/common/DepsHandler'
import without from 'lodash/without'
import filter from 'lodash/filter'
import map from 'lodash/map'
import clone from 'lodash/clone'
import keyBy from 'lodash/keyBy'
import { mapValues } from 'lodash'
import store from '.'

interface ICommitArg {
  prop: string
  value: any
}

interface IInternalDataItemDesc<T> extends IDataItem<T> {
  dependencies: string[]
}

@Module
class TradeEditModule extends VuexModule {
  private internalDataDesc = this.buildInternalDataDesc()
  data = this.buildValuesMap()

  private buildInternalDataDesc() {
    const deps = DataItems.map(x => ({
      id: x.id,
      dependsOn: x.dependsOn,
      exclude: x.update?.excludeItems ?? []
    }))

    const updatePaths = resolveDeps(deps)

    const items = DataItems.map(x => ({
      ...x,
      dependencies: updatePaths[x.id]?.dependencies ?? []
    }))

    return keyBy(items, item => item.id)
  }

  private buildValuesMap() {
    const obj: any = {}

    for (const item of DataItems) {
      const def = this.getDefaultValue(item)
      // map.set(item.id, def)
      obj[item.id] = def
    }

    return obj
  }

  // @Mutation
  // private mutateInit({ internalDataDesc, data }: { internalDataDesc: any; data: any }) {
  //   // this.internalDataDesc = internalDataDesc
  //   this.data = data
  // }

  @Mutation
  private mutateValue({ prop, value }: ICommitArg) {
    // this.data.set(prop, value)
    this.data[prop] = value
  }

  @Mutation
  private mutateValues(values: ICommitArg[]) {
    for (const { prop, value } of values)
      this.data[prop] = value
    // this.data.set(prop, value)
  }

  // @Action
  // async init() {
  //   this.mutateInit({
  //     // internalDataDesc: this.buildInternalDataDesc(),
  //     data: this.buildValuesMap()
  //   })
  // }

  @Action
  async update({ prop, value }: { prop: string; value: any }) {
    try {
      const itemDesc = this.internalDataDesc[prop]!

      this.mutateValue({ prop, value })

      if (itemDesc.update !== undefined) {
        if (itemDesc.update.type === 'reset')
          this.buildReset(itemDesc)
        else if (itemDesc.update.type === 'update')
          this.buildUpdate(itemDesc)
        else
          console.warn(`Unknown IUpdateReq.type ${itemDesc.update.type}`)
      }
    } catch (err) {
      console.error('update err', err)
    }
  }

  private buildUpdate(updatedProp: IInternalDataItemDesc<any>) {
    // const tempMap = new Map<string, any>(this.data)
    const tmpObj = clone(this.data)
    const commitArgs: ICommitArg[] = []

    for (const prop of updatedProp.dependencies) {
      const depItem = this.internalDataDesc[prop]

      if (depItem.compute !== undefined) {
        const value = depItem.compute(tmpObj)
        // tempMap.set(prop, value)
        tmpObj[prop] = value
        commitArgs.push({ prop, value })
      }
    }

    this.mutateValues(commitArgs)
  }

  private buildReset(updatedProp: IInternalDataItemDesc<any>) {
    const excludeItems = [...(updatedProp.update?.excludeItems ?? []), updatedProp.id]
    const dataItems = filter(this.internalDataDesc, x => !excludeItems.includes(x.id))

    const commitArgs = dataItems
      .map(x => ({ prop: x.id, value: this.getDefaultValue(x) }))

    this.mutateValues(commitArgs)
  }

  private getDefaultValue(item: IDataItem<any>): any {
    if (typeof item.default === 'function')
      return item.default()
    else
      return item.default
  }

  // private buildUpdateOrder(prop: string): string[] {
  //   const props: string[] = []

  //   return props
  // }

  // /**
  //  * Возвращает массив, содержащий все идентификаторы, перечисленные в TradeDataItems,
  //  * за исключением перечисленных в excludeProps.
  //  */
  // private getSortedUpdatingItems(update: IUpdateReq, excludeProps: string[]): IDataItem<any>[] {
  //   const allItemIds = map(this.internalDataDesc, 'id')

  //   if (update.excludeItems)
  //     excludeProps.push(...update.excludeItems)

  //   const itemIds = without(allItemIds, ...excludeProps)
  //   return map(itemIds, itemId => this.internalDataDesc[itemId])
  // }

  @Action
  async reset() {

  }
}

export default new TradeEditModule({
  store, name: 'trade_edit_module'
})
