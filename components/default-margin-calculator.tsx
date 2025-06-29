"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HourDayToggle } from "./hour-day-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CalculatorData } from "@/lib/types"
import { defaultLabourValues, defaultPurchasesValues } from "@/lib/defaults"
import CalculatorGrid from "./calculator-grid"
import { calculateValues } from "@/lib/calculator"

export default function DefaultMarginCalculator() {
  const [labourData, setLabourData] = useState<CalculatorData>(defaultLabourValues)
  const [purchasesData, setPurchasesData] = useState<CalculatorData>({ ...defaultPurchasesValues, cost: 1.0 })
  const [previousLabourData, setPreviousLabourData] = useState<CalculatorData | null>(null)
  const [previousPurchasesData, setPreviousPurchasesData] = useState<CalculatorData | null>(null)
  const [isDay, setIsDay] = useState(false)
  const [isLabourCostEntered, setIsLabourCostEntered] = useState(false)
  const [lastEnteredLabourField, setLastEnteredLabourField] = useState<keyof CalculatorData | null>(null)
  const [lastEnteredPurchasesField, setLastEnteredPurchasesField] = useState<keyof CalculatorData | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleClear = () => {
    setPreviousLabourData(labourData)
    setPreviousPurchasesData(purchasesData)
    setLabourData(defaultLabourValues)
    setPurchasesData({ ...defaultPurchasesValues, cost: 1.0 })
    setIsLabourCostEntered(false)
    setLastEnteredLabourField(null)
    setLastEnteredPurchasesField(null)
    setValidationError(null)
  }

  const handleBack = () => {
    if (previousLabourData) {
      setLabourData(previousLabourData)
      setIsLabourCostEntered(previousLabourData.cost > 0)
      // Preserve the fact that Labour Cost was entered
      setLastEnteredLabourField(previousLabourData.cost > 0 ? "cost" : null)
    }
    if (previousPurchasesData) {
      setPurchasesData(previousPurchasesData)
      // Don't set any last entered field for purchases when going back
      setLastEnteredPurchasesField(null)
    }
    setPreviousLabourData(null)
    setPreviousPurchasesData(null)
    setValidationError(null)
  }

  const handleCalculate = () => {
    // Check if Labour Cost is entered
    if (!isLabourCostEntered) {
      setValidationError("Labour Cost is required before calculating.")
      return
    }

    // Check if at least one other field is entered for Labour (besides cost)
    if (!lastEnteredLabourField || lastEnteredLabourField === "cost") {
      setValidationError("Please enter at least one field other than Cost for Labour calculations.")
      return
    }

    // Check if at least one field is entered for Purchases
    if (!lastEnteredPurchasesField) {
      setValidationError("Please enter at least one field for Purchases calculations.")
      return
    }

    // Check for zero values
    if (
      (lastEnteredLabourField && labourData[lastEnteredLabourField] === 0) ||
      (lastEnteredPurchasesField && purchasesData[lastEnteredPurchasesField] === 0)
    ) {
      setValidationError("Zero values are not allowed. Please enter a positive number.")
      return
    }

    setValidationError(null)

    // Store current state for back button
    setPreviousLabourData(labourData)
    setPreviousPurchasesData(purchasesData)

    // For Labour: Create a new object with only cost and the last entered field
    const labourInputData: Partial<CalculatorData> = {
      cost: labourData.cost,
    }
    if (lastEnteredLabourField && lastEnteredLabourField !== "cost") {
      labourInputData[lastEnteredLabourField] = labourData[lastEnteredLabourField]
    }

    // For Purchases: Create a new object with only cost (fixed at 1.00) and the last entered field
    const purchasesInputData: Partial<CalculatorData> = {
      cost: 1.0,
    }
    if (lastEnteredPurchasesField) {
      purchasesInputData[lastEnteredPurchasesField] = purchasesData[lastEnteredPurchasesField]
    }

    // Calculate all fields based on the input data
    const labourCalculated = calculateValues(labourInputData as CalculatorData)
    const purchasesCalculated = calculateValues(purchasesInputData as CalculatorData)

    setLabourData(labourCalculated)
    setPurchasesData(purchasesCalculated)
  }

  // This function is no longer used, but kept for reference
  const calculatePreservingFields = (
    data: CalculatorData,
    fieldsToPreserve: (keyof CalculatorData | null)[],
    isDay: boolean,
  ): CalculatorData => {
    // Create a copy of the data
    const result = { ...data }

    // Calculate all fields
    const calculatedData = calculateValues(data)

    // Update all fields except those to preserve
    Object.keys(calculatedData).forEach((key) => {
      if (!fieldsToPreserve.includes(key as keyof CalculatorData)) {
        result[key as keyof CalculatorData] = calculatedData[key as keyof CalculatorData]
      }
    })

    return result
  }

  const handleLabourDataChange = (newData: CalculatorData, enteredField?: keyof CalculatorData) => {
    if (isDay) {
      newData = {
        ...newData,
        cost: newData.cost / 8,
        charge: newData.charge / 8,
        profit: newData.profit / 8,
      }
    }

    // Don't allow zero values
    if (enteredField && newData[enteredField] === 0) {
      setValidationError("Zero values are not allowed. Please enter a positive number.")
      return
    }

    setLabourData(newData)
    setIsLabourCostEntered(newData.cost > 0)

    if (enteredField) {
      setLastEnteredLabourField(enteredField)
      setValidationError(null)
    }
  }

  const getDisplayLabourData = (): CalculatorData => {
    if (isDay) {
      return {
        ...labourData,
        cost: labourData.cost * 8,
        charge: labourData.charge * 8,
        profit: labourData.profit * 8,
      }
    }
    return labourData
  }

  const handlePurchasesDataChange = (newData: CalculatorData, enteredField?: keyof CalculatorData) => {
    // Don't allow zero values
    if (enteredField && enteredField !== "cost" && newData[enteredField] === 0) {
      setValidationError("Zero values are not allowed. Please enter a positive number.")
      return
    }

    setPurchasesData({ ...newData, cost: 1.0 })

    if (enteredField && enteredField !== "cost") {
      setLastEnteredPurchasesField(enteredField)
      setValidationError(null)
    }
  }

  // Determine which fields should be shown as user-entered (blue)
  const getLabourUserEnteredFields = (): Set<keyof CalculatorData> => {
    const fields = new Set<keyof CalculatorData>()

    // Labour Cost is always shown as user-entered if it has a value
    if (isLabourCostEntered) {
      fields.add("cost")
    }

    // Add the most recently entered field (if it's not cost)
    if (lastEnteredLabourField && lastEnteredLabourField !== "cost") {
      fields.add(lastEnteredLabourField)
    }

    return fields
  }

  const getPurchasesUserEnteredFields = (): Set<keyof CalculatorData> => {
    const fields = new Set<keyof CalculatorData>()

    // Add the most recently entered field
    if (lastEnteredPurchasesField) {
      fields.add(lastEnteredPurchasesField)
    }

    return fields
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Default Margin Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{isDay ? "Labour (Day)" : "Labour/hr"}</h2>
            <HourDayToggle isDay={isDay} onToggle={setIsDay} />
          </div>

          {validationError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertDescription>Complete one remaining field to calculate all values.</AlertDescription>
            </Alert>
          )}

          <CalculatorGrid
            data={getDisplayLabourData()}
            onChange={handleLabourDataChange}
            isPurchase={false}
            isLabourCostEntered={isLabourCostEntered}
            userEnteredFields={getLabourUserEnteredFields()}
          />

          <div className="pt-4">
            <h2 className="text-lg font-semibold mb-4">Purchases</h2>
            <CalculatorGrid
              data={purchasesData}
              onChange={handlePurchasesDataChange}
              isPurchase={true}
              isLabourCostEntered={true}
              userEnteredFields={getPurchasesUserEnteredFields()}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
            <Button onClick={handleBack} variant="outline" disabled={!previousLabourData && !previousPurchasesData}>
              Back
            </Button>
            <Button onClick={handleCalculate}>Calculate</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
