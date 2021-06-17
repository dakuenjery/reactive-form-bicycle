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
