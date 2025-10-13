document.addEventListener("DOMContentLoaded", () => {
  const addProblemBtn = document.querySelector(".btn-add");
  const createBtn = document.querySelector(".btn-primary");
  const cancelBtn = document.querySelector(".btn-cancel");
  const problemsSelected = [];
  let selectedProblems = []; // store full problem info for table display

  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const problemTableBody = document.querySelector("tbody");

  // --- Add Problem Dialog ---
  addProblemBtn.addEventListener("click", async () => {
    const dialog = document.createElement("div");
    dialog.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 50;
      ">
        <div style="
          background: #fff;
          padding: 20px;
          width: 500px;
          max-height: 80%;
          overflow-y: auto;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        ">
          <h3 style="margin-bottom: 12px;">Select Problems</h3>
          <input type="text" id="problem-search" placeholder="Search problem..." style="width:100%;padding:8px;margin-bottom:12px;border:1px solid #ccc;border-radius:6px;">
          <div id="problem-list" style="display:flex;flex-direction:column;gap:8px;"></div>
          <div style="margin-top:16px;text-align:right;">
            <button id="problem-add-done" style="padding:6px 14px;margin-right:8px;background-color:#4CAF50;color:white;border:none;border-radius:6px;cursor:pointer;">Done</button>
            <button id="problem-add-cancel" style="padding:6px 14px;background-color:#f44336;color:white;border:none;border-radius:6px;cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    const problemListDiv = dialog.querySelector("#problem-list");
    const problemSearch = dialog.querySelector("#problem-search");

    // Fetch problems
    let problems = [];
    try {
      const response = await fetch("/api/contests/problems", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) problems = result.problems;
      else alert(result.message || "Failed to load problems");
    } catch (error) {
      console.error(error);
      alert("Error fetching problems");
    }

    function renderProblems(filter = "") {
      const safeProblems = Array.isArray(problems) ? problems : [];
      const filtered = safeProblems.filter((p) =>
        p.title.toLowerCase().includes(filter.toLowerCase())
      );
      problemListDiv.innerHTML = filtered
        .map(
          (p) => `
          <label style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            padding:6px 10px;
            border:1px solid #ddd;
            border-radius:6px;
            cursor:pointer;
            background:${problemsSelected.includes(p.id) ? "#e0f7fa" : "#fff"};
          ">
            <span>${p.title} <strong>(${p.difficulty})</strong></span>
            <input type="checkbox" class="problem-checkbox" data-id="${p.id}"
              ${problemsSelected.includes(p.id) ? "checked" : ""}>
          </label>
        `
        )
        .join("");
    }

    renderProblems();

    problemSearch.addEventListener("input", () =>
      renderProblems(problemSearch.value)
    );

    // Done button
    dialog.querySelector("#problem-add-done").addEventListener("click", () => {
      const checkboxes = dialog.querySelectorAll(".problem-checkbox");
      problemsSelected.length = 0;
      selectedProblems = [];
      checkboxes.forEach((cb) => {
        if (cb.checked) {
          const id = parseInt(cb.dataset.id);
          problemsSelected.push(id);
          const problemInfo = problems.find((p) => p.id === id);
          if (problemInfo) selectedProblems.push(problemInfo);
        }
      });

      renderProblemTable();
      document.body.removeChild(dialog);
    });

    // Cancel button
    dialog
      .querySelector("#problem-add-cancel")
      .addEventListener("click", () => {
        document.body.removeChild(dialog);
      });
  });

  // --- Render selected problems in table ---
  function renderProblemTable() {
    problemTableBody.innerHTML = selectedProblems
      .map(
        (p, index) => `
        <tr>
          <td>${p.title}</td>
          <td>${p.difficulty}</td>
          <td>${(index + 1) * 100}</td>
          <td class="text-right">
            <button class="text-red btn-delete" data-id="${p.id}">
              <span class="material-symbols-outlined text-xl">delete</span>
            </button>
          </td>
        </tr>
      `
      )
      .join("");

    // Add delete functionality
    const deleteBtns = document.querySelectorAll(".btn-delete");
    deleteBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const idx = problemsSelected.indexOf(id);
        if (idx > -1) problemsSelected.splice(idx, 1);
        selectedProblems = selectedProblems.filter((p) => p.id !== id);
        renderProblemTable();
      });
    });
  }

  // --- Create Contest ---
  createBtn.addEventListener("click", async () => {
    const name = document.getElementById("contest-name").value;
    const start_time = document.getElementById("start-time").value;
    const duration_hours = parseInt(document.getElementById("duration").value);

    if (
      !name ||
      !start_time ||
      !duration_hours ||
      problemsSelected.length === 0
    ) {
      return alert("Please fill all fields and select at least one problem.");
    }

    try {
      const response = await fetch("/api/contests/create-contest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          start_time,
          duration_hours,
          problem_ids: problemsSelected,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // ✅ Instead of redirecting, show a success message
        alert("Contest created successfully!");

        // Optional: Clear form & selections
        document.getElementById("contest-name").value = "";
        document.getElementById("start-time").value = "";
        document.getElementById("duration").value = "";
        problemsSelected.length = 0;

        // Optional: Refresh the problems table if you have one
      } else {
        alert(result.message || "Failed to create contest");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating contest");
    }
  });

  // --- Cancel button ---
  cancelBtn.addEventListener("click", () => {
    window.history.back();
  });
});
