import { Link } from "react-router-dom";
import "../styles/notLoggedInHomePage.css";

export default function notLoggedInHomePage() {
  return (
    <main id="notLoggedInHomePage-main">
      {/* Hero Section */}
      <section className="nl-hero">
        <div className="nl-hero-content">
          <p className="nl-eyebrow">Job Site Management for Trade Teams</p>
          <h1>Every tool. Every job. Every crew member. In sync.</h1>
          <p className="nl-lead">
            Stop the morning chaos. Loadout ensures your crew knows exactly what
            to load, who is assigned, and where they are headed before the
            truck leaves the shop.
          </p>
          <div className="nl-hero-cta">
            <Link className="nl-btn primary" to="/create-account">
              Get Started Free
            </Link>
            <Link className="nl-btn ghost" to="/login">
              Log in
            </Link>
          </div>
          <div className="nl-hero-meta">
            <span>Real-time updates</span>
            <span>Role-based access</span>
            <span>Mobile-ready</span>
          </div>
        </div>
        <div className="nl-hero-card">
          <img
            src="/images/Logo.png"
            alt="Loadout logo"
            className="nl-hero-logo"
          />
          <div className="nl-hero-card-body">
            <h3>Maple Street Renovation</h3>
            <div className="nl-hero-job-meta">
              <span className="nl-job-badge">3 crew assigned</span>
              <span className="nl-job-badge">12 tools ready</span>
            </div>
            <ul>
              <li className="nl-checked">Electrical Kit (5 tools)</li>
              <li className="nl-checked">Hammer drill</li>
              <li className="nl-checked">Extension cords</li>
              <li>Laser level</li>
            </ul>
            <p className="nl-hero-note">
              Live status updates as your team prepares.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="nl-problem">
        <div className="nl-problem-content">
          <h2>Forgotten tools cost you money</h2>
          <p>
            Every trip back to the shop is lost time, delayed jobs, and
            frustrated crews. Without a system, you are gambling every morning.
          </p>
        </div>
        <div className="nl-problem-list">
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>Wasted hours on return trips</p>
          </div>
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>Jobs delayed waiting for equipment</p>
          </div>
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>No visibility into who has what</p>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="nl-app-preview">
        <div className="nl-section-header">
          <h2>See it in action</h2>
          <p>
            A clean, intuitive interface built for the job site, not the office.
          </p>
        </div>
        <div className="nl-preview-grid">
          <div className="nl-preview-card">
            <div className="nl-preview-image-wrapper">
              <img
                src="/images/viewJobs.jpg"
                alt="Jobs list view showing all scheduled jobs"
                className="nl-preview-image"
              />
            </div>
            <h3>View All Jobs</h3>
            <p>See every job at a glance with dates and addresses.</p>
          </div>
          <div className="nl-preview-card">
            <div className="nl-preview-image-wrapper nl-preview-scrollable">
              <img
                src="/images/add_editJobs.jpg"
                alt="Add or edit job details"
                className="nl-preview-image"
              />
            </div>
            <h3>Add & Edit Jobs</h3>
            <p>Create and update jobs, assign employees, and select the tools needed for the task.</p>
          </div>
          <div className="nl-preview-card">
            <div className="nl-preview-image-wrapper">
              <img
                src="/images/checkTools.jpg"
                alt="Tool checklist interface"
                className="nl-preview-image"
              />
            </div>
            <h3>Check Off Tools</h3>
            <p>Crews check off tools as they load. Everyone knows when the truck is ready.</p>
          </div>
          <div className="nl-preview-card">
            <div className="nl-preview-image-wrapper">
              <img
                src="/images/employees.jpg"
                alt="Employee management screen"
                className="nl-preview-image"
              />
            </div>
            <h3>Manage Your Team</h3>
            <p>View your crew, assign roles, and create accounts all in one place.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="nl-workflow">
        <div className="nl-section-header">
          <h2>Up and running in minutes</h2>
          <p>No training required. If your crew can use a phone, they can use Loadout.</p>
        </div>
        <div className="nl-workflow-steps">
          <div className="nl-step">
            <span>01</span>
            <h3>Add your tools</h3>
            <p>
              Import your entire inventory at once. Create reusable toolkits
              for common job types.
            </p>
          </div>
          <div className="nl-step">
            <span>02</span>
            <h3>Create a job</h3>
            <p>
              Enter the details, assign your crew, and select the tools
              they will need.
            </p>
          </div>
          <div className="nl-step">
            <span>03</span>
            <h3>Load out</h3>
            <p>
              Your crew checks off each tool as they load. You see it happen
              in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="nl-features">
        <div className="nl-section-header">
          <h2>Built for how you actually work</h2>
          <p>
            Every feature designed to save time and eliminate mistakes.
          </p>
        </div>
        <div className="nl-feature-grid">
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>Reusable Toolkits</h3>
            <p>
              Bundle tools into kits for common jobs. Assign 20 tools with
              one tap instead of selecting them individually.
            </p>
          </article>
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>Real-Time Sync</h3>
            <p>
              Changes appear instantly across all devices. Update a job from
              the office and your crew sees it immediately.
            </p>
          </article>
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Role-Based Access</h3>
            <p>
              Owners see everything. Managers handle jobs and tools. Crew
              members see their assignments and check off items.
            </p>
          </article>
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <h3>Bulk Import</h3>
            <p>
              Add your entire tool inventory in one shot. No tedious
              one-by-one data entry.
            </p>
          </article>
        </div>
      </section>

      {/* Testimonial */}
      <section className="nl-proof">
        <div className="nl-proof-card">
          <div className="nl-quote-mark">"</div>
          <h2>We stopped losing hours to forgotten equipment.</h2>
          <p>
            "Before Loadout, guys would get to a job and realize they left
            the concrete saw back at the shop. Now everyone checks their list,
            confirms the loadout, and we roll. No more guessing, no more
            wasted trips."
          </p>
          <div className="nl-testimonial-author">
            <span className="nl-author-name">Operations Manager</span>
            <span className="nl-author-company">Regional Construction Firm</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="nl-cta">
        <div>
          <h2>Ready to eliminate the guesswork?</h2>
          <p>
            Get your crew on the same page. Start free today.
          </p>
        </div>
        <div className="nl-cta-buttons">
          <Link className="nl-btn primary" to="/create-account">
            Get Started Free
          </Link>
          <Link className="nl-btn ghost" to="/login">
            Log in
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="nl-footer">
        <p>Loadout</p>
        <p className="nl-footer-tagline">Job site management for trade teams</p>
      </footer>
    </main>
  );
}
