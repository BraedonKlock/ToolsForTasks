import { Link } from "react-router-dom";
import "../styles/notLoggedInHomePage.css";

export default function notLoggedInHomePage() {
    return (
        <main id="notLoggedInHomePage-main">
        <section className="nl-hero">
            <div className="nl-hero-content">
            <p className="nl-eyebrow">Built for construction teams</p>
            <h1>Never leave the shop without the right tools.</h1>
            <p className="nl-lead">
                Tools for Tasks keeps every job stocked and ready. Track what each
                job needs, assign tools to crews, and stop forgotten tool runs
                before they start.
            </p>
            <div className="nl-hero-cta">
                <Link className="nl-btn primary" to="/create-account">
                Start free
                </Link>
                <Link className="nl-btn ghost" to="/login">
                Log in
                </Link>
            </div>
            <div className="nl-hero-meta">
                <span>Instant setup</span>
                <span>Mobile-first workflow</span>
                <span>Job-ready checklists</span>
            </div>
            </div>
            <div className="nl-hero-card">
            <img
                src="/images/lg.png"
                alt="Tools for Tasks logo"
                className="nl-hero-logo"
            />
            <div className="nl-hero-card-body">
                <h3>Today’s loadout</h3>
                <ul>
                <li>Concrete saw</li>
                <li>Laser level</li>
                <li>Hammer drill</li>
                <li>Extension cords</li>
                </ul>
                <p className="nl-hero-note">
                Every tool checked in, before the truck rolls.
                </p>
            </div>
            </div>
        </section>

        <section className="nl-metrics">
            <div className="nl-metric-card">
            <h2>0</h2>
            <p>Forgotten tools per trip</p>
            </div>
            <div className="nl-metric-card">
            <h2>15 min</h2>
            <p>Saved on every loadout</p>
            </div>
            <div className="nl-metric-card">
            <h2>100%</h2>
            <p>Visibility for every job</p>
            </div>
        </section>

        <section className="nl-features">
            <div className="nl-section-header">
            <h2>Stay ahead of every job</h2>
            <p>
                Run tighter crews with a single source of truth for tools, tasks,
                and job readiness.
            </p>
            </div>
            <div className="nl-feature-grid">
            <article className="nl-feature-card">
                <h3>Job-based tool lists</h3>
                <p>
                Build tool requirements per job so nothing is missed when crews
                load out.
                </p>
            </article>
            <article className="nl-feature-card">
                <h3>Crew accountability</h3>
                <p>
                Assign tools to specific crew members and keep handoffs clean and
                clear.
                </p>
            </article>
            <article className="nl-feature-card">
                <h3>Fast check-in/out</h3>
                <p>
                Track what leaves and returns, so you always know what is on the
                truck.
                </p>
            </article>
            <article className="nl-feature-card">
                <h3>Real-time status</h3>
                <p>
                See missing tools instantly and solve issues before the crew
                hits the road.
                </p>
            </article>
            </div>
        </section>

        <section className="nl-workflow">
            <div className="nl-section-header">
            <h2>How it works</h2>
            <p>Set up once, then reuse for every job and crew.</p>
            </div>
            <div className="nl-workflow-steps">
            <div className="nl-step">
                <span>01</span>
                <h3>List your tools</h3>
                <p>Import your inventory and organize it by job type.</p>
            </div>
            <div className="nl-step">
                <span>02</span>
                <h3>Build job loadouts</h3>
                <p>Create the checklist that goes out with each job.</p>
            </div>
            <div className="nl-step">
                <span>03</span>
                <h3>Send crews ready</h3>
                <p>Verify every loadout before leaving the shop.</p>
            </div>
            </div>
        </section>

        <section className="nl-proof">
            <div className="nl-proof-card">
            <h2>"We stopped the daily tool scramble."</h2>
            <p>
                "Now we know exactly what is on each truck and who has it. That is
                hours saved every week."
            </p>
            <span>Operations Manager, Midwest Construction</span>
            </div>
        </section>

        <section className="nl-cta">
            <div>
            <h2>Ready to stop forgotten tools?</h2>
            <p>
                Get crews loaded out fast, protect your margins, and keep every job
                on schedule.
            </p>
            </div>
            <Link className="nl-btn primary" to="/create-account">
            Start free today
            </Link>
        </section>
        </main>
    );
}
