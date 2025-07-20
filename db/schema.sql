CREATE TABLE IF NOT EXISTS tasks (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `text` TEXT NOT NULL,
    `status` TEXT CHECK( status IN ("in progress", "completed") ) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
AFTER UPDATE OF `status`, `text` ON tasks
FOR EACH ROW
BEGIN
    UPDATE tasks
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;