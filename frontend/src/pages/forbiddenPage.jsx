import { Link } from "react-router-dom";
import "../styles/forbiddenPage.css";

export default function ForbiddenPage() {
  return (
    <main className="forbidden-page">
      <div className="forbidden-card">
        <p className="forbidden-eyebrow">403</p>
        <h1>Forbidden</h1>
        <p className="forbidden-copy">You do not have permission to view this page.</p>
      </div>
    </main>
  );
}
