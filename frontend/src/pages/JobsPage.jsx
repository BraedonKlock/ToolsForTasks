import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/JobsPage.css";
import JobCard from "../components/JobCard";
import { AuthContext } from "../context/AuthContext";

export default function JobsPage() {
  const { accessToken, user, logout } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
      (async () => {
        try {
          const res = await fetch("/api/loggedIn/jobs", {
              headers:{ Authorization: `Bearer ${accessToken}` },
          });

          if(res.status === 401) {
            logout();
            return
          }

          if(!res.ok) {
              const data = await res.json().catch(() => ({})); // safe parse
                throw new Error("Failed to fetch Jobs, Try again later.");
          };

          if(res.ok) {
              const data = await res.json();
              setJobs(data.jobs);
          }

        } catch(err) {
          setError(err.message)
        }
      })();
  }, []);

  function handleDeleteSuccess(deletedId) {
    const newJobs = jobs.filter((job) => job.id !== deletedId);
    setJobs(newJobs);
  }

  return (
    <main>
      <input
        className="job-search"
        type="search"
        name="search"
        placeholder="Search"
      />
        {error && <p id="login-error" className="error">{error}</p>}

      <section id="jobs-jobsContainer" className="jobs-container">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} isJobsPage={true} onDeleteSuccess={handleDeleteSuccess}/>
          ))
        ) : (
          <h1>No Jobs Found</h1>
        )}
      </section>
      {user?.role === "owner" && (
        <Link to="/loggedIn/add-job">
          <img id="addJob-image" src="/images/add.png" alt="Add Job" />
        </Link>
      )}
    </main>
  );
}