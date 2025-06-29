import type { CalculatorData } from "./types"

export function calculateValues(data: CalculatorData): CalculatorData {
  const { cost, markup, profit, charge, margin } = data

  let calculatedProfit = profit
  let calculatedCharge = charge
  let calculatedMarkup = markup
  let calculatedMargin = margin

  if (cost > 0) {
    if (markup > 0) {
      calculatedProfit = cost * (markup / 100)
      calculatedCharge = cost + calculatedProfit
      calculatedMargin = (calculatedProfit / calculatedCharge) * 100
    } else if (profit > 0) {
      calculatedCharge = cost + profit
      calculatedMarkup = (profit / cost) * 100
      calculatedMargin = (profit / calculatedCharge) * 100
    } else if (charge > 0) {
      calculatedProfit = charge - cost
      calculatedMarkup = (calculatedProfit / cost) * 100
      calculatedMargin = (calculatedProfit / charge) * 100
    } else if (margin > 0) {
      calculatedCharge = cost / (1 - margin / 100)
      calculatedProfit = calculatedCharge - cost
      calculatedMarkup = (calculatedProfit / cost) * 100
    }
  }

  return {
    cost,
    markup: calculatedMarkup,
    profit: calculatedProfit,
    charge: calculatedCharge,
    margin: calculatedMargin,
  }
}

export function hasEnoughInfoToCalculate(data: CalculatorData): boolean {
  const { cost, markup, profit, charge, margin } = data

  // For Labour calculator, we need at least two values
  if (cost > 0) {
    return markup > 0 || profit > 0 || charge > 0 || margin > 0
  }

  // For Purchases calculator, cost is always 1.00, so we need at least one other value
  return markup > 0 || profit > 0 || charge > 0 || margin > 0
}
