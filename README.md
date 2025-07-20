# TasksApi

Minimalistic API service for task management.
The project is created on Node.js + Express.


## 📁 Project Structure
`app.js` — Main application file with Express and Database initialization.

`database.js` — Code for SQLite database initialization.

`tasks/routes.js` — Tasks API endpoints.

`helpers.js` — Helper functions (validation, etc.)

`db/` — Folder with SQLite database files.
`db/schema.sql` — Database schema, used when creating a new database.

`Dockerfile` — Docker container configuration.



## 🐳 Deployment with Docker
To deploy the project in Docker, you first need to create an **Image**.

`cd <project folder>`
`docker build -t <name of your image> .`

After that, you can run container with your **Image** using the simple command:

`docker run -p 8080:80 <name of your image>`

The API will be available at http://localhost:8080



## ⚙ Environment Variables and .env

The server can accept the following environment variables:
```
# Server port
PORT=80

# Path to the SQLite database schema
DB_SCHEMA_PATH="db/schema.sql"

# SQLite database file name, the database file will be created inside the db/ folder
DB_FILE_NAME="tasks.db"
```
(These are default values. If environment variables are not provided, the server will use default values.)



## 📑 Task Structure
Tasks in the database have the following structure:

| Field        | Type     | Description                                                          |
|--------------|----------|----------------------------------------------------------------------|
| `id`         | integer  | Unique task identifier.                                              |
| `text`       | text     | Description of the task.                                        |
| `status`     | text     | Current task status, can only be `"in progress"` or `"completed"`.       |
| `created_at` | datetime | Date of task creation. (Automatically set)                           |
| `updated_at` | datetime | Date of last task update. (Automatically updated via SQLite TRIGGER) |

(For more details, see `db/schema.sql`)



## 📌 API Notes

Base API URL: `/api/v1` + endpoint path. (e.g. `/api/v1/tasks`)

Requests with JSON payload must include `Content-Type: application/json` header (or `application/json; charset=utf-8`)

**Example of successful response:**
```
{
  "status": "ok",
  "data": {
    "id": 123,
    "text": "Buy bread",
    "status": "in progress",
    "created_at": "2025-07-20 08:34:26",
    "updated_at": "2025-07-20 08:34:26"
  }
}
```

```
{
    "status": "ok",
    "data": [
        {
            "id": 1,
            "text": "Hello World",
            "status": "completed",
            "created_at": "2025-07-20 08:34:26",
            "updated_at": "2025-07-20 08:34:26"
        },
        {
            "id": 2,
            "text": "Test 123",
            "status": "in progress",
            "created_at": "2025-07-20 08:34:46",
            "updated_at": "2025-07-20 08:34:46"
        }
    ],
    "meta": {
        "page": 0,
        "items_per_page": 10,
        "total_items": 2
    }
}
```

**Example of error response:**
```
{
  "status": "error",
  "error": {
    "message": "Bad Request"
  }
}
```


**Example of response 404 Not-Found:**
```
{
  "status": "not_found"
}
```



## 📍 API Endpoints

### ▶️ Get Task List
Path: `/tasks`
Method: `GET`

Accepts query parameters in the URL (e.g. /tasks?status=completed)

| query-parameters | Type    | Description                                            |
|------------------|---------|--------------------------------------------------------|
| `text`           | string  | (Optional) Filters by word or phrase in the task text. |
| `status`         | string  | (Optional) Filters by status.                          |
| `page`           | integer | (Optional) Page number (default 0).                    |
| `items_per_page` | integer | (Optional) Items per page (default 10).                |

**Response:**
```
{
  "status": "ok",
  "data": <array of tasks>,
  "meta": {
    "page":           <current page>,
    "items_per_page": <number of items per page>,
    "total_items":    <total number of found items>
  }
}
```



### ▶️ Create Task
Path: `/tasks`
Method: `POST`

**Request parameters (JSON):**
```
{
  "text":   <task description>,
  "status": <task status>
}
```

**Response:**
```
{
  "status": "ok",
  "data": {
    "task_id": <id of new task>
  }
}
```
Additionally, it sends `Location` header with address of new task. (e.g. `/api/v1/tasks/123`)



### ▶️ Get Task by ID
Path: `/tasks/<id>`
Method: `GET`

Accepts the task identifier in `<id>`.

**Response:**
```
{
  "status": "ok",
  "data":   <task>
}
```
If the task is not found, returns error **404 Not Found**



### ▶️ Update Task
Path: `/tasks/<id>`
Method: `PATCH`

Accepts the task identifier in `<id>`.
Request parameters are the same as for creating tasks, however all parameters are optional, and you can update only one field (e.g., `status`).

**Request parameters (JSON):**
```
{
  "text":   <task description>,
  "status": <task status>
}
```

**Response:**
```
{
  "status": "ok"
}
```
If the task is not found, returns error **404 Not Found**



### ▶️ Delete Task
Path: `/tasks/<id>`
Method: `DELETE`

Accepts the task identifier in `<id>`.

**Response:**
```
{
  "status": "ok"
}
```
If the task is not found, returns error **404 Not Found**


