import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addToolKitPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function AddToolKit() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [tools, setTools] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/loggedIn/tools", {
                    headers: {Authorization: `Bearer ${accessToken}`}
                })
                if (res.status === 401) {
                    logout();
                    return;
                }
                const data = await res.json().catch(() => {});
                if (!res.ok) {
                    throw new Error(data.error || "Could not load tools, try again later.")
                }
                setTools(data.tools);
            } catch(err) {
                setError(err.message);
            }
        })();
    }, [accessToken, logout])

    function onSubmit(e) {

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
                        <label className="addToolKitPage-label" htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter the tool kit name"
                            required
                        />
                    </div>

                    <p className="addToolKitPage-subtitle">Select Tools to Add:</p>
                    <section className="addToolKitPage-tools">
                        <div className="addToolKitPage-toolsHeader">
                            <h2>Tools</h2>
                            <button type="button" className="addToolKitPage-addToolBtn">+ Add tools to kit</button>
                        </div>

                        <div className="addToolKitPage-toolsList">
                            {tools.length === 0 ? (
                                <h1>No tools to display</h1>
                            ) : (
                                tools.map((tool) => {
                                    const firstLetter = tool.name? tool.name.charAt(0).toUpperCase() : "?";
                                    return (
                                        <div className="addToolKitPage-toolRow" key={tool.id}>
                                            <div className="addToolKitPage-toolInfo">
                                                <span className="addToolKitPage-toolInitial">{firstLetter}</span>
                                                <span className="addToolKitPage-toolName">{tool.name}</span>
                                            </div>
                                            <button type="button" className="addToolKitPage-selectBtn">Select</button>
                                        </div>
                                    )}
                                )
                            )
                        }
                        </div>
                    </section>

                    <button type="submit" className="addToolKitPage-submitBtn">Create Tool Kit</button>
                </form>
            </div>
        </main>
    )
}
