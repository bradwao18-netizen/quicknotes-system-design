# QuickNotes System Architecture Document

## 1. Requirements

### Functional Requirements
* Users can securely authenticate and manage their notes.
* Users can create, read, update, and delete (CRUD) notes.
* Users can search and filter notes by title or content.

### Non-Functional Requirements
* **High Availability:** 99.9% uptime with minimal service disruption.
* **Low Latency:** Fast response times (< 200ms for read operations).
* **Scalability:** Capable of handling up to 1 million active users with predictable peak loads.

---

## 2. Load Estimates (1 Million Users)
# QuickNotes System Architecture Document

## Component Role Breakdown
* **App Server 1 & App Server 2:** Handle incoming client requests, route API calls, and distribute incoming traffic load.
* **Redis Cache:** Stores frequently accessed session data and reduces database read latency.
* **Message Queue (RabbitMQ):** Decouples services by queuing asynchronous background jobs (e.g., notification processing or log syncing).
* **Background Worker:** Consumes messages from the queue to process asynchronous tasks independently of the main application servers.
* **Primary DB & Read Replica:** The Primary DB processes all metadata writes, while the Read Replica handles read queries to scale database throughput.

---

## System Architecture & Request Flows

### 1. Step-by-Step Request Flows

#### GET Operation Flow (Loading Notes)
1. **User Action:** The user triggers a request to fetch notes from the frontend interface.
2. **Load Balancing / App Servers:** Request hits the App Servers, which check the Redis Cache first for cached note data.
3. **Database Query:** If a cache miss occurs, the query is routed to the Read Replica to fetch the note records.
4. **Response Delivery:** Data flows back through the App Server to the client interface.

#### POST Operation Flow (Creating a Note)
1. **User Action:** The user submits a new note creation payload.
2. **App Server Processing:** The App Server validates the request payload.
3. **Write Operation:** A write command is sent to the Primary DB to persist the new note metadata.
4. **Asynchronous Queueing:** A background task is pushed to the Message Queue (RabbitMQ) for indexing or notifications, which is then processed by the Background Worker.

---

## Single-Point-of-Failure (SPOF) Analysis

* **Primary Database Dependency:**
  * *Risk:* If the Primary DB goes down, write operations fail completely.
  * *Mitigation:* Implement database failover clusters and automated replica promotion.
* **App Server Bottlenecks:**
  * *Risk:* Traffic spikes can overwhelm a single app server instance.
  * *Mitigation:* Load balancing across multiple app servers and horizontal scaling.

---

## 3. Architecture Diagram* **Assumptions:** 1 million registered users, 10% active daily (100,000 DAU). Each active user creates 5 notes and views 20 notes per day. Average note metadata size = 2 KB.
* **Reads Per Second (Average):** $\frac{100,000 \text{ users} \times 20 \text{ reads/day}}{86,400 \text{ seconds}} \approx \mathbf{23.15 \text{ reads/sec}}$ (Peak at $5\times$ = **115.75 reads/sec**).
* **Writes Per Second (Average):** $\frac{100,000 \text{ users} \times 5 \text{ writes/day}}{86,400 \text{ seconds}} \approx \mathbf{5.79 \text{ writes/sec}}$ (Peak at $5\times$ = **28.95 writes/sec**).
* **Storage Per Year:** $100,000 \text{ writes/day} \times 365 \text{ days} \times 2 \text{ KB/note} \approx \mathbf{73 \text{ GB/year}}$ (metadata).

---


## 3. Architecture Diagram

```text
[Client / Browser]
        │
        ▼
   [DNS & CDN]
        │
        ▼
   [Load Balancer (Nginx)]
        │
        ├──────────────────────────┐
        ▼                          ▼
 [App Server 1]             [App Server 2]
        │                          │
        ├───────────┬──────────────┘
        ▼           ▼
   [Redis Cache]  [Message Queue (RabbitMQ)]
        │           │
        │           ▼
        │      [Background Worker]
        │           │
        ▼           ▼
  [Primary DB] ──► [Read Replica]
 (Metadata Write)   (Metadata Read)
