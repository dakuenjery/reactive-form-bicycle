import { PropType, computed, Ref } from 'vue'

export interface ITradeFormEventPayload {
  prop: string
  value: any
}

export const tradeMixin = {
  props: {
    model: {
      type: Object as PropType<any>,
      required: true
    }
  },
  emits: {
    update(payload: ITradeFormEventPayload) {
      return true
    }
  }
}

export function buildChangePropEmiter(modelRef: Ref<any>, emit: Function) {
  return (prop: string) => (
    computed({
      get: () => modelRef.value[prop],
      set: (value: any) => {
        console.log('emit', { prop, value })
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
