import { useEffect, useMemo } from 'react'
import { WizzardInternalStep } from './types'

export const WizzardStep: WizzardInternalStep = ({
  children,
  step,
  isActive,
  isSelected,
  Renderer,
  stepIndex,
  setStep,
  registerStep,
  unregisterStep,
}) => {
  useEffect(() => {
    registerStep({ key: step.name, label: step.label, requires: step.requires, completed: false })

    return () => {
      unregisterStep(step.name)
    }
  }, [step.name])

  return useMemo(() => {
    return (
      <Renderer
        stepIndex={stepIndex}
        setStep={setStep}
        isActive={isActive}
        isSelected={isSelected}
        step={step as any}
      >
        {children}
      </Renderer>
    )
  }, [Renderer, stepIndex, children, isActive, isSelected, step, setStep])
}
