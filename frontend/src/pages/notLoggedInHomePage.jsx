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
            Loadout eliminates the chaos of job site prep. Know exactly
            what each job needs, who is assigned, and what is loaded on the truck
            before anyone leaves the shop.
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
          <h2>Stop the daily tool scramble</h2>
          <p>
            Forgotten tools mean wasted trips, delayed jobs, and frustrated crews.
            Without a system, every morning starts with the same question:
            "Did we grab everything?"
          </p>
        </div>
        <div className="nl-problem-list">
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>Multiple trips back to the shop</p>
          </div>
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>Jobs delayed waiting for equipment</p>
          </div>
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>No visibility into who has what</p>
          </div>
          <div className="nl-problem-item">
            <span className="nl-problem-icon">X</span>
            <p>Crews guessing at requirements</p>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="nl-metrics">
        <div className="nl-metric-card">
          <h2>0</h2>
          <p>Forgotten tool runs</p>
        </div>
        <div className="nl-metric-card">
          <h2>100%</h2>
          <p>Job visibility</p>
        </div>
        <div className="nl-metric-card">
          <h2>Live</h2>
          <p>Real-time sync</p>
        </div>
      </section>

      {/* Core Features */}
      <section className="nl-features">
        <div className="nl-section-header">
          <h2>Everything your team needs</h2>
          <p>
            A complete system for managing jobs, tools, toolkits, and crews
            with real-time coordination across your entire organization.
          </p>
        </div>
        <div className="nl-feature-grid">
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Job Management</h3>
            <p>
              Create jobs with addresses, contacts, dates, notes, and photos.
              Assign tools and crew in one place.
            </p>
          </article>
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <h3>Tool Tracking</h3>
            <p>
              Add your complete tool inventory. Assign tools to jobs with
              quantities and track what is checked off before departure.
            </p>
          </article>
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>Toolkits</h3>
            <p>
              Bundle common tools together into reusable kits. Assign an
              "Electrical Kit" or "Plumbing Kit" to a job with one click.
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
            <h3>Crew Assignment</h3>
            <p>
              Assign multiple employees to each job. Everyone sees their
              assignments and knows exactly what is expected.
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
              Changes appear instantly for everyone. When a manager updates
              a job, crews see it immediately on their devices.
            </p>
          </article>
          <article className="nl-feature-card">
            <div className="nl-feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3>Role-Based Access</h3>
            <p>
              Owners manage everything. Managers handle jobs and tools.
              Crew members view their assignments and check off items.
            </p>
          </article>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="nl-roles">
        <div className="nl-section-header">
          <h2>Built for every role</h2>
          <p>
            From the owner running operations to crew members in the field,
            everyone gets exactly the access they need.
          </p>
        </div>
        <div className="nl-roles-grid">
          <div className="nl-role-card nl-role-owner">
            <span className="nl-role-badge">Owner</span>
            <h3>Full Control</h3>
            <ul>
              <li>Manage all employees</li>
              <li>Create and edit jobs</li>
              <li>Configure tools and toolkits</li>
              <li>Organization-wide visibility</li>
            </ul>
          </div>
          <div className="nl-role-card nl-role-manager">
            <span className="nl-role-badge">Manager</span>
            <h3>Operations Lead</h3>
            <ul>
              <li>Create and manage jobs</li>
              <li>Assign crews and tools</li>
              <li>Track job readiness</li>
              <li>Manage tool inventory</li>
            </ul>
          </div>
          <div className="nl-role-card nl-role-crew">
            <span className="nl-role-badge">Crew</span>
            <h3>Field Ready</h3>
            <ul>
              <li>View assigned jobs</li>
              <li>See required tools</li>
              <li>Check off loaded items</li>
              <li>Access job details</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="nl-workflow">
        <div className="nl-section-header">
          <h2>How it works</h2>
          <p>Get your team organized in three simple steps.</p>
        </div>
        <div className="nl-workflow-steps">
          <div className="nl-step">
            <span>01</span>
            <h3>Set up your shop</h3>
            <p>
              Add your employees, input your tool inventory, and create
              toolkits for common job types.
            </p>
          </div>
          <div className="nl-step">
            <span>02</span>
            <h3>Create jobs</h3>
            <p>
              Add job details, assign your crew, and select the tools
              and toolkits each job requires.
            </p>
          </div>
          <div className="nl-step">
            <span>03</span>
            <h3>Load out with confidence</h3>
            <p>
              Crews check off tools as they load. Everyone knows the
              truck is ready before it leaves.
            </p>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="nl-app-preview">
        <div className="nl-section-header">
          <h2>See it in action</h2>
          <p>
            Here is what you will be working with. A clean, intuitive interface
            designed for real job sites.
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

      {/* Speed Section */}
      <section className="nl-speed">
        <div className="nl-section-header">
          <h2>Set up in minutes, not hours</h2>
          <p>
            We built Loadout to respect your time. No clunky data entry,
            no repetitive busywork. Get your entire operation configured fast
            and keep it running even faster.
          </p>
        </div>
        <div className="nl-speed-grid">
          <div className="nl-speed-card">
            <div className="nl-speed-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </div>
            <h3>Bulk Tool Import</h3>
            <p className="nl-speed-tagline">Add your entire inventory in one shot</p>
            <p>
              Forget adding tools one at a time. Drop in 10, 50, or 100 tools
              at once and watch your inventory populate instantly. What used to
              take an afternoon now takes seconds.
            </p>
            <ul className="nl-speed-benefits">
              <li>Add multiple tools in a single action</li>
              <li>No repetitive form filling</li>
              <li>Get operational on day one</li>
            </ul>
          </div>
          <div className="nl-speed-card">
            <div className="nl-speed-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <h3>Reusable Toolkits</h3>
            <p className="nl-speed-tagline">Build once, assign forever</p>
            <p>
              Running the same type of job over and over? Create a toolkit once
              with every tool that job type needs. Next time you create a job,
              one click adds the entire kit. No more rebuilding the same list
              from scratch every single time.
            </p>
            <ul className="nl-speed-benefits">
              <li>Pre-built kits for every job type</li>
              <li>Assign 20 tools with one click</li>
              <li>Eliminate repetitive list building</li>
            </ul>
          </div>
        </div>
        <div className="nl-speed-summary">
          <p>
            <strong>The bottom line:</strong> Less time managing tools means more
            time doing the work that actually makes you money.
          </p>
        </div>
      </section>

      {/* Visual Features */}
      <section className="nl-visual-features">
        <div className="nl-section-header">
          <h2>See it all at a glance</h2>
          <p>
            Visual tools help your team work faster and with fewer mistakes.
          </p>
        </div>
        <div className="nl-visual-grid">
          <div className="nl-visual-card">
            <div className="nl-visual-preview">
              <div className="nl-mock-image"></div>
            </div>
            <h3>Job Photos</h3>
            <p>Upload photos for each job so crews know exactly where they are headed.</p>
          </div>
          <div className="nl-visual-card">
            <div className="nl-visual-preview">
              <div className="nl-mock-avatar"></div>
              <div className="nl-mock-avatar"></div>
              <div className="nl-mock-avatar"></div>
            </div>
            <h3>Employee Profiles</h3>
            <p>Add profile photos so everyone can put a face to a name.</p>
          </div>
          <div className="nl-visual-card">
            <div className="nl-visual-preview">
              <div className="nl-mock-checklist">
                <div className="nl-mock-check checked"></div>
                <div className="nl-mock-check checked"></div>
                <div className="nl-mock-check"></div>
              </div>
            </div>
            <h3>Live Checklists</h3>
            <p>Watch tools get checked off in real-time as your team loads up.</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="nl-proof">
        <div className="nl-proof-card">
          <div className="nl-quote-mark">"</div>
          <h2>We stopped losing hours to forgotten equipment.</h2>
          <p>
            "Before Loadout, we had no system. Guys would get to a job
            and realize they left the concrete saw back at the shop. Now everyone
            checks their list, confirms the loadout, and we roll. No more guessing,
            no more wasted trips."
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
          <h2>Ready to run tighter crews?</h2>
          <p>
            Get your team on the same page. Every job stocked, every tool
            tracked, every crew member informed.
          </p>
        </div>
        <div className="nl-cta-buttons">
          <Link className="nl-btn primary" to="/create-account">
            Start Free Today
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
