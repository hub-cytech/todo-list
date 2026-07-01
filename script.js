// Attend que la page soit complètement chargée
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Fonction réutilisable pour créer un élément de tâche
    const createTaskElement = (text, isCompleted = false) => {
        const taskItem = document.createElement('li');
        if (isCompleted) taskItem.classList.add('completed');

        // Création sécurisée des éléments (évite XSS)
        const span = document.createElement('span');
        span.textContent = text; // ✅ SÉCURISÉ : textContent ne peut pas exécuter de code
        
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

        return taskItem;
    };

    // Charge les tâches depuis localStorage au démarrage
    const loadTasks = () => {
        try {
            const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            taskList.innerHTML = '';

            tasks.forEach(task => {
                const taskItem = createTaskElement(task.text, task.completed);
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
        } catch (error) {
            console.error("Erreur lors du chargement des tâches :", error);
            // Si les données sont corrompues, on recommence avec une liste vide
            localStorage.removeItem('tasks');
            taskList.innerHTML = '';
        }
    };

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

    // Ajouter une tâche
    const addTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            // Message d'erreur visuel
            taskInput.style.borderColor = '#ff4444';
            taskInput.placeholder = 'Veuillez entrer une tâche !';
            setTimeout(() => {
                taskInput.style.borderColor = '#ddd';
                taskInput.placeholder = 'Ajouter une tâche...';
            }, 2000);
            return;
        }

        // Utilisation de la fonction réutilisable
        const taskItem = createTaskElement(taskText);
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
