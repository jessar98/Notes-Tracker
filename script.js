const notes = [
  {
    id: 1,
    date: "2026-09-04",
    time: "09:00",
    completed: false
  },
  {
    id: 2,
    date: "2026-09-05",
    time: "10:30",
    completed: false
  },
  {
    id: 3,
    date: "2026-09-08",
    time: "14:00",
    completed: false
  },
  {
    id: 4,
    date: "2026-09-01",
    time: "09:30",
    completed: true
  },
  {
    id: 5,
    date: "2026-08-28",
    time: "11:00",
    completed: true
  }
];


const form = document.getElementById("noteForm");
const list = document.getElementById("notesList");


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

  const date = new Date(dateString + "T00:00:00");

  return {
    day: date.getDate(),

    month: date.toLocaleDateString("en-US", {
      month: "short"
    })
  };
}


/* =========================
   SORT NOTES
   NEWEST → OLDEST
========================= */

function sortNotes() {

  notes.sort((a, b) => {

    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);

    return dateB - dateA;

  });

}


/* =========================
   RENDER
========================= */

function render() {

  /* Always sort before displaying */

  sortNotes();


  /* Count tasks */

  const pending =
    notes.filter(note => !note.completed).length;

  const completed =
    notes.filter(note => note.completed).length;

  const total = notes.length;


  /* Calculate progress */

  const percent =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;


  /* Update dashboard */

  document.getElementById("pendingCount").textContent =
    pending;

  document.getElementById("completedCount").textContent =
    completed;

  document.getElementById("progressText").textContent =
    `${percent}% Complete`;

  document.getElementById("progressRing").textContent =
    `${percent}%`;

  document.getElementById("progressFill").style.width =
    `${percent}%`;

  document.getElementById("progressMessage").textContent =
    `${completed} of ${total} notes completed`;

  document.getElementById("totalBadge").textContent =
    `${total} total`;


  /* Render notes */

  list.innerHTML = notes.map(note => {

    const formattedDate = formatDate(note.date);

    return `

      <div class="note">

        <div class="note-date">

          <span class="note-day">
            ${formattedDate.day}
          </span>

          <span class="note-month">
            ${formattedDate.month}
          </span>

        </div>


        <div class="note-info">

          <div class="note-time">
            ${note.time}
          </div>

        </div>


        <span
          class="note-status ${
            note.completed
              ? "completed"
              : "pending"
          }"
        >

          ${
            note.completed
              ? "Completed"
              : "Pending"
          }

        </span>


        ${
          !note.completed
            ? `
              <button
                class="complete-btn"
                onclick="completeNote(${note.id})"
              >
                Complete
              </button>
            `
            : ""
        }

      </div>

    `;

  }).join("");

}


/* =========================
   COMPLETE NOTE
========================= */

function completeNote(id) {

  const note = notes.find(
    note => note.id === id
  );


  if (!note) {
    return;
  }


  note.completed = true;


  render();


  showSuccessMessage();

}


/* =========================
   ADD NEW NOTE
========================= */

form.addEventListener("submit", function(event) {

  event.preventDefault();


  const date =
    document.getElementById("visitDate").value;

  const time =
    document.getElementById("visitTime").value;


  if (!date || !time) {
    return;
  }


  /*
    Every newly created note
    ALWAYS starts as pending.
  */

  notes.push({

    id: Date.now(),

    date: date,

    time: time,

    completed: false

  });


  /* Clear form */

  form.reset();


  /*
    Render automatically sorts
    the new note into its
    correct chronological position.
  */

  render();

});


/* =========================
   SUCCESS MESSAGE
========================= */

let successTimeout;


function showSuccessMessage() {

  const message =
    document.getElementById("successMessage");


  message.classList.add("show");


  clearTimeout(successTimeout);


  successTimeout = setTimeout(() => {

    message.classList.remove("show");

  }, 2500);

}


/* =========================
   COMPLETE ALL
========================= */

document
  .getElementById("completeAllBtn")
  .addEventListener("click", function() {

    const pendingNotes =
      notes.filter(note => !note.completed);


    if (pendingNotes.length === 0) {
      return;
    }


    notes.forEach(note => {

      note.completed = true;

    });


    render();


    showSuccessMessage();

  });


/* =========================
   INITIAL LOAD
========================= */

render();