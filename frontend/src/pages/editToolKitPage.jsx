import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/editToolKitPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client"; // importing socket.io client
import LoadingSpinner from "../components/LoadingSpinner";
import { API_URL } from "../config/api";

export default function EditToolKit() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [tools, setTools] = useState([]);
    const [toolKit, setToolKit] = useState(null);
    const [selectedTools, setSelectedTools] = useState([]);
    const [isLoadingTools, setIsLoadingTools] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null); // holding socket instance

    const loadToolKitTools = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/loggedIn/tool-kits/${encodeURIComponent(id)}/tools`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.status === 401) {
                logout();
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "Could not load the tools assigned to the tool kit, try again later.");
            }
            const mappedTools = (data.tools || []).map((tool) => ({
                id: tool.tool_id,
                name: tool.tool_name,
                quantity: tool.quantity,
            }));
            setSelectedTools(mappedTools);
        } catch (err) {
            setError(err.message);
        }
    }, [accessToken, id, logout]);

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingTools(true);
                const res = await fetch(`${API_URL}/api/loggedIn/tools`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (res.status === 401) {
                    logout();
                    return;
                }
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.error || "Could not load tools, try again later.");
                }
                setTools(data.tools);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoadingTools(false);
            }
        })();

        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/loggedIn/tool-kit/${encodeURIComponent(id)}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (res.status === 401) {
                    logout();
                    return;
                }
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.error || "Could not load tool kit data, try again later.");
                }
                setToolKit(data.toolKit);
            } catch (err) {
                setError(err.message);
            }
        })();

        loadToolKitTools();
    }, [accessToken, logout, loadToolKitTools]);

    // creating socket connection so this page can listen for changes from the server
    useEffect(() => {
        if (!accessToken) return;

        const socketUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
        const s = io(socketUrl, {
            auth: { token: accessToken },
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        s.on("connect", () => {
            console.log("Edit tool kit socket connected:", s.id);
        });

        s.on("connect_error", (err) => {
            console.error("Edit tool kit socket connect error:", err.message);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, [accessToken]);

    // listening for toolKits:changed so we can reload selected tools
    useEffect(() => {
        if (!socket) return;

        const handleToolKitsChanged = () => {
            loadToolKitTools();
        };

        socket.on("toolKits:changed", handleToolKitsChanged);

        return () => {
            socket.off("toolKits:changed", handleToolKitsChanged);
        };
    }, [socket, loadToolKitTools]);

    function toggleSelected(tool) {
        setSelectedTools((prev) => {
            const existing = prev.find((t) => t.id === tool.id);
            if (existing) return prev.filter((t) => t.id !== tool.id);
            return [...prev, { ...tool, quantity: 1 }];
        });
    }

    function isSelected(toolId) {
        return selectedTools.some((t) => t.id === toolId);
    }

    function setToolQuantity(toolId, qty) {
        const n = Math.max(1, Math.min(10, Number(qty) || 1));
        setSelectedTools((prev) =>
            prev.map((t) => (t.id === toolId ? { ...t, quantity: n } : t))
        );
    }

    async function onSubmit(e) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        const toolsForKit = selectedTools.map((t) => ({
            tool_id: t.id,
            quantity: t.quantity ?? 1,
        }));

        const finalPayload = { ...payload, tools: toolsForKit };

        try {
            const res = await fetch(`${API_URL}/api/loggedIn/tool-kit/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(finalPayload)
            });

            if (res.status === 401) {
                logout();
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "Could not update tool kit, try again later.");
            }
            navigate("/loggedIn/tools");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="editToolKitPage">
            <Link
                id="editToolKitPage-backBtn"
                className="editToolKitPage-backBtn"
                to="/loggedIn/tools"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div className="editToolKitPage-card">
                <h1 className="editToolKitPage-title">Edit Tool Kit</h1>

                {error && <p id="error" className="error">{error}</p>}

                <form className="editToolKitPage-form" onSubmit={onSubmit}>
                    <div className="editToolKitPage-field">
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Tool Kit Name"
                            defaultValue={toolKit?.name?? ""}
                            required
                        />
                    </div>

                    <section className="editToolKitPage-tools">
                        <div className="editToolKitPage-toolsHeader">
                            <p className="editToolKitPage-subtitle">Select Tools to Add:</p>
                        </div>

                        <div className="editToolKitPage-toolsList">
                            {isLoadingTools ? (
                                <LoadingSpinner message="Loading tools..." />
                            ) : tools.length === 0 ? (
                                <h6>No tools to display</h6>
                            ) : (
                                tools.map((tool) => {
                                    const firstLetter = tool.name ? tool.name.charAt(0).toUpperCase() : "";
                                    const selected = selectedTools.find((t) => t.id === tool.id);
                                    return (
                                        <div className="editToolKitPage-toolRow" key={tool.id}>
                                            <div className="editToolKitPage-toolInfo">
                                                <span className="editToolKitPage-toolInitial">{firstLetter}</span>
                                                <span className="editToolKitPage-toolName">{tool.name}</span>
                                            </div>

                                            {selected && (
                                                <select
                                                    className="editToolKitPage-qtySelect"
                                                    value={selected.quantity ?? 1}
                                                    onChange={(e) => setToolQuantity(tool.id, e.target.value)}
                                                >
                                                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                                                        <option key={n} value={n}>x{n}</option>
                                                    ))}
                                                </select>
                                            )}

                                            <button
                                                type="button"
                                                className={`editToolKitPage-selectBtn ${isSelected(tool.id) ? "selected" : ""}`}
                                                onClick={() => toggleSelected(tool)}
                                            >
                                                {isSelected(tool.id) ? "Selected" : "Select"}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <button type="submit" className="editToolKitPage-submitBtn">Update Tool Kit</button>
                </form>
            </div>
        </main>
    );
}
