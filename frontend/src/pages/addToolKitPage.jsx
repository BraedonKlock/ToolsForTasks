import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addToolKitPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AddToolKit() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [tools, setTools] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [isLoadingTools, setIsLoadingTools] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingTools(true);
                const res = await fetch("/api/loggedIn/tools", {
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
    }, [accessToken, logout]);

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
            const res = await fetch("/api/loggedIn/tool-kit", {
                method: "POST",
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
                throw new Error(data.error || "Could not add tool kit, try again later.");
            }
            navigate("/loggedIn/tools");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <main className="addToolKitPage">
            <Link
                id="addToolKitPage-backBtn"
                className="addToolKitPage-backBtn"
                to="/loggedIn/tools"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div className="addToolKitPage-card">
                <h1 className="addToolKitPage-title">Add Tool Kit</h1>

                {error && <p id="error" className="error">{error}</p>}

                <form className="addToolKitPage-form" onSubmit={onSubmit}>
                    <div className="addToolKitPage-field">
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Tool Kit Name"
                            required
                        />
                    </div>

                    <section className="addToolKitPage-tools">
                        <div className="addToolKitPage-toolsHeader">
                            <p className="addToolKitPage-subtitle">Select Tools to Add:</p>
                        </div>

                        <div className="addToolKitPage-toolsList">
                            {isLoadingTools ? (
                                <LoadingSpinner message="Loading tools..." />
                            ) : tools.length === 0 ? (
                                <h6>No tools to display</h6>
                            ) : (
                                tools.map((tool) => {
                                    const firstLetter = tool.name ? tool.name.charAt(0).toUpperCase() : "";
                                    const selected = selectedTools.find((t) => t.id === tool.id);
                                    return (
                                        <div className="addToolKitPage-toolRow" key={tool.id}>
                                            <div className="addToolKitPage-toolInfo">
                                                <span className="addToolKitPage-toolInitial">{firstLetter}</span>
                                                <span className="addToolKitPage-toolName">{tool.name}</span>
                                            </div>

                                            {selected && (
                                                <select
                                                    className="addToolKitPage-qtySelect"
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
                                                className={`addToolKitPage-selectBtn ${isSelected(tool.id) ? "selected" : ""}`}
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

                    <button type="submit" className="addToolKitPage-submitBtn">Create Tool Kit</button>
                </form>
            </div>
        </main>
    );
}
