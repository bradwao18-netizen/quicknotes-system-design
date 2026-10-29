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
* **Assumptions:** 1 million registered users, 10% active daily (100,000 DAU). Each active user creates 5 notes and views 20 notes per day. Average note metadata size = 2 KB.
* **Reads Per Second (Average):** $\frac{100,000 \text{ users} \times 20 \text{ reads/day}}{86,400 \text{ seconds}} \approx \mathbf{23.15 \text{ reads/sec}}$ (Peak at $5\times$ = **115.75 reads/sec**).
* **Writes Per Second (Average):** $\frac{100,000 \text{ users} \times 5 \text{ writes/day}}{86,400 \text{ seconds}} \approx \mathbf{5.79 \text{ writes/sec}}$ (Peak at $5\times$ = **28.95 writes/sec**).
* **Storage Per Year:** $100,000 \text{ writes/day} \times 365 \text{ days} \times 2 \text{ KB/note} \approx \mathbf{73 \text{ GB/year}}$ (metadata).

---

## 3. Architecture Diagram & Component Roles

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