import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/manageAccountPage.css";
import { API_URL } from "../config/api";

export default function ManageAccount() {
    const [error, setError] = useState("");
    const { user, accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [accountDetails, setAccountDetails] = useState(null);

    useEffect(() => {
        (async() => {
            try {
                const res = await fetch(`${API_URL}/api/loggedIn/accounts/${encodeURIComponent(user.orgId)}`, {
                    headers: {Authorization: `Bearer ${accessToken}`}
                });

                if(res.status === 401) {
                    logout();
                    return;
                };

                if(!res.ok) {
                    throw new Error("Could not load account details, try again later.")
                };

                const data = await res.json()
                setAccountDetails(data.account);

            } catch(err) {
                setError(err.message);
            }
        })();
    },[]);

    async function onSubmit(e) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        if (!payload.password || payload.password.trim() === 0) {
            delete payload.password;
        }

        try {
            const res = await fetch(`${API_URL}/api/loggedIn/accounts/${encodeURIComponent(user.orgId)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                throw new Error("Could not update account, please try again later.")
            }
            navigate("/loggedIn")
        } catch(err) {
            setError(err.message);
        }
    };

    return (
        <main className="manageAccount-page">

        <div id="manageAccountPage-manageAccountContainer">
            <h1>Edit Account</h1>

            {error && <p id="error" className="error">{error}</p>}

            <form className="forms" onSubmit={onSubmit}>
            <div className="form-control">
                <input id="name" type="text" name="name" placeholder="Company Name" defaultValue={accountDetails?.companyName?? ""} required />
            </div>

            <div className="form-control">
                <input id="email" type="text" name="email" placeholder="Email" defaultValue={accountDetails?.email?? ""} required />
            </div>

            <div className="form-control">
                <input id="password" type="password" name="password" placeholder="Leave blank to keep current" autoComplete="new-password" />
            </div>

            <hr id="manageAccountPage-hr" />
            <button type="submit" id="manageAccountPage-updateBtn">Update</button>
            </form>
        </div>
        </main>
    )
}
