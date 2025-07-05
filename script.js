function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  const priority = document.getElementById("prioritySelect").value;
  const dueDateInput = document.getElementById("dueDate").value;
  const dueDate = dueDateInput ? new Date(dueDateInput + "T00:00:00") : null;

  if (taskText === "") return;

  const li = document.createElement("li");
  li.classList.add("task");

  const taskSpan = document.createElement("span");
  taskSpan.textContent = taskText;
  taskSpan.classList.add("task-text");

  // Priority badge
  const priorityBadge = document.createElement("span");
  priorityBadge.classList.add("priority-badge", `priority-${priority}`);
  priorityBadge.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
  li.appendChild(priorityBadge);
  li.appendChild(taskSpan);

  // Due Date Display
  let dueDateEl = null;
  if (dueDate && !isNaN(dueDate)) {
    dueDateEl = document.createElement("div");
    dueDateEl.classList.add("due-date");
    dueDateEl.textContent = `Due: ${dueDate.toDateString()}`;
    li.dataset.dueDate = dueDate.toISOString();
    li.appendChild(dueDateEl);

    // Auto-color if overdue
    const now = new Date();
    if (now > dueDate) {
      li.classList.add("overdue");
    }

    // Reminder 10 mins before
    const timeUntilReminder = dueDate - now - 10 * 60 * 1000;
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification("🕒 Reminder", {
            body: `"${taskText}" is due in 10 minutes!`,
          });
        }
      }, timeUntilReminder);
    }
  }

  // Completion toggle
  taskSpan.addEventListener("click", () => {
    li.classList.toggle("completed");
  });

  // Options menu
  const optionsBtn = document.createElement("span");
  optionsBtn.classList.add("options-btn");
  optionsBtn.innerHTML = "&#8942;";

  const optionsMenu = document.createElement("div");
  optionsMenu.classList.add("options-menu");

  const editBtn = document.createElement("button");
  editBtn.innerHTML = "🖊️ Edit";
  editBtn.onclick = () => {
    isEditing = true;
    optionsMenu.innerHTML = "";

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = taskSpan.textContent;
    editInput.style.width = "90%";
    editInput.style.margin = "5px";
    editInput.style.padding = "10px 5px";

    const saveBtn = document.createElement("button");
    saveBtn.innerHTML = "✔️ Save";
    saveBtn.style.margin = "5px 2px";
    saveBtn.onclick = () => {
      const newText = editInput.value.trim();
      if (newText !== "") taskSpan.textContent = newText;
      isEditing = false;
      restoreOptionsMenu();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = "❌ Cancel";
    cancelBtn.onclick = () => {
      isEditing = false;
      restoreOptionsMenu();
    };

    optionsMenu.appendChild(editInput);
    optionsMenu.appendChild(saveBtn);
    optionsMenu.appendChild(cancelBtn);
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "🗑️ Delete";
  deleteBtn.onclick = () => li.remove();

  function restoreOptionsMenu() {
    optionsMenu.innerHTML = "";
    optionsMenu.appendChild(editBtn);
    optionsMenu.appendChild(deleteBtn);
  }

  restoreOptionsMenu();
  optionsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
  });

  if (!window._optionsMenuClickListener) {
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".options-menu").forEach((menu) => {
        const btn = menu.previousSibling;
        if (!menu.contains(e.target) && !btn.contains(e.target) && !isEditing) {
          menu.style.display = "none";
        }
      });
    });
    window._optionsMenuClickListener = true;
  }

  li.appendChild(optionsBtn);
  li.appendChild(optionsMenu);
  document.getElementById("taskList").appendChild(li);

  input.value = "";
  document.getElementById("prioritySelect").value = "low";
  document.getElementById("dueDate").value = "";

  // Sort
  sortTasksByDate();

  // Celebration
  if (typeof confetti === "function") {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  li.classList.add("task-pop");
  setTimeout(() => {
    li.classList.remove("task-pop");
  }, 300);

  document.getElementById("year").textContent = new Date().getFullYear();
}

saveTasksToLocalStorage();

// Save tasks to localStorage
function saveTasksToLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#taskList .task").forEach((li) => {
    tasks.push({
      text: li.querySelector(".task-text").textContent,
      priority: li.querySelector(".priority-badge").textContent.toLowerCase(),
      dueDate: li.dataset.dueDate || null,
      completed: li.classList.contains("completed")
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


// One-time notification permission
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Sort tasks by due date
function sortTasksByDate() {
  const list = document.getElementById("taskList");
  const tasks = Array.from(list.children);

  tasks.sort((a, b) => {
    const dateA = new Date(a.dataset.dueDate || Infinity);
    const dateB = new Date(b.dataset.dueDate || Infinity);
    return dateA - dateB;
  });

  tasks.forEach(task => list.appendChild(task));
}

window.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);
function loadTasksFromLocalStorage() {
  const saved = JSON.parse(localStorage.getItem("tasks")) || [];
  saved.forEach(task => {
    const input = document.getElementById("taskInput");
    input.value = task.text;

    const prioritySelect = document.getElementById("prioritySelect");
    prioritySelect.value = task.priority;

    const dueDateInput = document.getElementById("dueDate");
    dueDateInput.value = task.dueDate ? task.dueDate.split("T")[0] : "";

    addTask(); // this will grab input values and run everything
    if (task.completed) {
      const lastTask = document.querySelector("#taskList .task:last-child");
      lastTask.classList.add("completed");
    }
  });

  // Clear the inputs after loading
  document.getElementById("taskInput").value = "";
  document.getElementById("prioritySelect").value = "low";
  document.getElementById("dueDate").value = "";
}

function clearAllTasks() {
  localStorage.removeItem("tasks");
  document.getElementById("taskList").innerHTML = "";
}


