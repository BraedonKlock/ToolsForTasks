import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function ToolKitCard(toolKit) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    return (<>
        <article className="kit-card">
            <div className="kit-card__avatar">R</div>
            <div className="kit-card__body">
                <h4 className="kit-card__title">Roof Repair</h4>
                <p className="kit-card__meta">
                    Hammer. Pry Bar. Harness +4 more
                </p>
            </div>
            <div className="threeDotMenu-container">
                <section className={`threeDotMenu-options ${menuOpen ? "active" : ""}`}>
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
                    onClick={(event) => {
                        event.stopPropagation();
                        setMenuOpen((prev) => !prev);
                    }}
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
            </div>
        </article>
    </>)
}
