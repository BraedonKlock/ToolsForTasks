import { useState, useRef, useEffect, useContext} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function JobCard({ job, isJobsPage, onDeleteSuccess }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [error, setError] = useState("");
    const menuRef = useRef(null);
    const { accessToken } = useContext(AuthContext);
    

    useEffect(() => {
        function handleClickOutside(event) {
            if(menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        }
    }, []);

    async function handleDelete() {
        try {
            const res = await fetch(`/api/loggedIn/jobs/${job.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
                if (onDeleteSuccess) onDeleteSuccess(job.id);
            } else {
                throw new Error("Could not delete Job")
            }
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <>
            {error && (
                <p className="error">{error}</p>
            )}
            <div className="job-card-wrapper">
                {!isJobsPage && (

                <Link to={`/loggedIn/job-details/${job.id}`} className="job-card-link">
                    <div className="job-card" data-job-id={job.jobid}>
                    <div className="job-avatar-wrapper">
                        <div className={`job-avatar ${job.image ? 'has-image' : ''}`}>
                            {job.image ? (
                                <img src={`/uploads/jobs/${job.image}`} alt={job.title || 'Job'} className="job-avatar-image" />
                            ) : (
                                job.jobid
                            )}
                        </div>
                        {job.image && <span className="job-avatar-label">{job.jobid}</span>}
                    </div>
                    <div className="job-text">
                        <h6>{job.title}</h6>
                        <h6>{job.date}</h6>
                        <h6>{job.address}</h6>
                    </div>
                    </div>
                </Link>
                )}

            {isJobsPage && (
                <>
                    <div className="job-card" data-job-id={job.id}>
                        <div className="job-avatar-wrapper">
                            <div className={`job-avatar ${job.image ? 'has-image' : ''}`}>
                                {job.image ? (
                                    <img src={`/uploads/jobs/${job.image}`} alt={job.title || 'Job'} className="job-avatar-image" />
                                ) : (
                                    job.jobid
                                )}
                            </div>
                            {job.image && <span className="job-avatar-label">{job.jobid}</span>}
                        </div>
                        <div className="job-text">
                            <h6>{job.title}</h6>
                            <h6>{job.date}</h6>
                            <h6>{job.address}</h6>
                        </div>

                        <div className="threeDotMenu-container" ref={menuRef}>
                            {menuOpen && (
                                <section className="threeDotMenu-options active">
                                    <Link to={`/loggedIn/edit-job/${job.id}`} id="editJobHref"> <FontAwesomeIcon icon={faPenToSquare} className="icon" /></Link>
                                    <button
                                        type="button"
                                        data-job-id={job.id}
                                        className="delete-btn"
                                        onClick={handleDelete}
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="delete-icon" />
                                    </button>
                                </section>
                            )}
                            <button
                                className="three-dot-menu-icon"
                                aria-label="More options"
                                onClick={(e) => {
                                e.stopPropagation(); // Stop click from triggering card link
                                setMenuOpen((prev) => !prev);
                                }}
                            >
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        </div>
                    </div>
                </>
            )}
            </div>
        </>
    );
}
