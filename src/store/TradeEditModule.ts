/* eslint-disable no-console */
import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import { DataItems } from '@/DataItemsDefinition'
import defaults from 'lodash/defaults'
import clone from 'lodash/clone'
import { DataObject, IState, ICommitArg, IDataItem } from '../reactive-data'
import store from '.'

interface IModuleMutation {
  dataItems: IDataItem<any>[]
  dataObj: DataObject
  state: IState
}

@Module
class TradeEditModule extends VuexModule {
  dataItems = DataItems
  dataObj: DataObject = new DataObject(this.dataItems)
  state: IState = this.dataObj.buildDefaultState()
  lastCommits: ICommitArg[] = []

  @Mutation
  private mutateValues(values: ICommitArg[]) {
    this.lastCommits = values

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
    const dataObj = new DataObject(dataItems)
    const defState = dataObj.buildDefaultState()
    const state = defaults(clone(this.state), defState)

    this.mutateModule({ dataItems, dataObj, state })

    const commit = dataObj.recompute(field.id, state)
    this.mutateValues([commit])
  }

  @Action
  async update({ prop, value }: ICommitArg) {
    try {
      console.log('state', this.state)
      const commits = this.dataObj.update(prop, value, this.state)
      console.log('commits:', commits)
      this.mutateValues(commits)
    } catch (err) {
      console.error('update err', err)
      console.error('state', this.state)
    }
  }
}

export default new TradeEditModule({
  store, name: 'trade_edit_module'
})
