import { useEffect, useRef } from 'react';
import { formatDate } from '../data/date.js';

export default function ConfirmationDialog({ open, selectedDay, selectedTime, onClose }) {
    const dialogRef = useRef(null);

    // Нативный dialog сохраняет управление фокусом и закрытие по Escape.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog ref={dialogRef} className="confirmation" aria-labelledby="confirmation-title" onClose={onClose}>
            <h2 id="confirmation-title">Дата и время выбраны</h2>
            <p className="confirmation__summary">{formatDate(selectedDay)} • {selectedTime}</p>
            <p>Это учебная страница: запись не отправляется в салон.</p>
            <form method="dialog"><button className="btn btn--primary">Закрыть</button></form>
        </dialog>
    );
}
