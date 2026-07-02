class TodoManager {
    constructor(storage) {
        this.storage = storage;
        this.STORAGE_KEY = 'tasks';
    }

    getTasks() {
        const raw = this.storage.getItem(this.STORAGE_KEY);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed;
        } catch {
            return [];
        }
    }

    saveTasks(tasks) {
        this.storage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    }

    addTask(text) {
        const trimmed = (text || '').trim();
        if (trimmed === '') return null;

        const task = { text: trimmed, completed: false };
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    }

    deleteTask(index) {
        const tasks = this.getTasks();
        if (index < 0 || index >= tasks.length) return false;
        tasks.splice(index, 1);
        this.saveTasks(tasks);
        return true;
    }

    toggleTask(index) {
        const tasks = this.getTasks();
        if (index < 0 || index >= tasks.length) return null;
        tasks[index].completed = !tasks[index].completed;
        this.saveTasks(tasks);
        return tasks[index];
    }

    clearCompleted() {
        const tasks = this.getTasks();
        const remaining = tasks.filter(t => !t.completed);
        this.saveTasks(remaining);
        return remaining;
    }

    getTaskCount() {
        const tasks = this.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        return { total, completed, pending: total - completed };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TodoManager;
}
