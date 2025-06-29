"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CalculatorData } from "@/lib/types"
import { calculateValues } from "@/lib/calculations"

interface CalculatorSectionProps {
  title: string
  data: CalculatorData
  setData: (data: CalculatorData) => void
  isRequired: boolean
  previewMode: boolean
  isPurchase?: boolean
}

export default function CalculatorSection({
  title,
  data,
  setData,
  isRequired,
  previewMode,
  isPurchase = false,
}: CalculatorSectionProps) {
  const [localData, setLocalData] = useState(data)
  const [isLabourCostEmpty, setIsLabourCostEmpty] = useState(isRequired && data.cost === 0)
  const [tempInputs, setTempInputs] = useState<Partial<CalculatorData>>({})
  const [userEnteredFields, setUserEnteredFields] = useState<Set<keyof CalculatorData>>(new Set())

  useEffect(() => {
    setLocalData(data)
    setIsLabourCostEmpty(isRequired && data.cost === 0)
  }, [data, isRequired])

  const handleInputChange = (field: keyof CalculatorData, value: string) => {
    setTempInputs((prev) => ({ ...prev, [field]: value }))
    setUserEnteredFields((prev) => new Set(prev).add(field))
    if (isPurchase) {
      handleCalculate(field, value)
    }
  }

  const handleCalculate = (field: keyof CalculatorData, value = "") => {
    let numValue: number

    if (field === "markup" || field === "margin") {
      numValue = Number.parseFloat(Number.parseFloat(value || tempInputs[field] || "0").toFixed(1))
    } else {
      numValue = Number.parseFloat(Number.parseFloat(value || tempInputs[field] || "0").toFixed(2))
    }

    if (isNaN(numValue)) numValue = 0

    if (field === "cost" && isRequired) {
      setIsLabourCostEmpty(numValue === 0)
    }

    const updatedData = { ...localData, [field]: numValue }
    if (isPurchase) {
      updatedData.cost = 1.0
    }
    const calculatedData = calculateValues(updatedData)
    setLocalData(calculatedData)
    setData(calculatedData)
    setTempInputs({})

    const newUserEnteredFields = new Set(userEnteredFields)
    Object.keys(calculatedData).forEach((key) => {
      if (key !== field && calculatedData[key as keyof CalculatorData] !== localData[key as keyof CalculatorData]) {
        newUserEnteredFields.delete(key as keyof CalculatorData)
      }
    })
    setUserEnteredFields(newUserEnteredFields)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, field: keyof CalculatorData) => {
    if (event.key === "Enter") {
      handleCalculate(field)
    }
  }

  const handleBlur = (field: keyof CalculatorData) => {
    handleCalculate(field)
  }

  const handleFocus = (field: keyof CalculatorData) => {
    if (!isPurchase || field !== "cost") {
      setTempInputs((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const inputClass = (field: keyof CalculatorData) => {
    let className = userEnteredFields.has(field) ? "text-blue-600" : "text-gray-500"
    if (isRequired && field === "cost" && isLabourCostEmpty) {
      className += " border-red-500"
    }
    return className
  }

  const formatValue = (field: keyof CalculatorData, value: number) => {
    if (field === "markup" || field === "margin") {
      return value.toFixed(1)
    }
    return value.toFixed(2)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        {(["cost", "markup", "profit", "charge", "margin"] as const).map((field) => (
          <div key={field}>
            <Label htmlFor={`${title}-${field}`}>
              {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
              {field === "cost" || field === "profit" || field === "charge" ? "($)" : "(%)"}
            </Label>
            <Input
              id={`${title}-${field}`}
              type="number"
              value={
                isPurchase && field === "cost"
                  ? "1.00"
                  : tempInputs[field] !== undefined
                    ? tempInputs[field]
                    : formatValue(field, localData[field])
              }
              onChange={(e) => handleInputChange(field, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              onBlur={() => handleBlur(field)}
              onFocus={() => handleFocus(field)}
              className={inputClass(field)}
              disabled={previewMode || (isPurchase && field === "cost")}
              min="0"
              step={field === "markup" || field === "margin" ? "0.1" : "0.01"}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
