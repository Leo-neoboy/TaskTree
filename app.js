const STORAGE_KEY = "task-tree-v1";

const tree = document.getElementById("tree");
const empty = document.getElementById("empty");
const status = document.getElementById("status");

const dialog = document.getElementById("editDialog");
const form = document.getElementById("editForm");
const titleInput = document.getElementById("titleInput");
const cancelButton = document.getElementById("cancel");

let tasks = [];
let editingTaskId = null;

loadTasks();

/* =========================
   STORAGE
   ========================= */

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            tasks = [];
            return;
        }

        const data = JSON.parse(saved);

        tasks = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Could not load tasks:", error);
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

    status.textContent = "Saved";
}

/* =========================
   ID
   ========================= */

function createId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now() + "-" + Math.random();
}

/* =========================
   CREATE TASK
   ========================= */

function createTask() {
    return {
        id: createId(),
        title: "New task",
        completed: false,
        expanded: true,
        children: [],
    };
}

/* =========================
   FIND TASK
   ========================= */

function findTask(list, id) {
    for (const task of list) {
        if (task.id === id) {
            return task;
        }

        const child = findTask(task.children, id);

        if (child) {
            return child;
        }
    }

    return null;
}

/* =========================
   REMOVE TASK
   ========================= */

function removeTask(list, id) {
    const index = list.findIndex((task) => task.id === id);

    if (index !== -1) {
        list.splice(index, 1);

        return true;
    }

    for (const task of list) {
        if (removeTask(task.children, id)) {
            return true;
        }
    }

    return false;
}

/* =========================
   DELETE TASK
   ========================= */

function deleteTask(id) {
    const task = findTask(tasks, id);

    if (!task) {
        return;
    }

    const hasChildren = task.children.length > 0;

    let message = `Delete "${task.title}"?`;

    if (hasChildren) {
        message += "\n\nThis will also delete all of its subtasks.";
    }

    const confirmed = confirm(message);

    if (!confirmed) {
        return;
    }

    removeTask(tasks, id);

    saveTasks();

    render();
}

/* =========================
   RENDER
   ========================= */

function render() {
    tree.replaceChildren();

    empty.classList.toggle("show", tasks.length === 0);

    for (const task of tasks) {
        tree.appendChild(renderTask(task));
    }
}

/* =========================
   RENDER TASK
   ========================= */

function renderTask(task) {
    const node = document.createElement("div");

    const row = document.createElement("div");

    row.className = "node-row";

    /* =========================
       EXPAND / COLLAPSE
       ========================= */

    const foldButton = document.createElement("button");

    foldButton.className = "fold";

    foldButton.type = "button";

    if (task.children.length > 0) {
        foldButton.appendChild(
            createIcon(task.expanded ? "chevronDown" : "chevronRight"),
        );

        foldButton.setAttribute(
            "aria-label",
            task.expanded ? "Collapse task" : "Expand task",
        );

        foldButton.addEventListener("click", () => {
            task.expanded = !task.expanded;

            saveTasks();

            render();
        });
    } else {
        foldButton.textContent = "";

        foldButton.disabled = true;
    }

    /* =========================
       CHECKBOX
       ========================= */

    const checkButton = document.createElement("button");

    checkButton.className = "check" + (task.completed ? " done" : "");

    checkButton.type = "button";

    checkButton.appendChild(
        createIcon(task.completed ? "checkboxChecked" : "checkbox"),
    );

    checkButton.setAttribute(
        "aria-label",
        task.completed ? "Mark incomplete" : "Mark complete",
    );

    checkButton.addEventListener("click", () => {
        task.completed = !task.completed;

        saveTasks();

        render();
    });

    /* =========================
       TITLE
       ========================= */

    const title = document.createElement("div");

    title.className = "title" + (task.completed ? " done" : "");

    title.textContent = task.title;

    /* =========================
       ADD CHILD
       ========================= */

    const addButton = document.createElement("button");

    addButton.className = "add-child";

    addButton.type = "button";

    addButton.appendChild(createIcon("plus"));

    addButton.setAttribute("aria-label", "Add subtask");

    addButton.addEventListener("click", () => {
        addChildTask(task.id);
    });

    /* =========================
       EDIT
       ========================= */

    const editButton = document.createElement("button");

    editButton.className = "edit";

    editButton.type = "button";

    editButton.appendChild(createIcon("edit"));

    editButton.setAttribute("aria-label", "Edit task");

    editButton.addEventListener("click", () => {
        openEditDialog(task.id);
    });

    /* =========================
       DELETE
       ========================= */

    const deleteButton = document.createElement("button");

    deleteButton.className = "delete";

    deleteButton.type = "button";

    deleteButton.appendChild(createIcon("delete"));

    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });

    /* =========================
       BUILD ROW
       ========================= */

    row.append(
        foldButton,
        checkButton,
        title,
        addButton,
        editButton,
        deleteButton,
    );

    node.appendChild(row);

    /* =========================
       CHILDREN
       ========================= */

    if (task.children.length > 0 && task.expanded) {
        const children = document.createElement("div");

        children.className = "node-children";

        for (const child of task.children) {
            children.appendChild(renderTask(child));
        }

        node.appendChild(children);
    }

    return node;
}

/* =========================
   ADD CHILD
   ========================= */

function addChildTask(parentId) {
    const parent = findTask(tasks, parentId);

    if (!parent) {
        return;
    }

    const child = createTask();

    parent.children.push(child);

    parent.expanded = true;

    saveTasks();

    render();

    openEditDialog(child.id);
}

/* =========================
   EDIT
   ========================= */

function openEditDialog(id) {
    const task = findTask(tasks, id);

    if (!task) {
        return;
    }

    editingTaskId = id;

    titleInput.value = task.title;

    dialog.showModal();

    setTimeout(() => {
        titleInput.focus();

        titleInput.select();
    }, 50);
}

/* =========================
   SAVE EDIT
   ========================= */

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const task = findTask(tasks, editingTaskId);

    const newTitle = titleInput.value.trim();

    if (task && newTitle.length > 0) {
        task.title = newTitle;

        saveTasks();

        render();
    }

    dialog.close();

    editingTaskId = null;
});

/* =========================
   CANCEL EDIT
   ========================= */

cancelButton.addEventListener("click", () => {
    dialog.close();

    editingTaskId = null;
});

/* =========================
   ADD ROOT TASK
   ========================= */

function addRootTask() {
    const task = createTask();

    tasks.push(task);

    saveTasks();

    render();

    openEditDialog(task.id);
}

document.getElementById("addRoot").addEventListener("click", addRootTask);

document.getElementById("emptyAdd").addEventListener("click", addRootTask);

/* =========================
   START
   ========================= */

render();
