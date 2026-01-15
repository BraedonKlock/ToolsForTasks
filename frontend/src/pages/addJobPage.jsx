import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addJobPage.css";
import "../styles/toolsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function AddJob() {
    const { accessToken, logout } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState("");
    const [addedEmployees, setAddedEmployees] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/loggedIn/employees", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error("Failed to load employees, try again later.");
                }

                const data = await res.json();
                setEmployees(data.employees);
            } catch (err) {
                setError(err.message);
                setEmployees([]); // optional: reset state
            }
        })();
    }, [accessToken, logout]);

    function toggleEmployee(employee) {
        setAddedEmployees((prev) => {
            const exists = prev.some((emp) => emp.id === employee.id);
            if (exists) return prev.filter((emp) => emp.id !== employee.id);
            return [...prev, employee];
        });
    }

    function isEmployeeSelected(employeeId) {
        return addedEmployees.some((emp) => emp.id === employeeId);
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        // build payload from the form
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());
        payload.employeeIds = form.getAll("employeeIds[]").map(Number);

        // remove junk keys the server doesn’t want
        delete payload["employeeIds[]"];
        delete payload.addEmployee;
        
        try {

            const res = await fetch("/api/loggedIn/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload),
            });

            if (res.status === 401) {
            logout();
            return;
            }
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "failed");
            }
            navigate("/loggedIn/jobs");
        } catch(err) {
            setError(err.message);

        }
    }

    return (
        <main className="addJob-page">
        <section id="addJob-form">
            <Link id="addJob-form-closeBtn" className="addJob-page-backBtn" to="/loggedIn/jobs">
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="addJob-container">
            <h1>Add Job</h1>

            <form className="forms" onSubmit={onSubmit}>
                <div className="form-control">
                    <label htmlFor="jobType">Job Type:</label>
                    <select name="jobType" id="addJobForm-jobType" required defaultValue="">
                        <option value="" disabled hidden>Select a job type</option>
                        <option value="roofing">Roofing</option>
                        <option value="carpentry">Carpentry</option>
                        <option value="siding">Siding</option>
                    </select>
                </div>

                <div className="form-control">
                    <label htmlFor="jobid">Job ID:</label>
                    <input type="text" name="jobid" />
                </div>

                <div className="form-control">
                    <label htmlFor="title">Title:</label>
                    <input type="text" name="title" />
                </div>

                <div className="form-control">
                    <label htmlFor="date">Date:</label>
                    <input id="addJobForm-date" type="date" name="date" />
                </div>

                <div className="form-control">
                    <label htmlFor="address">Address:</label>
                    <input type="text" name="address" />
                </div>

                <div className="form-control">
                    <label htmlFor="phoneNumber">Phone #:</label>
                    <input type="text" name="phoneNumber" />
                </div>

                <div className="form-control">
                    <label htmlFor="notes">Notes:</label>
                    <textarea id="addJob-notes" name="notes"></textarea>
                </div>

                {error && <p id="error" className="error">{error}</p>}

                {employees && (
                <>
                    <section className="addJob-employeeSection">
                        <div className="addJob-employeeHeader">
                            <p>Select Employees:</p>
                        </div>

                        <div className="tools-section__cards addJob-employeeCards">
                            {employees.length === 0 ? (
                                <h6>No employees to display</h6>
                            ) : (
                                employees.map((employee) => {
                                    const name = employee?.name ?? "";
                                    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                    const selected = isEmployeeSelected(employee.id);
                                    return (
                                        <article key={employee.id ?? employee.employeeid} className="tool-card tool-card--compact addJob-employeeCard">
                                            <div className="tool-card__avatar">{firstLetter}</div>
                                            <div className="tool-card__body">
                                                <h4 className="tool-card__title">{name || "Unnamed employee"}</h4>
                                                <p className="addJob-employeeMeta">#{employee.employeeid} • {employee.role}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className={`addJob-employeeSelectBtn ${selected ? "selected" : ""}`}
                                                onClick={() => toggleEmployee(employee)}
                                            >
                                                {selected ? "Selected" : "Select"}
                                            </button>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </section>


                    {/* HIDDEN INPUTS FOR FORM SUBMIT */}
                    <div id="addJob-hiddenEmployees">
                        {addedEmployees.map((emp) => (
                            <input
                                key={`hidden-${emp.id}`}
                                type="hidden"
                                name="employeeIds[]"
                                value={emp.id}
                            />
                        ))}
                    </div>
                </>
                )}

                <hr id="addJobForm-hr" />
                <button id="addJob-addJobBtn" type="submit">Add Job</button>
            </form>
            </div>
        </section>
        </main>
    );
}
