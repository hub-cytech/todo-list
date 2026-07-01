// Attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    const manager = new TodoManager(localStorage);

    // Création sécurisée des éléments (évite XSS)
    const createTaskElement = (text, isCompleted = false) => {
        const taskItem = document.createElement('li');
        if (isCompleted) taskItem.classList.add('completed');

        const span = document.createElement('span');
        span.textContent = text;

        const buttonDiv = document.createElement('div');

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = '\u2713';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '\u2717';

        buttonDiv.appendChild(completeBtn);
        buttonDiv.appendChild(deleteBtn);

        taskItem.appendChild(span);
        taskItem.appendChild(buttonDiv);

        return taskItem;
    };

    const renderTask = (task, index) => {
        const taskItem = createTaskElement(task.text, task.completed);
        taskList.appendChild(taskItem);

        taskItem.querySelector('.complete-btn').addEventListener('click', () => {
            manager.toggleTask(index);
            taskItem.classList.toggle('completed');
        });

        taskItem.querySelector('.delete-btn').addEventListener('click', () => {
            manager.deleteTask(index);
            taskItem.remove();
        });
    };

    // Charge les tâches depuis localStorage au démarrage
    const loadTasks = () => {
        taskList.innerHTML = '';
        const tasks = manager.getTasks();
        tasks.forEach((task, index) => renderTask(task, index));
    };

    // Ajouter une tâche
    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            taskInput.style.borderColor = '#ff4444';
            taskInput.placeholder = 'Veuillez entrer une tâche !';
            setTimeout(() => {
                taskInput.style.borderColor = '#ddd';
                taskInput.placeholder = 'Ajouter une tâche...';
            }, 2000);
            return;
        }

        const task = manager.addTask(taskInput.value);
        if (!task) return;

        const tasks = manager.getTasks();
        renderTask(task, tasks.length - 1);
        taskInput.value = '';
    };

    // Écouteurs
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Charge les tâches au démarrage
    loadTasks();
});
