import { useEffect, useRef, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function ToolKitCard({ toolKit, onToolKitDeleteSuccess }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { accessToken } = useContext(AuthContext);

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

    async function handleDelete(e) {
        e.stopPropagation()
        e.preventDefault();

        try {
        setToolsKitError("");

        const res = await fetch(`/api/loggedin/toolKits/${toolKit.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error("Could not delete Tool kit");

        if (onToolKitDeleteSuccess) onToolKitDeleteSuccess(toolKit.id);
        } catch (err) {
        setToolKitsError(err.message);
        }
    }

    const name = toolKit?.name ?? "";
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

    return (
        <>
        <article className="kit-card">
            <Link
            to={`/loggedIn/toolKit-details/${toolKit.id}`}
            className="kit-card__mainLink"
            >
            <div className="kit-card__avatar">{firstLetter}</div>

            <div className="kit-card__body">
                <h4 className="kit-card__title">{name || "Unnamed tool kit"}</h4>
                <p className="kit-card__meta">Hammer. Pry Bar. Harness +4 more</p>
            </div>
            </Link>

            <div className="threeDotMenu-container" ref={menuRef}>
            <section className={`threeDotMenu-options ${menuOpen ? "active" : ""}`}>
                <Link
                to={`/loggedIn/edit-tool-kit/${toolKit.id}`}
                onClick={(e) => e.stopPropagation()}
                >
                <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                </Link>

                <button type="button" className="delete-btn" onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
                </button>
            </section>

            <button
                className="three-dot-menu-icon"
                aria-label="More options"
                type="button"
                onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
                }}
            >
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
            </div>
        </article>
        </>
    );
}
