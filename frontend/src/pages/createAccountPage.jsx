import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/createAccountPage.css";
import { API_URL } from "../config/api";

export default function CreateAccountPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function onSubmit(e){
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        try {
            e.preventDefault();

            const res = await fetch(`${API_URL}/api/account`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                if(data.error) {
                    throw new Error(data.error)
                }
            }
            navigate("/login");
        } catch(err) {
            setError(err.message)
        }
    }
    return (

        <main className="createAccount-page">
            <div id="createForm-container">
            <h1>Create a new account</h1>
            <h6>It's quick and easy.</h6>
            <hr />
            {error ? <p className="error">{error}</p> : null}
            <form id="create-form" onSubmit={onSubmit}>
                <input type="text" name="companyName" placeholder="Company Name" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required />
                <button type="submit">Sign Up</button>
            </form>
            </div>
        </main>
    );
}
