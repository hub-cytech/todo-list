// Attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    if (!taskInput || !addTaskBtn || !taskList) {
        console.error('Éléments DOM requis introuvables. Vérifiez les IDs dans le HTML.');
        return;
    }

    // Récupère les tâches depuis localStorage de manière sécurisée
    const getStoredTasks = () => {
        try {
            const raw = localStorage.getItem('tasks');
            if (raw === null) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                console.warn('Données localStorage invalides (pas un tableau). Réinitialisation.');
                localStorage.removeItem('tasks');
                return [];
            }
            return parsed.filter(task =>
                task !== null && typeof task === 'object' && typeof task.text === 'string'
            );
        } catch (e) {
            console.error('Erreur lors de la lecture de localStorage:', e.message);
            localStorage.removeItem('tasks');
            return [];
        }
    };

    // Sauvegarde toutes les tâches dans localStorage
    const saveTasks = () => {
        const tasks = [];
        document.querySelectorAll('#taskList li').forEach(taskItem => {
            const span = taskItem.querySelector('span');
            if (!span) return;
            tasks.push({
                text: span.textContent,
                completed: taskItem.classList.contains('completed')
            });
        });
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde dans localStorage:', e.message);
            alert('Impossible de sauvegarder les tâches. Le stockage est peut-être plein.');
        }
    };

    // Crée un élément de tâche avec ses boutons et écouteurs
    const createTaskItem = (text, completed) => {
        const taskItem = document.createElement('li');
        if (completed) taskItem.classList.add('completed');

        const span = document.createElement('span');
        span.textContent = text;

        const btnContainer = document.createElement('div');

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = '✓';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✗';

        btnContainer.appendChild(completeBtn);
        btnContainer.appendChild(deleteBtn);
        taskItem.appendChild(span);
        taskItem.appendChild(btnContainer);

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
        const tasks = getStoredTasks();
        taskList.innerHTML = '';
        tasks.forEach(task => {
            taskList.appendChild(createTaskItem(task.text, task.completed));
        });
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

        taskList.appendChild(createTaskItem(taskText, false));
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
