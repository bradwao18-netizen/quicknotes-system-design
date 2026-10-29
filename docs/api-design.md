# QuickNotes API Design Document

## 1. Overview
The QuickNotes API is a RESTful service designed to support 1 million users. It allows authenticated users to create, read, update, delete, and search their personal notes securely. All requests and responses use JSON format over HTTPS.

---

## 2. Base URL
* **Production:** `https://api.quicknotes.com/v1`
* **Staging:** `https://staging-api.quicknotes.com/v1`

---

## 3. REST Endpoints Table

| Method | Path | Description | Success Status | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/notes` | Retrieve a paginated list of notes for the authenticated user | `200 OK` | Yes |
| **POST** | `/notes` | Create a new note | `201 Created` | Yes |
| **GET** | `/notes/{id}` | Retrieve a single note by ID | `200 OK` | Yes |
| **PUT** | `/notes/{id}` | Update an existing note completely | `200 OK` | Yes |
| **DELETE** | `/notes/{id}` | Delete a note by ID | `204 No Content` | Yes |
| **GET** | `/notes/search` | Search notes by keyword query parameters | `200 OK` | Yes |

---

## 4. Request & Response Examples

### A. Creating a Note (`POST /notes`)
* **Request Headers:**
  * `Authorization: Bearer <JWT_TOKEN>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "title": "Cloud Architecture Notes",
    "body": "Review load balancer configuration and read replica scaling."
  }

  {
  "status": "success",
  "code": 201,
  "data": {
    "id": "note_9f83b2a1c",
    "userId": "usr_448921a",
    "title": "Cloud Architecture Notes",
    "body": "Review load balancer configuration and read replica scaling.",
    "createdAt": "2026-10-29T08:30:00Z",
    "updatedAt": "2026-10-29T08:30:00Z"
  }
}

{
  "status": "success",
  "code": 200,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalNotes": 42,
    "totalPages": 5
  },
  "data": [
    {
      "id": "note_9f83b2a1c",
      "userId": "usr_448921a",
      "title": "Cloud Architecture Notes",
      "body": "Review load balancer configuration and read replica scaling.",
      "createdAt": "2026-10-29T08:30:00Z",
      "updatedAt": "2026-10-29T08:30:00Z"
    }
  ]
}

{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "reason": "Title is required and cannot exceed 100 characters."
    }
  ]
}