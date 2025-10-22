import { useState, useRef, useEffect} from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job, isJobsPage }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

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

return (
    <>
        <div className="job-card-wrapper">
            {!isJobsPage && (

            <Link to={`/job-details/${job.jobid}`} className="job-card-link">
                <div className="job-card" data-job-id={job.jobid}>
                <img
                    className="job-image"
                    src={`/images/${String(job.jobType).toLowerCase()}.png`}
                    alt={job.jobType}
                />
                <div className="job-text">
                    <h6>ID: {job.jobid}</h6>
                    <h6>{job.title}</h6>
                    <h6>{job.date}</h6>
                    <h6>{job.address}</h6>
                </div>
                </div>
            </Link>
            )}

        {isJobsPage && (
            <>
                <div className="job-card" data-job-id={job.jobid}>
                    <img
                        className="job-image"
                        src={`/images/${String(job.jobType).toLowerCase()}.png`}
                        alt={job.jobType}
                    />
                    <div className="job-text">
                        <h6>ID: {job.jobid}</h6>
                        <h6>{job.title}</h6>
                        <h6>{job.date}</h6>
                        <h6>{job.address}</h6>
                    </div>

                    <div className="threeDotMenu-container" ref={menuRef}>
                        {menuOpen && (
                            <section className="threeDotMenu-options">
                            <Link to={`/edit-job/${job.jobid}`} id="editJobHref">EDIT</Link>
                            <button
                                type="button"
                                data-job-id={job.jobid}
                                className="deleteJob-btn"
                                onClick={() => console.log("Delete job:", job.jobid)}
                            >
                                DELETE
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
                            ⋮
                        </button>
                    </div>
                </div>
            </>
        )}
        </div>
    </>
  );
}