import "../styles/LoggedInHomePage.css";
import { useEffect, useState } from "react";


export default function LoggedInHomePage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/loggedIn/jobs", {
        headers: { Authorization: `Bearer ${window.accessToken}` },
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
          <div key={job.jobid} data-job-id={job.jobid} className="job-card">
            <img
              className="job-image"
              src={`./public/images/${String(job.jobType).toLowerCase()}.png`}
              alt={job.jobType}
            />
            <div className="job-text">
              <h6>ID: {job.jobid}</h6>
              <h6>{job.title}</h6>
              <h6>{job.date}</h6>
              <h6>{job.address}</h6>
            </div>
          </div>
        ))
      ) : (
        <h1>No Jobs Found</h1>
      )}
    </section>
  </main>
);
}