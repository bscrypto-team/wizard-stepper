# Wizzard Stepper

## Disclaimer !

This project is experimental and is being tested for now

## Intro

For stepper creation, use `WizzardStepperFactory` class. There is required parameter called `steps` which defines all the basic steps for Stepper

```ts
const Factory = new WizzardStepperFactory({
  steps: [
    { key: 'info', label: 'Contant info' },
    { key: 'payment', label: 'Payment info' },
  ],
})
```

It's also possible to define `requires` param, with the value of:

- `ALL_BEFORE` - All preceding steps must be finished
- `STEP_BEFORE` - The step preceding this step must be finished
- `NONE` - Step is always enabled

Default is `STEP_BEFORE`

```ts
const Factory = new WizzardStepperFactory({
  steps: [
    { key: 'info', label: 'Contant info' },
    { key: 'payment', label: 'Payment info', requires: WizzardStepRequiresEnum.ALL_BEFORE },
    { key: 'recap', label: 'Recap', requires: WizzardStepRequiresEnum.NONE },
  ],
})
```

## Usage - Step

For correct behaviour, given part of application push be wrapped with Provider from `WizzardStepperFactory`, like so:

```tsx
// src/App.tsx

import { Stepper } from './Stepper'

const App: React.VFC = () => {
  return (
    <Factory.Provider>
      <Stepper />
    </Factory.Provider>
  )
}
```

For Stepper to register that given step exists, `<Step>` component must be used. Stepper does not display steps without it being explicitly defined with `<Step>` component

```tsx
// src/Stepper.tsx

import { InfoStep } from './InfoStep'

export const Stepper: React.VFC = () => {
  return (
    <Factory.Step name="info">
      <InfoStep />
    </Factory.Step>
  )
}
```

You can also access the step context inside of the given Step, or you can access wizzards context

```tsx
// src/InfoStep.tsx

import { InfoStep } from './InfoStep';

export const InfoStep: React.VFC = () => {
  const ctx = Factory.useStepContext('info');
  const wizzardCtx = Factory.useWizzardContext()

  return (
    ...
  )
};
```

## Minimal example

```tsx
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

const WizardProcess: React.FC = () => {
    const handleSubmit: WizzardStepperHandleSubmit<NewFormType> = (values, allValues) => {
        // eslint-disable-next-line no-console
        console.log('SUBMIT', values, { ...allValues })
    }

    const onStepChange: WizzardStepperOnStepChange<NewFormType> = (step) => {
        // eslint-disable-next-line no-console
        console.log(step)
    }
    
    return (
        <Factory.Provider defaultValues={{}} handleSubmit={handleSubmit} onStepChange={onStepChange}>
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
```

# TODO

## Stepper Mode

Je možné zvolit dva typy módu stepperu.

- `REVEAL_ALL` - Stepper zobrazí všechny kroky "on mount"
- `REVEAL_EACH` - Stepper zobrazí kroky postupně, podle toho jak jsou vyplňovány
