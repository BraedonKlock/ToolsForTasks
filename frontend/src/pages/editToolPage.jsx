import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/editToolPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../config/api";

export default function EditTool() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const [tool, setTool] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/loggedIn/tools/${encodeURIComponent(id)}`, {
                    headers: {Authorization: `Bearer ${accessToken}`}
                })
                if(res.status === 401) {
                    logout();
                        return;
                }
                if (!res.ok) {
                    throw new Error("Could not load Tool details, please try again later.")
                }
                if (res.ok) {
                    const data = await res.json();
                    setTool(data.tool);
                }
            } catch(err) {
                setError(err.message);
            }
        })();
    }, [accessToken, logout])

    async function onSubmit(e) {
        e.preventDefault()
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        try {
            const res = await fetch(`${API_URL}/api/loggedIn/tools/${encodeURIComponent(id)}`, {
                method: "PATCH",
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
                throw new Error(data.error || "Could not edit Tool, please try again later.")
            }
            navigate("/loggedIn/tools");
        } catch(err) {
            setError(err.message);
        }
    }
    return (
        <main className="editTool-page">
            <Link
                id="editTool-form-closeBtn"
                className="editToolPage-backBtn"
                to="/loggedIn/tools"
            >
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="editToolPage-editToolContainer">
                <h1>Edit Tool</h1>

                {error && <p id="error" className="error">{error}</p>}

                <form className="forms" onSubmit={onSubmit}>

                <div className="form-control">
                    <input id="name" type="text" name="name" placeholder="Tool Name" defaultValue={tool?.name?? ""} required />
                </div>

                <hr id="editToolPage-hr" />
                <button type="submit" id="editToolPage-editBtn">Update</button>
                </form>
            </div>
        </main>
    )
}