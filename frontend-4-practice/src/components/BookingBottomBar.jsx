import { formatDate } from '../data/date.js';

export default function BookingBottomBar({ selectedDay, selectedTime, onNext }) {
    return (
        <div className="actions">
            <p className="booking-summary" aria-live="polite">{formatDate(selectedDay)} • {selectedTime || 'Выберите время'}</p>
            <button type="button" className="btn btn--primary btn--next" disabled={!selectedTime} onClick={onNext}>Далее</button>
        </div>
    );
}
