import { useState, useRef, useEffect, useContext} from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../config/api";

export default function employeeCard({employee, onDeleteSuccess}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [error, setError] = useState("");
    const menuRef = useRef(null);
    const { accessToken } = useContext(AuthContext);

    // Handle both old (number) and new (filename) avatar formats
    const getAvatarSrc = () => {
        const avatar = employee.avatar;
        // If avatar is a number or numeric string, use old format
        if (!isNaN(avatar) && avatar !== null && avatar !== '') {
            return `/images/user${avatar}.png`;
        }
        // If avatar is a filename, use uploads path
        if (avatar && typeof avatar === 'string') {
            return `${API_URL}/uploads/employees/${avatar}`;
        }
        // Default fallback
        return `${API_URL}/uploads/employees/default.png`;
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if(menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        }
    }, []);

    async function handleDelete() {
        try {
            const res = await fetch(`${API_URL}/api/loggedIn/employees/${employee.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                if (onDeleteSuccess) onDeleteSuccess(employee.id);
            } else {
                throw new Error("Could not delete Employee")
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            {error && (
                <p className="error">{error}</p>
            )}
            <div className="employee-card" data-employee-id={employee.id}>
                <img
                    className="employee-image"
                    src={getAvatarSrc()}
                    alt={`${employee.name}'s avatar`}
                />
                <div className="employee-text">
                    <h6>ID: {employee.employeeid}</h6>
                    <h6>{employee.name}</h6>
                    <h6>{employee.role}</h6>
                </div>

                <div className="threeDotMenu-container" ref={menuRef}>
                    {menuOpen && (
                        <section className="threeDotMenu-options active">
                        <Link to={`/loggedIn/edit-employee/${employee.id}`}> <FontAwesomeIcon icon={faPenToSquare} className="icon" /></Link>
                        <button
                            type="button"
                            data-employee-id={employee.id}
                            className="delete-btn"
                            onClick={handleDelete}
                        >
                            <FontAwesomeIcon icon={faTrash} className="delete-icon" />
                        </button>
                        </section>
                    )}
                    <button
                        className="three-dot-menu-icon"
                        aria-label="More options"
                        onClick={(e) => {
                        e.stopPropagation(); // Stop click from triggering card link
                        setMenuOpen((prev) => !prev);
                        }}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>
                </div>
            </div>
        </>
    )
}
