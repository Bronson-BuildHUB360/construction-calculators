"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CalculatorData } from "@/lib/types"

interface CalculatorGridProps {
  data: CalculatorData
  onChange: (data: CalculatorData, enteredField?: keyof CalculatorData) => void
  isPurchase: boolean
  isLabourCostEntered?: boolean
  userEnteredFields: Set<keyof CalculatorData>
}

export default function CalculatorGrid({
  data,
  onChange,
  isPurchase,
  isLabourCostEntered = true,
  userEnteredFields,
}: CalculatorGridProps) {
  const [localData, setLocalData] = useState(data)
  const [tempInputs, setTempInputs] = useState<Partial<CalculatorData>>({})

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleInputChange = (field: keyof CalculatorData, value: string) => {
    setTempInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleBlur = (field: keyof CalculatorData) => {
    const value = tempInputs[field] || "0"
    let numValue: number

    if (field === "markup" || field === "margin") {
      numValue = Number.parseFloat(Number.parseFloat(value).toFixed(1))
    } else {
      numValue = Number.parseFloat(Number.parseFloat(value).toFixed(2))
    }

    if (isNaN(numValue)) numValue = 0

    // Don't allow zero values
    if (numValue === 0) {
      // Reset the temp input
      setTempInputs((prev) => ({ ...prev, [field]: undefined }))
      return
    }

    const updatedData = { ...localData, [field]: numValue }
    if (isPurchase) {
      updatedData.cost = 1.0
    }

    setLocalData(updatedData)
    onChange(updatedData, field)
    setTempInputs((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, field: keyof CalculatorData) => {
    if (event.key === "Enter") {
      event.currentTarget.blur()
    }
  }

  const handleFocus = (field: keyof CalculatorData) => {
    if (!isPurchase || field !== "cost") {
      setTempInputs((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const inputClass = (field: keyof CalculatorData) => {
    // Fields in the userEnteredFields set are blue, all others are grey
    let className = userEnteredFields.has(field) ? "text-blue-600" : "text-gray-500"

    if (field === "cost") {
      if (isPurchase) {
        className += " bg-gray-100"
      } else if (!isLabourCostEntered) {
        className += " border-red-500"
      }
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
    <div className="grid grid-cols-5 gap-4 items-start">
      <div className="space-y-2">
        <Label htmlFor={`cost-${isPurchase ? "purchase" : "labour"}`}>cost</Label>
        <Input
          id={`cost-${isPurchase ? "purchase" : "labour"}`}
          type="number"
          value={
            isPurchase ? "1.00" : tempInputs.cost !== undefined ? tempInputs.cost : formatValue("cost", localData.cost)
          }
          onChange={(e) => handleInputChange("cost", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "cost")}
          onBlur={() => handleBlur("cost")}
          onFocus={() => handleFocus("cost")}
          className={inputClass("cost")}
          disabled={isPurchase}
          min="0.01"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`markup-${isPurchase ? "purchase" : "labour"}`}>m-u%</Label>
        <Input
          id={`markup-${isPurchase ? "purchase" : "labour"}`}
          type="number"
          value={tempInputs.markup !== undefined ? tempInputs.markup : formatValue("markup", localData.markup)}
          onChange={(e) => handleInputChange("markup", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "markup")}
          onBlur={() => handleBlur("markup")}
          onFocus={() => handleFocus("markup")}
          className={inputClass("markup")}
          min="0.1"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`profit-${isPurchase ? "purchase" : "labour"}`}>profit</Label>
        <Input
          id={`profit-${isPurchase ? "purchase" : "labour"}`}
          type="number"
          value={tempInputs.profit !== undefined ? tempInputs.profit : formatValue("profit", localData.profit)}
          onChange={(e) => handleInputChange("profit", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "profit")}
          onBlur={() => handleBlur("profit")}
          onFocus={() => handleFocus("profit")}
          className={inputClass("profit")}
          min="0.01"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`margin-${isPurchase ? "purchase" : "labour"}`}>margin%</Label>
        <Input
          id={`margin-${isPurchase ? "purchase" : "labour"}`}
          type="number"
          value={tempInputs.margin !== undefined ? tempInputs.margin : formatValue("margin", localData.margin)}
          onChange={(e) => handleInputChange("margin", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "margin")}
          onBlur={() => handleBlur("margin")}
          onFocus={() => handleFocus("margin")}
          className={inputClass("margin")}
          min="0.1"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`charge-${isPurchase ? "purchase" : "labour"}`}>charge</Label>
        <Input
          id={`charge-${isPurchase ? "purchase" : "labour"}`}
          type="number"
          value={tempInputs.charge !== undefined ? tempInputs.charge : formatValue("charge", localData.charge)}
          onChange={(e) => handleInputChange("charge", e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, "charge")}
          onBlur={() => handleBlur("charge")}
          onFocus={() => handleFocus("charge")}
          className={inputClass("charge")}
          min="0.01"
          step="0.01"
        />
      </div>
    </div>
  )
}
