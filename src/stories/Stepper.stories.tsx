import { Meta, Story } from '@storybook/react'
import { WizzardStepperFactory, WizzardStepperHandleSubmit } from '../components'

type NewFormType = {
  first: { first: number }
  second: { second: number }
  third: { third: number }
}

const Factory = new WizzardStepperFactory<NewFormType>({
  steps: [
    { key: 'first', label: 'First step' },
    { key: 'second', label: 'Second step' },
    { key: 'third', label: 'Third step' },
  ],
  HeaderRenderer: ({ children }) => {
    return <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
  },
  StepRenderer: ({ step, isActive, setStep }) => {
    return (
      <>
        <button disabled={!isActive} onClick={() => setStep()}>
          {step.label}
        </button>
      </>
    )
  },
  StepContentRenderer: ({ isSelected, children }) => {
    if (!isSelected) return null

    return <>{children}</>
  },
  ProviderRenderer: ({ children }) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {children}
      </div>
    )
  },
})

const _First = () => {
  const { submitData } = Factory.useStepContext('first')
  return (
    <>
      <button onClick={() => submitData({ first: 200 })}>Next</button>
    </>
  )
}
const _Second = () => {
  const { submitData } = Factory.useStepContext('second')
  return (
    <>
      <button onClick={() => submitData()}>Next 2</button>
    </>
  )
}
const _Third = () => {
  const { submitData } = Factory.useStepContext('third')
  return (
    <>
      <button onClick={() => submitData()}>Finish</button>
    </>
  )
}

const NewWizzardTemplate: Story = () => {
  const handleSubmit: WizzardStepperHandleSubmit<NewFormType> = (values, allValues) => {
    // eslint-disable-next-line no-console
    console.log('SUBMIT', values, { ...allValues })
  }
  return (
    <Factory.Provider defaultValues={{}} handleSubmit={handleSubmit}>
      <Factory.StepperHeader />

      <Factory.Step name="first">
        <_First />
      </Factory.Step>

      <Factory.Step name="second">
        <_Second />
      </Factory.Step>

      <Factory.Step name="third">
        <_Third />
      </Factory.Step>
    </Factory.Provider>
  )
}

export const NewWizzard = NewWizzardTemplate.bind({})
NewWizzard.storyName = 'Wizzard 2.0'

export default {
  title: 'WizzardStepper',
} as Meta
