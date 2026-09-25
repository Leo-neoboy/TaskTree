const STORAGE_KEY = "task-tree-v1";

const tree = document.getElementById("tree");
const empty = document.getElementById("empty");
const status = document.getElementById("status");

const drawer = document.getElementById("drawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const drawerToggle = document.getElementById("drawerToggle");

const addFolderButton = document.getElementById("addFolder");

const dialog = document.getElementById("editDialog");
const form = document.getElementById("editForm");
const titleInput = document.getElementById("titleInput");
const cancelButton = document.getElementById("cancel");

const folderDialog = document.getElementById("folderDialog");
const folderForm = document.getElementById("folderForm");
const folderDialogTitle = document.getElementById("folderDialogTitle");
const folderNameInput = document.getElementById("folderNameInput");
const folderCancel = document.getElementById("folderCancel");

let editingFolderId = null;

let tasks = [];
let editingTaskId = null;
let creatingTaskId = null;

let folders = [];

let activeFolderId = null;

loadTasks();

if (folders.length === 0) {
    initializeFolders();
}

function initializeFolders() {
    const defaultFolder = {
        id: "default",
        name: "Default",
        tasks: tasks,
    };

    folders = [defaultFolder];

    activeFolderId = defaultFolder.id;
}

function openDrawer() {
    drawer.classList.add("open");
    drawerOverlay.classList.add("open");
}

function closeDrawer() {
    drawer.classList.remove("open");
    drawerOverlay.classList.remove("open");
}

drawerToggle.addEventListener("click", openDrawer);

drawerOverlay.addEventListener("click", closeDrawer);

const folderList = document.getElementById("folderList");

function renderFolders() {
    folderList.replaceChildren();

    for (const folder of folders) {
        const button = document.createElement("button");

        button.className =
            "folder-item" + (folder.id === activeFolderId ? " active" : "");

        button.type = "button";

        const name = document.createElement("span");

        name.className = "folder-name";
        name.textContent = folder.name;

        const actions = document.createElement("span");

        actions.className = "folder-actions";

        const editButton = document.createElement("button");

        editButton.className = "folder-edit";
        editButton.type = "button";
        editButton.textContent = "✏️";
        editButton.setAttribute("aria-label", "Rename folder");

        editButton.addEventListener("click", (event) => {
            event.stopPropagation();

            editingFolderId = folder.id;

            folderDialogTitle.textContent = "Rename Folder";
            folderNameInput.value = folder.name;

            folderDialog.showModal();

            setTimeout(() => {
                folderNameInput.focus();
                folderNameInput.select();
            }, 50);
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "folder-delete";
        deleteButton.type = "button";
        deleteButton.textContent = "🗑️";
        deleteButton.setAttribute("aria-label", "Delete folder");

        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();

            const confirmed = confirm(
                `Delete folder "${folder.name}" and all its tasks?`,
            );

            if (!confirmed) {
                return;
            }

            folders = folders.filter((item) => item.id !== folder.id);

            // If this was the last folder, create a fresh Default folder.
            if (folders.length === 0) {
                const defaultFolder = {
                    id: "default",
                    name: "Default",
                    tasks: [],
                };

                folders.push(defaultFolder);
            }

            if (activeFolderId === folder.id) {
                activeFolderId = folders[0].id;
            }

            const activeFolder = folders.find(
                (item) => item.id === activeFolderId,
            );

            tasks = activeFolder?.tasks || [];

            saveTasks();
            renderFolders();
            render();
        });

        actions.append(editButton, deleteButton);

        button.append(name, actions);

        button.addEventListener("click", () => {
            activeFolderId = folder.id;

            tasks = folder.tasks;

            saveTasks();

            renderFolders();
            render();

            closeDrawer();
        });

        folderList.appendChild(button);
    }
}

function createFolder() {
    editingFolderId = null;

    folderDialogTitle.textContent = "New Folder";
    folderNameInput.value = "";

    folderDialog.showModal();

    setTimeout(() => {
        folderNameInput.focus();
    }, 50);
}

addFolderButton.addEventListener("click", createFolder);

folderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const folderName = folderNameInput.value.trim();

    if (!folderName) {
        folderNameInput.focus();
        return;
    }

    if (editingFolderId) {
        const folder = folders.find((item) => item.id === editingFolderId);

        if (folder) {
            folder.name = folderName;
        }
    } else {
        folders.push({
            id: createId(),
            name: folderName,
            tasks: [],
        });
    }

    saveTasks();

    folderDialog.close();

    editingFolderId = null;

    renderFolders();
});

folderCancel.addEventListener("click", () => {
    folderDialog.close();

    editingFolderId = null;
});

/* =========================
   STORAGE
   ========================= */

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            tasks = [];
            folders = [];
            activeFolderId = null;
            return;
        }

        const data = JSON.parse(saved);

        // =========================
        // OLD FORMAT: tasks array
        // =========================

        if (Array.isArray(data)) {
            tasks = data;

            const defaultFolder = {
                id: "default",
                name: "Default",
                tasks: tasks,
            };

            folders = [defaultFolder];

            activeFolderId = "default";

            // Save the migrated format immediately
            saveTasks();

            return;
        }

        // =========================
        // NEW FORMAT: folders
        // =========================

        if (data && !Array.isArray(data) && Array.isArray(data.folders)) {
            folders = data.folders;

            activeFolderId = data.activeFolderId || folders[0]?.id || null;

            const activeFolder = folders.find(
                (folder) => folder.id === activeFolderId,
            );

            tasks = activeFolder?.tasks || [];

            return;
        }

        tasks = [];
        folders = [];
        activeFolderId = null;
    } catch (error) {
        console.error("Could not load tasks:", error);

        tasks = [];
        folders = [];
        activeFolderId = null;
    }
}

function saveTasks() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            folders: folders,
            activeFolderId: activeFolderId,
        }),
    );

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
   COUNT DESCENDANTS
   ========================= */

function countDescendants(task) {
    let count = task.children.length;

    for (const child of task.children) {
        count += countDescendants(child);
    }

    return count;
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

    node.className = "node";

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

    creatingTaskId = child.id;

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
    creatingTaskId = null;
});

/* =========================
   CANCEL EDIT
   ========================= */

cancelButton.addEventListener("click", () => {
    if (creatingTaskId) {
        removeTask(tasks, creatingTaskId);

        saveTasks();

        render();

        creatingTaskId = null;
    }

    dialog.close();

    editingTaskId = null;
});

/* =========================
   ADD ROOT TASK
   ========================= */

function addRootTask() {
    const activeFolder = folders.find((folder) => folder.id === activeFolderId);

    if (!activeFolder) {
        return;
    }

    const task = createTask();

    creatingTaskId = task.id;

    activeFolder.tasks.push(task);

    tasks = activeFolder.tasks;

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
renderFolders();
