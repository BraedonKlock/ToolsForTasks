import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/manageEmployeesPage.css";
import { AuthContext } from "../context/AuthContext";
import EmployeeCard from "../components/employeeCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { API_URL } from "../config/api";

export default function manageEmployeesPage() {
    const { accessToken, logout } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tabState, setTabState] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const isAll = tabState === "all";
    const isManagers = tabState === "managers";
    const isCrew = tabState === "crew";

    const filteredEmployees = employees.filter((employee) => {
        // Filter by role (tab)
        const role = (employee.role || "").trim().toLowerCase();
        if (!isAll) {
            if (isManagers && role !== "manager") return false;
            if (isCrew && role !== "crew") return false;
        }
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const employeeId = (employee.employeeid || "").toString().toLowerCase();
            const name = (employee.name || "").toLowerCase();
            return employeeId.includes(query) || name.includes(query);
        }
        return true;
    });

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`${API_URL}/api/loggedIn/employees`, {
                headers:{ Authorization: `Bearer ${accessToken}` },
            });

            if(res.status === 401) {
                logout();
                return
            }

            if(!res.ok) {
                    throw new Error("Failed to fetch Employees, Try again later.");
            };

            if(res.ok) {
                const data = await res.json();
                setEmployees(data.employees);
            }

            } catch(err) {
            setError(err.message)
            } finally {
                setIsLoading(false);
            }
        })();
    }, [accessToken, logout]);

    function handleDeleteSuccess(deletedId) {
        const newEmployees = employees.filter((employee) => employee.id !== deletedId);
        setEmployees(newEmployees);
    }

    return (
        <main id="manageEmployeesPage-main">
            <input
                className="job-search"
                type="search"
                name="search"
                placeholder="Search by ID or name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <section className="employees-tabs">
                <div className="employees-tabs__group">
                    <button
                        className={`pill ${isAll ? "pill--active" : ""}`}
                        type="button"
                        onClick={() => setTabState("all")}
                    >
                        All
                    </button>
                    <button
                        className={`pill ${isManagers ? "pill--active" : ""}`}
                        type="button"
                        onClick={() => setTabState("managers")}
                    >
                        Managers
                    </button>
                    <button
                        className={`pill ${isCrew ? "pill--active" : ""}`}
                        type="button"
                        onClick={() => setTabState("crew")}
                    >
                        Crew
                    </button>
                </div>
            </section>
            
            <div className="jobs-section__header jobs-section__header--split">
                <h3>Employees</h3>
                <Link className="pill pill--ghost" to="/loggedIn/add-employee">
                    <span className="pill__icon" aria-hidden="true">
                        +
                    </span>
                    Add Employee
                </Link>
            </div>

            {error && <p id="login-error" className="error">{error}</p>}
            <section id="employees-employeesContainer" className="employees-container">
                    {isLoading ? (
                        <LoadingSpinner message="Loading employees..." />
                    ) : filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                            <EmployeeCard key={employee.id} employee={employee} onDeleteSuccess={handleDeleteSuccess}/>
                        ))
                    ) : searchQuery.trim() ? (
                        <h1>No Employees Found</h1>
                    ) : (
                        <h1>No Employees Created</h1>
                    )}
                </section>
        </main>
    )
}
