# Movie Reservation System

A comprehensive movie reservation system built with Next.js, featuring user authentication, movie management, seat booking, and real-time availability tracking.

**Project URL:** https://roadmap.sh/projects/movie-reservation-system

## Features

- User authentication with Google OAuth
- Movie catalog with genre filtering
- Seat reservation system
- Admin panel for movie management
- Real-time seat availability
- Revenue tracking
- Client-side caching with SWR

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with Google Provider
- **Storage:** MinIO for file uploads
- **Caching:** Upstash Redis, SWR for client-side caching

## API Endpoints

### Authentication
```
POST   /api/auth/signin     - Sign in with Google
POST   /api/auth/signout    - Sign out user
GET    /api/auth/session    - Get current session
```

### Users
```
GET    /api/users           - Get all users
GET    /api/users/[id]      - Get user by ID
PUT    /api/users/[id]      - Update user
DELETE /api/users/[id]      - Delete user
```

**Example Request:**
```
GET http://localhost:3000/api/users

Request Headers:
Cookie: next-auth.session-token=efc7e6c5-95ff-459e-811a-bb313014ea0b
```

### Roles
```
GET    /api/roles           - Get all roles
GET    /api/roles/[id]      - Get role by ID
POST   /api/roles           - Create new role
PUT    /api/roles/[id]      - Update role
DELETE /api/roles/[id]      - Delete role
```

### Movies
```
GET    /api/movie           - Get all movies
GET    /api/movie/[id]      - Get movie by ID
POST   /api/movie           - Create new movie (Admin only)
PUT    /api/movie/[id]      - Update movie (Admin only)
DELETE /api/movie/[id]      - Delete movie (Admin only)
```

**Example Request:**
```
GET http://localhost:3000/api/movie

Request Headers:
Cookie: next-auth.session-token=efc7e6c5-95ff-459e-811a-bb313014ea0b
```

### Genres
```
GET    /api/genre           - Get all genres
GET    /api/genre/[id]      - Get genre by ID
POST   /api/genre           - Create new genre (Admin only)
PUT    /api/genre/[id]      - Update genre (Admin only)
DELETE /api/genre/[id]      - Delete genre (Admin only)
```

### Movie by Genre
```
GET    /api/movieByGenre/[id] - Get movies by genre ID
```

### Movie Show Dates
```
GET    /api/movieShowDate     - Get all show dates
GET    /api/movieShowDate/[id] - Get show date by ID
POST   /api/movieShowDate     - Create show date (Admin only)
PUT    /api/movieShowDate/[id] - Update show date (Admin only)
DELETE /api/movieShowDate/[id] - Delete show date (Admin only)
```

### Movie Show Hours
```
GET    /api/movieShowHour     - Get all show hours
GET    /api/movieShowHour/[id] - Get show hour by ID
POST   /api/movieShowHour     - Create show hour (Admin only)
PUT    /api/movieShowHour/[id] - Update show hour (Admin only)
DELETE /api/movieShowHour/[id] - Delete show hour (Admin only)
```

### Movie Seats
```
GET    /api/movieSeat         - Get all seats
GET    /api/movieSeat/[id]    - Get seat by ID
POST   /api/movieSeat         - Create seat (Admin only)
PUT    /api/movieSeat/[id]    - Update seat status
DELETE /api/movieSeat/[id]    - Delete seat (Admin only)
```

### Reservations
```
GET    /api/reservation       - Get all reservations (Admin only)
GET    /api/reservation/[id]  - Get reservation by ID
POST   /api/reservation       - Create new reservation
PUT    /api/reservation/[id]  - Update reservation
DELETE /api/reservation/[id]  - Cancel reservation
```

### User Reservations
```
GET    /api/userReservation/[id] - Get reservations by user ID
```

### Revenue
```
GET    /api/revenue           - Get revenue statistics (Admin only)
```

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd movie-reservation-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Fill in your environment variables:
- Database URLs (PostgreSQL)
- NextAuth configuration
- Google OAuth credentials
- Upstash Redis credentials

4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="your-token"
```

## Authentication

All API endpoints (except public movie viewing) require authentication. Include the session cookie in your requests:

```
Cookie: next-auth.session-token=your-session-token
```

## Admin Access

Admin-only endpoints require the user to have an "ADMIN" role. Regular users can only access public endpoints and their own reservations.

## File Uploads

Movie images are stored using MinIO. Ensure MinIO is running on `http://127.0.0.1:9000` for development.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── page.tsx       # Home page with movie listing
│   └── layout.tsx     # Root layout
├── config/
│   ├── minio.js       # MinIO configuration
│   └── prisma.js      # Prisma client
└── lib/
    ├── auth.ts        # NextAuth configuration
    └── fetcher.ts     # SWR fetcher function
```

This project follows the roadmap specification from https://roadmap.sh/projects/movie-reservation-system