import { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import CalendarHeader from './components/CalendarHeader.jsx';
import CalendarGrid from './components/CalendarGrid.jsx';
import TimeSlots from './components/TimeSlots.jsx';
import BookingBottomBar from './components/BookingBottomBar.jsx';
import ConfirmationDialog from './components/ConfirmationDialog.jsx';
import Footer from './components/Footer.jsx';
import { compareDates, isDateSelectable } from './data/date.js';
import { fetchToday, fetchSlots } from './api.js';

export default function App() {
    const [today, setToday] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(null);
    const [currentYear, setCurrentYear] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [slots, setSlots] = useState([]);
    const [todayLoading, setTodayLoading] = useState(true);
    const [todayError, setTodayError] = useState(null);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsError, setSlotsError] = useState(null);
    const [todayAttempt, setTodayAttempt] = useState(0);
    const [slotsAttempt, setSlotsAttempt] = useState(0);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const bookingRef = useRef(null);

    useEffect(() => {
        const controller = new AbortController();
        let active = true;
        setTodayLoading(true);
        setTodayError(null);
        async function loadToday() {
            try {
                const data = await fetchToday({ signal: controller.signal });
                if (!active) return;
                const date = new Date(data.year, data.month, data.day);
                setToday(date);
                setCurrentMonth(data.month);
                setCurrentYear(data.year);
                setSlotsLoading(true);
                setSelectedDay(date);
            } catch (error) {
                if (active) setTodayError(error.message);
            } finally {
                if (active) setTodayLoading(false);
            }
        }
        loadToday();
        return () => { active = false; controller.abort(); };
    }, [todayAttempt]);

    // Только этот эффект запрашивает слоты: обработчик клика меняет состояние.
    useEffect(() => {
        if (!selectedDay) return;
        const controller = new AbortController();
        let active = true;
        setSlotsLoading(true);
        setSlotsError(null);
        setSlots([]);
        setSelectedTime(null);
        async function loadSlots() {
            try {
                const data = await fetchSlots(selectedDay, { signal: controller.signal });
                if (!active) return;
                const responseDate = new Date(data.date.year, data.date.month, data.date.day);
                if (compareDates(responseDate, selectedDay) !== 0) {
                    throw new Error('Сервер вернул расписание для другой даты. Повторите запрос.');
                }
                setSlots(data.slots);
            } catch (error) {
                if (active) setSlotsError(error.message);
            } finally {
                if (active) setSlotsLoading(false);
            }
        }
        loadSlots();
        // Отмена запроса и флаг защищают и от ответов, пришедших после смены дня.
        return () => { active = false; controller.abort(); };
    }, [selectedDay, slotsAttempt]);

    function handleDayClick(date) {
        if (!today || !isDateSelectable(date.getDate(), date.getMonth(), date.getFullYear(), today)) return;
        if (compareDates(date, selectedDay) === 0) return;
        setSelectedTime(null);
        setSlots([]);
        setSlotsError(null);
        setSlotsLoading(true);
        setSelectedDay(date);
    }

    function handleMonthChange(offset) {
        const date = new Date(currentYear, currentMonth + offset, 1);
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
    }

    function handleTimeClick(time) {
        if (!slotsLoading && !slotsError && slots.some(slot => slot.time === time && slot.available)) {
            setSelectedTime(time);
        }
    }

    function handleNext() {
        if (selectedTime && !slotsLoading && !slotsError && compareDates(selectedDay, today) >= 0) {
            setConfirmationOpen(true);
        }
    }

    function retrySlots() {
        setSelectedTime(null);
        setSlotsLoading(true);
        setSlotsError(null);
        setSlotsAttempt(attempt => attempt + 1);
    }

    return (
        <>
            <Header onBook={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />
            <ProgressBar />
            <main className="main">
                <div className="main__container">
                    <h1 className="page-title">Выберите дату и время</h1>
                    {todayLoading ? <p className="request-status" role="status">Загрузка…</p>
                        : todayError ? <div className="request-error" role="alert"><p>{todayError}</p><button type="button" className="btn btn--primary" onClick={() => setTodayAttempt(attempt => attempt + 1)}>Повторить загрузку</button></div>
                        : <>
                            <div className="booking" ref={bookingRef}>
                                <section className="calendar-card">
                                    <CalendarHeader month={currentMonth} year={currentYear} onMonthChange={handleMonthChange} />
                                    <CalendarGrid month={currentMonth} year={currentYear} selectedDay={selectedDay} today={today} onDayClick={handleDayClick} />
                                </section>
                                <TimeSlots selectedDay={selectedDay} slots={slots} selectedTime={selectedTime} loading={slotsLoading} error={slotsError} onRetry={retrySlots} onTimeClick={handleTimeClick} />
                            </div>
                            <BookingBottomBar selectedDay={selectedDay} selectedTime={selectedTime} onNext={handleNext} />
                        </>}
                </div>
            </main>
            {selectedDay && <ConfirmationDialog open={confirmationOpen} selectedDay={selectedDay} selectedTime={selectedTime} onClose={() => setConfirmationOpen(false)} />}
            <Footer />
        </>
    );
}
