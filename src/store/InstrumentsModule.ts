import { VuexModule, Module, Mutation, Action } from 'vuex-class-modules'
import store from '.'

interface IInstrument {
  instrument: string
}

interface IInstrumentGroup {
  title: string
  instruments: IInstrument[]
}

@Module({ generateMutationSetters: true })
class InstrumentsModule extends VuexModule {
  instuments: IInstrumentGroup[] = [
    {
      title: 'Favotites',
      instruments: [{
        instrument: 'sim6'
      }, {
        instrument: 'brm6'
      }, {
        instrument: 'rim6'
      }]
    },
    {
      title: 'Other',
      instruments: [{
        instrument: 'mmm6'
      }, {
        instrument: 'lkm6'
      }, {
        instrument: 'rnm6'
      }, {
        instrument: 'mtm6'
      }]
    }
  ]

  @Mutation
  add() {

  }
}

export default new InstrumentsModule({
  store, name: 'instruments_module'
})
