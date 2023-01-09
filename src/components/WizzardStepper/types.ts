import React from 'react'
import { DeepPartial, Unionize } from 'utility-types'
import {
  PathName,
  WizzardStepItem,
  WizzardStepItemExtended,
  WizzardValue,
  WizzardStepProps,
  WizzardErrors,
  StepContentRendererFc,
} from './publicTypes'

export type WizzardData<T extends WizzardValue> = DeepPartial<T>

export type WizzardInternalContext<T extends WizzardValue> = {
  _data: DeepPartial<T>
  _errors: WizzardErrors<T>
  activeStep: PathName<T>
  activeStepIndex: number
  originalSteps: WizzardStepItem<T>[]
  registeredSteps: WizzardStepItemExtended<T>[]
  registeredStepsRef: React.MutableRefObject<WizzardStepItemExtended<T>[]>
  setActiveStep: (step: PathName<T>) => boolean
  getStepIndex: (step: PathName<T>) => number
  registerStep: (step: WizzardStepItemExtended<T>) => void
  updateStep: (key: PathName<T>, step: Omit<Partial<WizzardStepItemExtended<T>>, 'key'>) => void
  isStepAvailable: (key: PathName<T>) => boolean
  isStepLast: (key: PathName<T>) => boolean
  unregisterStep: (step: PathName<T>) => void
  updateDataCache: <Key extends PathName<T>>(
    key: Key,
    data: DeepPartial<T>[Key],
    replace?: boolean
  ) => void
  updateErrorsCache: (errors: WizzardErrors<T>, replace?: boolean) => void
  submit: (data: Unionize<Required<DeepPartial<T>>>) => Promise<WizzardErrors<T>> | WizzardErrors<T>
  isReady: boolean
}

export type WizzardInternalStepProps<
  T extends WizzardValue,
  Key extends PathName<T> = PathName<T>
> = Pick<WizzardInternalContext<T>, 'registerStep' | 'unregisterStep'> & {
  Renderer: StepContentRendererFc<T>
  step: WizzardStepProps<T, Key>
  stepIndex: number
  isActive: boolean
  isSelected: boolean
  setStep: () => void
  children?: React.ReactNode
}

export type WizzardInternalStep = <T extends WizzardValue, Key extends PathName<T> = PathName<T>>(
  props: WizzardInternalStepProps<T, Key>
) => React.ReactElement | null
