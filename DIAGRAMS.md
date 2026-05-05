# HealthMate Project Diagrams

This document contains architectural and procedural diagrams for the HealthMate application, represented in **Mermaid** syntax.

## 1. Use Case Diagram
Visualizes the primary interactions between different actors and the system functionalities.

```mermaid
usecaseDiagram
    actor "User" as U
    actor "Trainer" as T
    actor "Admin" as A
    actor "AI Engine" as AI

    package "HealthMate System" {
        usecase "Login / Register (OTP)" as UC1
        usecase "Track Daily Metrics (Steps, Water, Sleep)" as UC2
        usecase "Log Meals & Workouts" as UC3
        usecase "Post & Comment on Blogs" as UC4
        usecase "Follow/Unfollow Community Members" as UC5
        usecase "Search & Hire Trainers" as UC6
        usecase "Receive AI Health Tips" as UC7
        usecase "Generate Personalized Plans" as UC8
        usecase "Moderate Content & Reports" as UC9
    }

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC8
    
    T --> UC1
    T --> UC4
    T --> UC6
    
    A --> UC1
    A --> UC9
    
    AI --> UC7
    AI --> UC8
    UC2 ..> UC7 : <<include>>
```

---

## 2. Class Diagram
Represents the structural model and data relationships of the backend.

```mermaid
classDiagram
    class User {
        +String id
        +String username
        +String email
        +Set~Role~ roles
        +double weight
        +double height
        +String healthGoal
        +getBMI()
    }

    class Role {
        +String id
        +ERole name
    }

    class ERole {
        <<enumeration>>
        USER
        TRAINER
        ADMIN
    }

    class Trainer {
        +String specialty
        +String bio
        +String location
        +List~Review~ reviews
    }

    class DailyLog {
        +String userId
        +LocalDate date
        +int steps
        +double waterIntake
        +double sleepDuration
        +int caloriesBurned
    }

    class BlogPost {
        +String title
        +String content
        +String userId
        +LocalDateTime createdAt
    }

    class Meal {
        +String name
        +double calories
        +double protein
        +String logId
    }

    User "1" *-- "many" Role : roles
    User "1" -- "0..1" Trainer : professional profile
    User "1" -- "many" DailyLog : logs daily data
    User "1" -- "many" BlogPost : authors
    DailyLog "1" -- "many" Meal : contains
    BlogPost "1" -- "many" Comment : has
```

---

## 3. Sequence Diagrams
Dynamic behavioral charts for core workflows.

### A. Authentication Flow (OTP-Based)
How a user logs into the system securely.

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React App
    participant Auth as AuthController
    participant OTP as OtpService
    participant Mail as Mail API
    participant DB as MongoDB

    User->>Frontend: Enter Email/Registration Details
    Frontend->>Auth: POST /api/auth/register-or-login
    Auth->>OTP: generateOTP(email)
    OTP->>Mail: Send OTP Email
    Mail-->>User: Delivery of OTP
    User->>Frontend: Enter 6-digit OTP
    Frontend->>Auth: POST /api/auth/verify-otp
    Auth->>OTP: validateOTP(email, code)
    Auth->>DB: Find/Create User
    DB-->>Auth: User Record
    Auth-->>Frontend: Set-Cookie (JWT) / Response Body
    Frontend-->>User: Redirect to Dashboard
```

### B. Activity Tracking & AI Tip Generation
How logging a metric triggers system feedback.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Controller
    participant Service
    participant AI as Gemini AI
    participant DB

    User->>Frontend: Logs 2L Water Intake
    Frontend->>Controller: POST /api/logs/water
    Controller->>Service: updateDailyLog(userId, intake)
    Service->>DB: Save Metric
    Service->>AI: analyzeStats(userHistory)
    AI-->>Service: "Great progress! Drink 500ml more after workout."
    Service-->>Frontend: Updated UI + AI Tip
    Frontend-->>User: Show Success Toast & Feedback
```

### C. Moderation Workflow
Handling reports for inappropriate content.

```mermaid
sequenceDiagram
    participant User as Reporting User
    participant Frontend
    participant ModCtrl as ModerationController
    participant DB
    participant Admin

    User->>Frontend: Click "Report Post"
    Frontend->>ModCtrl: POST /api/moderate/report
    ModCtrl->>DB: Store Report (Status: PENDING)
    Admin->>Frontend: Open Moderation Center
    Frontend->>ModCtrl: GET /api/moderate/pending
    ModCtrl-->>Frontend: List of Reports
    Admin->>Frontend: Click "Approve Removal"
    Frontend->>ModCtrl: PUT /api/moderate/action
    ModCtrl->>DB: Update Report + Delete Post
    ModCtrl-->>Admin: Action Confirmed
```

---

## Technical Implementation Details
- **Persistence**: MongoDB (NoSQL) using `Spring Data MongoDB`.
- **Security**: JWT-based authentication with OTP secondary verification.
- **Frontend**: React.js with styled-components/Lucide icons.
- **AI Integration**: Google Gemini API for health tip generation and data analysis.
