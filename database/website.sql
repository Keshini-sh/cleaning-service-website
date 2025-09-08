//users table (users)
| Column   | Type         | Notes                |
| -------- | ------------ | -------------------- |
| id       | INT, PK, AI  | Unique user ID       |
| name     | VARCHAR(100) | User’s full name     |
| email    | VARCHAR(100) | Unique email address |
| password | VARCHAR(255) | Hashed password      |

//Services table (services)
| Column       | Type          | Notes                 |
| ------------ | ------------- | --------------------- |
| id           | INT, PK, AI   | Unique service ID     |
| business\_id | INT, FK       | References `business` |
| name         | VARCHAR(100)  | Service name          |
| price        | DECIMAL(10,2) | Price of service      |

//Bookings table (bookings) 
| Column      | Type        | Notes                    |
| ----------- | ----------- | ------------------------ |
| id          | INT, PK, AI | Booking ID               |
| user\_id    | INT, FK     | References `users`       |
| service\_id | INT, FK     | References `services`    |
| date        | DATE        | Scheduled booking date   |
| status      | ENUM        | `unpaid`, `paid`, `late` |

//Businesses table (businesses) 
| Column      | Type        | Notes                    |
| ----------- | ----------- | ------------------------ |
| id          | INT, PK, AI | Booking ID               |
| user\_id    | INT, FK     | References `users`       |
| service\_id | INT, FK     | References `services`    |
| date        | DATE        | Scheduled booking date   |
| status      | ENUM        | `unpaid`, `paid`, `late` |
