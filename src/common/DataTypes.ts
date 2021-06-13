import {
  isObject, isArray, isFunction, isString
} from 'lodash'

export type UpdateReq = {
  type: 'reset' | 'update'
  path?: string[]
  excludeItems?: string[]
}

export interface IState {
  [key: string]: any
}

export type IContext = Map<string, any>

export interface ICommitArg {
  prop: string
  value: any
}

export type ComputeFormula = string
export type ComputeBase<T> = {
  func: (ctx: Map<string, any>) => T
  dependsOn: string[]
}
export type ComputeFunc<T> = ComputeBase<T> | ComputeFormula

// export type ComputeBaseMap<T> = {
//   [key: string]: ComputeBase<T>
// }

// export type ComputeDefaultMap<T> = {
//   _default: ComputeFunc<T>
//   [key: string]: ComputeFunc<T>
// }

// export type Compute<T> = ComputeFunc<T> | ComputeDefaultMap<T>

export interface IDataItem<T> {
  id: string
  availableValues?: T[]
  default?: (() => T) | T // TODO: Promise<T>
  compute?: ComputeFunc<T> // TODO: Promise<T>
  update?: UpdateReq
}

export function isFormula<T>(compute: ComputeFunc<T>): compute is ComputeFormula {
  return isString(compute)
}

export function isFuncDef<T>(compute: ComputeFunc<T>): compute is ComputeBase<T> {
  return isObject(compute)
    && isFunction(compute.func)
    && isArray(compute.dependsOn)
}

// export function isComputeDefMap<T>(compute: ComputeFunc<T>): compute is ComputeDefaultMap<T> {
//   return isObject(compute)
//     && every(compute, (v: ComputeFunc<T>) => isFormula(v) || isFuncDef(v))
// }
