import { MONTHS_GENITIVE, DAYS_OF_WEEK } from '../data/date.js';

export default function TimeSlots({ selectedDay, slots, selectedTime, loading, error, onRetry, onTimeClick }) {
    return (
        <section className="time-card">
            <h2 className="time-card__title">
                {selectedDay.getDate()} {MONTHS_GENITIVE[selectedDay.getMonth()]}, {DAYS_OF_WEEK[selectedDay.getDay()].toLowerCase()}
            </h2>
            <p className="time-card__subtitle">Свободное время</p>
            {loading ? <p className="request-status" role="status">Загрузка слотов…</p>
                : error ? <div className="request-error" role="alert"><p>{error}</p><button type="button" className="btn btn--primary" onClick={onRetry}>Повторить загрузку слотов</button></div>
                : <div className="time-slots" aria-label="Свободное время">
                {slots.map(({ time, available }) => (
                    <button
                        type="button"
                        key={time}
                        className={`time-btn${selectedTime === time ? ' time-btn--active' : ''}`}
                        aria-pressed={selectedTime === time}
                        disabled={!available}
                        aria-label={`${time}${available ? '' : ' — занято'}`}
                        onClick={() => onTimeClick(time)}
                    >
                        {time}
                    </button>
                ))}
            </div>}
            {!loading && !error && !slots.some(slot => slot.available) && <p role="status">На этот день свободного времени нет. Выберите другую дату.</p>}
            <p className="selected-time" aria-live="polite">Выбрано: <span>{selectedTime || 'Выберите время'}</span></p>
        </section>
    );
}
