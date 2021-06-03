import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import { DataItems } from '@/common/DataItemsDefinition'
import { buildDataObject, DataObject, IState, ICommitArg, IDataItem } from '@/common/DataItems'
import defaults from 'lodash/defaults'
import clone from 'lodash/clone'
import store from '.'

interface IModuleMutation {
  dataItems: IDataItem<any>[]
  dataObj: DataObject
  state: IState
}

@Module
class TradeEditModule extends VuexModule {
  private dataItems = DataItems
  private dataObj: DataObject = buildDataObject(this.dataItems)
  state: IState = this.dataObj.buildDefaultState()

  @Mutation
  private mutateValues(values: ICommitArg[]) {
    for (const { prop, value } of values)
      this.state[prop] = value
  }

  @Mutation
  private mutateModule(payload: IModuleMutation) {
    this.dataItems = payload.dataItems
    this.dataObj = payload.dataObj
    this.state = payload.state
  }

  @Action
  async addField(field: { id: string; formula: string }) {
    const dataItems = [...this.dataItems, field]
    const dataObj = buildDataObject(dataItems)
    const defState = dataObj.buildDefaultState()
    const state = defaults(clone(this.state), defState)

    this.mutateModule({ dataItems, dataObj, state })

    const commit = dataObj.recompute(field.id, state)
    this.mutateValues([commit])
  }

  @Action
  async update({ prop, value }: ICommitArg) {
    try {
      const commits = this.dataObj.update(prop, value, this.state)
      this.mutateValues(commits)
    } catch (err) {
      console.error('update err', err)
    }
  }
}

export default new TradeEditModule({
  store, name: 'trade_edit_module'
})
