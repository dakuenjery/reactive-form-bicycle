<template lang="pug">
el-form.addtrade-form
  el-card.input-header
    template(#header)
      div.flex
        span.flex-1 {{ tradeType }}

        el-select.w-30(v-model='inst' filterable
          placeholder='Instrument')
          el-option-group(v-for='group in instruments'
            :key='group.title' :label='group.title')

            el-option(v-for='inst in group.instruments'
              :key='inst.instrument'
              :label='inst.instrument'
              :value='inst.instrument')

    el-form-item(label='Enter price')
      el-input-number(v-model='enter' controls-position='right')

    el-form-item(label='Stop price')
      el-input-number(v-model='stop' controls-position='right')

    el-form-item(label='Take price')
      el-input-number(v-model='take' controls-position='right')

    el-form-item(label='Lots')
      el-input-number(v-model='lots' controls-position='right')

</template>

<script lang="ts">
import { computed as c, toRefs, defineComponent, Ref } from 'vue'
import instModule from '@/store/InstrumentsModule'
import { tradeMixin, buildChangePropEmiter } from '@/common/FormComponentMixin'
import { IState } from '@/common/DataItems'

export default defineComponent({
  ...tradeMixin,
  setup(props, { emit }) {
    const propRefs = toRefs(props)
    const model = propRefs.model as Ref<IState>

    const emitPropBuilder = buildChangePropEmiter(model, emit)

    const instruments = c(() => instModule.instuments)

    const tradeTypeValue = emitPropBuilder('trade_type')

    const tradeType = c(() => {
      if (tradeTypeValue.value === 'long')
        return 'Long'
      else if (tradeTypeValue.value === 'short')
        return 'Short'
      else
        return 'New trade'
    })

    return {
      instruments,

      inst: emitPropBuilder('instrument'),

      enter: emitPropBuilder('enter_price'),
      stop: emitPropBuilder('stop_price'),
      take: emitPropBuilder('take_price'),
      lots: emitPropBuilder('lots'),
      tradeType
    }
  }
})

</script>
