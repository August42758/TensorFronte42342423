import { MONTHS_NOMINATIVE } from '../data/date.js';

export default function CalendarHeader({ month, year, onMonthChange }) {
    return (
        <div className="calendar-card__header">
            <h2 className="calendar-card__title" id="calendar-title">{MONTHS_NOMINATIVE[month]} {year}</h2>
            <div className="calendar-navigation">
                <button type="button" className="calendar-arrow" aria-label="Предыдущий месяц" onClick={() => onMonthChange(-1)}>‹</button>
                <button type="button" className="calendar-arrow" aria-label="Следующий месяц" onClick={() => onMonthChange(1)}>›</button>
            </div>
        </div>
    );
}
