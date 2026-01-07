import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "../styles/toolsPage.css";

export default function ToolsPage() {
    return (
        <main id="toolsPage-main" className="tools-page">
            <section className="tools-tabs">
                <div className="tools-tabs__group">
                    <button className="pill pill--active" type="button">
                        All Tools
                    </button>
                    <button className="pill" type="button">
                        Tool Kits
                    </button>
                    <button className="pill pill--cta" type="button">
                        <span className="pill__icon" aria-hidden="true">
                            +
                        </span>
                        New Tool Kit
                    </button>
                </div>
            </section>

            <section className="tools-section">
                <div className="tools-section__header">
                    <h3>Tool Kits</h3>
                </div>
                <div className="tools-section__cards">
                    <article className="kit-card">
                        <div className="kit-card__avatar">R</div>
                        <div className="kit-card__body">
                            <h4 className="kit-card__title">Roof Repair</h4>
                            <p className="kit-card__meta">
                                Hammer. Pry Bar. Harness +4 more
                            </p>
                        </div>
                        <div className="threeDotMenu-container">
                            <section className="threeDotMenu-options">
                                <Link to="/loggedIn/edit-tool-kit">
                                    <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                                </Link>
                                <button type="button" className="delete-btn">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </section>
                            <button
                                className="three-dot-menu-icon"
                                aria-label="More options"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        </div>
                    </article>

                    <article className="kit-card">
                        <div className="kit-card__avatar kit-card__avatar--muted">
                            H
                        </div>
                        <div className="kit-card__body">
                            <h4 className="kit-card__title">Home Inspection</h4>
                            <p className="kit-card__meta">
                                Flashlight. Gloves +3 more
                            </p>
                        </div>
                        <div className="threeDotMenu-container">
                            <section className="threeDotMenu-options">
                                <Link to="/loggedIn/edit-tool-kit">
                                    <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                                </Link>
                                <button type="button" className="delete-btn">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </section>
                            <button
                                className="three-dot-menu-icon"
                                aria-label="More options"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        </div>
                    </article>
                </div>
            </section>

            <section className="tools-section">
                <div className="tools-section__header tools-section__header--split">
                    <h3>Tools</h3>
                    <button className="pill pill--ghost" type="button">
                        <span className="pill__icon" aria-hidden="true">
                            +
                        </span>
                        Add Tool
                    </button>
                </div>
                <div className="tools-section__cards">
                    <article className="tool-card tool-card--compact">
                        <div className="tool-card__avatar">H</div>
                        <div className="tool-card__body">
                            <h4 className="tool-card__title">Hammer</h4>
                        </div>
                        <div className="threeDotMenu-container">
                            <section className="threeDotMenu-options">
                                <Link to="/loggedIn/edit-tool">
                                    <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                                </Link>
                                <button type="button" className="delete-btn">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </section>
                            <button
                                className="three-dot-menu-icon"
                                aria-label="More options"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        </div>
                    </article>

                    <article className="tool-card tool-card--compact">
                        <div className="tool-card__avatar tool-card__avatar--muted">
                            T
                        </div>
                        <div className="tool-card__body">
                            <h4 className="tool-card__title">test</h4>
                        </div>
                        <div className="threeDotMenu-container">
                            <section className="threeDotMenu-options">
                                <Link to="/loggedIn/edit-tool">
                                    <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                                </Link>
                                <button type="button" className="delete-btn">
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </section>
                            <button
                                className="three-dot-menu-icon"
                                aria-label="More options"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}
