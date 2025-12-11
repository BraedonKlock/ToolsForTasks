import { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/JobsPage.css";
import JobCard from "../components/JobCard";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client"; // importing socket.io client

export default function JobsPage() {
  const { accessToken, user, logout } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [socket, setSocket] = useState(null); // holding socket instance

  // fetching jobs from the backend so the page can be updated when the db changes
  const loadJobs = useCallback(async () => {
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
  }, [accessToken, logout]);

  useEffect(() => {
    if (!accessToken) return;
    loadJobs();
  }, [accessToken, loadJobs]);

  // creating socket connection so this page can listen for changes from the server
  useEffect(() => {
    if (!accessToken) return;

    const s = io("http://localhost:3000", {
      auth: { token: accessToken },
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [accessToken]);

  // listening for jobs:changed so we can reload jobs from the database
  useEffect(() => {
    if (!socket) return;

    const handleJobsChanged = () => {
      loadJobs();
    };

    socket.on("jobs:changed", handleJobsChanged);

    return () => {
      socket.off("jobs:changed", handleJobsChanged);
    };
  }, [socket, loadJobs]);

  function handleDeleteSuccess(deletedId) {
    const newJobs = jobs.filter((job) => job.id !== deletedId);
    setJobs(newJobs);
  }

  return (
    <main className="jobs-page">
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
