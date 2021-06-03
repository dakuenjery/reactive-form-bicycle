<template lang="pug">
el-form.addtrade-form
  el-card.input-header
    template(#header)
      div.flex
        span.flex-1 Other form items

        el-button(circle
          @click='dialogVisible = true'
          icon='el-icon-plus')

    template(v-for='prop in formProps' :key='prop.key')
      el-form-item(:label='prop.key')
        el-input-number(v-model='prop.value' controls-position='right')

    template(v-if='isFormEmpty')
      el-empty.p-0(:image-size='50'
        description='Add new form item! Example: $take_pts * $lots * $pts_cost')

  el-dialog(title='Add form item' v-model='dialogVisible')
    el-form(:model='addModel')
      el-form-item(label='Field name')
        el-input(v-model='addModel.id' controls-position='right')

      el-form-item(label='Formula')
        el-input(v-model='addModel.formula' controls-position='right')

    template(#footer)
      el-button(
        @click='dialogVisible = false'
        icon='el-icon-close') Cancel

      el-button(type='primary'
        @click='addField'
        icon='el-icon-check') Create

</template>

<script lang="ts">
import { computed as c, toRefs, defineComponent, Ref, ref } from 'vue'
import { tradeMixin, buildChangePropEmiter } from '@/common/FormComponentMixin'
import { IState } from '@/common/DataItems'
import { ElMessage } from 'element-plus'
import tradeModule from '@/store/TradeEditModule'
import keys from 'lodash/keys'
import without from 'lodash/without'

const ignoreProps = [
  'instrument',
  'enter_price',
  'stop_price',
  'take_price',
  'lots',
  'price_step',
  'pts_cost',
  'stop_pts',
  'take_pts',
  'trade_type'
]

export default defineComponent({
  ...tradeMixin,
  setup(props, { emit }) {
    const propRefs = toRefs(props)
    const model = propRefs.model as Ref<IState>

    const emitPropBuilder = buildChangePropEmiter(model, emit)

    const formProps = c(() => {
      const propIds = without(keys(model.value), ...ignoreProps)
      return propIds.map(x => ({
        key: x,
        value: emitPropBuilder(x)
      }))
    })

    const isFormEmpty = c(() => formProps.value.length === 0)

    const dialogVisible = ref(false)

    const addModel = ref({
      id: '',
      formula: ''
    })

    const addField = () => {
      const v = addModel.value

      if (v.id.trim() === '' || v.formula.trim() === '') {
        ElMessage.error('Incorrect input :(')
        return
      }

      tradeModule.addField(addModel.value)

      dialogVisible.value = false
      addModel.value = {
        id: '',
        formula: ''
      }
    }

    const removeField = (propKey: string) => {

    }

    return {
      formProps,
      isFormEmpty,
      dialogVisible,
      addModel,
      addField,
      removeField
    }
  }
})

</script>
