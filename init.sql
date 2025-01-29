CREATE TABLE IF NOT EXISTS mails (
    id INTEGER PRIMARY KEY,
    `subject` TEXT,
    `from` TEXT,
    `to` TEXT,
    `raw` TEXT,
    `at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

