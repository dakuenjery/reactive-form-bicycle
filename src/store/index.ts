import { createStore } from 'vuex'

const strict = process.env.NODE_ENV === 'development'

const store = createStore({
  strict
})

export default store
