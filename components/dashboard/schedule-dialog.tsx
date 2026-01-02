"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: any) => void
  initialConfig?: any
}

export function ScheduleDialog({
  open,
  onOpenChange,
  onSave,
  initialConfig,
}: ScheduleDialogProps) {
  const [frequency, setFrequency] = useState(initialConfig?.frequency || "daily")
  const [time, setTime] = useState(initialConfig?.time || "09:00")
  const [dayOfWeek, setDayOfWeek] = useState(initialConfig?.dayOfWeek?.toString() || "1")
  const [dayOfMonth, setDayOfMonth] = useState(initialConfig?.dayOfMonth?.toString() || "1")

  const handleSave = () => {
    const config: any = {
      frequency,
      time,
    }

    if (frequency === "weekly") {
      config.dayOfWeek = parseInt(dayOfWeek)
    } else if (frequency === "monthly") {
      config.dayOfMonth = parseInt(dayOfMonth)
    }

    onSave(config)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Dashboard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          {frequency === "weekly" && (
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="space-y-2">
              <Label>Day of Month</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Schedule</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
