import type { CalculatorData } from "./types"

export function calculateValues(data: Partial<CalculatorData>): CalculatorData {
  const { cost = 0, markup = 0, profit = 0, charge = 0, margin = 0 } = data

  const calculatedCost = cost
  let calculatedProfit = profit
  let calculatedCharge = charge
  let calculatedMarkup = markup
  let calculatedMargin = margin

  // If we have cost and one other field, we can calculate everything
  if (calculatedCost > 0) {
    if (markup > 0) {
      calculatedProfit = calculatedCost * (markup / 100)
      calculatedCharge = calculatedCost + calculatedProfit
      calculatedMargin = (calculatedProfit / calculatedCharge) * 100
    } else if (profit > 0) {
      calculatedCharge = calculatedCost + profit
      calculatedMarkup = (profit / calculatedCost) * 100
      calculatedMargin = (profit / calculatedCharge) * 100
    } else if (charge > 0) {
      calculatedProfit = charge - calculatedCost
      calculatedMarkup = (calculatedProfit / calculatedCost) * 100
      calculatedMargin = (calculatedProfit / charge) * 100
    } else if (margin > 0) {
      calculatedCharge = calculatedCost / (1 - margin / 100)
      calculatedProfit = calculatedCharge - calculatedCost
      calculatedMarkup = (calculatedProfit / calculatedCost) * 100
    }
  }

  return {
    cost: calculatedCost,
    markup: calculatedMarkup,
    profit: calculatedProfit,
    charge: calculatedCharge,
    margin: calculatedMargin,
  }
}
