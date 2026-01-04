import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import "../styles/editEmployeePage.css";

export default function EditEmployee() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [avatarNum, setAvatarNum] = useState(0);
    const navigate = useNavigate();
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);

    const avatarFile = `user${avatarNum}.png`;
    const avatarSrc = `/images/${avatarFile}`;

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/employeeDetails/${encodeURIComponent(id)}`, {
                    headers: {Authorization: `Bearer ${accessToken}`}
                });

                if (res.status === 401) {
                    logout();
                    return;
                }
                if (!res.ok) {
                    throw new Error("Failed to load employee details, try again later.");
                }
                if(res.ok) {
                    const data = await res.json();
                    setEmployee(data.employee);
                    const n = Number(data.employee.avatar);
                    setAvatarNum(Number.isFinite(n) ? n : 0);
                }
            } catch(err) {
                setError(err.message)
            }
        })();
    }, [accessToken, logout, id]);

    async function onSubmit(e) {
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());

        // If password is blank, don't send it at all
        if (!payload.password || payload.password.trim().length === 0) {
            delete payload.password;
        }

        try {
            e.preventDefault();

            const res = await fetch(`/api/loggedIn/employees/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.status === 401) {
                logout();
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Could not update employee, try again later.")
            }
            navigate("/loggedIn/manage-employees");
        } catch(err) {
            setError(err.message);
        }
    }

    return (
        <main className="editEmployee-page">
        <Link
            id="editJob-form-closeBtn"
            className="editEmployeePage-backBtn"
            to="/loggedIn/manage-employees"
        >
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
        </Link>

        <div id="editEmployeePage-editEmployeeContainer">
            <h1>Edit Employee</h1>

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
                <input id="employeeid" type="text" name="employeeid" defaultValue={employee?.employeeid?? ""} required />
            </div>

            <div className="form-control">
                <label htmlFor="name">Name:</label>
                <input id="name" type="text" name="name" defaultValue={employee?.name?? ""} required />
            </div>

            <div className="form-control">
                <label htmlFor="role">Role:</label>
                <select name="role" id="addEmployeePage-roleSelect" required defaultValue={employee?.role ?? ""}>
                <option value={employee?.role?? ""} hidden>{employee?.role?? ""}</option>
                <option value="manager">manager</option>
                <option value="crew">crew</option>
                </select>
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
    );
}