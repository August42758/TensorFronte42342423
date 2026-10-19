async function request(url, signal) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.message || `Ошибка сервера (${response.status}).`);
        if (!data) throw new Error('Сервер вернул некорректный ответ.');
        return data;
    } catch (error) {
        if (signal?.aborted) throw error;
        if (controller.signal.aborted) throw new Error('Сервер не ответил за 10 секунд. Попробуйте ещё раз.');
        if (error instanceof TypeError) throw new Error('Не удалось подключиться к серверу. Проверьте соединение.');
        throw error;
    } finally {
        clearTimeout(timeout);
        signal?.removeEventListener('abort', abort);
    }
}

function validDate(date) {
    if (!date || !['day', 'month', 'year'].every(key => Number.isInteger(date[key]))) return false;
    const value = new Date(date.year, date.month, date.day);
    return date.year >= 1900 && date.year <= 9999 && value.getFullYear() === date.year
        && value.getMonth() === date.month && value.getDate() === date.day;
}

export async function fetchToday({ signal } = {}) {
    const date = await request('/api/booking/today', signal);
    if (!validDate(date)) throw new Error('Сервер вернул некорректную текущую дату.');
    return date;
}

export async function fetchSlots(date, { signal } = {}) {
    const params = new URLSearchParams({ day: date.getDate(), month: date.getMonth(), year: date.getFullYear() });
    const data = await request(`/api/slots?${params}`, signal);
    if (!validDate(data.date) || !Array.isArray(data.slots) || data.slots.some(slot =>
        !slot || typeof slot.available !== 'boolean' || typeof slot.time !== 'string'
        || !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time))) {
        throw new Error('Сервер вернул некорректное расписание.');
    }
    return data;
}
