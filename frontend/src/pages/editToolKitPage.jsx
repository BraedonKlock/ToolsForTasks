import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/editToolKitPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function EditToolKit() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [tools, setTools] = useState([]);
    const [toolKit, setToolKit] = useState(null);
    const [selectedTools, setSelectedTools] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
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
            }
        })();

        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/tool-kit/${encodeURIComponent(id)}`, {
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

        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/tool-kits/${encodeURIComponent(id)}/tools`, {
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
        })();
    }, [accessToken, logout]);

    useEffect(() => {
        try {
            
        } catch(err) {
            setError(err.message);
        }
    })

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
                        <label className="editToolKitPage-label" htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            defaultValue={toolKit?.name?? ""}
                            required
                        />
                    </div>

                    <section className="editToolKitPage-tools">
                        <div className="editToolKitPage-toolsHeader">
                            <p className="editToolKitPage-subtitle">Select Tools to Add:</p>
                        </div>

                        <div className="editToolKitPage-toolsList">
                            {tools.length === 0 ? (
                                <h1>No tools to display</h1>
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
