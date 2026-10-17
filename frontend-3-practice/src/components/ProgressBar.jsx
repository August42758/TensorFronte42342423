export default function ProgressBar() {
    return (
        <div className="progress-section">
            <div className="progress-section__container">
                <div className="progress-header">
                    <span className="progress-header__title">Запись онлайн</span>
                    <span className="progress-header__step">3 из 5</span>
                </div>
                <div className="progress-bar" role="progressbar" aria-label="Шаг записи" aria-valuemin={0} aria-valuemax={5} aria-valuenow={3}>
                    <div className="progress-bar__fill" />
                </div>
            </div>
        </div>
    );
}
