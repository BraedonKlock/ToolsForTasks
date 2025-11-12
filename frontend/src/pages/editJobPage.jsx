import { Link, useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";;
import { AuthContext } from "../context/AuthContext";
import "../styles/editJobPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function EditJobPage() {
    const {accessToken, logout} = useContext(AuthContext);
    const [error, setError] = useState("");
    const [currentEmployees, setCurrentEmployees] = useState([]);
    const [addedEmployees, setAddedEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [job, setJob] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/jobEmployees/${encodeURIComponent(id)}`, {
                    headers: {Authorization: `Bearer ${accessToken}`}
                });

                if (res.status === 401) {
                    logout();
                    return;
                }

                if (!res.ok) {
                    throw new Error("Failed to load employees for the job.");
                }

                const data = await res.json();
                setCurrentEmployees(data.employees);
            } catch(err) {
                setError(err.message);
            }
        })();


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
                throw new Error("Failed to load employees, try again later.");
            }

            const data = await res.json();
            setEmployees(data.employees);
            } catch (err) {
            setError(err.message);
            }
        })();

        (async () => {
            try {
            const res = await fetch(`/api/loggedIn/jobDetails/${encodeURIComponent(id)}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {

                throw new Error("Failed to fetch job details, try again later.");
            }

            if (res.ok) {
                const data = await res.json();
                setJob(data.job);
            }
            } catch (err) {
            setError(err.message);
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
        for (let i = 0; i < currentEmployees.length; i++) {
            if (currentEmployees[i].employeeid === selected.employeeid) {
            alreadyAdded = true;
            break;
            }
        }

        // If already in list, stop the function
        if (alreadyAdded) return;

        // Add the employee to state (append to existing list)
        setAddedEmployees(prev => [...prev, selected]);
    }

    async function handleRemoveEmployeeFromJob(employeeId) {
        try {
            const res = await fetch(`/api/loggedIn/employeesFromJobs/${encodeURIComponent(id)}/employees/${encodeURIComponent(employeeId)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res.status !== 200) {
                const data= await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }
            }

            setCurrentEmployees((prev) => prev.filter((e) => e.id !== employeeId));
        } catch(err) {
            setError(err.message);
        }
    }

    async function onSubmit(e) {
        const form = new FormData(e.currentTarget);
        const payload = Object.fromEntries(form.entries());
        payload.employeeIds = form.getAll("employeeIds[]").map(Number);

        // remove junk keys the server doesn’t want
        delete payload["employeeIds[]"];
        delete payload.addEmployee;

        try {
            e.preventDefault();

            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json()
                if (data.error) {
                    throw new Error(data.error)
                }
            }
            
            navigate("/loggedIn/jobs");
        } catch(err) {
            setError(err.message);
        }
    }

    return (
        <main className="editJob-page">
        <section id="addJob-form">
            <Link id="addJob-form-closeBtn" className="jobDetails-backBtn" to="/loggedIn/jobs">
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="addJob-container">
            <h1>Edit Job</h1>

            <form className="forms" onSubmit={onSubmit}>
                <div className="form-control">
                <label htmlFor="jobType">Job Type:</label>
                <select name="jobType" id="addJobForm-jobType" required>
                    <option value={job?.jobType?? ""} disabled hidden>{job?.jobType?? ""}</option>
                    <option value="roofing">Roofing</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="siding">Siding</option>
                </select>
                </div>

                <div className="form-control">
                <label htmlFor="jobid">Job ID:</label>
                <input type="text" name="jobid" defaultValue={job?.jobid?? ""}/>
                </div>

                <div className="form-control">
                <label htmlFor="title">Title:</label>
                <input type="text" name="title" defaultValue={job?.title?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="date">Date:</label>
                <input id="addJobForm-date" type="date" name="date" defaultValue={job?.date?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="address">Address:</label>
                <input type="text" name="address" defaultValue={job?.address?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="phoneNumber">Phone #:</label>
                <input type="text" name="phoneNumber" defaultValue={job?.phoneNumber?? ""} />
                </div>

                <div className="form-control">
                <label htmlFor="notes">Notes:</label>
                <textarea id="addJob-notes" name="notes" defaultValue={job?.notes?? ""}></textarea>
                </div>

                {error && <p id="login-error" className="error">{error}</p>}

                {employees.length > 0 && (
                <>
                    <div className="form-control">
                    <label htmlFor="addEmployee">Choose:</label>
                    <select
                        name="addEmployee"
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
                            {employee.name} — #{employee.employeeid} • {employee.role}
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

                    {/* VISIBLE EMPLOYEE DISPLAY FOR CURRENTEMPLOYEES*/}
                    <div id="addJob-employeeDisplay">
                        {(currentEmployees ?? []).map((emp) => (
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
                                onClick={() => {handleRemoveEmployeeFromJob(emp.id)}
                                }
                            ><FontAwesomeIcon icon={faTrash} />
                            </button>
                            </div>
                        ))}


                        {/* VISIBLE EMPLOYEE DISPLAY */}
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
                                key={`hidden-${emp.employeeid}`}
                                type="hidden"
                                name="employeeIds[]"
                                value={emp.id}
                            />
                        ))}
                    </div>
                </>
                )}

                <hr id="addJobForm-hr" />
                <button id="addJob-addJobBtn" type="submit">Update Job</button>
            </form>
            </div>
        </section>
        </main>
    );
}