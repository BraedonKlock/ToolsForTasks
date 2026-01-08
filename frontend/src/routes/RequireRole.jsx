// RequireRole.jsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RequireRole({ allowed }) {
    const { user } = useContext(AuthContext); // user should include role

    if (!user) return <Navigate to="/login" replace />;

    if (!allowed.includes(user.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
}
