'use strict';

// 1. Данные. Месяцы в JavaScript нумеруются от 0 до 11.
const MONTHS_NOMINATIVE = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_GENITIVE = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const DAYS_OF_WEEK = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const SLOT_SCHEDULES = [
    ['10:00', '11:30', '13:00', '15:30', '17:00', '19:00'],
    ['09:00', '10:30', '12:00', '14:00', '16:30', '18:00'],
    ['09:30', '11:00', '13:30', '15:00', '17:30', '19:30']
];

// 2. Состояние: выбранная дата хранится отдельно от просматриваемого месяца.
const state = {
    currentMonth: null,
    currentYear: null,
    selectedDay: null,
    selectedTime: null,
    slots: []
};
let elements;

// 3. Чистые функции: не обращаются к DOM и не меняют состояние.
function buildCalendarGrid(year, month) {
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;
    const weeks = [];
    for (let index = 0; index < cellCount; index += 7) {
        const week = [];
        for (let column = 0; column < 7; column += 1) {
            week.push(new Date(year, month, index + column - offset + 1));
        }
        weeks.push(week);
    }
    return weeks;
}

function compareDates(date1, date2) {
    const first = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()).getTime();
    const second = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()).getTime();
    return Math.sign(first - second);
}

function isDateSelectable(day, month, year, today) {
    return compareDates(new Date(year, month, day), today) >= 0;
}

function getSlots(date) {
    // Учебное расписание: разные дни получают разные наборы времени.
    return [...SLOT_SCHEDULES[(date.getDate() + date.getMonth()) % SLOT_SCHEDULES.length]];
}

function formatDate(date) {
    return `${DAYS_OF_WEEK[date.getDay()]}, ${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
}

// 4. Рендер: после innerHTML обработчики назначаются новым кнопкам.
function renderCalendar() {
    const today = new Date();
    elements.calendarTitle.textContent = `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;
    const labels = DAY_LABELS.map(day => `<div class="calendar__day-name">${day}</div>`).join('');
    const days = buildCalendarGrid(state.currentYear, state.currentMonth).flat().map(date => {
        const outsideMonth = date.getMonth() !== state.currentMonth;
        const selectable = !outsideMonth && isDateSelectable(date.getDate(), date.getMonth(), date.getFullYear(), today);
        const selected = compareDates(date, state.selectedDay) === 0;
        const classes = ['calendar__day'];
        if (!selectable) classes.push('calendar__day--muted', 'disabled');
        if (selected) classes.push('calendar__day--active');
        return `<button type="button" class="${classes.join(' ')}" data-day="${date.getDate()}" aria-label="${formatDate(date)}" aria-pressed="${selected}" ${compareDates(date, today) === 0 ? 'aria-current="date"' : ''} ${selectable ? '' : 'disabled'}>${date.getDate()}</button>`;
    }).join('');
    elements.calendar.innerHTML = labels + days;
    elements.calendar.querySelectorAll('button:not(:disabled)').forEach(button => {
        button.addEventListener('click', onDayClick);
    });
}

function renderTimeSlots() {
    elements.timeTitle.textContent = `${state.selectedDay.getDate()} ${MONTHS_GENITIVE[state.selectedDay.getMonth()]}, ${DAYS_OF_WEEK[state.selectedDay.getDay()].toLowerCase()}`;
    elements.timeSlots.innerHTML = state.slots.map(time => {
        const selected = time === state.selectedTime;
        return `<button type="button" class="time-btn${selected ? ' time-btn--active' : ''}" data-time="${time}" aria-pressed="${selected}">${time}</button>`;
    }).join('');
    elements.timeSlots.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', onTimeSlotClick);
    });
    elements.selectedTime.textContent = state.selectedTime || 'Выберите время';
}

function updateBottomBar() {
    elements.summary.textContent = `${formatDate(state.selectedDay)} • ${state.selectedTime || 'Выберите время'}`;
    elements.nextButton.disabled = !state.selectedTime;
}

// 5. Обработчики действий пользователя.
function onDayClick(event) {
    const day = Number(event.currentTarget.dataset.day);
    if (!isDateSelectable(day, state.currentMonth, state.currentYear, new Date())) return;
    const date = new Date(state.currentYear, state.currentMonth, day);
    if (compareDates(date, state.selectedDay) === 0) return;
    state.selectedDay = date;
    state.selectedTime = null;
    state.slots = getSlots(date);
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

function onTimeSlotClick(event) {
    state.selectedTime = event.currentTarget.dataset.time;
    renderTimeSlots();
    updateBottomBar();
}

function setupMonthNavigation() {
    function changeMonth(offset) {
        const date = new Date(state.currentYear, state.currentMonth + offset, 1);
        state.currentMonth = date.getMonth();
        state.currentYear = date.getFullYear();
        renderCalendar();
    }
    elements.previousMonth.addEventListener('click', () => changeMonth(-1));
    elements.nextMonth.addEventListener('click', () => changeMonth(1));
}

// 6. Инициализация.
function init() {
    elements = {
        calendar: document.querySelector('.calendar'),
        calendarTitle: document.querySelector('#calendar-title'),
        previousMonth: document.querySelector('#previous-month'),
        nextMonth: document.querySelector('#next-month'),
        timeTitle: document.querySelector('.time-card__title'),
        timeSlots: document.querySelector('.time-slots'),
        selectedTime: document.querySelector('.selected-time span'),
        summary: document.querySelector('.booking-summary'),
        nextButton: document.querySelector('.btn--next'),
        confirmation: document.querySelector('.confirmation')
    };
    const today = new Date();
    state.currentMonth = today.getMonth();
    state.currentYear = today.getFullYear();
    state.selectedDay = new Date(state.currentYear, state.currentMonth, today.getDate());
    state.slots = getSlots(state.selectedDay);
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
    setupMonthNavigation();
    elements.nextButton.addEventListener('click', () => {
        if (!state.selectedTime || compareDates(state.selectedDay, new Date()) < 0) return;
        elements.confirmation.querySelector('.confirmation__summary').textContent = elements.summary.textContent;
        elements.confirmation.showModal();
    });
    document.querySelector('.header__btn').addEventListener('click', () => {
        document.querySelector('.booking').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

document.addEventListener('DOMContentLoaded', init);
