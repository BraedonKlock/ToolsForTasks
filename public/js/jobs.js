/**-----------------------------------------------ADD JOB FORM ----------------------------------------------------- */
/**Getting addJob-image, jobs-main, addJob-form, and addJob-form-closeBtn in jobs.ejs so that i can attach an event listener to the addJob-image and addJob-form-closeBtn to toggle the jobs-main and addJob-form */
const addJobImage = document.getElementById('addJob-image');
const jobMain = document.getElementById('jobs-main');
const addJobForm = document.getElementById('addJob-form');
const closeBtn = document.getElementById('addJob-form-closeBtn');

if (addJobImage && jobMain && addJobForm) {
  addJobImage.addEventListener('click', () => {
    jobMain.classList.toggle('active');
    addJobForm.classList.toggle('active');
  });

  closeBtn.addEventListener('click', () => {
    jobMain.classList.toggle('active');
    addJobForm.classList.toggle('active'); 
});
}

/**-----------------------------------------------ADD EMPLOYEES ----------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('addJob-employeeSelect'); // select element
  const addBtn = document.getElementById('addJob-addEmployeeBtn'); // add employee button
  const display = document.getElementById('addJob-employeeDisplay'); // added employee display
  const hiddenHolder = document.getElementById('addJob-hiddenEmployees'); // hidden input for form submission

  if (!select || !addBtn || !display || !hiddenHolder) return;

  const picked = new Set();   // newly added this session
  const existing = new Set(); // already assigned when page loads

  // build a map from employee id -> email using the <select> options
  const idToEmail = new Map();
  for (const opt of select.options) {
    const empId = opt.dataset?.id;
    if (empId && opt.value) idToEmail.set(String(empId), opt.value);
  }

  // seed from pre-rendered pills on the page (existing assignments)
  display.querySelectorAll('.employee-pill').forEach(pill => {
    const empId = pill.getAttribute('data-empid');
    const email = empId ? idToEmail.get(String(empId)) : null;
    if (email) {
      existing.add(email); // mark as already assigned
    }

    // existing pill remove: if user removes it, also remove from existing set
    const removeBtn = pill.querySelector('.addJob-removeBtn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (email) existing.delete(email);
        pill.remove();
        // (We didn't create hidden inputs for existing employees,
        // so there's nothing to remove from hiddenHolder here.)
      });
    }
  });

  // add new employee (only if not in existing or picked)
  function addEmployee(id, name, role, email) {
    if (existing.has(email) || picked.has(email)) return; // block duplicates (old or new)
    picked.add(email); // track new additions only

    // pill for newly added employee
    const pill = document.createElement('div');
    pill.className = 'employee-pill';
    pill.innerHTML = `
      <h3>${name}</h3>
      <div id="addJobForm-employeeData">
        <div class="emp-div">
          <p>ID:</p>
          <p>${id}</p>
        </div>
        <div class="emp-div">
          <p>Role:</p>
          <p>${role}</p>
        </div>
      </div>
      <button type="button" class="addJob-removeBtn" aria-label="Remove from list">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    pill.querySelector('.addJob-removeBtn').addEventListener('click', () => {
      picked.delete(email); // only affects picked (new) set
      pill.remove();
      const hidden = hiddenHolder.querySelector(`input[value="${email}"]`);
      if (hidden) hidden.remove();
    });

    display.appendChild(pill);

    // hidden input ONLY for newly added employees
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'employees';
    hiddenInput.value = email;
    hiddenHolder.appendChild(hiddenInput);
  }

  addBtn.addEventListener('click', () => {
    const option = select.options[select.selectedIndex];
    if (!option || !option.value) return;

    const id    = option.dataset.id;
    const name  = option.dataset.name;
    const role  = option.dataset.role;
    const email = option.value;

    addEmployee(id, name, role, email);
    select.selectedIndex = 0; // reset to placeholder
  });
});


/**------------------------------------------DELETE EMPLOYEES IN EDIT JOB---------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('addJob-employeeDisplay');
  if (!display) return;

  // read CSRF from the hidden input you already render in the form
  const csrf = document.querySelector('input[name="_csrf"]')?.value;

  // grab jobid from URL (/loggedin/jobs/123/edit)
  const pathParts = window.location.pathname.split('/');
  const jobid = pathParts[3]; // adjust if your path differs

  display.addEventListener('click', (e) => {
    const btn = e.target.closest('.addJob-removeBtn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const pill = btn.closest('.employee-pill');
    // Make sure your EJS pill renders data-empid="..."
    const empid = pill?.dataset.empid; 
    if (!empid || !jobid || !csrf) return;

    btn.disabled = true;

    fetch(`/loggedin/jobs/${encodeURIComponent(jobid)}/employees/${encodeURIComponent(empid)}/remove`, {
      method: 'POST',
      credentials: 'same-origin', // send session cookie for CSRF validation
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({ _csrf: csrf }).toString() // send _csrf
    })
      .then(r => r.ok ? r.json() : r.json().then(j => Promise.reject(j)))
      .then(({ ok }) => {
        if (!ok) throw new Error('Delete failed');
        pill.remove(); // remove from screen
      })
      .catch(err => {
        console.error(err);
        btn.disabled = false;
        alert('Could not remove employee.');
      });
  });
});

/**-----------------------------------------------THREE DOT MENU ----------------------------------------------------- */
// Select all three-dot menu buttons
const threeDotMenus = document.querySelectorAll('.three-dot-menu-icon');

threeDotMenus.forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation(); // don’t trigger document click

    const menu = button.previousElementSibling; // the <section> right before the button

    // Close all other menus first
    document.querySelectorAll('.threeDotMenu-options.active')
            .forEach(m => m !== menu && m.classList.toggle('active'));

    // Toggle this menu
    menu.classList.toggle('active');
  });
});

// Close menus if clicking anywhere outside
document.addEventListener('click', (e) => {
  document.querySelectorAll('.threeDotMenu-options.active')
    .forEach(menu => {
      if (!menu.contains(e.target)) {
        menu.classList.toggle('active');
      }
    });
});

// Close menus when scrolling
window.addEventListener('scroll', () => {
  document.querySelectorAll('.threeDotMenu-options.active')
          .forEach(menu => menu.classList.toggle('active'));
});

/**-----------------------------------------------DELETE JOB BUTTON----------------------------------------------------- */
const deleteJobBtns = document.querySelectorAll('.deleteJob-btn');

for (let i = 0; i < deleteJobBtns.length; i++) {
  const deleteJobBtn = deleteJobBtns[i];
  deleteJobBtn.addEventListener('click', (e) => {
    const jobId = deleteJobBtn.dataset.jobId;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    try {
      const response = fetch(`/loggedin/job/${jobId}`, {
        method: 'DELETE',
        headers: {
        'CSRF-Token': csrfToken
        }
      })
      .then(response => {
        if(response.ok) {
          deleteJobBtn.closest('.job-card').remove();
        };
      });
    } catch(err) {
      console.log("Error deleting job", err);
    };
  });
};