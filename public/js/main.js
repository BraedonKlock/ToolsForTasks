/**------------------------------------------HAMBURGER NAVIGATION ------------------------------------------------ */
/**Getting elements to add event listener to the hamburger menu so that it can be toggled */
const hamburgerMenu = document.getElementById('hamburger');
const hamburgerNav = document.getElementById('hamburger-nav');

hamburgerMenu.addEventListener('click', () => {
  hamburgerNav.classList.toggle('active');
});

/**Event listener that collapses hamburger-nav when the user clicks outside the menu */
document.addEventListener('click', function (event) {
  const clickedInsideHamburger = hamburgerMenu.contains(event.target); // if hamburger is clicked returns true
  const clickedInsidenav = hamburgerNav.contains(event.target); // if link container is clicked return true

  // If clicked outside both hamburger and container for links then collapse menu
  if (!clickedInsideHamburger && !clickedInsidenav) {
    if (hamburgerNav.classList.contains('active')) {
    hamburgerNav.classList.toggle('active'); // collapse hamburger-nav
    }
  }
});

/**Event listener that collapses hamburger menu if the user scrolls */
window.addEventListener('scroll', function () {
  if (hamburgerNav.classList.contains('active')) {
    hamburgerNav.classList.toggle('active');
  }
});


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
