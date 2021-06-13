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

    data-item(propId='enter_price' label='Enter price')
    data-item(propId='stop_price' label='Stop price')
    data-item(propId='take_price' label='Take price')
    data-item(propId='lots' label='Lots')

</template>

<script lang="ts">
import { computed as c, toRefs, defineComponent, Ref, provide } from 'vue'
import instModule from '@/store/InstrumentsModule'
import { tradeMixin, buildChangePropEmiter } from '@/common/FormComponentMixin'
import DataInfo from '@/components/DataInfo.vue'
import DataItem from '@/components/DataItem.vue'
import { IState } from '@/common/DataTypes'

export default defineComponent({
  ...tradeMixin,
  components: { DataInfo, DataItem },
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

    provide('propBuilder', emitPropBuilder)

    return {
      instruments,
      inst: emitPropBuilder('instrument'),
      tradeType
    }
  }
})

</script>
