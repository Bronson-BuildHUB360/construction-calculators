"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HourDayToggle } from "./hour-day-toggle"
import type { CalculatorData } from "@/lib/types"
import { defaultLabourValues } from "@/lib/defaults"
import { calculateValues, hasEnoughInfoToCalculate } from "@/lib/calculations"

export default function LabourCalculator() {
  const [currentData, setCurrentData] = useState<CalculatorData>(defaultLabourValues)
  const [previousData, setPreviousData] = useState<CalculatorData | null>(null)
  const [tempInputs, setTempInputs] = useState<Partial<CalculatorData>>({})
  const [userEnteredFields, setUserEnteredFields] = useState<Set<keyof CalculatorData>>(new Set())
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isDay, setIsDay] = useState(false)

  const handleInputChange = (field: keyof CalculatorData, value: string) => {
    const numValue = value === "" ? 0 : Number.parseFloat(value)
    setTempInputs((prev) => ({ ...prev, [field]: numValue }))
    setUserEnteredFields((prev) => new Set(prev).add(field))
  }

  const handleCalculate = () => {
    const updatedData = { ...currentData, ...tempInputs }

    if (!hasEnoughInfoToCalculate(updatedData)) {
      setValidationError("Please enter at least two values to perform calculations.")
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
    setCurrentData(defaultLabourValues)
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
    if (tempInputs[field] !== undefined) {
      return tempInputs[field]?.toString() || ""
    }

    let value = currentData[field]
    if (isDay && (field === "cost" || field === "charge" || field === "profit")) {
      value *= 8
    }

    if (field === "markup" || field === "margin") {
      return value.toFixed(1)
    }
    return value.toFixed(2)
  }

  const inputClass = (field: keyof CalculatorData) => {
    let className = userEnteredFields.has(field) ? "text-blue-600" : "text-gray-500"
    if (validationError && !userEnteredFields.has(field)) {
      className += " border-red-500"
    }
    return className
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Labour</h2>
        <HourDayToggle isDay={isDay} onToggle={setIsDay} />
      </div>

      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        {(["cost", "markup", "profit", "charge", "margin"] as const).map((field) => (
          <div key={field}>
            <Label htmlFor={`labour-${field}`}>
              {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
              {field === "cost" || field === "profit" || field === "charge" ? "($)" : "(%)"}
            </Label>
            <Input
              id={`labour-${field}`}
              type="number"
              value={getDisplayValue(field)}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className={inputClass(field)}
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
