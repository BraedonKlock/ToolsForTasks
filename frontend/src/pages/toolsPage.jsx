import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import "../styles/toolsPage.css";

export default function ToolsPage() {
    const [tools, setTools] = useState([]);
    const [toolKits, setToolKits] = useState([]);
    const { accessToken, logout } = useContext(AuthContext);
    const [toolKitError, setToolKitError] = useState("");
    const [toolsError, setToolsError] = useState("");

    useEffect(() => {
        (async () => {
            try { 
                const res = await fetch("/api/loggedIn/toolKits", {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                if(res.status === 401) {
                    logout();
                    return
                }
                if(!res.ok) {
                    const data = await res.json().catch(() => ({})); // safe parse
                    throw new Error(data.error || "Failed to load Tool Kits, try again later");
                }
                const data = await res.json()
                setToolKits(data.toolKits);
            }catch(err) {
                setToolKitError(err.message);
            }
        })();
    }, [accessToken])

    useEffect(() => {
        (async () => {
            try { 
                const res = await fetch("/api/loggedIn/tools", {
                    headers: {Authorization: `Bearer ${accessToken}`},
                });
                if(!res.ok) {
                    const data = await res.json().catch(() => ({})); // safe parse
                    throw new Error(data.error || "Failed to load Tools, try again later");
                }
                const data = await res.json()
                setTools(data.tools);
            }catch(err) {
                setToolsError(err.message);
            }
        })();
    }, [accessToken])

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
                {toolKitError && <p  className="error">{toolKitError}</p>}
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
                </div>
            </section>

            <section className="tools-section">
            <div className="tools-section__header tools-section__header--split">
                <h3>Tools</h3>
                <button className="pill pill--ghost" type="button">
                <span className="pill__icon" aria-hidden="true">+</span>
                Add Tool
                </button>
            </div>

            {toolsError && <p className="error">{toolsError}</p>}

            <div className="tools-section__cards">
                {tools.length === 0 ? (
                <h6>No tools to display</h6>
                ) : (
                tools.map((tool) => {
                    const name = tool?.name ?? "";
                    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

                    return (
                    <article key={tool.id ?? name} className="tool-card tool-card--compact">
                        <div className="tool-card__avatar">{firstLetter}</div>

                        <div className="tool-card__body">
                        <h4 className="tool-card__title">{name || "Unnamed tool"}</h4>
                        </div>

                        <div className="threeDotMenu-container">
                        <section className="threeDotMenu-options">
                            <Link to={`/loggedIn/edit-tool/${tool.id ?? ""}`}>
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
                    );
                })
                )}
            </div>
            </section>
        </main>
    );
}
