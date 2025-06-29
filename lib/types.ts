export interface CalculatorData {
  cost: number
  markup: number
  profit: number
  charge: number
  margin: number
}

export interface DefaultValues {
  labour: CalculatorData
  purchases: CalculatorData
}

export type CalculatorField = keyof CalculatorData

export interface LabourInput {
  cost: number
  selectedField: CalculatorField | null
  selectedValue: number
}

export interface PurchasesInput {
  selectedField: CalculatorField | null
  selectedValue: number
}

export interface CalculationResults {
  labour: CalculatorData
  purchases: CalculatorData
}
