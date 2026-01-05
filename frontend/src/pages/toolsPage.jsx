import { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";

import "../styles/toolsPage.css";

export default function ToolsPage() {
    const [openMenuFor, setOpenMenuFor] = useState(null); // stores the tool name whose menu is open
    const [error, setError] = useState("");
    const menuRef = useRef(null);
    const { accessToken, logout } = useContext(AuthContext);
    const [tools, setTools] = useState([]);

    useEffect(() => {
        function handleClickOutside(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenMenuFor(null);
        }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        (async () => {
        try {
            const res = await fetch("/api/loggedIn/tools", {
            headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 401) {
            logout();
            return;
            }

            if (!res.ok) {
            throw new Error("Failed to fetch Tools, Try again later.");
            }

            const data = await res.json();
            setTools(data.tools);
        } catch (err) {
            setError(err.message);
        }
        })();
    }, [accessToken, logout]);

    async function handleDelete(toolName) {
        try {
        const res = await fetch(
            `/api/loggedIn/tools/${encodeURIComponent(toolName)}`,
            {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (res.status === 401) {
            logout();
            return;
        }

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Could not delete Tool");
        }

        setTools((prev) => prev.filter((t) => t.name !== toolName));
        setOpenMenuFor(null); // optional: close menu after delete
        } catch (err) {
        setError(err.message);
        }
    }

    return (
        <main id="toolsPage-main">
        <input
            className="tool-search"
            type="search"
            name="search"
            placeholder="Search"
        />

        {error && (
            <p id="error" className="error">
            {error}
            </p>
        )}

        <section id="tools-toolsContainer" className="tools-container">
            {tools.length > 0 ? (
            tools.map((tool) => {
                const isOpen = openMenuFor === tool.name;

                return (
                <div className="tool-card" data-tool-name={tool.name} key={tool.name}>
                    <div className="tool-text">
                    <h6>{tool.name}</h6>
                    </div>

                    <div className="threeDotMenu-container" ref={menuRef}>
                    {isOpen && (
                        <section className="threeDotMenu-options">
                        <Link
                            to={`/loggedIn/edit-tool/${encodeURIComponent(tool.name)}`}
                        >
                            <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                        </Link>

                        <button
                            type="button"
                            data-tool-name={tool.name}
                            className="delete-btn"
                            onClick={() => handleDelete(tool.name)}
                        >
                            <FontAwesomeIcon icon={faTrash} className="delete-icon" />
                        </button>
                        </section>
                    )}

                    <button
                        className="three-dot-menu-icon"
                        aria-label="More options"
                        onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuFor(isOpen ? null : tool.name);
                        }}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                    </div>
                </div>
                );
            })
            ) : (
            <h1>No Tools Found</h1>
            )}
        </section>

        <Link to="/loggedIn/add-tool" alt="Add Tool">
            <img src="/images/addToolImage.png" id="addTools-image" />
        </Link>
        </main>
    );
}
