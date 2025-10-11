const socket = io();

/**-------------------------------------SOCKET IO FOR CREATING A JOB IN JOBS.JS --------------------------------------- */

function renderJobCard(job) {
  const div = document.createElement('div');
  div.className = 'job-card';
  div.setAttribute('data-job-id', job.jobid);
  div.setAttribute('data-date', job.date);

  const imgType = (job.jobType || '').toLowerCase();

  div.innerHTML = `
    <img class="job-image" src="/photos/${imgType}.png">
    <div class="job-text">
      <h6>ID: ${job.jobid}</h6>
      <h6>${job.title}</h6>
      <h6>${job.date}</h6>
      <h6>${job.address}</h6>
    </div>
    <div class="threeDotMenu-container">
      <section class="threeDotMenu-options">
          <a href="<%= path %>/edit-job/id">EDIT</a>
          <button class="delete-btn">DELETE</button>
      </section>
      <button class="three-dot-menu-icon" aria-label="More options">&vellip;</button>
  </div>
  `;
const menu = div.querySelector('.threeDotMenu-options');
  const button = div.querySelector('.three-dot-menu-icon');

  button.addEventListener('click', (e) => {
    e.stopPropagation(); // don't trigger document click
    // Close other open menus
    document.querySelectorAll('.threeDotMenu-options.active')
      .forEach(m => { if (m !== menu) m.classList.remove('active'); });
    // Toggle this one
    menu.classList.toggle('active');
  });

  return div;
}


socket.on('job:created', (job) => {

  const container = document.getElementById('jobs-jobsContainer');
  if (!container) return;

  if (container.querySelector(`.job-card[data-job-id="${job.jobid}"]`)) return;

  const card = renderJobCard(job);
  container.prepend(card);  // or append/insert sorted

});

/**-------------------------------------SOCKET IO FOR CREATING A JOB IN INDEX.JS -------------------------------------- */
function renderIndexJobCard(job) {
    const anchorTag = document.createElement('a');
    anchorTag.href = `/loggedin/job-details/${job.jobid}`;
    anchorTag.className = "job-card";
    const imgType = (job.jobType || '').toLowerCase();

    console.log('jobType:', job.jobType, 'imgType:', imgType);

    anchorTag.innerHTML = `
        <img class="job-image" src="/photos/${imgType}.png">
        <div class="job-text">
            <h6>ID: ${job.jobid}</h6>
            <h6>${job.title}</h6>
            <h6>${job.date}</h6>
            <h6>${job.address}</h6>
        </div>
    `;

    return anchorTag;
};

socket.on('job:created-index', (job) => {
    const container = document.getElementById('index-jobsContainer');

    if (!container) return;

    const card = renderIndexJobCard(job);
    container.prepend(card);
});

/**-------------------------------SOCKET IO FOR DELETING A JOB IN JOBS.EJS & INDEX.EJS--------------------------------- */
function deleteJob(id) {
  document.querySelector(`.job-card[data-job-id="${id}"]`).remove();
};

socket.on('job:delete-jobs', ({ id }) => {
  deleteJob(id);
});