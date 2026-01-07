import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

import "../styles/toolsPage.css";
import ToolKitCard from "../components/toolKitCard";

export default function ToolsPage() {
    const [tools, setTools] = useState([]);
    const [toolKits, setToolKits] = useState([]);
    const { accessToken, logout } = useContext(AuthContext);

    const [toolKitError, setToolKitError] = useState("");
    const [toolsError, setToolsError] = useState("");

    // tabs: "all" | "tools" | "toolKits"
    const [tabState, setTabState] = useState("all");

    const isAll = tabState === "all";
    const isTools = tabState === "tools";
    const isToolKits = tabState === "toolKits";

    // Load Tool Kits
    useEffect(() => {
        if (!accessToken) return;

        const controller = new AbortController();

        (async () => {
        try {
            setToolKitError("");

            const res = await fetch("/api/loggedIn/toolKits", {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
            });

            // handle auth
            if (res.status === 401) {
            setToolKitError("Session expired. Please log in again.");
            logout();
            return;
            }

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
            throw new Error(data.error || "Failed to load Tool Kits, try again later");
            }

            setToolKits(data.toolKits ?? []);
        } catch (err) {
            if (err.name !== "AbortError") setToolKitError(err.message);
        }
        })();

        return () => controller.abort();
    }, [accessToken, logout]);

    // Load Tools
    useEffect(() => {
        if (!accessToken) return;

        const controller = new AbortController();

        (async () => {
        try {
            setToolsError("");

            const res = await fetch("/api/loggedIn/tools", {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: controller.signal,
            });

            if (res.status === 401) {
            setToolsError("Session expired. Please log in again.");
            logout();
            return;
            }

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
            throw new Error(data.error || "Failed to load Tools, try again later");
            }

            setTools(data.tools ?? []);
        } catch (err) {
            if (err.name !== "AbortError") setToolsError(err.message);
        }
        })();

        return () => controller.abort();
    }, [accessToken, logout]);

    return (
        <main id="toolsPage-main" className="tools-page">
        <section className="tools-tabs">
            <div className="tools-tabs__group">
            <button
                className={`pill ${isAll ? "pill--active" : ""}`}
                type="button"
                onClick={() => setTabState("all")}
            >
                All
            </button>

            <button
                className={`pill ${isTools ? "pill--active" : ""}`}
                type="button"
                onClick={() => setTabState("tools")}
            >
                All Tools
            </button>

            <button
                className={`pill ${isToolKits ? "pill--active" : ""}`}
                type="button"
                onClick={() => setTabState("toolKits")}
            >
                Tool Kits
            </button>
            </div>
        </section>

        {(isAll || isToolKits) && (
            <section className="tools-section">
            <div className="tools-section__header tools-section__header--split">
                <h3>Tool Kits</h3>
                <button className="pill pill--ghost" type="button">
                <span className="pill__icon" aria-hidden="true">
                    +
                </span>
                New Tool Kit
                </button>
            </div>

            {toolKitError && <p className="error">{toolKitError}</p>}

            <div className="tools-section__cards">
                {toolKits.length > 0 ? (
                toolKits.map((toolKit) => (
                    <ToolKitCard key={toolKit.id ?? toolKit.name} toolKit={toolKit} />
                ))
                ) : (
                <h6>No Tool Kits found</h6>
                )}
            </div>
            </section>
        )}

        {(isAll || isTools) && (
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
        )}
        </main>
    );
}
