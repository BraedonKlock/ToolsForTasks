import { Link, useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";;
import { AuthContext } from "../context/AuthContext";
import "../styles/editJobPage.css";
import "../styles/toolsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function EditJobPage() {
    const {accessToken, logout} = useContext(AuthContext);
    const [error, setError] = useState("");
    const [currentEmployees, setCurrentEmployees] = useState([]);
    const [addedEmployees, setAddedEmployees] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [job, setJob] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/employees`, {
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
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}`, {
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



    function isEmployeeSelected(employeeId) {
        return currentEmployees.some((emp) => emp.id === employeeId) ||
            addedEmployees.some((emp) => emp.id === employeeId);
    }

    async function toggleEmployee(employee) {
        if (currentEmployees.some((emp) => emp.id === employee.id)) {
            await handleRemoveEmployeeFromJob(employee.id);
            return;
        }

        setAddedEmployees((prev) => {
            const exists = prev.some((emp) => emp.id === employee.id);
            if (exists) return prev.filter((emp) => emp.id !== employee.id);
            return [...prev, employee];
        });
    }

    async function handleRemoveEmployeeFromJob(employeeId) {
        try {
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/employees/${encodeURIComponent(employeeId)}`, {
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
        <section id="editJob-form">
            <Link id="editJob-form-closeBtn" className="editJob-page-backBtn" to="/loggedIn/jobs">
                <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </Link>

            <div id="editJob-container">
            <h1>Edit Job</h1>

            <form className="forms" onSubmit={onSubmit}>
                <div className="form-control">
                <label htmlFor="jobType">Job Type:</label>
                <select name="jobType" id="editJobForm-jobType" required>
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
                <input id="editJobForm-date" type="date" name="date" defaultValue={job?.date?? ""} />
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
                <textarea id="editJob-notes" name="notes" defaultValue={job?.notes?? ""}></textarea>
                </div>

                {error && <p id="error" className="error">{error}</p>}

                {employees && (
                <>
                    <section className="editJob-employeeSection">
                        <div className="editJob-employeeHeader">
                            <p>Select Employees:</p>
                        </div>

                        <div className="tools-section__cards editJob-employeeCards">
                            {employees.length === 0 ? (
                                <h6>No employees to display</h6>
                            ) : (
                                employees.map((employee) => {
                                    const name = employee?.name ?? "";
                                    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                    const selected = isEmployeeSelected(employee.id);
                                    return (
                                        <article key={employee.id ?? employee.employeeid} className="tool-card tool-card--compact editJob-employeeCard">
                                            <div className="tool-card__avatar">{firstLetter}</div>
                                            <div className="tool-card__body">
                                                <h4 className="tool-card__title">{name || "Unnamed employee"}</h4>
                                                <p className="editJob-employeeMeta">#{employee.employeeid} • {employee.role}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className={`editJob-employeeSelectBtn ${selected ? "selected" : ""}`}
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
                    <div id="editJob-hiddenEmployees">
                        {addedEmployees.map((emp) => (
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

                <hr id="editJobForm-hr" />
                <button id="editJob-addJobBtn" type="submit">Update Job</button>
            </form>
            </div>
        </section>
        </main>
    );
}
