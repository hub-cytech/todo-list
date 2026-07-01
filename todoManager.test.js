const TodoManager = require('./todoManager');

function createMockStorage() {
    const store = {};
    return {
        getItem: jest.fn((key) => store[key] ?? null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
        _store: store,
    };
}

describe('TodoManager', () => {
    let manager;
    let storage;

    beforeEach(() => {
        storage = createMockStorage();
        manager = new TodoManager(storage);
    });

    // ── getTasks ──────────────────────────────────────────

    describe('getTasks', () => {
        it('returns an empty array when storage is empty', () => {
            expect(manager.getTasks()).toEqual([]);
        });

        it('returns an empty array when storage contains invalid JSON', () => {
            storage._store['tasks'] = 'not json';
            expect(manager.getTasks()).toEqual([]);
        });

        it('returns an empty array when storage contains a non-array JSON value', () => {
            storage._store['tasks'] = JSON.stringify({ foo: 1 });
            expect(manager.getTasks()).toEqual([]);
        });

        it('returns tasks from storage', () => {
            const tasks = [{ text: 'Buy milk', completed: false }];
            storage._store['tasks'] = JSON.stringify(tasks);
            expect(manager.getTasks()).toEqual(tasks);
        });

        it('returns multiple tasks preserving order', () => {
            const tasks = [
                { text: 'A', completed: false },
                { text: 'B', completed: true },
                { text: 'C', completed: false },
            ];
            storage._store['tasks'] = JSON.stringify(tasks);
            expect(manager.getTasks()).toEqual(tasks);
        });
    });

    // ── saveTasks ─────────────────────────────────────────

    describe('saveTasks', () => {
        it('persists tasks to storage', () => {
            const tasks = [{ text: 'Task 1', completed: false }];
            manager.saveTasks(tasks);
            expect(storage.setItem).toHaveBeenCalledWith('tasks', JSON.stringify(tasks));
        });

        it('saves an empty array', () => {
            manager.saveTasks([]);
            expect(storage.setItem).toHaveBeenCalledWith('tasks', '[]');
        });
    });

    // ── addTask ───────────────────────────────────────────

    describe('addTask', () => {
        it('adds a task and returns it', () => {
            const result = manager.addTask('Write tests');
            expect(result).toEqual({ text: 'Write tests', completed: false });
            expect(manager.getTasks()).toEqual([{ text: 'Write tests', completed: false }]);
        });

        it('trims whitespace from task text', () => {
            const result = manager.addTask('  Clean up  ');
            expect(result).toEqual({ text: 'Clean up', completed: false });
        });

        it('returns null for empty string', () => {
            expect(manager.addTask('')).toBeNull();
        });

        it('returns null for whitespace-only string', () => {
            expect(manager.addTask('   ')).toBeNull();
        });

        it('returns null for null/undefined input', () => {
            expect(manager.addTask(null)).toBeNull();
            expect(manager.addTask(undefined)).toBeNull();
        });

        it('appends to existing tasks', () => {
            manager.addTask('First');
            manager.addTask('Second');
            const tasks = manager.getTasks();
            expect(tasks).toHaveLength(2);
            expect(tasks[0].text).toBe('First');
            expect(tasks[1].text).toBe('Second');
        });
    });

    // ── deleteTask ────────────────────────────────────────

    describe('deleteTask', () => {
        beforeEach(() => {
            manager.addTask('Task A');
            manager.addTask('Task B');
            manager.addTask('Task C');
        });

        it('deletes a task at a valid index', () => {
            expect(manager.deleteTask(1)).toBe(true);
            const tasks = manager.getTasks();
            expect(tasks).toHaveLength(2);
            expect(tasks[0].text).toBe('Task A');
            expect(tasks[1].text).toBe('Task C');
        });

        it('deletes the first task', () => {
            expect(manager.deleteTask(0)).toBe(true);
            expect(manager.getTasks()[0].text).toBe('Task B');
        });

        it('deletes the last task', () => {
            expect(manager.deleteTask(2)).toBe(true);
            expect(manager.getTasks()).toHaveLength(2);
        });

        it('returns false for negative index', () => {
            expect(manager.deleteTask(-1)).toBe(false);
            expect(manager.getTasks()).toHaveLength(3);
        });

        it('returns false for out-of-range index', () => {
            expect(manager.deleteTask(10)).toBe(false);
            expect(manager.getTasks()).toHaveLength(3);
        });
    });

    // ── toggleTask ────────────────────────────────────────

    describe('toggleTask', () => {
        beforeEach(() => {
            manager.addTask('Toggle me');
        });

        it('marks an incomplete task as completed', () => {
            const result = manager.toggleTask(0);
            expect(result.completed).toBe(true);
            expect(manager.getTasks()[0].completed).toBe(true);
        });

        it('marks a completed task as incomplete', () => {
            manager.toggleTask(0); // complete
            const result = manager.toggleTask(0); // back to incomplete
            expect(result.completed).toBe(false);
            expect(manager.getTasks()[0].completed).toBe(false);
        });

        it('returns null for negative index', () => {
            expect(manager.toggleTask(-1)).toBeNull();
        });

        it('returns null for out-of-range index', () => {
            expect(manager.toggleTask(5)).toBeNull();
        });

        it('only toggles the targeted task', () => {
            manager.addTask('Other task');
            manager.toggleTask(0);
            const tasks = manager.getTasks();
            expect(tasks[0].completed).toBe(true);
            expect(tasks[1].completed).toBe(false);
        });
    });

    // ── clearCompleted ────────────────────────────────────

    describe('clearCompleted', () => {
        it('removes completed tasks', () => {
            manager.addTask('Done');
            manager.addTask('Pending');
            manager.toggleTask(0);
            const remaining = manager.clearCompleted();
            expect(remaining).toHaveLength(1);
            expect(remaining[0].text).toBe('Pending');
        });

        it('returns all tasks when none are completed', () => {
            manager.addTask('A');
            manager.addTask('B');
            const remaining = manager.clearCompleted();
            expect(remaining).toHaveLength(2);
        });

        it('returns empty array when all are completed', () => {
            manager.addTask('X');
            manager.toggleTask(0);
            const remaining = manager.clearCompleted();
            expect(remaining).toEqual([]);
        });

        it('handles empty task list', () => {
            expect(manager.clearCompleted()).toEqual([]);
        });
    });

    // ── getTaskCount ──────────────────────────────────────

    describe('getTaskCount', () => {
        it('returns zeros for empty list', () => {
            expect(manager.getTaskCount()).toEqual({ total: 0, completed: 0, pending: 0 });
        });

        it('counts tasks correctly', () => {
            manager.addTask('A');
            manager.addTask('B');
            manager.addTask('C');
            manager.toggleTask(1);
            expect(manager.getTaskCount()).toEqual({ total: 3, completed: 1, pending: 2 });
        });

        it('counts all completed', () => {
            manager.addTask('A');
            manager.addTask('B');
            manager.toggleTask(0);
            manager.toggleTask(1);
            expect(manager.getTaskCount()).toEqual({ total: 2, completed: 2, pending: 0 });
        });
    });

    // ── STORAGE_KEY ───────────────────────────────────────

    describe('storage key', () => {
        it('uses "tasks" as the default storage key', () => {
            manager.addTask('Test key');
            expect(storage.setItem).toHaveBeenCalledWith(
                'tasks',
                expect.any(String)
            );
        });
    });

    // ── integration-style scenarios ───────────────────────

    describe('workflow scenarios', () => {
        it('add, toggle, delete workflow', () => {
            manager.addTask('Buy groceries');
            manager.addTask('Walk the dog');
            manager.addTask('Read a book');

            manager.toggleTask(0);
            expect(manager.getTaskCount()).toEqual({ total: 3, completed: 1, pending: 2 });

            manager.deleteTask(1);
            expect(manager.getTasks()).toHaveLength(2);
            expect(manager.getTasks()[1].text).toBe('Read a book');

            manager.clearCompleted();
            expect(manager.getTasks()).toEqual([{ text: 'Read a book', completed: false }]);
        });

        it('survives a round-trip through storage', () => {
            manager.addTask('Persist me');
            manager.toggleTask(0);

            const freshManager = new TodoManager(storage);
            const tasks = freshManager.getTasks();
            expect(tasks).toEqual([{ text: 'Persist me', completed: true }]);
        });
    });
});
