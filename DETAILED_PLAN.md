# ShowTick Detailed Project Plan

This document provides a detailed roadmap and functional breakdown of the ShowTick platform development.

## 📅 Development Roadmap (Gantt Chart)

```mermaid
gantt
    title ShowTick Project Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: MVP Setup
    Auth & User Module       :done, p1, 2026-04-15, 5d
    Movie Grid & UI          :done, p2, 2026-04-18, 4d
    Basic REST APIs          :done, p3, after p1, 5d
    section Phase 2: Core Engine
    Theatre & Show Mapping   :done, p4, 2026-04-20, 6d
    Booking & Seat Selection :active, p5, 2026-04-22, 7d
    City Selection System    :active, p6, after p4, 3d
    section Phase 3: Advanced Features
    Payment Gateway Mock     :after p5, 5d
    E-Ticket & QR Codes      : 4d
    Admin Dashboard          : 7d
    section Phase 4: Production
    Redis Caching            : 3d
    WebSockets for Live Seats: 5d
    PostgreSQL Migration     : 4d
```

## 🛠️ Feature Implementation Flow

```mermaid
flowchart TD
    Start([Project Initialization]) --> Setup[Django & Vite Setup]
    Setup --> Auth[JWT Authentication]
    Auth --> Movies[Movie Management]
    Movies --> Theatres[Theatre & Screen Configuration]
    Theatres --> Shows[Showtime Scheduling]
    
    subgraph Booking_Engine [Core Booking Engine]
        Shows --> Selection[Interactive Seat Selection]
        Selection --> Lock[Database Row Locking]
        Lock --> Timer[10-min Seat Hold Timer]
    end

    Timer --> Payment{Payment Simulation}
    Payment -- Success --> Confirm[Booking Confirmation]
    Payment -- Fail --> Release[Release Seat Lock]
    
    Confirm --> Ticket[Generate E-Ticket with QR]
    Ticket --> Notify[Email/SMS Notification]
    Notify --> End([Process Complete])
```

## 📊 Database Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ BOOKING : makes
    MOVIE ||--o{ SHOW : has
    THEATRE ||--o{ SCREEN : contains
    SCREEN ||--o{ SHOW : hosts
    SCREEN ||--o{ SEAT : has
    SHOW ||--o{ BOOKING : receives
    BOOKING ||--o{ SEAT : includes
    
    USER {
        string username
        string email
        string password
    }
    MOVIE {
        string title
        string genre
        int duration
        string poster_url
    }
    SHOW {
        datetime start_time
        float price
    }
    BOOKING {
        string transaction_id
        string status
        float total_amount
    }
```

## 🚀 Deployment Strategy

```mermaid
graph LR
    Dev[Development / Local] --> Git[GitHub Repo]
    Git --> CI[CI/CD Actions]
    CI --> Staging[Staging / Heroku/Render]
    Staging --> Prod[Production / AWS/Vercel]
```
