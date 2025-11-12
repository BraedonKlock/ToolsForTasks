import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/createAccountPage.css";

export default function CreateAccountPage() {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function onSubmit(e){
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        try {
            e.preventDefault();

            const res = await fetch("/api/account", {
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
                <select
                    id="createForm-busType"
                    name="businessType"
                    required
                    defaultValue=""
                >
                    <option value="" disabled hidden>Business Type</option>
                    <option value="roofing">Roofing</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="siding">Siding</option>
                </select>
                <div className="form-control">
                    <label htmlFor="CompanyName">Company Name:</label>
                    <input type="text" name="companyName" required />
                </div>
                <div className="form-control">
                    <label htmlFor="email">Email:</label>
                    <input type="text" name="email" required />
                </div>
                <div className="form-control">
                    <label htmlFor="password">Password:</label>
                    <input type="password" name="password" required />
                </div>
                <div className="form-control">
                    <label htmlFor="ConfirmPassword">Confirm Password:</label>
                    <input type="password" name="confirmPassword" required/>
                </div>
                <button type="submit">Sign Up</button>
            </form>
            </div>
        </main>
    );
}