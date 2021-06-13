<template lang="pug">
el-tooltip(class='item' effect='dark' placement='bottom')
  template(#content)
    data-info(:propId='propId')

  el-form-item(:label='label ?? propId')
    el-input-number(v-model='prop' controls-position='right')

</template>

<script lang="ts">
import { toRefs, defineComponent, inject, ref, Directive, DirectiveBinding } from 'vue'
import DataInfo from '@/components/DataInfo.vue'

const labelhover: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<any>) {
    const label = el.getElementsByClassName('el-form-item__label')?.item(0) as HTMLElement

    if (label) {
      label.onmouseover = () => binding.value(true)
      label.onmouseout = () => binding.value(false)
    }
  }
}

export default defineComponent({
  components: { DataInfo },
  directives: {
    labelhover
  },
  props: {
    propId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: undefined
    }
  },
  setup(props) {
    const propRefs = toRefs(props)
    const propBuilder = inject('propBuilder') as (prop: string) => any

    const propId = propRefs.propId
    const prop = propBuilder(propId.value)

    const visible = ref(false)

    const func = (arg: boolean) => {
      visible.value = arg
    }

    return {
      prop,
      visible,
      func
    }
  }
})

</script>

<style>
.pop-point {
  position: absolute;
  width: 1px !important;
  height: 100%;
  left: -50%;
  z-index: -1;
}
</style>
