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

  return <main><pre>{JSON.stringify(jobs, null, 2)}</pre></main>
    
}