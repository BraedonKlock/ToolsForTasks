import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addToolPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function AddTool() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    async function onSubmit(e) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        try {
            const res = await fetch("/api/loggedIn/tools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            })

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || "Could not add Tool, please try again later.")
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
                <h1>Add Tool</h1>

                {error && <p id="error" className="error">{error}</p>}

                <form className="forms" onSubmit={onSubmit}>

                <div className="form-control">
                    <label htmlFor="name">Name:</label>
                    <input id="name" type="text" name="name" required />
                </div>

                <hr id="addToolPage-hr" />
                <button type="submit" id="addToolPage-addBtn">Add</button>
                </form>
            </div>
        </main>
    )
}