import "../styles/LoggedInHomePage.css";
import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import JobCard from "../components/JobCard"
import { io } from "socket.io-client"; // importing socket.io client
import LoadingSpinner from "../components/LoadingSpinner";

export default function LoggedInHomePage() {
  const [jobs, setJobs] = useState([]);
  const { accessToken, logout } = useContext(AuthContext);
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
      console.log("Home socket connected:", s.id);
    });

    s.on("connect_error", (err) => {
      console.error("Home socket connect error:", err.message);
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

  return (
    <main className="loggedinHomePage">
      <input
        className="job-search"
        type="search"
        name="search"
        placeholder="Search by ID, title, address, or date"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <section id="jobs-jobsContainer" className="jobs-container">
        {error && (
          <p className="error">{error}</p>
        )}
        {isLoading ? (
          <LoadingSpinner message="Loading jobs..." />
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.jobid} job={job} isJobsPage={false} />
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
