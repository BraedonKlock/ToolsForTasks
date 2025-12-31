import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import "../styles/manageAccountPage.css";

export default function ManageAccount() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);

    function onSubmit(e) {

    }

    return (
        <main className="editEmployee-page">

        <div id="editEmployeePage-editEmployeeContainer">
            <h1>Edit Account</h1>

            {error && <p id="login-error" className="error">{error}</p>}

            <form className="forms" onSubmit={onSubmit}>
            <div className="form-control">
                <label htmlFor="role">Business Type:</label>
                <select name="role" id="addEmployeePage-roleSelect" required defaultValue={employee?.role ?? ""}>
                <option value={employee?.role?? ""} hidden>{employee?.role?? ""}</option>
                <option value="manager">manager</option>
                <option value="crew">crew</option>
                </select>
            </div>

            <div className="form-control">
                <label htmlFor="name">Company Name:</label>
                <input id="name" type="text" name="name" defaultValue={employee?.name?? ""} required />
            </div>


            <div className="form-control">
                <label htmlFor="email">Email:</label>
                <input id="email" type="text" name="email" defaultValue={employee?.email?? ""} required />
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