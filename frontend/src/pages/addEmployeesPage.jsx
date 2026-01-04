import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addEmployeePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function AddEmployees() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [avatarNum, setAvatarNum] = useState(0);
    const navigate = useNavigate();


    const avatarFile = avatarNum === 0 ? "user.png" : `user${avatarNum}.png`;
    const avatarSrc = `/images/${avatarFile}`;

    async function onSubmit(e) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        try {
        const result = await fetch("/api/loggedIn/employees", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (result.status === 401) {
            logout();
            return;
        }

        if (!result.ok) {
            const data = await result.json().catch(() => ({}));
            throw new Error(data.error || "Failed to add employee, try again later.");
        }

        navigate("/loggedIn/manage-employees");
        } catch (err) {
        setError(err.message);
        }
    }

    return (
        <main className="addEmployee-page">
        <Link
            id="addJob-form-closeBtn"
            className="addEmployeePage-backBtn"
            to="/loggedIn/manage-employees"
        >
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
        </Link>

        <div id="addEmployeePage-addEmployeeContainer">
            <h1>Add Employee</h1>

            {error && <p id="error" className="error">{error}</p>}

            <form className="forms" onSubmit={onSubmit}>
            {/* AVATAR PICKER */}
            <div className="form-control" id="avatarDiv">

                {/* preview */}
                <img
                    src={avatarSrc}
                    alt={`Avatar ${avatarNum}`}
                    style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    }}
                />

                {/* select number */}
                <select
                    id="avatarPicker"
                    value={avatarNum}
                    onChange={(e) => setAvatarNum(Number(e.target.value))}
                >
                    {Array.from({ length: 10 }, (_, i) => (
                    <option key={i} value={i}>
                        {`Avatar ${i}`}
                    </option>
                    ))}
                </select>

                {/* This is what actually gets submitted */}
                <input type="hidden" name="avatar" value={avatarNum} />
            </div>

            <div className="form-control">
                <label htmlFor="employeeid">ID:</label>
                <input id="employeeid" type="text" name="employeeid" required />
            </div>

            <div className="form-control">
                <label htmlFor="name">Name:</label>
                <input id="name" type="text" name="name" required />
            </div>

            <div className="form-control">
                <label htmlFor="role">Role:</label>
                <select name="role" id="addEmployeePage-roleSelect" required defaultValue="">
                <option value="" disabled hidden>Select</option>
                <option value="manager">manager</option>
                <option value="crew">Crew</option>
                </select>
            </div>

            <div className="form-control">
                <label htmlFor="email">Email:</label>
                <input id="email" type="text" name="email" required />
            </div>

            <div className="form-control">
                <label htmlFor="password">Password:</label>
                <input id="password" type="password" name="password" required />
            </div>

            <hr id="addEmployeePage-hr" />
            <button type="submit" id="addEmployeePage-addBtn">Add</button>
            </form>
        </div>
        </main>
    );
}
