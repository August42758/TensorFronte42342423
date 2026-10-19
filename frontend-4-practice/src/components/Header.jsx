export default function Header({ onBook }) {
    return (
        <header className="header">
            <div className="header__container">
                <div className="logo-group">
                    <div className="logo">ЛУНА</div>
                    <span className="logo-subtitle">Салон красоты</span>
                </div>
                <nav className="nav">
                    <a href="#" className="nav__link">Услуги</a>
                    <a href="#" className="nav__link">Мастера</a>
                    <a href="#" className="nav__link">Отзывы</a>
                </nav>
                <button type="button" className="btn btn--primary header__btn" onClick={onBook}>Записаться</button>
            </div>
        </header>
    );
}
