<template lang="pug">
el-form.addtrade-form
  el-card(header='Risk')
    data-item(propId='price_step' label='Price step')
    data-item(propId='pts_cost' label='Pts cost')
    data-item(propId='stop_pts' label='Stop pts')
    data-item(propId='take_pts' label='Take pts')

</template>

<script lang="ts">
import { toRefs, defineComponent, Ref, provide } from 'vue'
import { IState, ComponentMixin as mixin, buildPropBuilder } from '../reactive-data'
import DataItem from './DataItem.vue'

export default defineComponent({
  ...mixin,
  components: { DataItem },
  setup(props, { emit }) {
    const propRefs = toRefs(props)
    const model = propRefs.model as any as Ref<IState>

    const emitPropBuilder = buildPropBuilder(model, emit)
    provide('propBuilder', emitPropBuilder)

    return {}
  }
})

</script>
