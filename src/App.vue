<template lang="pug">
div.flex.justify-center.container.m-8
  div.addtrade-form.inline-grid.grid-cols-1.grid-rows-2.gap-4(
    class='sm:(grid-cols-2 grid-rows-1)'
    )
    trade-basic-params-form.max-w-62(:model='data' @update='upd')
    trade-risk-params-form.max-w-62(:model='data' @update='upd')

</template>

<script lang="ts">
import { computed as c, defineComponent, ref } from 'vue'
import tradeModule from '@/store/TradeEditModule'
import TradeBasicParamsForm from '@/components/TradeBasicParamsForm.vue'
import TradeRiskParamsForm from '@/components/TradeRiskParamsForm.vue'
import { ITradeFormEventPayload } from '@/common/FormComponentMixin'

export default defineComponent({
  name: 'App',
  components: {
    TradeBasicParamsForm, TradeRiskParamsForm
  },
  setup() {
    const data = c(() => tradeModule.data)

    const upd = (payload: ITradeFormEventPayload) => {
      tradeModule.update(payload)
    }

    return {
      data,
      upd
    }
  }
})
</script>
