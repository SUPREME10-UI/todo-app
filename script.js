let isEditing = false; // Global flag

function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText === "") return;

  const li = document.createElement("li");
  li.classList.add("task");

  const taskSpan = document.createElement("span");
  taskSpan.textContent = taskText;
  taskSpan.classList.add("task-text");

  taskSpan.addEventListener("click", () => {
    li.classList.toggle("completed");
  });

  const optionsBtn = document.createElement("span");
  optionsBtn.classList.add("options-btn");
  optionsBtn.innerHTML = "&#8942;"; // ⋮

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
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Save';
    saveBtn.classList.add("save-btn");
    saveBtn.style.margin = "5px 2px";
    saveBtn.onclick = () => {
      const newText = editInput.value.trim();
      if (newText !== "") {
        taskSpan.textContent = newText;
      }
      isEditing = false;
      restoreOptionsMenu();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    cancelBtn.classList.add("cancel-btn");
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
    optionsMenu.style.display =
      optionsMenu.style.display === "block" ? "none" : "block";
  });

  // Only add once
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

  li.appendChild(taskSpan);
  li.appendChild(optionsBtn);
  li.appendChild(optionsMenu);
  document.getElementById("taskList").appendChild(li);
  input.value = "";

  // Celebration!
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

  // Pop animation
  li.classList.add("task-pop");
  setTimeout(() => {
    li.classList.remove("task-pop");
  }, 300);
}
