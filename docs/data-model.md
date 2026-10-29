# QuickNotes Data Model Document

## 1. SQL vs. NoSQL Decision & Justification
* **Decision:** We choose **SQL (Relational Database - PostgreSQL)** over NoSQL for the QuickNotes backend.
* **Justification:** 
  1. **Relational Integrity:** QuickNotes requires strong relationships between users and their notes (Foreign Key constraints ensure data ownership and security).
  2. **ACID Compliance:** Transactions involving user creation, note updates, and tag attachments demand strict consistency and transactional safety.
  3. **Complex Queries:** Features like pagination, sorting by creation date, and filtering by category benefit greatly from SQL indexing and relational joins.

---

## 2. Entities & Relationships
The database consists of **four core entities**:
1. **Users**: Stores registered user account profiles and credentials.
2. **Notes**: Stores the individual note content, titles, and ownership references.
3. **Categories**: Stores custom folder tags/labels that users can assign to notes.
4. **NoteCategories (Junction Table)**: Manages the many-to-many relationship between Notes and Categories.

---

## 3. SQL `CREATE TABLE` Statements & Indexes

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. NoteCategories (Junction Table for Many-to-Many relationship)
CREATE TABLE note_categories (
    note_id INT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, category_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_categories_user_id ON categories(user_id);

SELECT id, title, body, created_at 
FROM notes 
WHERE user_id = 1 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;

INSERT INTO notes (user_id, title, body) 
VALUES (1, 'Cloud Architecture Notes', 'Review load balancer configuration.') 
RETURNING id, created_at;

SELECT id, title, body, created_at 
FROM notes 
WHERE user_id = 1 
  AND (title ILIKE '%architecture%' OR body ILIKE '%architecture%')
ORDER BY created_at DESC;