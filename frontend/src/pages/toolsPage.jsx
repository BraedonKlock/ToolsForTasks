import { Link } from "react-router-dom";
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client"; // importing socket.io client

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
    const [socket, setSocket] = useState(null); // holding socket instance

    const [toolKitError, setToolKitError] = useState("");
    const [toolsError, setToolsError] = useState("");

    // tabs: "all" | "tools" | "toolKits"
    const [tabState, setTabState] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const isAll = tabState === "all";
    const isTools = tabState === "tools";
    const isToolKits = tabState === "toolKits";

    const filteredToolKits = toolKits.filter((toolKit) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = (toolKit.name || "").toLowerCase();
        return name.includes(query);
    });

    const filteredTools = tools.filter((tool) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const name = (tool.name || "").toLowerCase();
        return name.includes(query);
    });

    const loadToolKits = useCallback(async (signal) => {
        try {
            setToolKitError("");

            const res = await fetch("/api/loggedIn/tool-kits", {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal,
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
    }, [accessToken, logout]);

    // Load Tool Kits
    useEffect(() => {
        if (!accessToken) return;

        const controller = new AbortController();
        loadToolKits(controller.signal);

        return () => controller.abort();
    }, [accessToken, loadToolKits]);

    
    const loadTools = useCallback(async (signal) => {
        try {
            setToolsError("");

            const res = await fetch("/api/loggedIn/tools", {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal,
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
    }, [accessToken, logout]);

    // Load Tools
    useEffect(() => {
        if (!accessToken) return;
        
        const controller = new AbortController();
        loadTools(controller.signal);
    
        return () => controller.abort();
    }, [accessToken, loadTools]);

    // creating socket connection so this page can listen for changes from the server
    useEffect(() => {
        if (!accessToken) return;

        const socketUrl = `http://${window.location.hostname}:3000`;
        const s = io(socketUrl, {
            auth: { token: accessToken },
        });

        s.on("connect", () => {
            console.log("Tools socket connected:", s.id);
        });

        s.on("connect_error", (err) => {
            console.error("Tools socket connect error:", err.message);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, [accessToken]);

    // listening for tools:changed and toolKits:changed so we can reload from the database
    useEffect(() => {
        if (!socket) return;

        const handleToolsChanged = () => {
            loadTools();
        };

        const handleToolKitsChanged = () => {
            loadToolKits();
        };

        socket.on("tools:changed", handleToolsChanged);
        socket.on("toolKits:changed", handleToolKitsChanged);

        return () => {
            socket.off("tools:changed", handleToolsChanged);
            socket.off("toolKits:changed", handleToolKitsChanged);
        };
    }, [socket, loadTools, loadToolKits]);

function handleToolKitDeleteSuccess(deletedId) {
    const newToolKits = toolKits.filter((toolKit) => toolKit.id !== deletedId);
    setToolKits(newToolKits);
}

async function handleDeleteTool(toolId) {
    try {
        setToolsError("");
        
        const res = await fetch(`/api/loggedIn/tools/${toolId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (res.status === 401) {
            setToolsError("Session expired. Please log in again.");
            logout();
        return;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
        throw new Error(data.error || "Could not delete tool");
        }

        setTools((prev) => prev.filter((t) => t.id !== toolId));
    } catch (err) {
        setToolsError(err.message);
    }
    }

    return (
        <main id="toolsPage-main" className="tools-page">
        <input
            className="job-search"
            type="search"
            name="search"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />

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
                Tools
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
                    <Link className="pill pill--ghost" to="/loggedIn/add-tool-Kit">
                    <span className="pill__icon" aria-hidden="true">
                        +
                    </span>
                    New Tool Kit
                    </Link>
                </div>

                {toolKitError && <p className="error">{toolKitError}</p>}

                <div className="tools-section__cards">
                    {filteredToolKits.length > 0 ? (
                        filteredToolKits.map((toolKit) => (
                            <ToolKitCard key={toolKit.id ?? toolKit.name} toolKit={toolKit} onToolKitDeleteSuccess={handleToolKitDeleteSuccess} setToolKitError={setToolKitError}/>
                        ))
                    ) : searchQuery.trim() ? (
                        <h6>No Tool Kits found</h6>
                    ) : (
                        <h6>No Tool Kits created</h6>
                    )}
                </div>
            </section>
        )}

        {(isAll || isTools) && (
            <section className="tools-section">
                <div className="tools-section__header tools-section__header--split">
                    <h3>Tools</h3>
                    <Link className="pill pill--ghost" to="/loggedIn/add-tool">
                    <span className="pill__icon" aria-hidden="true">
                        +
                    </span>
                    Add Tool
                    </Link>
                </div>

                {toolsError && <p className="error">{toolsError}</p>}

                <div className="tools-section__cards">
                    {filteredTools.length > 0 ? (
                        filteredTools.map((tool) => (
                            <ToolCard key={tool.id ?? tool.name} tool={tool} onDelete={handleDeleteTool} />
                        ))
                    ) : searchQuery.trim() ? (
                        <h6>No tools found</h6>
                    ) : (
                        <h6>No tools created</h6>
                    )}
                </div>
            </section>
        )}
        </main>
    );
}

function ToolCard({ tool, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const name = tool?.name ?? "";
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

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

    return (
        <article className="tool-card tool-card--compact">
            <div className="tool-card__avatar">{firstLetter}</div>

            <div className="tool-card__body">
                <h4 className="tool-card__title">{name || "Unnamed tool"}</h4>
            </div>

            <div className="threeDotMenu-container" ref={menuRef}>
                {menuOpen && (
                    <section className="threeDotMenu-options active">
                        <Link to={`/loggedIn/edit-tool/${tool.id ?? ""}`}>
                            <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                        </Link>

                        <button
                            type="button"
                            className="delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(tool.id);
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </section>
                )}

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
    );
}
