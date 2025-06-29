import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface HourDayToggleProps {
  isDay: boolean
  onToggle: (value: boolean) => void
}

export function HourDayToggle({ isDay, onToggle }: HourDayToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="hour-day-toggle" checked={isDay} onCheckedChange={onToggle} />
      <Label htmlFor="hour-day-toggle">{isDay ? "Day" : "Hour"}</Label>
    </div>
  )
}
