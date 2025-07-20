# TasksApi

Minimalistic API service for task management (TODO application).

## Description

This project is a minimalistic REST API for tasks management.
It supports basic functions: creating, updating, deleting, and getting tasks. (with pagination, status filtering, and text search)

The project is created on Node.js + Express and is ready for deployment with Docker.



## 📁 Project Structure
`app.js` — Main application file with Express and Database initialization.

`database.js` — Code for SQLite database initialization.

`tasks/routes.js` — Tasks API endpoints.

`helpers.js` — Helper functions (validation, etc.)

`db/` — Folder with SQLite database files.
`db/schema.sql` — Database schema, used when creating a new database.

`Dockerfile` — Docker container configuration.



## 📑 Task Structure
Tasks in the database have the following structure:

| Field        | Type     | Description                                                          |
|--------------|----------|----------------------------------------------------------------------|
| `id`         | integer  | Unique task identifier.                                              |
| `text`       | text     | Text description of the task.                                        |
| `status`     | text     | Current task status, can only be `"in progress"` or `"completed"`.       |
| `created_at` | datetime | Date of task creation. (Automatically set)                           |
| `updated_at` | datetime | Date of last task update. (Automatically updated via SQLite TRIGGER) |

(For more details, see `db/schema.sql`)



## API Description and Endpoints

Base API URL: `/api/v1` + endpoint path. (e.g. `/api/v1/tasks`)

The response body has the following structure:
```
{
  // Required field, contains the request status.
  "status": <"ok", "not_found" or "error">,

  // Optional field, contains the main data.
  "data": <object or array of objects>,

  // Optional field, for additional data.
  "meta": <additional data, e.g. pagination>

  // In case of error, this field will contain a brief error description.
  "error": {
    "message": <error text>
  }
}
```
(Errors currently have a simple, "symbolic" description, without specific details...)

If successful, it returns a response with HTTP status 200 (or 201 when adding a task) and data in JSON format.

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

⚠ Requests with JSON payload must include `Content-Type: application/json` header (or `application/json; charset=utf-8`)



### ▶️ Get Task List

Path: `/tasks`
Method: `GET`

Accepts query parameters in the URL (example: /tasks?status=completed)

| query-parameters | Type    | Description                                                     |
|------------------|---------|-----------------------------------------------------------------|
| `text`           | string  | (Optional) Filters by word or phrase in the task text.          |
| `status`         | string  | (Optional) Filters by status: `"in progress"` or `"completed"`. |
| `page`           | integer | (Optional) Page number (default 0).                             |
| `items_per_page` | integer | (Optional) Number of items per page (default 10).               |

**Response:**
HTTP status: **200**
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

Accepts the following parameters in JSON format:
```
{
  "text":   <task description>,
  "status": <"in progress" or "completed">
}
```

**Response:**
HTTP status: **201**

```
{
  "status": "ok",
  "data": {
    "task_id": <id of new task>
  }
}
```
Additionally, it sends an HTTP `Location` header with address of new task. (example: `/api/v1/tasks/123`)



### ▶️ Get Task by ID
Path: `/tasks/<id>`
Method: `GET`

Accepts the task identifier in `<id>`.

**Response:**
HTTP status: **200**

```
{
  "status": "ok",
  "data":   <обьект задачи>
}
```
If the task is not found, returns error **404 Not Found**



### ▶️ Update Task
Path: `/tasks/<id>`
Method: `PATCH`

Accepts the task identifier in `<id>`.
Request parameters are the same as for [POST] /tasks, however all parameters are optional, and you can update only one field (e.g., `status`).

Required parameters in JSON format:
```
{
  "text":   <task description>,
  "status": <"in progress" or "completed">
}
```

Full list of parameters, for greater REST compliance.
```
{
  "id":         <(optional) task id, must be the same as id in URL>,
  "text":       <task description>,
  "status":     <"in progress" or "completed">
  "created_at": <(optional) Ignored>
  "updated_at": <(optional) Ignored, updated automatically>
}
```

**Response:**
HTTP status: **200**
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
HTTP status: **200** (не **204**...)
```
{
  "status": "ok"
}
```
If the task is not found, returns error **404 Not Found**



## Environment Variables and .env

The server can accept the following environment variables:
```
# Server port (for Docker, this is a port inside the container)
PORT=80

# Path to the SQLite database schema
DB_SCHEMA_PATH="db/schema.sql"

# SQLite database file name, the database file will be created inside the db/ folder
DB_FILE_NAME="tasks.db"
```
(These are default values. If environment variables are not provided, the server will use default values.)

The Dockerfile is configured to start the server with the `--env-file-if-exists=.env` parameter, so it will automatically pick up variables from the `.env` file.



## Getting Started


### ⚙️ Run without Docker
To run the server without Docker, you need Node.js and npm. (The project was tested with Node.js version 18).

Navigate to the project folder and run the following command in your terminal:
`node app.js`

The API will be available at http://localhost:80


### 🐳 Deployment in Docker
To deploy the project in Docker, you first need to create an Image.

To do this, navigate to the project folder in your terminal and execute the command:
`docker build -t <name of your image> .`

After that, you can run a container with your Image using the simple command:
`docker run -p 8080:80 <name of your image>`
The API will be available at http://localhost:8080



## Testing
Tests haven't been implemented yet...






