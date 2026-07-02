// Attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Sauvegarde toutes les tâches dans localStorage
    const saveTasks = () => {
        try {
            const tasks = [];
            document.querySelectorAll('#taskList li').forEach(taskItem => {
                tasks.push({
                    text: taskItem.querySelector('span').textContent,
                    completed: taskItem.classList.contains('completed')
                });
            });
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des tâches :", error);
            alert("Impossible de sauvegarder les tâches. Le stockage local est peut-être plein.");
        }
    };

    // Crée un élément de tâche avec ses boutons et écouteurs
    const createTaskElement = (text, isCompleted = false) => {
        const taskItem = document.createElement('li');
        if (isCompleted) taskItem.classList.add('completed');

        // Création sécurisée des éléments (évite XSS)
        const span = document.createElement('span');
        span.textContent = text;

        const buttonDiv = document.createElement('div');

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = '✓';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✗';

        buttonDiv.appendChild(completeBtn);
        buttonDiv.appendChild(deleteBtn);

        taskItem.appendChild(span);
        taskItem.appendChild(buttonDiv);

        completeBtn.addEventListener('click', () => {
            taskItem.classList.toggle('completed');
            saveTasks();
        });

        deleteBtn.addEventListener('click', () => {
            taskItem.remove();
            saveTasks();
        });

        return taskItem;
    };

    // Charge les tâches depuis localStorage au démarrage
    const loadTasks = () => {
        try {
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            taskList.innerHTML = '';
            tasks.forEach(task => {
                taskList.appendChild(createTaskElement(task.text, task.completed));
            });
        } catch (error) {
            console.error("Erreur lors du chargement des tâches :", error);
            localStorage.removeItem('tasks');
            taskList.innerHTML = '';
        }
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

        taskList.appendChild(createTaskElement(taskText));
        taskInput.value = '';
        saveTasks();
    };

    // Écouteurs
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Charge les tâches au démarrage
    loadTasks();
});
