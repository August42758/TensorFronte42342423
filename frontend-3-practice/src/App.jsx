import { useRef, useState } from 'react';
import Header from './components/Header.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import CalendarHeader from './components/CalendarHeader.jsx';
import CalendarGrid from './components/CalendarGrid.jsx';
import TimeSlots from './components/TimeSlots.jsx';
import BookingBottomBar from './components/BookingBottomBar.jsx';
import ConfirmationDialog from './components/ConfirmationDialog.jsx';
import Footer from './components/Footer.jsx';
import { compareDates, isDateSelectable } from './data/date.js';
import { getSlots } from './data/slots.js';

export default function App() {
    const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });
    const [selectedTime, setSelectedTime] = useState(null);
    const [slots, setSlots] = useState(() => getSlots(selectedDay));
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const bookingRef = useRef(null);

    function handleDayClick(date) {
        if (!isDateSelectable(date.getDate(), date.getMonth(), date.getFullYear(), new Date())) return;
        if (compareDates(date, selectedDay) === 0) return;
        setSelectedDay(date);
        setSelectedTime(null);
        setSlots(getSlots(date));
    }

    function handleMonthChange(offset) {
        const date = new Date(currentYear, currentMonth + offset, 1);
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
    }

    function handleNext() {
        if (selectedTime && compareDates(selectedDay, new Date()) >= 0) setConfirmationOpen(true);
    }

    return (
        <>
            <Header onBook={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />
            <ProgressBar />
            <main className="main">
                <div className="main__container">
                    <h1 className="page-title">Выберите дату и время</h1>
                    <div className="booking" ref={bookingRef}>
                        <section className="calendar-card">
                            <CalendarHeader month={currentMonth} year={currentYear} onMonthChange={handleMonthChange} />
                            <CalendarGrid month={currentMonth} year={currentYear} selectedDay={selectedDay} onDayClick={handleDayClick} />
                        </section>
                        <TimeSlots selectedDay={selectedDay} slots={slots} selectedTime={selectedTime} onTimeClick={setSelectedTime} />
                    </div>
                    <BookingBottomBar selectedDay={selectedDay} selectedTime={selectedTime} onNext={handleNext} />
                </div>
            </main>
            <ConfirmationDialog open={confirmationOpen} selectedDay={selectedDay} selectedTime={selectedTime} onClose={() => setConfirmationOpen(false)} />
            <Footer />
        </>
    );
}
