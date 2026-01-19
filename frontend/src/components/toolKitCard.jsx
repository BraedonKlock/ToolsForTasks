import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client"; // importing socket.io client
import { API_URL } from "../config/api";

export default function ToolKitCard({ toolKit, onToolKitDeleteSuccess, setToolKitError }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { accessToken, logout } = useContext(AuthContext);
    const [tools, setTools] = useState([]);
    const [socket, setSocket] = useState(null); // holding socket instance

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    const loadToolKitTools = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/loggedIn/tool-kits/${toolKit.id}/tools`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 401) {
                logout();
                return;
            }

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || "Could not load tools, try again later.");
            }
            setTools(data.tools ?? []);
        } catch (err) {
            setToolKitError(err.message);
        }
    }, [toolKit.id, accessToken, logout, setToolKitError]);

    useEffect(() => {
        loadToolKitTools();
    }, [loadToolKitTools]);

    // creating socket connection so this card can listen for changes from the server
    useEffect(() => {
        if (!accessToken) return;

        const socketUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
        const s = io(socketUrl, {
            auth: { token: accessToken },
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        s.on("connect", () => {
            console.log("Tool kit card socket connected:", s.id);
        });

        s.on("connect_error", (err) => {
            console.error("Tool kit card socket connect error:", err.message);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, [accessToken]);

    // listening for toolKits:changed so we can reload tool kit tools
    useEffect(() => {
        if (!socket) return;

        const handleToolKitsChanged = () => {
            loadToolKitTools();
        };

        socket.on("toolKits:changed", handleToolKitsChanged);

        return () => {
            socket.off("toolKits:changed", handleToolKitsChanged);
        };
    }, [socket, loadToolKitTools]);

    async function handleDelete(e) {
        e.stopPropagation()
        e.preventDefault();

        try {
            setToolKitError("");

            const res = await fetch(`${API_URL}/api/loggedIn/tool-kits/${toolKit.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!res.ok) throw new Error("Could not delete Tool kit");

            if (onToolKitDeleteSuccess) onToolKitDeleteSuccess(toolKit.id);
        } catch (err) {
            setToolKitError(err.message);
        }
    }
    const name = toolKit?.name ?? "";
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

    return (
        <>
        <article className="kit-card">
            <div className="kit-card__avatar">{firstLetter}</div>

            <div className="kit-card__body">
                <h4 className="kit-card__title">{name}</h4>
                <p className="kit-card__meta">
                {tools.length === 0
                    ? "No tools yet"
                    : `${tools[0]?.tool_name ?? ""}${tools[1]?.tool_name ? `, ${tools[1].tool_name}` : ""}${
                        tools.length > 2 ? ` + ${tools.length - 2} others` : ""
                    }`}
                </p>
            </div>

            <div className="threeDotMenu-container" ref={menuRef}>
            {menuOpen && (
                <section className="threeDotMenu-options active">
                    <Link
                    to={`/loggedIn/edit-tool-kit/${toolKit.id}`}
                    onClick={(e) => e.stopPropagation()}
                    >
                    <FontAwesomeIcon icon={faPenToSquare} className="icon" />
                    </Link>

                    <button type="button" className="delete-btn" onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} />
                    </button>
                </section>
            )}

            <button
                className="three-dot-menu-icon"
                aria-label="More options"
                type="button"
                onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
                }}
            >
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
            </div>
        </article>
        </>
    );
}
