'use client';

import { useState, useMemo } from 'react';
import { format, addDays, isToday, isBefore, setHours, setMinutes, parse } from 'date-fns';
import { cs } from 'date-fns/locale';
import { config, generateTimeSlots, getOpeningHoursForDay, canOrderForDate } from '@/data/config';

interface DateTimePickerProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onSelect: (date: string, time: string) => void;
}

export function DateTimePicker({ selectedDate, selectedTime, onSelect }: DateTimePickerProps) {
  const [activeDate, setActiveDate] = useState<string | null>(selectedDate);

  // Generování dostupných dnů
  const availableDates = useMemo(() => {
    const dates = [];
    const now = new Date();

    for (let i = 0; i <= config.maxDaysAhead; i++) {
      const date = addDays(now, i);
      const hours = getOpeningHoursForDay(date);

      // Kontrola, jestli je den otevřený a lze na něj objednat
      if (!hours.closed && canOrderForDate(date)) {
        dates.push({
          date,
          dateStr: format(date, 'yyyy-MM-dd'),
          display: format(date, 'EEE d. MMM', { locale: cs }),
          isToday: isToday(date),
        });
      }
    }

    return dates;
  }, []);

  // Generování časových slotů pro vybraný den
  const availableSlots = useMemo(() => {
    if (!activeDate) return [];

    const date = parse(activeDate, 'yyyy-MM-dd', new Date());
    const slots = generateTimeSlots(date);

    // Sloty už jsou filtrované podle deadline v generateTimeSlots
    return slots;
  }, [activeDate]);

  const handleDateClick = (dateStr: string) => {
    setActiveDate(dateStr);
  };

  const handleTimeClick = (time: string) => {
    if (activeDate) {
      onSelect(activeDate, time);
    }
  };

  return (
    <div className="space-y-6">
      {/* Select pickup day */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Vyberte den vyzvednutí</h3>
        <div className="flex flex-wrap gap-2">
          {availableDates.map((d) => (
            <button
              key={d.dateStr}
              onClick={() => handleDateClick(d.dateStr)}
              className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                activeDate === d.dateStr
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="text-sm font-medium">
                {d.isToday ? 'Dnes' : d.display}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Select pickup time */}
      {activeDate && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Vyberte čas vyzvednutí</h3>
          {availableSlots.length > 0 ? (
            <>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleTimeClick(slot)}
                    className={`px-3 py-2 rounded-lg border-2 transition-colors text-center ${
                      selectedDate === activeDate && selectedTime === slot
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  ℹ️ Objednávky na další den přijímáme nejpozději do {config.orderDeadlineHour}:00 předchozího dne
                </p>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Pro tento den již nejsou dostupné žádné časové sloty.<br/>
                Objednávky přijímáme nejpozději do {config.orderDeadlineHour}:00 předchozího dne.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
