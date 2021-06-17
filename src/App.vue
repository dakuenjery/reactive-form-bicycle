<template lang="pug">
div.flex.justify-center.container.m-8
  div.addtrade-form.inline-grid.gap-4
    trade-basic-params-form.max-w-62(:model='data' @update='upd')
    trade-risk-params-form.max-w-62(:model='data' @update='upd')
    others-params-form.max-w-62(:model='data' @update='upd'
      class='sm:(col-span-2 max-w-200)'
    )

</template>

<script lang="ts">
import { computed as c, defineComponent } from 'vue'
import TradeBasicParamsForm from './components/TradeBasicParamsForm.vue'
import TradeRiskParamsForm from './components/TradeRiskParamsForm.vue'
import OthersParamsForm from './components/OthersParamsForm.vue'
import tradeModule from './store/TradeEditModule'
import { IUpdateItemEventPayload } from './reactive-data'

export default defineComponent({
  name: 'App',
  components: {
    TradeBasicParamsForm, TradeRiskParamsForm, OthersParamsForm
  },
  setup() {
    const data = c(() => tradeModule.state)

    const upd = (payload: IUpdateItemEventPayload) => {
      tradeModule.update(payload)
    }

    return {
      data,
      upd
    }
  }
})
</script>
