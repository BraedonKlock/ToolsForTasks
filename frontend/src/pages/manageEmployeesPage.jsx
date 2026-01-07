import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/manageEmployeesPage.css";
import { AuthContext } from "../context/AuthContext";
import EmployeeCard from "../components/employeeCard";

export default function manageEmployeesPage() {
    const { accessToken, logout } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/loggedIn/employees", {
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
                placeholder="Search"
            />
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
                    {employees.length > 0 ? (
                    employees.map((employee) => (
                        <EmployeeCard key={employee.id} employee={employee} onDeleteSuccess={handleDeleteSuccess}/>
                    ))
                    ) : (
                    <h1>No Employees Found</h1>
                    )}
                </section>
        </main>
    )
}
