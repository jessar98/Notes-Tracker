/* =========================
   FIREBASE IMPORTS
========================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================
   FIREBASE CONFIGURATION
========================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyBFKWjne4A4v7jqFtr8DLOCxZ3hCVkM8o0",

  authDomain:
    "drsudwal.firebaseapp.com",

  projectId:
    "drsudwal",

  storageBucket:
    "drsudwal.firebasestorage.app",

  messagingSenderId:
    "293629903723",

  appId:
    "1:293629903723:web:66220212746db88322c22e"

};



/* =========================
   INITIALIZE FIREBASE
========================= */

const app =
  initializeApp(firebaseConfig);


const db =
  getFirestore(app);



/* =========================
   FIRESTORE COLLECTION
========================= */

const notesCollection =
  collection(db, "notes");



/* =========================
   LOCAL ARRAY
========================= */

let notes = [];



/* =========================
   DOM ELEMENTS
========================= */

const form =
  document.getElementById("noteForm");

const list =
  document.getElementById("notesList");

const completeAllBtn =
  document.getElementById("completeAllBtn");

const deleteAllBtn =
  document.getElementById("deleteAllBtn");



/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

  const date =
    new Date(dateString + "T00:00:00");


  return {

    day:
      date.getDate(),

    month:
      date.toLocaleDateString(
        "en-US",
        {
          month: "short"
        }
      )

  };

}



/* =========================
   SORT NOTES
   NEWEST → OLDEST
========================= */

function sortNotes() {

  notes.sort((a, b) => {

    const dateA =
      new Date(
        `${a.date}T${a.time}`
      );


    const dateB =
      new Date(
        `${b.date}T${b.time}`
      );


    return dateB - dateA;

  });

}



/* =========================
   LOAD NOTES FROM FIRESTORE
========================= */

async function loadNotes() {

  try {

    list.innerHTML = `
      <div class="loading">
        Loading notes...
      </div>
    `;


    const snapshot =
      await getDocs(notesCollection);


    notes = snapshot.docs.map(
      document => ({

        id:
          document.id,

        ...document.data()

      })
    );


    render();


  } catch (error) {

    console.error(
      "Error loading notes:",
      error
    );


    list.innerHTML = `
      <div class="loading">
        Unable to load notes.
      </div>
    `;

  }

}



/* =========================
   SAVE NOTE TO FIRESTORE
========================= */

async function addNote(date, time) {

  try {

    await addDoc(
      notesCollection,
      {

        date: date,

        time: time,

        completed: false

      }
    );


    await loadNotes();


    showSuccessMessage();


  } catch (error) {

    console.error(
      "Error adding note:",
      error
    );


    alert(
      "There was a problem saving the note."
    );

  }

}



/* =========================
   COMPLETE NOTE
========================= */

async function completeNote(id) {

  try {

    const noteReference =
      doc(
        db,
        "notes",
        id
      );


    await updateDoc(
      noteReference,
      {
        completed: true
      }
    );


    await loadNotes();


    showSuccessMessage();


  } catch (error) {

    console.error(
      "Error completing note:",
      error
    );


    alert(
      "There was a problem completing the note."
    );

  }

}



/* =========================
   COMPLETE ALL
========================= */

async function completeAllNotes() {

  const pendingNotes =
    notes.filter(
      note => !note.completed
    );


  if (
    pendingNotes.length === 0
  ) {

    return;

  }


  completeAllBtn.disabled = true;

  completeAllBtn.textContent =
    "Completing...";


  try {

    /*
      Update every pending
      Firestore document.
    */

    await Promise.all(

      pendingNotes.map(note => {

        const noteReference =
          doc(
            db,
            "notes",
            note.id
          );


        return updateDoc(
          noteReference,
          {
            completed: true
          }
        );

      })

    );


    await loadNotes();


    showSuccessMessage();


  } catch (error) {

    console.error(
      "Error completing all notes:",
      error
    );


    alert(
      "There was a problem completing the notes."
    );


  } finally {

    completeAllBtn.disabled = false;

  }

}

function formatTime(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/* =========================
   SUCCESS MESSAGE
========================= */

let successTimeout;


function showSuccessMessage() {

  const message =
    document.getElementById(
      "successMessage"
    );


  message.classList.add("show");


  clearTimeout(
    successTimeout
  );


  successTimeout =
    setTimeout(() => {

      message.classList.remove(
        "show"
      );

    }, 2500);

}

/* =========================
   DELETE ALL NOTES
========================= */

async function deleteAllNotes() {

  if (notes.length === 0) {
    return;
  }


  const confirmed = confirm(
    "Are you sure you want to delete ALL notes?\n\nThis cannot be undone."
  );


  if (!confirmed) {
    return;
  }


  deleteAllBtn.disabled = true;

  deleteAllBtn.textContent =
    "Deleting...";


  try {

    await Promise.all(

      notes.map(note => {

        return deleteDoc(
          doc(
            db,
            "notes",
            note.id
          )
        );

      })

    );


    await loadNotes();


  } catch (error) {

    console.error(
      "Firebase delete all error:",
      error
    );


    alert(
      "Could not delete all notes."
    );


  } finally {

    deleteAllBtn.disabled = false;

    deleteAllBtn.textContent =
      "Delete All";

  }

}

/* =========================
   RENDER DASHBOARD
========================= */

function render() {

  sortNotes();


  const pending =
    notes.filter(
      note => !note.completed
    ).length;


  const completed =
    notes.filter(
      note => note.completed
    ).length;


  const total =
    notes.length;


  const percent =
    total > 0

      ? Math.round(
          (completed / total) * 100
        )

      : 0;



  /* =========================
     DASHBOARD COUNTERS
  ========================== */

  document.getElementById(
    "pendingCount"
  ).textContent =
    pending;


  document.getElementById(
    "completedCount"
  ).textContent =
    completed;


  document.getElementById(
    "progressText"
  ).textContent =
    `${percent}% Complete`;


  document.getElementById(
    "progressRing"
  ).textContent =
    `${percent}%`;


  document.getElementById(
    "progressFill"
  ).style.width =
    `${percent}%`;


  document.getElementById(
    "progressMessage"
  ).textContent =
    `${completed} of ${total} notes completed`;


  document.getElementById(
    "totalBadge"
  ).textContent =
    `${total} total`;



  /* =========================
     COMPLETE ALL BUTTON
  ========================== */

  if (pending === 0) {

    completeAllBtn.disabled = true;

    completeAllBtn.textContent =
      "All Completed";

  } else {

    completeAllBtn.disabled = false;

    completeAllBtn.textContent =
      "Complete All";

  }



  /* =========================
     NOTES LIST
  ========================== */

  if (notes.length === 0) {

    list.innerHTML = `
      <div class="loading">
        No visit notes yet.
      </div>
    `;

    return;

  }



  list.innerHTML =
    notes.map(note => {

      const formattedDate =
        formatDate(
          note.date
        );


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
              ${formatTime(note.time)}
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
                  data-id="${note.id}"
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
   ADD NOTE FORM
========================= */

form.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const date =
      document.getElementById(
        "visitDate"
      ).value;


    const time =
      document.getElementById(
        "visitTime"
      ).value;


    if (!date || !time) {

      return;

    }


    const submitButton =
      form.querySelector(
        "button[type='submit']"
      );


    submitButton.disabled = true;

    submitButton.textContent =
      "Saving...";


    try {

      /*
        IMPORTANT:
        Every new note is ALWAYS
        created as pending.
      */

      await addDoc(
        notesCollection,
        {

          date: date,

          time: time,

          completed: false

        }
      );


      form.reset();


      await loadNotes();


    } catch (error) {

      console.error(
        "Error adding note:",
        error
      );


      alert(
        "There was a problem saving the note."
      );


    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        "+ Add Pending Note";

    }

  }
);



/* =========================
   COMPLETE INDIVIDUAL NOTE
========================= */

list.addEventListener(
  "click",
  function(event) {

    const button =
      event.target.closest(
        ".complete-btn"
      );


    if (!button) {

      return;

    }


    const id =
      button.dataset.id;


    completeNote(id);

  }
);



/* =========================
   COMPLETE ALL BUTTON
========================= */

completeAllBtn.addEventListener(
  "click",
  completeAllNotes
);

deleteAllBtn.addEventListener(
  "click",
  deleteAllNotes
);

/* =========================
   START APPLICATION
========================= */

loadNotes();