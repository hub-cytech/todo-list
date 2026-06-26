// Attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Charge les tâches depuis localStorage au démarrage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = '';

        tasks.forEach(task => {
            const taskItem = document.createElement('li');
            if (task.completed) taskItem.classList.add('completed');

            taskItem.innerHTML = `
                <span>${task.text}</span>
                <div>
                    <button class="complete-btn">✓</button>
                    <button class="delete-btn">✗</button>
                </div>
            `;

            taskList.appendChild(taskItem);

            taskItem.querySelector('.complete-btn').addEventListener('click', () => {
                task.completed = !task.completed;
                saveTasks();
                taskItem.classList.toggle('completed');
            });

            taskItem.querySelector('.delete-btn').addEventListener('click', () => {
                const index = tasks.indexOf(task);
                tasks.splice(index, 1);
                saveTasks();
                taskItem.remove();
            });
        });
    };

    // Sauvegarde toutes les tâches dans localStorage
    const saveTasks = () => {
        const tasks = [];
        document.querySelectorAll('#taskList li').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('span').textContent,
                completed: taskItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Ajouter une tâche
    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            <span>${taskText}</span>
            <div>
                <button class="complete-btn">✓</button>
                <button class="delete-btn">✗</button>
            </div>
        `;

        taskList.appendChild(taskItem);
        taskInput.value = '';
        saveTasks();

        taskItem.querySelector('.complete-btn').addEventListener('click', () => {
            taskItem.classList.toggle('completed');
            saveTasks();
        });

        taskItem.querySelector('.delete-btn').addEventListener('click', () => {
            taskItem.remove();
            saveTasks();
        });
    };

    // Écouteurs
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Charge les tâches au démarrage
    loadTasks();
});
