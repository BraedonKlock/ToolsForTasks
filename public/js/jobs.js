/**-----------------------------------------------ADD JOB FORM ----------------------------------------------------- */
/**Getting addJob-image, jobs-main, addJob-form, and addJob-form-closeBtn in jobs.ejs so that i can attach an event listener to the addJob-image and addJob-form-closeBtn to toggle the jobs-main and addJob-form */
const addJobImage = document.getElementById('addJob-image');
const jobMain = document.getElementById('jobs-main');
const addJobForm = document.getElementById('addJob-form');
const closeBtn = document.getElementById('addJob-form-closeBtn');

addJobImage.addEventListener('click', () => {
  jobMain.classList.toggle('active');
  addJobForm.classList.toggle('active');
});
closeBtn.addEventListener('click', () => {
  jobMain.classList.toggle('active');
  addJobForm.classList.toggle('active'); 
});

/**-----------------------------------------------ADD EMPLOYEES ----------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('addJob-employeeSelect'); // select element
  const addBtn = document.getElementById('addJob-addEmployeeBtn'); // add employee button
  const display = document.getElementById('addJob-employeeDisplay'); // added employee display
  const hiddenHolder = document.getElementById('addJob-hiddenEmployees'); // hidden input for form submission

  const picked = new Set(); // track by email (unique), using a set to prevent duplicates

  /**This function adds an employee to the employee display and hidden input elements to the hidden employeees
   * passing in id, name, and role for display purposes so the owner knows which employees are being added
   * email is being passes in because thats the value that will be set since emails are unique
   * email will set as value because that will be used for searching the db for employee database ID
   */
  function addEmployee(id, name, role, email) {
    if (picked.has(email)) return; // confirming set doesnt have employee already
    picked.add(email); // adding employee to the set

    /**Creating the display for the employee added  */
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

    // adding an event listener for the remove employee from job button
    pill.querySelector('.addJob-removeBtn').addEventListener('click', () => {
      picked.delete(email); // deleting employee from set
      pill.remove(); // removing the pill from employee display
      const hidden = hiddenHolder.querySelector(`input[value="${email}"]`); // getting the hidden input element by value
      if (hidden) hidden.remove(); // removing hidden input element by value
    });

    display.appendChild(pill); // appending employee pill to employee display

    /**Hidden input element */
    const hiddenInput = document.createElement('input'); // creating input element
    hiddenInput.type = 'hidden'; // type hidden so its not seen by the user
    /**setting name to employees. 
     * i am not setting it to an array just incase only 1 employee is selected
     *  if 1 employee is selected then its sent as a string and that would return it as undefined 
     */
    hiddenInput.name = 'employees'; 
    hiddenInput.value = email; // value set to email because thats our unique identifier
    hiddenHolder.appendChild(hiddenInput); // appending to hidden input 
  }

  /**Adding an event listener to the add employee button
   * which takes the select element's option that is selected and passes in the datasets for display
   */
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