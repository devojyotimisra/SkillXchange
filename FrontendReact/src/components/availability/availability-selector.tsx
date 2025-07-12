import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Availability } from '@/types';

interface AvailabilitySelectorProps {
  availabilities: Availability[];
  onChange: (availabilities: Availability[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  'Morning (8am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-9pm)',
  'Night (9pm-12am)',
];

export function AvailabilitySelector({ availabilities, onChange }: AvailabilitySelectorProps) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const handleAdd = () => {
    if (!selectedDay || !selectedTimeSlot) return;
    
    // Check if this combination already exists
    const exists = availabilities.some(
      (a) => a.day === selectedDay && a.timeSlot === selectedTimeSlot
    );
    
    if (!exists) {
      const newAvailability: Availability = {
        id: uuidv4(),
        day: selectedDay,
        timeSlot: selectedTimeSlot,
      };
      onChange([...availabilities, newAvailability]);
    }
    
    setSelectedDay('');
    setSelectedTimeSlot('');
  };

  const handleRemove = (id: string) => {
    onChange(availabilities.filter((a) => a.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {availabilities.map((avail) => (
            <Badge key={avail.id} variant="secondary" className="flex items-center gap-1">
              {avail.day} - {avail.timeSlot}
              <button
                type="button"
                onClick={() => handleRemove(avail.id)}
                className="ml-1 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {availabilities.length === 0 && (
            <p className="text-sm text-muted-foreground">No availabilities added yet.</p>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="button" onClick={handleAdd} disabled={!selectedDay || !selectedTimeSlot}>
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}