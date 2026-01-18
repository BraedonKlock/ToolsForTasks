import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addEmployeePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCamera } from "@fortawesome/free-solid-svg-icons";
import { API_URL } from "../config/api";

export default function AddEmployees() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError("Please select an image file");
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image must be less than 5MB");
                return;
            }
            setError("");
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleAvatarClick() {
        fileInputRef.current?.click();
    }

    async function onSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        // Remove the file input from formData and add our controlled file
        formData.delete('avatar');
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
        const result = await fetch(`${API_URL}/api/loggedIn/employees`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
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
            {/* AVATAR UPLOAD */}
            <div className="form-control" id="avatarDiv">
                <div className="avatar-upload-container" onClick={handleAvatarClick}>
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Employee avatar"
                            className="avatar-preview"
                        />
                    ) : (
                        <div className="avatar-placeholder">
                            <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                            <span>Add Photo</span>
                        </div>
                    )}
                    <div className="avatar-upload-overlay">
                        <FontAwesomeIcon icon={faCamera} className="camera-icon" />
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="avatar-file-input"
                />

                <span className="avatar-upload-hint">
                    {avatarFile ? avatarFile.name : "Optional: Upload a photo"}
                </span>
            </div>

            <div className="form-control">
                <input id="employeeid" type="text" name="employeeid" placeholder="Employee ID" required />
            </div>

            <div className="form-control">
                <input id="name" type="text" name="name" placeholder="Name" required />
            </div>

            <div className="form-control">
                <select name="role" id="addEmployeePage-roleSelect" required defaultValue="">
                <option value="" disabled hidden>Select Role</option>
                <option value="manager">Manager</option>
                <option value="crew">Crew</option>
                </select>
            </div>

            <div className="form-control">
                <input id="email" type="text" name="email" placeholder="Email" required />
            </div>

            <div className="form-control">
                <input id="password" type="password" name="password" placeholder="Password" required />
            </div>

            <hr id="addEmployeePage-hr" />
            <button type="submit" id="addEmployeePage-addBtn">Add</button>
            </form>
        </div>
        </main>
    );
}
