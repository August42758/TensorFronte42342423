import { MONTHS_GENITIVE, DAYS_OF_WEEK } from '../data/date.js';

export default function TimeSlots({ selectedDay, slots, selectedTime, onTimeClick }) {
    return (
        <section className="time-card">
            <h2 className="time-card__title">
                {selectedDay.getDate()} {MONTHS_GENITIVE[selectedDay.getMonth()]}, {DAYS_OF_WEEK[selectedDay.getDay()].toLowerCase()}
            </h2>
            <p className="time-card__subtitle">Свободное время</p>
            <div className="time-slots" aria-label="Свободное время">
                {slots.map(time => (
                    <button
                        type="button"
                        key={time}
                        className={`time-btn${selectedTime === time ? ' time-btn--active' : ''}`}
                        aria-pressed={selectedTime === time}
                        onClick={() => onTimeClick(time)}
                    >
                        {time}
                    </button>
                ))}
            </div>
            <p className="selected-time" aria-live="polite">Выбрано: <span>{selectedTime || 'Выберите время'}</span></p>
        </section>
    );
}
