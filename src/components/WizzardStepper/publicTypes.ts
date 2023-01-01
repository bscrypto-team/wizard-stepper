import React from 'react'
import { DeepPartial, Unionize } from 'utility-types'
import { Primitive } from '~/types'

export type WizzardValue = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
}

export type PathName<T extends WizzardValue> = Extract<keyof T, Primitive>

export enum WizzardStepRequiresEnum {
  ALL_BEFORE = '__ALL_BEFORE__',
  STEP_BEFORE = '__STEP_BEFORE__',
  NONE = '__NONE__',
}

export type WizzardStepItem<T extends WizzardValue> = {
  key: PathName<T>
  label: React.ReactNode
  requires?: WizzardStepRequiresEnum
}

export type WizzardStepItemExtended<T extends WizzardValue> = WizzardStepItem<T> & {
  completed: boolean
}

export type WizzardStepperProviderSubmitHelperProps<T extends WizzardValue> = {
  setErrors: (errors: WizzardStepError[], key: PathName<T>) => void
  /**
   * @description Clear all errors from previous submit
   * @param clearAll - if `true` clears all errors (errors from previous submit and also all errors saved with `setErrors` function)
   */
  clearPreviousErrors: (clearAll?: boolean) => void
  /**
   * @description Set active step
   */
  setStep: (key: PathName<T>) => boolean
}

export type WizzardStepperHandleSubmit<T extends WizzardValue> = (
  data: Unionize<Required<DeepPartial<T>>>,
  allValues: DeepPartial<T>,
  helpers: WizzardStepperProviderSubmitHelperProps<T>
) => Promise<void> | void

export type WizzardStepperProviderProps<T extends WizzardValue> = {
  defaultValues: DeepPartial<T>
  handleSubmit: WizzardStepperHandleSubmit<T>
}

export type StepRendererProps<T extends WizzardValue = WizzardValue> = {
  step: WizzardStepItemExtended<T>
  setStep: () => void
  isSelected: boolean
  isActive: boolean
  isLast: boolean
  stepNumber: number
}
export type StepRendererFc<T extends WizzardValue = WizzardValue> = React.VFC<StepRendererProps<T>>

export type HeaderRendererProps<T extends WizzardValue = WizzardValue> = {
  children?: React.ReactNode
  activeStep: PathName<T>
  activeStepIndex: number
}
export type HeaderRendererFc<T extends WizzardValue = WizzardValue> = React.VFC<
  HeaderRendererProps<T>
>
export type StepContentRendererProps<T extends WizzardValue = WizzardValue> = {
  children?: React.ReactNode
  step: WizzardStepItemExtended<T>
  stepIndex: number
  setStep: () => void
  isSelected: boolean
  isActive: boolean
}
export type StepContentRendererFc<T extends WizzardValue = WizzardValue> = React.VFC<
  StepContentRendererProps<T>
>
export type ProviderRendererProps<T extends WizzardValue = WizzardValue> = {
  children?: React.ReactNode
  activeStep: PathName<T>
  activeStepIndex: number
}
export type ProviderRendererFc<T extends WizzardValue> = React.VFC<ProviderRendererProps<T>>

export type WizzardStepperFactoryOptions<T extends WizzardValue> = {
  steps: WizzardStepItem<T>[]
  StepRenderer?: StepRendererFc<T>
  HeaderRenderer?: HeaderRendererFc<T>
  StepContentRenderer?: StepContentRendererFc<T>
  ProviderRenderer?: ProviderRendererFc<T>
}

export type WizzardStepProps<T extends WizzardValue, Key extends PathName<T> = PathName<T>> = {
  name: Key
  label?: React.ReactNode
  requires?: WizzardStepRequiresEnum
}

export type WizzardStepError = {
  message: string
}
export type WizzardErrors<T extends WizzardValue> = Partial<Record<PathName<T>, WizzardStepError[]>>

export type WizzardUseStepReturnType<
  T extends WizzardValue,
  Key extends PathName<T> = PathName<T>
> = {
  /**
   * @description Cached data for defined step
   */
  _data: DeepPartial<T>[Key]
  /**
   * @description Cached errors for given step
   */
  _errors: WizzardErrors<T>[Key]
  /**
   * @description Update cached data
   * @param data - Data
   * @param replace - if true - replace all cached data for defined step, if not - merge it with already cached data
   */
  updateData: (data: DeepPartial<T>[Key], replace?: boolean) => void
  /**
   * @description Updates and/or submit the data - this wil trigger validations
   */
  submitData: (data?: DeepPartial<T>[Key]) => Promise<void> | void
}

export type WizzardUseWizzardReturnType<T extends WizzardValue> = {
  /**
   * @description Cached data
   */
  _data: DeepPartial<T>
  /**
   * @description Cached errors
   */
  _errors: WizzardErrors<T>
  /**
   * @description
   */
  nextStep: (skipValidations?: void) => void

  /**
   * @description Set to defined step
   *
   * @returns Returns if set was successful
   */
  setStep: (key: PathName<T>) => boolean
}
