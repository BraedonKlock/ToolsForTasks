import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addToolPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function AddTool() {
    const [error, setError] = useState("");
    const [tools, setTools] = useState([{ id: 1, name: "" }]);
    const { accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    function addToolField() {
        setTools(prev => [...prev, { id: Date.now(), name: "" }]);
    }

    function removeToolField(id) {
        if (tools.length === 1) return;
        setTools(prev => prev.filter(t => t.id !== id));
    }

    function updateToolName(id, name) {
        setTools(prev => prev.map(t => t.id === id ? { ...t, name } : t));
    }

    async function onSubmit(e) {
        e.preventDefault();

        const validTools = tools.filter(t => t.name.trim() !== "");
        if (validTools.length === 0) {
            setError("Please enter at least one tool name");
            return;
        }

        try {
            const res = await fetch("/api/loggedIn/tools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ tools: validTools.map(t => ({ name: t.name.trim() })) })
            })

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || "Could not add tools, please try again later.")
            }
            navigate("/loggedIn/tools");
        } catch(err) {
            setError(err.message);
        }
    }

    return (
        <main className="addTool-page">
            <Link
                id="addTool-form-closeBtn"
                className="addToolPage-backBtn"
                to="/loggedIn/tools"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="addToolPage-addToolContainer">
                <h1>Add Tools</h1>

                {error && <p id="error" className="error">{error}</p>}

                <form className="forms" onSubmit={onSubmit}>
                    <div className="addToolPage-toolsList">
                        {tools.map((tool, index) => (
                            <div key={tool.id} className="addToolPage-toolRow">
                                <div className="form-control">
                                    <label htmlFor={`tool-${tool.id}`}>Tool {index + 1}:</label>
                                    <input
                                        id={`tool-${tool.id}`}
                                        type="text"
                                        value={tool.name}
                                        onChange={(e) => updateToolName(tool.id, e.target.value)}
                                        placeholder="Enter tool name"
                                    />
                                </div>
                                {tools.length > 1 && (
                                    <button
                                        type="button"
                                        className="addToolPage-removeBtn"
                                        onClick={() => removeToolField(tool.id)}
                                        aria-label="Remove tool"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="addToolPage-addMoreBtn"
                        onClick={addToolField}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add Another Tool
                    </button>

                    <hr id="addToolPage-hr" />
                    <button type="submit" id="addToolPage-addBtn">
                        Add {tools.filter(t => t.name.trim() !== "").length || ""} Tool{tools.filter(t => t.name.trim() !== "").length !== 1 ? "s" : ""}
                    </button>
                </form>
            </div>
        </main>
    )
}
