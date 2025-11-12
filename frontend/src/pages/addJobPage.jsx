import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/addJobPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function AddJob() {
    const { accessToken, logout } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState("");
    const [selectedEmpId, setSelectedEmpId] = useState("");
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
                    // Backend responded, but not 200 OK
                    const data = await res.json().catch(() => ({})); // safe parse
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

    function handleAddEmployee() {
        let selected = null;

        // Find the selected employee by ID
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].employeeid === Number(selectedEmpId)) {
            selected = employees[i];
            break; // stop looping once found
            }
        }

        // If no match found, stop the function
        if (!selected) return;

        // Check if the employee was already added
        let alreadyAdded = false;
        for (let i = 0; i < addedEmployees.length; i++) {
            if (addedEmployees[i].employeeid === selected.employeeid) {
            alreadyAdded = true;
            break;
            }
        }

        // If already in list, stop the function
        if (alreadyAdded) return;

        // Add the employee to state (append to existing list)
        setAddedEmployees(prev => [...prev, selected]);
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
        console.log(payload);
        
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
                throw new Error("failed");
            }
            navigate("/loggedIn/jobs");
        } catch(err) {
            setError(err.message);

        }
    }

    return (
        <main className="addJob-page">
        <section id="addJob-form">
            <Link id="addJob-form-closeBtn" className="jobDetails-backBtn" to="/loggedIn/jobs">
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

                {error && <p id="login-error" className="error">{error}</p>}

                {employees.length > 0 && (
                <>
                    <div className="form-control">
                    <label htmlFor="addEmployee">Choose:</label>
                    <select
                        id="addJob-employeeSelect"
                        value={selectedEmpId}
                        onChange={(e) => setSelectedEmpId(e.target.value)}
                    >
                        <option value="" disabled hidden>Employees</option>
                        {employees.map((employee) => (
                        <option
                            key={employee.employeeid}
                            value={employee.employeeid}
                        >
                            {employee.name} | #{employee.employeeid} | {employee.role} 
                        </option>
                        ))}
                    </select>
                    </div>

                    <button
                        type="button"
                        id="addJob-addEmployeeBtn"
                        onClick={handleAddEmployee}
                    >
                        Add Employee
                    </button>

                    {/* VISIBLE EMPLOYEE DISPLAY */}
                    <div id="addJob-employeeDisplay">
                        {(addedEmployees ?? []).map((emp) => (
                            <div className="employee-pill" key={emp.id}>
                            <h3>{emp.name}</h3>

                            <div className="addJobForm-employeeData" data-empid={emp.id}>
                                <div className="emp-div">
                                <p>ID:</p>
                                <p>{emp.employeeid}</p>
                                </div>

                                <div className="emp-div">
                                <p>Role:</p>
                                <p>{emp.role}</p>
                                </div>
                            </div>

                            {/* Remove button INSIDE the pill, after the data */}
                            <button
                                type="button"
                                className="addJob-removeBtn"
                                aria-label="Remove from list"
                                title="Remove"
                                onClick={() =>
                                setAddedEmployees((prev) => prev.filter((e) => e.id !== emp.id))
                                }
                            ><FontAwesomeIcon icon={faTrash} />
                            </button>
                            </div>
                        ))}
                    </div>


                    {/* HIDDEN INPUTS FOR FORM SUBMIT */}
                    <div id="addJob-hiddenEmployees">
                        {addedEmployees.map(emp => (
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