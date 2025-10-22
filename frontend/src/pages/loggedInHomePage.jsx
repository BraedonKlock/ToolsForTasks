import "../styles/LoggedInHomePage.css";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import JobCard from "../components/JobCard"

export default function LoggedInHomePage() {
  const [jobs, setJobs] = useState([]);
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/loggedIn/jobs", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    })();
  }, []);

return (
  <main>
    <input
      className="input-boxes"
      type="search"
      name="search"
      placeholder="Search"
    />

    <section id="jobs-jobsContainer" className="jobs-container">
      {jobs && jobs.length > 0 ? (
        jobs.map((job) => (
          <JobCard key={job.jobid} job={job} isJobsPage={false} />
        ))
      ) : (
        <h1>No Jobs Found</h1>
      )}
    </section>
  </main>
);
}