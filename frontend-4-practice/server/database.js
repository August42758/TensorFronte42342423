// Дата сервера; месяц нумеруется с нуля.
export const today = { day: 17, month: 9, year: 2026 };
export const slotSchedules = [
    [
        { time: '10:00', available: true },
        { time: '11:30', available: false },
        { time: '13:00', available: true },
        { time: '15:30', available: true },
        { time: '17:00', available: false },
        { time: '19:00', available: true }
    ],
    [
        { time: '09:00', available: true },
        { time: '10:30', available: true },
        { time: '12:00', available: false },
        { time: '14:00', available: true },
        { time: '16:30', available: true },
        { time: '18:00', available: false }
    ]
];
export function getSlotsForDate(date) {
    return slotSchedules[(date.day + date.month) % slotSchedules.length];
}
