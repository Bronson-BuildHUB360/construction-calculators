"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, Calculator, CheckCircle, ArrowLeft } from "lucide-react"
import { HourDayToggle } from "./hour-day-toggle"
import type { LabourInput, PurchasesInput, CalculationResults, CalculatorField, CalculatorData } from "@/lib/types"
import { calculateValues } from "@/lib/calculator"

const fieldOptions = [
  { value: "markup", label: "Markup %", type: "percentage" },
  { value: "profit", label: "Profit $", type: "currency" },
  { value: "margin", label: "Margin %", type: "percentage" },
  { value: "charge", label: "Charge $", type: "currency" },
] as const

export default function LabourPurchasingCalculator() {
  const [currentStep, setCurrentStep] = useState<"input" | "results">("input")
  const [isDay, setIsDay] = useState(false)

  // Input state
  const [labourInput, setLabourInput] = useState<LabourInput>({
    cost: 0,
    selectedField: null,
    selectedValue: 0,
  })

  const [purchasesInput, setPurchasesInput] = useState<PurchasesInput>({
    selectedField: null,
    selectedValue: 0,
  })

  // Results state
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleLabourCostChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "")
    const numValue = Number.parseFloat(cleanValue) || 0
    setLabourInput((prev: LabourInput) => ({ ...prev, cost: numValue }))
    setValidationError(null)
  }

  const handleLabourFieldSelect = (field: string) => {
    setLabourInput((prev: LabourInput) => ({
      ...prev,
      selectedField: field as CalculatorField,
      selectedValue: 0,
    }))
    setValidationError(null)
  }

  const handleLabourValueChange = (value: string) => {
    const field = labourInput.selectedField
    if (!field) return
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "")
    const numValue = Number.parseFloat(cleanValue) || 0
    setLabourInput((prev: LabourInput) => ({ ...prev, selectedValue: numValue }))
    setValidationError(null)
  }

  const handlePurchasesFieldSelect = (field: string) => {
    setPurchasesInput((prev: PurchasesInput) => ({
      ...prev,
      selectedField: field as CalculatorField,
      selectedValue: 0,
    }))
    setValidationError(null)
  }

  const handlePurchasesValueChange = (value: string) => {
    const field = purchasesInput.selectedField
    if (!field) return
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "")
    const numValue = Number.parseFloat(cleanValue) || 0
    setPurchasesInput((prev: PurchasesInput) => ({ ...prev, selectedValue: numValue }))
    setValidationError(null)
  }

  const validateInputs = (): boolean => {
    if (labourInput.cost <= 0) {
      setValidationError("Labour cost rate is required and must be greater than 0.")
      return false
    }

    if (!labourInput.selectedField) {
      setValidationError("Please select a field for Labour calculations.")
      return false
    }

    if (labourInput.selectedValue <= 0) {
      setValidationError("Labour field value must be greater than 0.")
      return false
    }

    if (!purchasesInput.selectedField) {
      setValidationError("Please select a field for Purchases calculations.")
      return false
    }

    if (purchasesInput.selectedValue <= 0) {
      setValidationError("Purchases field value must be greater than 0.")
      return false
    }

    return true
  }

  const handleCalculate = () => {
    if (!validateInputs()) return

    // Prepare labour data
    const labourData: CalculatorData = {
      cost: isDay ? labourInput.cost / 8 : labourInput.cost,
      markup: 0,
      profit: 0,
      charge: 0,
      margin: 0,
    }

    if (labourInput.selectedField) {
      let value = labourInput.selectedValue
      if (isDay && (labourInput.selectedField === "profit" || labourInput.selectedField === "charge")) {
        value = value / 8
      }
      labourData[labourInput.selectedField as keyof CalculatorData] = value
    }

    // Prepare purchases data
    const purchasesData: CalculatorData = {
      cost: 1.0,
      markup: 0,
      profit: 0,
      charge: 0,
      margin: 0,
    }

    if (purchasesInput.selectedField) {
      purchasesData[purchasesInput.selectedField as keyof CalculatorData] = purchasesInput.selectedValue
    }

    // Calculate results
    const labourResults = calculateValues(labourData)
    const purchasesResults = calculateValues(purchasesData)

    setResults({
      labour: labourResults,
      purchases: purchasesResults,
    })

    setCurrentStep("results")
    setValidationError(null)
  }

  const handleBack = () => {
    setCurrentStep("input")
    setValidationError(null)
  }

  const handleApply = () => {
    // Here you would typically save the results or apply them to your system
    console.log("Applied results:", results)

    // Reset for new calculation
    setLabourInput({ cost: 0, selectedField: null, selectedValue: 0 })
    setPurchasesInput({ selectedField: null, selectedValue: 0 })
    setResults(null)
    setCurrentStep("input")
    setValidationError(null)
  }

  const handleClear = () => {
    setLabourInput({ cost: 0, selectedField: null, selectedValue: 0 })
    setPurchasesInput({ selectedField: null, selectedValue: 0 })
    setResults(null)
    setCurrentStep("input")
    setValidationError(null)
  }

  const getDisplayValue = (value: number, field: CalculatorField, isLabour: boolean = true) => {
    if (isDay && results && isLabour && (field === "cost" || field === "profit" || field === "charge")) {
      return (value * 8).toFixed(2)
    }
    if (field === "markup" || field === "margin") {
      return value.toFixed(1)
    }
    return value.toFixed(2)
  }

  const getFieldLabel = (field: CalculatorField) => {
    const option = fieldOptions.find((opt) => opt.value === field)
    return option?.label || field
  }

  const getFieldSymbol = (field: CalculatorField) => {
    const option = fieldOptions.find((opt) => opt.value === field)
    if (option?.type === "percentage") return "%"
    if (option?.type === "currency") return "$"
    return ""
  }

  const formatInputValue = (value: number, field: CalculatorField) => {
    if (value === 0) return ""
    const symbol = getFieldSymbol(field)
    const formattedValue = field === "markup" || field === "margin" ? value.toFixed(1) : value.toFixed(2)
    return symbol + formattedValue
  }

  const parseInputValue = (value: string, field: CalculatorField) => {
    const symbol = getFieldSymbol(field)
    const cleanValue = value.replace(symbol, "").trim()
    return Number.parseFloat(cleanValue) || 0
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (currentStep === "results" && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Print Header - Only visible when printing */}
        <div className="print:block hidden print:mb-8">
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Labour & Purchasing Defaults Calculator</h1>
            <p className="text-gray-600 mt-2">Calculation Results</p>
            <p className="text-sm text-gray-500 mt-1">Generated on: {getCurrentDate()}</p>
          </div>
        </div>

        <Card className="print:shadow-none print:border-0">
          <CardHeader className="text-center print:pb-4">
            <CardTitle className="text-2xl text-green-700 flex items-center justify-center gap-2 print:text-gray-900 print:text-xl">
              <CheckCircle className="h-6 w-6 print:hidden" />
              Calculation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 print:space-y-6">
            {/* Labour Results */}
            <div className="print:break-inside-avoid">
              <div className="flex items-center justify-between mb-4 print:justify-start print:gap-4">
                <h3 className="text-lg font-semibold print:text-base print:font-bold">
                  Labour {isDay ? "(Day)" : "(Hour)"}
                </h3>
                <div className="print:hidden">
                  <HourDayToggle isDay={isDay} onToggle={setIsDay} />
                </div>
                {/* Print-only toggle indicator */}
                <div className="hidden print:block text-sm text-gray-600">
                  Rate Type: {isDay ? "Per Day" : "Per Hour"}
                </div>
              </div>

              {/* Desktop/Screen Layout */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Cost</Label>
                  <div className="text-xl font-bold text-blue-600">${getDisplayValue(results.labour.cost, "cost", true)}</div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${labourInput.selectedField === "markup" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Markup</Label>
                  <div className={`text-xl font-bold ${labourInput.selectedField === "markup" ? "text-blue-600" : ""}`}>
                    {getDisplayValue(results.labour.markup, "markup", true)}%
                  </div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${labourInput.selectedField === "profit" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Profit</Label>
                  <div className={`text-xl font-bold ${labourInput.selectedField === "profit" ? "text-blue-600" : ""}`}>
                    ${getDisplayValue(results.labour.profit, "profit", true)}
                  </div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${labourInput.selectedField === "margin" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Margin</Label>
                  <div className={`text-xl font-bold ${labourInput.selectedField === "margin" ? "text-blue-600" : ""}`}>
                    {getDisplayValue(results.labour.margin, "margin", true)}%
                  </div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${labourInput.selectedField === "charge" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Charge</Label>
                  <div className={`text-xl font-bold ${labourInput.selectedField === "charge" ? "text-blue-600" : ""}`}>
                    ${getDisplayValue(results.labour.charge, "charge", true)}
                  </div>
                </div>
              </div>

              {/* Print Layout - Table format */}
              <div className="hidden print:block">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Field</th>
                      <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Value</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium">Cost</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        ${getDisplayValue(results.labour.cost, "cost", true)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-blue-600 font-medium">
                        User Input
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Markup</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        {getDisplayValue(results.labour.markup, "markup", true)}%
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {labourInput.selectedField === "markup" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Profit</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        ${getDisplayValue(results.labour.profit, "profit", true)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {labourInput.selectedField === "profit" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Margin</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        {getDisplayValue(results.labour.margin, "margin", true)}%
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {labourInput.selectedField === "margin" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Charge</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        ${getDisplayValue(results.labour.charge, "charge", true)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {labourInput.selectedField === "charge" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purchases Results */}
            <div className="print:break-inside-avoid">
              <h3 className="text-lg font-semibold mb-4 print:text-base print:font-bold">Purchases</h3>

              {/* Desktop/Screen Layout */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Cost</Label>
                  <div className="text-xl font-bold text-blue-600">$1.00</div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${purchasesInput.selectedField === "markup" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Markup</Label>
                  <div
                    className={`text-xl font-bold ${purchasesInput.selectedField === "markup" ? "text-blue-600" : ""}`}
                  >
                    {getDisplayValue(results.purchases.markup, "markup", false)}%
                  </div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${purchasesInput.selectedField === "profit" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Profit</Label>
                  <div
                    className={`text-xl font-bold ${purchasesInput.selectedField === "profit" ? "text-blue-600" : ""}`}
                  >
                    ${getDisplayValue(results.purchases.profit, "profit", false)}
                  </div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${purchasesInput.selectedField === "margin" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Margin</Label>
                  <div
                    className={`text-xl font-bold ${purchasesInput.selectedField === "margin" ? "text-blue-600" : ""}`}
                  >
                    {getDisplayValue(results.purchases.margin, "margin", false)}%
                  </div>
                </div>
                <div
                  className={`text-center p-4 rounded-lg ${purchasesInput.selectedField === "charge" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Label className="text-sm text-gray-600">Charge</Label>
                  <div
                    className={`text-xl font-bold ${purchasesInput.selectedField === "charge" ? "text-blue-600" : ""}`}
                  >
                    ${getDisplayValue(results.purchases.charge, "charge", false)}
                  </div>
                </div>
              </div>

              {/* Print Layout - Table format */}
              <div className="hidden print:block">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Field</th>
                      <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Value</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-medium">Cost</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">$1.00</td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-blue-600 font-medium">Fixed</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Markup</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        {getDisplayValue(results.purchases.markup, "markup", false)}%
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {purchasesInput.selectedField === "markup" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Profit</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        ${getDisplayValue(results.purchases.profit, "profit", false)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {purchasesInput.selectedField === "profit" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Margin</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        {getDisplayValue(results.purchases.margin, "margin", false)}%
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {purchasesInput.selectedField === "margin" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2">Charge</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                        ${getDisplayValue(results.purchases.charge, "charge", false)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {purchasesInput.selectedField === "charge" ? (
                          <span className="text-blue-600 font-medium">User Input</span>
                        ) : (
                          <span className="text-gray-600">Calculated</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Print Footer - Only visible when printing */}
            <div className="print:block hidden print:mt-8 print:pt-4 print:border-t print:border-gray-300">
              <div className="text-xs text-gray-500 text-center">
                <p>Labour & Purchasing Defaults Calculator - Generated on {getCurrentDate()}</p>
                <p className="mt-1">
                  Labour Input: Cost ${isDay ? labourInput.cost.toFixed(2) : labourInput.cost.toFixed(2)}{" "}
                  {isDay ? "(Day)" : "(Hour)"} + {getFieldLabel(labourInput.selectedField!)}{" "}
                  {labourInput.selectedValue.toFixed(
                    labourInput.selectedField === "markup" || labourInput.selectedField === "margin" ? 1 : 2,
                  )}
                  {labourInput.selectedField === "markup" || labourInput.selectedField === "margin" ? "%" : ""}
                </p>
                <p>
                  Purchases Input: Cost $1.00 + {getFieldLabel(purchasesInput.selectedField!)}{" "}
                  {purchasesInput.selectedValue.toFixed(
                    purchasesInput.selectedField === "markup" || purchasesInput.selectedField === "margin" ? 1 : 2,
                  )}
                  {purchasesInput.selectedField === "markup" || purchasesInput.selectedField === "margin" ? "%" : ""}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t print:hidden">
              <Button onClick={handleBack} variant="outline" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Edit
              </Button>
              <Button onClick={handleApply} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4" />
                Apply Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Labour & Purchasing Defaults Calculator</CardTitle>
          <p className="text-gray-600">Set default values for labour and purchasing.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {/* Labour Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Labour Rates</h3>
              <HourDayToggle isDay={isDay} onToggle={setIsDay} />
            </div>

            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Left column: Cost Rate */}
              <div className="space-y-2">
                <Label htmlFor="labour-cost" className="text-sm font-medium">
                  Cost Rate {isDay ? "(per Day)" : "(per Hour)"} *
                </Label>
                <Input
                  id="labour-cost"
                  type="text"
                  placeholder="0.00"
                  value={labourInput.cost || ""}
                  onChange={(e) => handleLabourCostChange(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              {/* Right column: Dropdown and Value */}
              <div className="space-y-2">
                <Select value={labourInput.selectedField || ""} onValueChange={handleLabourFieldSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {labourInput.selectedField && (
                  <Input
                    type="text"
                    placeholder={`Enter ${getFieldLabel(labourInput.selectedField)}`}
                    value={labourInput.selectedValue || ""}
                    onChange={(e) => handleLabourValueChange(e.target.value)}
                    className="text-lg font-semibold"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Purchases Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Purchasing Rates</h3>

            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Left column: Cost Price */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cost Price (Fixed)</Label>
                <Input type="text" value="$1.00" disabled className="text-lg font-semibold bg-gray-100" />
              </div>

              {/* Right column: Dropdown and Value */}
              <div className="space-y-2">
                <Select value={purchasesInput.selectedField || ""} onValueChange={handlePurchasesFieldSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {purchasesInput.selectedField && (
                  <Input
                    type="text"
                    placeholder={`Enter ${getFieldLabel(purchasesInput.selectedField)}`}
                    value={purchasesInput.selectedValue || ""}
                    onChange={(e) => handlePurchasesValueChange(e.target.value)}
                    className="text-lg font-semibold"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button onClick={handleClear} variant="outline">
              Clear All
            </Button>
            <Button onClick={handleCalculate} className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculate Defaults
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
