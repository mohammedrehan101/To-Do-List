const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const addButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');
const taskCounter = document.getElementById('taskCounter');
const clearAllButton = document.getElementById('clearAllButton');
const filterButtons = document.querySelectorAll('.filter-button');
const darkModeToggle = document.getElementById('darkModeToggle');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ---------- Rendering ----------

function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter((task) => {
        if (currentFilter === 'completed') return task.done;
        if (currentFilter === 'pending') return !task.done;
        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.classList.add('empty-message');
        emptyMsg.textContent = tasks.length === 0
            ? 'No tasks yet. Add one above!'
            : 'No tasks match this filter.';
        taskList.appendChild(emptyMsg);
    } else {
        filteredTasks.forEach((task) => {
            taskList.appendChild(buildTaskElement(task));
        });
    }

    updateCounter();
}

function buildTaskElement(task) {
    const listItem = document.createElement('li');
    listItem.dataset.id = task.id;

    // Left side: checkbox + text + due date
    const leftWrap = document.createElement('div');
    leftWrap.classList.add('task-left');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => toggleComplete(task.id));

    const textWrap = document.createElement('div');
    textWrap.classList.add('task-text-wrap');

    const span = document.createElement('span');
    span.classList.add('task-text');
    if (task.done) span.classList.add('completed');
    span.textContent = task.text;
    textWrap.appendChild(span);

    if (task.dueDate) {
        const dueDateEl = document.createElement('span');
        dueDateEl.classList.add('task-due-date');

        const isOverdue = !task.done && new Date(task.dueDate) < new Date(new Date().toDateString());
        if (isOverdue) dueDateEl.classList.add('overdue');

        dueDateEl.textContent = `Due: ${formatDate(task.dueDate)}${isOverdue ? ' (overdue)' : ''}`;
        textWrap.appendChild(dueDateEl);
    }

    leftWrap.appendChild(checkbox);
    leftWrap.appendChild(textWrap);

    // Right side: edit + delete buttons
    const buttonWrap = document.createElement('div');
    buttonWrap.classList.add('task-buttons');

    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(task.id, listItem));

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    buttonWrap.appendChild(editBtn);
    buttonWrap.appendChild(deleteBtn);

    listItem.appendChild(leftWrap);
    listItem.appendChild(buttonWrap);

    return listItem;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateCounter() {
    const remaining = tasks.filter((task) => !task.done).length;
    taskCounter.textContent = `${remaining} task${remaining === 1 ? '' : 's'} remaining`;
}

// ---------- Task actions ----------

function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;

    tasks.push({
        id: Date.now().toString(),
        text: text,
        done: false,
        dueDate: dueDateInput.value || null
    });

    saveTasks();
    renderTasks();

    taskInput.value = '';
    dueDateInput.value = '';
    taskInput.focus();
}

function toggleComplete(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.done = !task.done;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
}

function startEdit(id, listItem) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    listItem.innerHTML = '';

    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('task-edit-input');
    input.value = task.text;

    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText !== '') {
            task.text = newText;
            saveTasks();
        }
        renderTasks();
    };

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
    input.addEventListener('blur', saveEdit);

    listItem.appendChild(input);
    input.focus();
    input.select();
}

function clearAllTasks() {
    if (tasks.length === 0) return;
    const confirmed = confirm('Clear ALL tasks? This cannot be undone.');
    if (!confirmed) return;

    tasks = [];
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ---------- Filters ----------

filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// ---------- Dark mode ----------

function initDarkMode() {
    const darkModeOn = localStorage.getItem('darkMode') === 'true';
    if (darkModeOn) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
});

// ---------- Event listeners ----------

addButton.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') addTask();
});

dueDateInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') addTask();
});

clearAllButton.addEventListener('click', clearAllTasks);

// ---------- Init ----------

initDarkMode();
renderTasks();