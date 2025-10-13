// Select the button
const button = document.getElementById("createContestBtn");

// Add click event listener
button.addEventListener("click", () => {
  // Redirect to the desired page
  window.location.href = "admin-create-contest.html";
});

const tableBody = document.querySelector("tbody");
const modal = document.getElementById("contestModal");
// const closeModal = modal.querySelector(".close-btn");
const contestTitle = document.getElementById("contestTitle");
const contestStart = document.getElementById("contestStart");
const contestDuration = document.getElementById("contestDuration");
const contestProblems = document.getElementById("contestProblems");
const deleteContestBtn = document.getElementById("deleteContestBtn");

let selectedContestId = null;

function attachRowListeners() {
  document.querySelectorAll(".contest-row").forEach((row) => {
    row.addEventListener("click", () => showContestDetails(row.dataset.id));
  });
}

// Fetch contests and populate table
async function loadContests() {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    const res = await fetch("/api/contests/fetch-contests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("✅Fetched contests:", data);

    const contests = data.contests || [];

    tableBody.innerHTML = "";
    contests.forEach((contest) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <th scope="row" class="contest-row" data-id="${contest.id}">${
        contest.name
      }</th>
        <td>${new Date(contest.start_time).toLocaleString()}</td>
        <td>${contest.duration_hours} hours</td>
        <td>
          <span class="status-badge ${
            new Date(contest.start_time) > new Date() ? "upcoming" : "completed"
          }">
            <span class="status-dot ${
              new Date(contest.start_time) > new Date() ? "blue" : "green"
            }"></span>
            ${
              new Date(contest.start_time) > new Date()
                ? "Upcoming"
                : "Completed"
            }
          </span>
        </td>
        <td class="text-right">
          <button class="action-btn delete" data-id="${contest.id}">
            <span class="material-symbols-outlined"></span>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachRowListeners();
    attachDeleteButtons();
  } catch (err) {
    console.error("Failed to load contests:", err);
  }
}

const closeModalBtn = modal.querySelector(".close-btn");

// Open modal
function openModal() {
  modal.classList.add("show");
  modal.classList.remove("hidden");
}

// Close modal
function closeModal() {
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300); 
}

// Close on close button
closeModalBtn.addEventListener("click", closeModal);
// Close when clicking overlay
modal.querySelector(".modal-overlay").addEventListener("click", closeModal);

// Show contest details
async function showContestDetails(contestId) {
  selectedContestId = contestId;
  const res = await fetch(`/api/contests/${contestId}`);
  const data = await res.json();
  console.log("Details: ", data);

  if (!data.contest) return alert("Contest not found");

  contestTitle.textContent = data.contest.name;
  contestStart.textContent = new Date(data.contest.start_time).toLocaleString();
  contestDuration.textContent = data.contest.duration_hours;

  contestProblems.innerHTML = "";
  data.problems.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.title} (${p.difficulty})`;
    contestProblems.appendChild(li);
  });

  openModal();
}

// Delete contest from table
function attachDeleteButtons() {
  document.querySelectorAll(".action-btn.delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm("Are you sure you want to delete this contest?")) {
        const res = await fetch(`/api/contests/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) loadContests();
        else alert("Failed to delete contest");
      }
    });
  });
}

// Delete from modal
// deleteContestBtn.addEventListener("click", async () => {
//   if (!selectedContestId) return;
//   if (confirm("Are you sure you want to delete this contest?")) {
//     const res = await fetch(`/api/contests/${selectedContestId}`, {
//       method: "DELETE",
//     });
//     const data = await res.json();
//     if (data.success) {
//       closeModal();
//       loadContests();
//     } else {
//       alert("Failed to delete contest");
//     }
//   }
// });

// Initial load
loadContests();
