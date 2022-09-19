# Wizzard Stepper 2.0

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

```ts
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

```ts
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

```ts
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

# TODO

## Stepper Mode

Je možné zvolit dva typy módu stepperu.

- `REVEAL_ALL` - Stepper zobrazí všechny kroky "on mount"
- `REVEAL_EACH` - Stepper zobrazí kroky postupně, podle toho jak jsou vyplňovány
