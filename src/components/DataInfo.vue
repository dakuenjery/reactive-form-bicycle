<template lang="pug">
el-scrollbar
  div
    div.font-bold {{ propId.trim() }}
    pre.text-8px.p-1 {{ formula }}

  el-divider.my-2

  div(v-for='v in updPath') {{ v }}

</template>

<script lang="ts">
import { computed as c, toRefs, defineComponent } from 'vue'
import { isFormula, isFuncDef } from '@/common/DataTypes'
import tradeModule from '@/store/TradeEditModule'
import {
  find,
} from 'lodash'

export default defineComponent({
  props: {
    propId: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const propRefs = toRefs(props)
    const propId = propRefs.propId

    const propInfo = tradeModule.dataObj.properties[propId.value]

    const compute = find(tradeModule.dataItems, x => x.id === propId.value)?.compute

    let formula = 'unknown'

    if (compute !== undefined) {
      if (isFormula(compute)) {
        formula = compute.split('\n')
          .map(x => x.trim())
          .filter(x => x.length > 0)
          .join('\n')
      } else if (isFuncDef(compute)) {
        formula = `f(${compute.dependsOn.join(',')})`
      }
    }
    const updPath = c(() => {
      const commits = tradeModule.lastCommits

      if (commits[0]?.prop === propId.value)
        return commits.map(x => `${x.prop}: ${x.value}`)

      return propInfo?.update?.path ?? []
    })

    return {
      formula,
      updPath
    }
  }
})

</script>
