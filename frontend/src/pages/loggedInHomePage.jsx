import "../styles/LoggedInHomePage.css";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import JobCard from "../components/JobCard"

export default function LoggedInHomePage() {
  const [jobs, setJobs] = useState([]);
  const { accessToken, logout } = useContext(AuthContext);
  const [error, setError] = useState("");

useEffect(() => {
  (async () => {
    try {
      const res = await fetch("/api/loggedIn/jobs", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if(res.status === 401) {
        logout();
        return
      }

      if(!res.ok) {
        throw new Error("Failed to fetch jobs, try again later");
      }

      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (err) {
      setError(err.message);
    }
  })();
}, []);


return (
  <main className="loggedinHomePage">
    <input
      className="job-search"
      type="search"
      name="search"
      placeholder="Search"
    />

    <section id="jobs-jobsContainer" className="jobs-container">
                  {error && (
                <p className="error">{error}</p>
            )}
      {jobs && jobs.length > 0 ? (
        jobs.map((job) => (
          <JobCard key={job.jobid} job={job} isJobsPage={false} />
        ))
      ) : (
        <h1>No Jobs Created</h1>
      )}
    </section>
  </main>
);
}