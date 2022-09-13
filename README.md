# Wizzard Stepper 2.0

TODO: Make docs

## Usage:

Pro vytvoření stepperu se používá `WizzardStepperFactory` class, kde hlavní parametr jsou `steps` které definují základní kroky ve Stepperu (pořadí je důležité)

```ts
const Factory = new WizzardStepperFactory({
  steps: [
    { key: 'info', label: 'Contant info' },
    { key: 'payment', label: 'Payment info' },
  ],
})
```

Je také možné definovat `requires` parametr, který může dostat dva parametry

- `ALL_BEFORE` - všechny předchozí kroky musí být vyplněný
- `STEP_BEFORE` - krok který předchází danému kroku musí být vyplněný
- `NONE` - krok je vždy povolen

Výchozí nastavení je `STEP_BEFORE`

```ts
const Factory = new WizzardStepperFactory({
  steps: [
    { key: 'info', label: 'Contant info' },
    { key: 'payment', label: 'Payment info', requires: WizzardStepRequiresEnum.ALL_BEFORE },
    { key: 'recap', label: 'Recap', requires: WizzardStepRequiresEnum.NONE },
  ],
})
```

# ?????? Experimental ??????

## Stepper Mode

Je možné zvolit dva typy módu stepperu.

- `REVEAL_ALL` - Stepper zobrazí všechny kroky "on mount"
- `REVEAL_EACH` - Stepper zobrazí kroky postupně, podle toho jak jsou vyplňovány

# ?????? Experimental END ??????

## Usage - Step

Pro správné fungování, daná část aplikace musí být obalená Providerem z `WizzardStepperFactory`

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

Pro to aby Stepper vůbec zaregistroval že daný step existuje, musí být použitá `<Step>` komponenta. Stepper standardně kroky nezobrazí pokud nejsou explicitně definovány, takže daný příklad níže nám pouze v hlavičce zobrazí krok s `info` (`payment` a `recap` nejsou zobrazeny ani potom co `info` je vyplněno)

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

Dále pak stačí v dané komponentě přistoupit ke contextu

```ts
// src/InfoStep.tsx

import { InfoStep } from './InfoStep';

export const InfoStep: React.VFC = () => {
  const ctx = Factory.useStepContext('info');

  return (
    ...
  )
};
```
