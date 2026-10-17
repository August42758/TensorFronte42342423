const SLOT_SCHEDULES = [
    ['10:00', '11:30', '13:00', '15:30', '17:00', '19:00'],
    ['09:00', '10:30', '12:00', '14:00', '16:30', '18:00'],
    ['09:30', '11:00', '13:30', '15:00', '17:30', '19:30']
];

export function getSlots(date) {
    return [...SLOT_SCHEDULES[(date.getDate() + date.getMonth()) % SLOT_SCHEDULES.length]];
}
