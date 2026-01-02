import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/manageAccountPage.css";

export default function ManageAccount() {
    const [error, setError] = useState("");
    const { user, accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [accountDetails, setAccountDetails] = useState(null);

    useEffect(() => {
        (async() => {
            try {
                const res = await fetch(`/api/loggedIn/accountDetails/${encodeURIComponent(user.orgId)}`, {
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
            const res = await fetch(`/api/loggedIn/account/${encodeURIComponent(user.orgId)}`, {
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
        <main className="editEmployee-page">

        <div id="editEmployeePage-editEmployeeContainer">
            <h1>Edit Account</h1>

            {error && <p id="login-error" className="error">{error}</p>}

            <form className="forms" onSubmit={onSubmit}>
            <div className="form-control">
                <label htmlFor="type">Business Type:</label>
                <select name="type" id="addEmployeePage-roleSelect" required defaultValue={accountDetails?.businessType ?? ""}>
                <option value={accountDetails?.businessType?? ""} hidden>{accountDetails?.businessType?? ""}</option>
                <option value="roofing">Roofing</option>
                <option value="carpentry">Carpentry</option>
                <option value="siding">Siding</option>
                </select>
            </div>

            <div className="form-control">
                <label htmlFor="name">Company Name:</label>
                <input id="name" type="text" name="name" defaultValue={accountDetails?.companyName?? ""} required />
            </div>


            <div className="form-control">
                <label htmlFor="email">Email:</label>
                <input id="email" type="text" name="email" defaultValue={accountDetails?.email?? ""} required />
            </div>

            <div className="form-control">
                <label htmlFor="password">Password:</label>
                <input id="password" type="password" name="password" placeholder="Leave blank to keep current password" autoComplete="new-password" />
            </div>

            <hr id="editEmployeePage-hr" />
            <button type="submit" id="editEmployeePage-addBtn">Update</button>
            </form>
        </div>
        </main>
    )
}