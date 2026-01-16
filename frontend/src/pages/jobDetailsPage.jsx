import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "../styles/jobDetailsPage.css";
import LoadingSpinner from "../components/LoadingSpinner";

export default function JobDetailsPage() {
    const { accessToken, logout } = useContext(AuthContext);
    const [error, setError] = useState("");
    const [job, setJob] = useState(null);
    const [tools, setTools] = useState([]);
    const [selectedToolIds, setSelectedToolIds] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTools, setIsLoadingTools] = useState(true);
    const { id } = useParams();


    const loadJobDetails = useCallback(async (signal) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal,
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch job details, try again later.");
            }

            const data = await res.json();
            setJob(data.job);
        } catch (err) {
            if (err.name !== "AbortError") setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, id, logout]);

    const loadJobTools = useCallback(async (signal) => {
        try {
            setIsLoadingTools(true);
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/tools`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal,
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch job tools, try again later.");
            }

            const data = await res.json();
            const loadedTools = data.tools ?? [];
            setTools(loadedTools);
            setSelectedToolIds(
                loadedTools
                    .filter((tool) => Number(tool.is_selected) === 1)
                    .map((tool) => tool.id)
            );
        } catch (err) {
            if (err.name !== "AbortError") {
                setError(err.message);
                setTools([]);
            }
        } finally {
            setIsLoadingTools(false);
        }
    }, [accessToken, id, logout]);

    useEffect(() => {
        const controller = new AbortController();
        loadJobDetails(controller.signal);
        return () => controller.abort();
    }, [loadJobDetails]);

    useEffect(() => {
        const controller = new AbortController();
        loadJobTools(controller.signal);
        return () => controller.abort();
    }, [loadJobTools]);

    useEffect(() => {
        if (!accessToken) return;

        const socketUrl = `http://${window.location.hostname}:3000`;
        const s = io(socketUrl, {
            auth: { token: accessToken },
        });

        s.on("connect", () => {
            console.log("Job details socket connected:", s.id);
        });

        s.on("connect_error", (err) => {
            console.error("Job details socket connect error:", err.message);
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, [accessToken]);

    useEffect(() => {
        if (!socket) return;

        const handleJobToolsChanged = (payload) => {
            if (!payload || Number(payload.jobId) !== Number(id)) return;
            loadJobTools();
        };

        const handleJobsChanged = () => {
            loadJobDetails();
            loadJobTools();
        };

        socket.on("jobTools:changed", handleJobToolsChanged);
        socket.on("jobs:changed", handleJobsChanged);

        return () => {
            socket.off("jobTools:changed", handleJobToolsChanged);
            socket.off("jobs:changed", handleJobsChanged);
        };
    }, [socket, loadJobTools, loadJobDetails, id]);

    async function toggleToolSelection(toolId) {
        const shouldSelect = !selectedToolIds.includes(toolId);
        setSelectedToolIds((prev) =>
            shouldSelect ? [...prev, toolId] : prev.filter((id) => id !== toolId)
        );

        try {
            const res = await fetch(`/api/loggedIn/jobs/${encodeURIComponent(id)}/tools/${toolId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ isSelected: shouldSelect ? 1 : 0 })
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to update tool selection, try again later.");
            }
        } catch (err) {
            setError(err.message);
            setSelectedToolIds((prev) =>
                shouldSelect ? prev.filter((id) => id !== toolId) : [...prev, toolId]
            );
        }
    }


    return (
        <main className="jobsDetails-page">
            <Link to="/loggedIn/" className="jobDetails-backBtn" ><FontAwesomeIcon icon={faArrowLeft} className="icon" /></Link>
            <section className="jobDetails-container">
                {error && (<p className="error">{error}</p>)}

                {isLoading ? (
                    <LoadingSpinner message="Loading job details..." />
                ) : job && (
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
                            {isLoadingTools ? (
                                <LoadingSpinner message="Loading tools..." />
                            ) : tools.length === 0 ? (
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
