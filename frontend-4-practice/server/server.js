import { today, getSlotsForDate } from './database.js';

export const DELAY_MS = 700;

function sendJson(res, status, data) {
    if (res.destroyed) return;
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(data));
}

function readDate(params) {
    const keys = ['day', 'month', 'year'];
    if (keys.some(key => !/^\d+$/.test(params.get(key) ?? ''))) return null;
    const [day, month, year] = keys.map(key => Number(params.get(key)));
    if (year < 1900 || year > 9999 || month > 11 || day < 1 || day > 31) return null;
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
    return { day, month, year };
}

function middleware(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) return next();
    setTimeout(() => {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET');
            return sendJson(res, 405, { message: 'Разрешены только GET-запросы.' });
        }
        const endpoint = url.pathname === '/api/booking/today' ? 'today'
            : url.pathname === '/api/slots' ? 'slots' : null;
        if (!endpoint) return sendJson(res, 404, { message: 'Эндпоинт не найден.' });
        // MOCK_API_FAIL=today, slots или all позволяет проверить ошибки в интерфейсе.
        if (['all', endpoint].includes(process.env.MOCK_API_FAIL) || url.searchParams.get('error') === '1') {
            return sendJson(res, 500, { message: 'Сервер временно недоступен. Попробуйте ещё раз.' });
        }
        if (endpoint === 'today') return sendJson(res, 200, today);
        const date = readDate(url.searchParams);
        if (!date) return sendJson(res, 400, { message: 'Передайте корректные day, month и year.' });
        if (new Date(date.year, date.month, date.day) < new Date(today.year, today.month, today.day)) {
            return sendJson(res, 400, { message: 'Нельзя записаться на прошедшую дату.' });
        }
        return sendJson(res, 200, { date, slots: getSlotsForDate(date) });
    }, DELAY_MS);
}

export default function mockApiPlugin() {
    return {
        name: 'luna-mock-api',
        configureServer(server) { server.middlewares.use(middleware); },
        configurePreviewServer(server) { server.middlewares.use(middleware); }
    };
}
