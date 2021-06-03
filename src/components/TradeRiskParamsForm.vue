<template lang="pug">
el-form.addtrade-form
  el-card(header='Risk')

    el-form-item(label='Price step')
      el-input-number(v-model='priceStep' controls-position='right')

    el-form-item(label='Pts cost')
      el-input-number(v-model='ptsCost' controls-position='right')

    el-form-item(label='Stop pts')
      el-input-number(v-model='stop' controls-position='right')

    el-form-item(label='Take pts')
      el-input-number(v-model='take' controls-position='right')

</template>

<script lang="ts">
import { computed as c, toRefs, defineComponent, Ref } from 'vue'
import { tradeMixin, buildChangePropEmiter } from '@/common/FormComponentMixin'
import { IState } from '@/common/DataItems'

export default defineComponent({
  ...tradeMixin,
  setup(props, { emit }) {
    const propRefs = toRefs(props)
    const model = propRefs.model as any as Ref<IState>

    const emitPropBuilder = buildChangePropEmiter(model, emit)

    return {
      priceStep: emitPropBuilder('price_step'),
      ptsCost: emitPropBuilder('pts_cost'),
      stop: emitPropBuilder('stop_pts'),
      take: emitPropBuilder('take_pts'),
    }
  }
})

</script>
