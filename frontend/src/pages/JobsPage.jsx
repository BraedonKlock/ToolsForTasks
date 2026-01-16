import { useEffect, useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/JobsPage.css";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client"; // importing socket.io client

export default function JobsPage() {
  const { accessToken, user, logout } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null); // holding socket instance
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const jobId = (job.jobid || "").toString().toLowerCase();
    const title = (job.title || "").toLowerCase();
    const address = (job.address || "").toLowerCase();
    const date = (job.date || "").toLowerCase();
    return jobId.includes(query) || title.includes(query) || address.includes(query) || date.includes(query);
  });

  /** fetching jobs from the backend so the page can be updated when the db changes
   * useCallback is implemented because useEffect has loadJobs in its dependency array,
   * so without useCallback React would treat loadJobs as a new function on every render
   * and re-run the effect each time. useCallback keeps the same function reference
   * unless accessToken or logout change, so the effect only runs when it actually needs to.
  */
  const loadJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/loggedIn/jobs", {
          headers:{ Authorization: `Bearer ${accessToken}` },
      });

      if(res.status === 401) {
        logout();
        return
      }

      if(!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error("Failed to fetch Jobs, Try again later.");
      };

      if(res.ok) {
          const data = await res.json();
          setJobs(data.jobs);
      }

    } catch(err) {
      setError(err.message)
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, logout]);

  useEffect(() => {
    if (!accessToken) return;
    loadJobs();
  }, [accessToken, loadJobs]);

  // creating socket connection so this page can listen for changes from the server
  useEffect(() => {
    if (!accessToken) return;

    const socketUrl = `http://${window.location.hostname}:3000`;
    const s = io(socketUrl, {
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
        placeholder="Search by ID, title, address, or date"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
        <div className="jobs-section__header jobs-section__header--split">
          <h3>Jobs</h3>
          <Link className="pill pill--ghost" to="/loggedIn/add-job">
            <span className="pill__icon" aria-hidden="true">
              +
            </span>
            Add Job
          </Link>
        </div>
      {error && <p id="error" className="error">{error}</p>}

      <section id="jobs-jobsContainer" className="jobs-container">
        {isLoading ? (
          <LoadingSpinner message="Loading jobs..." />
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} isJobsPage={true} onDeleteSuccess={handleDeleteSuccess}/>
          ))
        ) : searchQuery.trim() ? (
          <h1>No Jobs Found</h1>
        ) : (
          <h1>No Jobs Created</h1>
        )}
      </section>
    </main>
  );
}
