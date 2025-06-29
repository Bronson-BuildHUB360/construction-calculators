"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { CalculatorData } from "@/lib/types"
import { defaultPurchasesValues } from "@/lib/defaults"
import { calculateValues, hasEnoughInfoToCalculate } from "@/lib/calculations"

export default function PurchasesCalculator() {
  const [currentData, setCurrentData] = useState<CalculatorData>({ ...defaultPurchasesValues, cost: 1.0 })
  const [previousData, setPreviousData] = useState<CalculatorData | null>(null)
  const [tempInputs, setTempInputs] = useState<Partial<CalculatorData>>({})
  const [userEnteredFields, setUserEnteredFields] = useState<Set<keyof CalculatorData>>(new Set())
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleInputChange = (field: keyof CalculatorData, value: string) => {
    if (field === "cost") return // Cost is locked at 1.00

    const numValue = value === "" ? 0 : Number.parseFloat(value)
    setTempInputs((prev) => ({ ...prev, [field]: numValue }))
    setUserEnteredFields((prev) => new Set(prev).add(field))
  }

  const handleCalculate = () => {
    const updatedData = { ...currentData, ...tempInputs, cost: 1.0 }

    if (!hasEnoughInfoToCalculate(updatedData)) {
      setValidationError("Please enter at least one value to perform calculations.")
      return
    }

    setValidationError(null)
    setPreviousData(currentData)

    const calculatedData = calculateValues(updatedData)
    setCurrentData(calculatedData)
    setTempInputs({})
  }

  const handleClear = () => {
    setPreviousData(currentData)
    setCurrentData({ ...defaultPurchasesValues, cost: 1.0 })
    setTempInputs({})
    setUserEnteredFields(new Set())
    setValidationError(null)
  }

  const handleBack = () => {
    if (previousData) {
      setCurrentData(previousData)
      setPreviousData(null)
      setTempInputs({})
      setUserEnteredFields(new Set())
      setValidationError(null)
    }
  }

  const getDisplayValue = (field: keyof CalculatorData) => {
    if (field === "cost") return "1.00"

    if (tempInputs[field] !== undefined) {
      return tempInputs[field]?.toString() || ""
    }

    if (field === "markup" || field === "margin") {
      return currentData[field].toFixed(1)
    }
    return currentData[field].toFixed(2)
  }

  const inputClass = (field: keyof CalculatorData) => {
    if (field === "cost") return "text-gray-500"

    let className = userEnteredFields.has(field) ? "text-blue-600" : "text-gray-500"
    if (validationError && !userEnteredFields.has(field)) {
      className += " border-red-500"
    }
    return className
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Purchases</h2>

      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {(["cost", "markup", "profit", "charge", "margin"] as const).map((field) => (
          <div key={field}>
            <Label htmlFor={`purchases-${field}`}>
              {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
              {field === "cost" || field === "profit" || field === "charge" ? "($)" : "(%)"}
            </Label>
            <Input
              id={`purchases-${field}`}
              type="number"
              value={getDisplayValue(field)}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={inputClass(field)}
              disabled={field === "cost"}
              min="0"
              step={field === "markup" || field === "margin" ? "0.1" : "0.01"}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <Button onClick={handleClear} variant="outline">
          Clear
        </Button>
        <Button onClick={handleBack} variant="outline" disabled={!previousData}>
          Back
        </Button>
        <Button onClick={handleCalculate}>Calculate</Button>
      </div>
    </div>
  )
}
