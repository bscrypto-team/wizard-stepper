import { clone, debounce, merge } from 'lodash'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { findElement } from '~/helpers/findElement'
import {
  PathName,
  StepContentRendererFc,
  WizzardErrors,
  WizzardStepError,
  WizzardStepItemExtended,
  WizzardStepperFactoryOptions,
  WizzardStepperProviderProps,
  WizzardStepProps,
  WizzardStepRequiresEnum,
  WizzardUseStepReturnType,
  WizzardUseWizzardReturnType,
  WizzardValue,
} from './publicTypes'
import { WizzardInternalContext } from './types'
import { WizzardStep } from './WizzardStep'

const EmptyRenderer: React.FC = ({ children }) => <>{children}</>

export class WizzardStepperFactory<T extends WizzardValue> {
  private context: React.Context<WizzardInternalContext<T> | null>
  private options: WizzardStepperFactoryOptions<T>
  private DEFAULT_STEP_REQUIRES = WizzardStepRequiresEnum.STEP_BEFORE

  constructor(options: WizzardStepperFactoryOptions<T>) {
    this.options = options
    this.context = React.createContext<WizzardInternalContext<T> | null>(null)
  }

  private useInternalContext = () => {
    const ctx = useContext(this.context)

    if (!ctx) throw new Error('Missing WizzardStepperProvider')

    return ctx
  }

  public useWizzardContext = (): WizzardUseWizzardReturnType<T> => {
    const { _errors, _data, registeredStepsRef, activeStep, setActiveStep } =
      this.useInternalContext()

    const nextStep = useCallback(() => {
      const foundStep = registeredStepsRef.current.findIndex((step) => step.key === activeStep)

      if (foundStep === -1) return

      const next = registeredStepsRef.current[foundStep + 1]

      next.key && setActiveStep(next.key)
    }, [setActiveStep, activeStep])

    return useMemo(
      () => ({
        _data,
        _errors,
        nextStep,
        setStep: setActiveStep,
      }),
      [_errors, _data, nextStep, setActiveStep]
    )
  }

  public useStepContext = <Key extends PathName<T>>(key: Key): WizzardUseStepReturnType<T, Key> => {
    const { nextStep } = this.useWizzardContext()
    const { _data, _errors, updateDataCache, updateErrorsCache, submit, updateStep } =
      this.useInternalContext()
    const stepData = _data[key]
    const stepErrors = _errors[key]

    const dataRef = useRef(stepData)
    const errorsRef = useRef(stepErrors)

    const updateData = useCallback<WizzardUseStepReturnType<T, Key>['updateData']>(
      (data, replace) => {
        updateDataCache(key, data, replace)
      },
      [updateDataCache, key]
    )

    const submitData = useCallback<WizzardUseStepReturnType<T, Key>['submitData']>(
      async (data) => {
        if (data) {
          updateDataCache(key, data)
        }

        const result = await submit({ [key]: merge(clone(dataRef.current), data ?? {}) } as any)

        if (!result[key]?.length) {
          updateStep(key, { completed: true })
          nextStep()
        }

        updateErrorsCache(result)
      },
      [submit, updateDataCache, updateErrorsCache, nextStep, updateStep, key]
    )

    useEffect(() => {
      dataRef.current = stepData
      errorsRef.current = stepErrors
    }, [stepData, stepErrors])

    return useMemo(
      () => ({
        _data: stepData,
        _errors: stepErrors,
        updateData,
        submitData,
      }),
      [stepData, stepErrors, updateData, submitData]
    )
  }

  public Step = <Key extends PathName<T> = PathName<T>>(
    props: WizzardStepProps<T, Key> & { children?: React.ReactNode }
  ) => {
    const {
      registerStep,
      unregisterStep,
      activeStep,
      isStepAvailable,
      setActiveStep,
      getStepIndex,
    } = this.useInternalContext()

    const step = this.options.steps.find((s) => s.key === props.name)

    const Renderer = this.options.StepContentRenderer ?? (EmptyRenderer as StepContentRendererFc<T>)

    const isActive = isStepAvailable(props.name)
    const stepIndex = getStepIndex(props.name)

    const setStep = useCallback(() => {
      setActiveStep(props.name)
    }, [setActiveStep, props.name])

    return useMemo(
      () => (
        <WizzardStep
          {...(step ?? {})}
          {...props}
          step={{ ...step, ...props }}
          stepIndex={stepIndex}
          Renderer={Renderer}
          isActive={isActive}
          isSelected={activeStep === props.name}
          setStep={setStep}
          registerStep={registerStep}
          unregisterStep={unregisterStep}
        ></WizzardStep>
      ),
      [
        props,
        isActive,
        stepIndex,
        setStep,
        Renderer,
        step,
        activeStep,
        registerStep,
        unregisterStep,
      ]
    )
  }

  private StepperHeaderItem: React.VFC<{ step: WizzardStepItemExtended<T> }> = ({ step }) => {
    const { isStepAvailable, activeStep } = this.useInternalContext()
    const { setStep } = this.useWizzardContext()

    const isAvailable = isStepAvailable(step.key)

    const _setStep = useCallback(() => {
      setStep(step.key)
    }, [setStep, step.key])

    if (!this.options.StepRenderer) return null

    return (
      <this.options.StepRenderer
        step={step}
        isActive={isAvailable}
        isSelected={activeStep === step.key}
        setStep={_setStep}
      />
    )
  }

  public StepperHeader: React.VFC = () => {
    const { registeredSteps, activeStep, activeStepIndex } = this.useInternalContext()

    const Renderer = this.options.HeaderRenderer ?? EmptyRenderer

    return (
      <Renderer activeStep={activeStep} activeStepIndex={activeStepIndex}>
        {registeredSteps.map((step) => (
          <this.StepperHeaderItem key={step.key} step={step} />
        ))}
      </Renderer>
    )
  }

  public Provider: React.FC<React.PropsWithChildren<WizzardStepperProviderProps<T>>> = ({
    children,
    defaultValues,
    handleSubmit,
  }) => {
    const [dataCache, setData] = useState(defaultValues)
    const [errorsCache, setErrors] = useState<WizzardErrors<T>>({})

    const [activeStep, setActiveStep] = useState(this.options.steps[0].key)

    const submitRef = useRef(handleSubmit)
    const stepsRef = useRef<WizzardStepItemExtended<T>[]>([])
    const dataCacheRef = useRef(dataCache)
    const errorsCacheRef = useRef(errorsCache)

    const [registeredSteps, setRegisteredSteps] = useState<WizzardStepItemExtended<T>[]>([])
    const [isReady, setIsReady] = useState(false)

    const updateSteps = useMemo(
      () =>
        debounce(() => {
          setRegisteredSteps([...stepsRef.current.map((e) => ({ ...e }))])
          setIsReady(true)
        }, 75),
      []
    )

    const registerStep = useCallback<WizzardInternalContext<T>['registerStep']>(
      (newStep) => {
        const foundStep = stepsRef.current.findIndex((step) => step.key === newStep.key)

        if (foundStep !== -1) {
          // eslint-disable-next-line no-console
          console.error(`Step '${newStep.key}' already exists`)
          return
        }

        stepsRef.current.push({ ...newStep })

        updateSteps()
      },
      [updateSteps]
    )
    const unregisterStep = useCallback<WizzardInternalContext<T>['unregisterStep']>(
      (key) => {
        const foundStep = stepsRef.current.findIndex((step) => step.key === key)

        if (foundStep === -1) {
          return
        }

        stepsRef.current.splice(foundStep, 1)

        updateSteps()
      },
      [updateSteps]
    )

    const updateStep = useCallback<WizzardInternalContext<T>['updateStep']>(
      (key, step) => {
        const foundStep = stepsRef.current.findIndex((step) => step.key === key)

        if (foundStep === -1) {
          return
        }

        stepsRef.current[foundStep] = {
          ...stepsRef.current[foundStep],
          ...step,
        }

        updateSteps()
      },
      [updateSteps]
    )

    const isStepAvailable = useCallback<WizzardInternalContext<T>['isStepAvailable']>((step) => {
      const foundStep = stepsRef.current.findIndex((s) => s.key === step)

      if (foundStep === -1) {
        return false
      }

      const currentStep = stepsRef.current[foundStep]

      if (foundStep === 0) {
        return true
      }

      if (currentStep.completed) {
        return true
      }

      switch (currentStep.requires || this.DEFAULT_STEP_REQUIRES) {
        case WizzardStepRequiresEnum.NONE: {
          return true
        }
        case WizzardStepRequiresEnum.STEP_BEFORE: {
          const before = stepsRef.current[foundStep - 1]

          return before.completed
        }
        case WizzardStepRequiresEnum.ALL_BEFORE: {
          // TODO: implement logic
        }
      }
      return false
    }, [])

    const _setActiveStep = useCallback(
      (key: PathName<T>) => {
        if (isStepAvailable(key)) {
          setActiveStep(key)

          return true
        }

        return false
      },
      [isStepAvailable]
    )

    const updateDataCache = useCallback<WizzardInternalContext<T>['updateDataCache']>(
      (key, data, replace) => {
        setData((prev) => {
          let newState = prev
          if (replace) {
            newState = { ...prev, [key]: data }
          } else {
            newState = merge(clone(prev), { [key]: data })
          }
          dataCacheRef.current = newState

          return newState
        })
      },
      []
    )
    const updateErrorsCache = useCallback<WizzardInternalContext<T>['updateErrorsCache']>(
      (errors, replace) => {
        setErrors((prev) => {
          let newState = prev
          if (replace) {
            newState = { ...errors }
          } else {
            newState = { ...prev, ...errors }
          }
          errorsCacheRef.current = newState

          return newState
        })
      },
      []
    )

    const submit = useCallback<WizzardInternalContext<T>['submit']>(
      async (data) => {
        let _errors: WizzardErrors<T> = {}
        let shouldClearErrors = false
        const setErrors = (errors: WizzardStepError[], key: PathName<T>) => {
          if (!_errors[key]) {
            _errors[key] = []
          }

          _errors[key]?.push(...errors)
        }

        await submitRef.current(data, dataCacheRef.current, {
          setErrors,
          setStep: isStepAvailable,
          clearPreviousErrors: (clearAll?: boolean) => {
            shouldClearErrors = true

            if (clearAll) {
              _errors = {}
            }
          },
        })

        if (shouldClearErrors) {
          return _errors
        }

        return { ...errorsCacheRef.current, ..._errors }
      },
      [isStepAvailable]
    )

    const getStepIndex = useCallback((key: PathName<T>) => {
      return stepsRef.current.findIndex((i) => i.key === key)
    }, [])

    const activeStepIndex = useMemo(() => {
      return registeredSteps.findIndex((i) => i.key === activeStep)
    }, [activeStep, registeredSteps])

    useEffect(() => {
      submitRef.current = handleSubmit
      dataCacheRef.current = dataCache
      errorsCacheRef.current = errorsCache
    }, [handleSubmit, dataCache, errorsCache])

    const ctxValue = useMemo<WizzardInternalContext<T>>(
      () => ({
        _data: dataCache,
        _errors: errorsCache,
        activeStep,
        activeStepIndex,
        originalSteps: this.options.steps,
        registeredSteps,
        registeredStepsRef: stepsRef,
        getStepIndex,
        setActiveStep: _setActiveStep,
        isStepAvailable,
        registerStep,
        updateStep,
        unregisterStep,
        updateDataCache,
        updateErrorsCache,
        submit,
        isReady,
      }),
      [
        getStepIndex,
        isStepAvailable,
        _setActiveStep,
        registerStep,
        unregisterStep,
        updateStep,
        updateDataCache,
        updateErrorsCache,
        submit,
        activeStep,
        activeStepIndex,
        registeredSteps,
        isReady,
        dataCache,
        errorsCache,
      ]
    )

    const Renderer = this.options.ProviderRenderer ?? EmptyRenderer

    const content = useMemo(
      () => (
        <this.context.Provider value={ctxValue}>
          <Renderer activeStep={ctxValue.activeStep} activeStepIndex={ctxValue.activeStepIndex}>
            {children}
          </Renderer>
        </this.context.Provider>
      ),
      [ctxValue, children, Renderer]
    )

    useEffect(() => {
      const found = findElement(content, this.Step)

      if (found) {
        setActiveStep(found.props.name)
      }
    }, [])

    return content
  }
}
