import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "../styles/jobDetailsPage.css";

export default function JobDetailsPage() {
    const { accessToken, logout } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [job, setJob] = useState(null);
    const [tools, setTools] = useState([]);
    const [selectedToolIds, setSelectedToolIds] = useState([]);
    const { id } = useParams();


    useEffect(() => {
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
    }, [accessToken, id, logout]);

    useEffect(() => {
    (async () => {
        try {
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/tools`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch job tools, try again later.");
            }

            const data = await res.json();
            setTools(data.tools ?? []);
        } catch (err) {
            setError(err.message);
            setTools([]);
        }
    })();
    }, [accessToken, id, logout]);

    function toggleToolSelection(toolId) {
        setSelectedToolIds((prev) =>
            prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
        );
    }


    return (
        <main className="jobsDetails-page">
            <Link to="/loggedIn/" className="jobDetails-backBtn" ><FontAwesomeIcon icon={faArrowLeft} className="icon" /></Link>
            <section className="jobDetails-container">
                {error && (<p className="error">{error}</p>)}

                {job && (
                    <>
                    <article className="jobDetails-subContainer">
                        <img
                        className="jobDetails-image"
                        src={`/images/${String(job.jobType).toLowerCase()}.png`}
                        alt={job.jobType || "job"}
                        />
                        <div className="jobDetails-text">
                        <h6>ID: {job.jobid}</h6>
                        <h6>{job.title}</h6>
                        <h6>{job.date}</h6>
                        <h6>{job.address}</h6>
                        <h6>{job.phoneNumber}</h6>
                        </div>
                    </article>
                    <p id="jobDetails-notes">
                        Notes:<br />
                        {job.notes}
                    </p>
                    <section className="jobDetails-toolsSection">
                        <div className="jobDetails-toolsHeader">
                            <h4>Tools</h4>
                        </div>
                        <div className="addToolKitPage-toolsList jobDetails-toolsList">
                            {tools.length === 0 ? (
                                <h6>No tools to display</h6>
                            ) : (
                                tools.map((tool) => {
                                    const name = tool?.name ?? "";
                                    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
                                    const selectedQuantity = tool.selected_quantity ?? tool.selectedQuantity ?? 1;
                                    const selected = selectedToolIds.includes(tool.id);
                                    return (
                                        <button
                                            key={tool.id ?? name}
                                            type="button"
                                            className={`addToolKitPage-toolRow jobDetails-toolRow ${selected ? "jobDetails-toolRow--selected" : ""}`}
                                            onClick={() => toggleToolSelection(tool.id)}
                                        >
                                            <div className="addToolKitPage-toolInfo">
                                                <span className="addToolKitPage-toolInitial">{firstLetter}</span>
                                                <span className="addToolKitPage-toolName">{name || "Unnamed tool"}</span>
                                            </div>
                                            <span className="jobDetails-toolQty">x{selectedQuantity}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </section>
                    </>
                )}
            </section>
        </main>
    )
}
