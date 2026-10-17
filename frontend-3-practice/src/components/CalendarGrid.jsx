import { buildCalendarGrid, compareDates, isDateSelectable, formatDate, DAY_LABELS } from '../data/date.js';

export default function CalendarGrid({ month, year, selectedDay, onDayClick }) {
    const today = new Date();
    const weeks = buildCalendarGrid(year, month);

    return (
        <div className="calendar" aria-labelledby="calendar-title">
            {DAY_LABELS.map(day => <div className="calendar__day-name" key={day}>{day}</div>)}
            {weeks.flat().map(date => {
                const selectable = date.getMonth() === month && isDateSelectable(date.getDate(), date.getMonth(), date.getFullYear(), today);
                const selected = compareDates(date, selectedDay) === 0;
                const classes = ['calendar__day'];
                if (!selectable) classes.push('calendar__day--muted', 'disabled');
                if (selected) classes.push('calendar__day--active');

                return (
                    <button
                        type="button"
                        key={date.getTime()}
                        className={classes.join(' ')}
                        disabled={!selectable}
                        aria-label={formatDate(date)}
                        aria-pressed={selected}
                        aria-current={compareDates(date, today) === 0 ? 'date' : undefined}
                        onClick={() => onDayClick(date)}
                    >
                        {date.getDate()}
                    </button>
                );
            })}
        </div>
    );
}
