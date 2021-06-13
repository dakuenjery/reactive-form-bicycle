import { PropType, computed, Ref } from 'vue'
import { IState } from '@/common/DataTypes'

export interface ITradeFormEventPayload {
  prop: string
  value: any
}

export const tradeMixin = {
  props: {
    model: {
      type: Object as PropType<IState>,
      required: true
    }
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(payload: ITradeFormEventPayload) {
      return true
    }
  }
}

export function buildChangePropEmiter(modelRef: Ref<IState>, emit: Function) {
  return (prop: string) => (
    computed({
      get: () => modelRef.value[prop],
      set: (value: any) => {
        emit('update', { prop, value })
      }
    })
  )
}

export function emitedProp<T>(get: () => T, prop: string, emit: Function) {
  return computed({
    get,
    set: (value: T) => emit('update', { prop, value })
  })
}
