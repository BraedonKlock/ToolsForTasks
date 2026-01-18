import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCamera } from "@fortawesome/free-solid-svg-icons";

import "../styles/editEmployeePage.css";
import { API_URL } from "../config/api";

export default function EditEmployee() {
    const [error, setError] = useState("");
    const { accessToken, logout } = useContext(AuthContext);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [currentAvatar, setCurrentAvatar] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);

    // Get avatar source based on current or new avatar
    const getAvatarSrc = () => {
        if (avatarPreview) return avatarPreview;
        if (!currentAvatar) return null;
        // If it's a filename, use uploads path
        return `${API_URL}/uploads/employees/${currentAvatar}`;
    };

    const hasAvatar = avatarPreview || currentAvatar;

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError("Please select an image file");
                return;
            }
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

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/loggedIn/employees/${encodeURIComponent(id)}`, {
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
                    setCurrentAvatar(data.employee.avatar);
                }
            } catch(err) {
                setError(err.message)
            }
        })();
    }, [accessToken, logout, id]);

    async function onSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        // Remove any existing avatar field and add our controlled values
        formData.delete('avatar');
        formData.append('currentAvatar', currentAvatar || '');
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        // Remove password if blank
        const password = formData.get('password');
        if (!password || password.trim().length === 0) {
            formData.delete('password');
        }

        try {
            const res = await fetch(`${API_URL}/api/loggedIn/employees/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: formData
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
            {/* AVATAR UPLOAD */}
            <div className="form-control" id="avatarDiv">
                <div className="avatar-upload-container" onClick={handleAvatarClick}>
                    {hasAvatar ? (
                        <img
                            src={getAvatarSrc()}
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
                    {avatarFile ? avatarFile.name : (hasAvatar ? "Click to change photo" : "Optional: Upload a photo")}
                </span>
            </div>

            <div className="form-control">
                <input id="employeeid" type="text" name="employeeid" placeholder="Employee ID" defaultValue={employee?.employeeid?? ""} required />
            </div>

            <div className="form-control">
                <input id="name" type="text" name="name" placeholder="Name" defaultValue={employee?.name?? ""} required />
            </div>

            <div className="form-control">
                <select name="role" id="editEmployeePage-roleSelect" required defaultValue={employee?.role ?? ""}>
                <option value={employee?.role?? ""} hidden>{employee?.role || "Select Role"}</option>
                <option value="manager">Manager</option>
                <option value="crew">Crew</option>
                </select>
            </div>

            <div className="form-control">
                <input id="email" type="text" name="email" placeholder="Email" defaultValue={employee?.email?? ""} required />
            </div>

            <div className="form-control">
                <input id="password" type="password" name="password" placeholder="Leave blank to keep current" autoComplete="new-password" />
            </div>

            <hr id="editEmployeePage-hr" />
            <button type="submit" id="editEmployeePage-addBtn">Update</button>
            </form>
        </div>
        </main>
    );
}
