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