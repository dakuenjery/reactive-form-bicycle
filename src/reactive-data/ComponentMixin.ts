import { PropType, computed, Ref } from 'vue'
import { IState } from './DataTypes'

export interface IUpdateItemEventPayload {
  prop: string
  value: any
}

export const ComponentMixin = {
  props: {
    model: {
      type: Object as PropType<IState>,
      required: true
    }
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(payload: IUpdateItemEventPayload) {
      return true
    }
  }
}

export function buildPropBuilder(modelRef: Ref<IState>, emit: Function) {
  return (prop: string) => (
    computed({
      get: () => modelRef.value[prop],
      set: (value: any) => {
        emit('update', { prop, value })
      }
    })
  )
}
