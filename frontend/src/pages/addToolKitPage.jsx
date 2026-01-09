import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addToolKitPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function AddToolKit() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const toolOptions = [
        { id: "hammer", name: "Hammer", initial: "H" },
        { id: "wench", name: "Wench", initial: "W" },
        { id: "drill", name: "Drill", initial: "D" },
        { id: "utility-knife", name: "Utility Knife", initial: "U" },
        { id: "level", name: "Level", initial: "L" },
    ];

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
                    <p className="addToolKitPage-subtitle">Select Tools to Add:</p>

                    <div className="addToolKitPage-field">
                        <label className="addToolKitPage-label" htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Name: Carpentry Kit"
                            required
                        />
                    </div>

                    <section className="addToolKitPage-tools">
                        <div className="addToolKitPage-toolsHeader">
                            <h2>Tools</h2>
                            <button type="button" className="addToolKitPage-addToolBtn">+ Add Tool</button>
                        </div>

                        <div className="addToolKitPage-toolsList">
                            {toolOptions.map((tool) => (
                                <div className="addToolKitPage-toolRow" key={tool.id}>
                                    <div className="addToolKitPage-toolInfo">
                                        <span className="addToolKitPage-toolInitial">{tool.initial}</span>
                                        <span className="addToolKitPage-toolName">{tool.name}</span>
                                    </div>
                                    <button type="button" className="addToolKitPage-selectBtn">Select</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <button type="submit" className="addToolKitPage-submitBtn">Create Tool Kit</button>
                </form>
            </div>
        </main>
    )
}
