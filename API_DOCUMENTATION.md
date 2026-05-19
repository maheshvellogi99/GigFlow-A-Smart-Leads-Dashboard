# GigFlow — API Documentation

This document provides a comprehensive overview of the backend REST API endpoints available in the GigFlow Smart Leads Dashboard. All routes (except login and register) require a valid JWT Bearer token in the `Authorization` header.

## Base URL
```
https://gigflow-backend-jbzs.onrender.com/api
```

---

## 1. Authentication Routes

### Register a New User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Description**: Creates a new user account. Registration as an `Admin` requires passing the secure `adminSecret`.

**Request Body (JSON)**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "Sales User", // Or "Admin"
  "adminSecret": "your_admin_secret_here" // Only required if role is Admin
}
```

**Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "64a2b...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Sales User"
  }
}
```

### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Description**: Authenticates a user and returns a JWT token.

**Request Body (JSON)**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "64a2b...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Sales User"
  }
}
```

### Get Current User Profile
- **URL**: `/auth/me`
- **Method**: `GET`
- **Access**: Protected (All Roles)
- **Description**: Returns the profile of the currently authenticated user based on the JWT payload.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64a2b...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Sales User",
    "createdAt": "2023-10-01T12:00:00.000Z"
  }
}
```

---

## 2. Lead Management Routes

**Note on Data Ownership**: 
- `Sales User`: Can only view, update, and export leads where `createdBy` matches their user ID.
- `Admin`: Can view, update, export, and delete *all* leads.

### Get All Leads (Paginated & Filtered)
- **URL**: `/leads`
- **Method**: `GET`
- **Access**: Protected (All Roles)
- **Description**: Retrieves a paginated list of leads. Supports dynamic filtering, searching, and sorting.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search string for name or email
- `status` (optional): Filter by LeadStatus (`New`, `Contacted`, `Qualified`, `Lost`)
- `source` (optional): Filter by LeadSource (`Website`, `Referral`, `Cold Call`, `Advertisement`)
- `sortBy` (optional): Sort direction (`Latest` or `Oldest`)

**Response (200 OK)**:
```json
{
  "success": true,
  "count": 1,
  "total": 15,
  "totalPages": 2,
  "currentPage": 1,
  "data": [
    {
      "_id": "64b3c...",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "status": "New",
      "source": "Website",
      "createdBy": {
        "_id": "64a2b...",
        "name": "John Doe"
      },
      "createdAt": "2023-10-02T10:00:00.000Z"
    }
  ]
}
```

### Get Single Lead
- **URL**: `/leads/:id`
- **Method**: `GET`
- **Access**: Protected (Owner or Admin)
- **Description**: Retrieves details for a specific lead by its MongoDB ID.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64b3c...",
    "name": "Acme Corp",
    ...
  }
}
```

### Create a Lead
- **URL**: `/leads`
- **Method**: `POST`
- **Access**: Protected (All Roles)
- **Description**: Creates a new lead. The `createdBy` field is automatically injected by the backend using the authenticated user's ID.

**Request Body (JSON)**:
```json
{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "status": "New",
  "source": "Website"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "_id": "64b3c...",
    "name": "Acme Corp",
    ...
  }
}
```

### Update a Lead
- **URL**: `/leads/:id`
- **Method**: `PUT`
- **Access**: Protected (Owner or Admin)
- **Description**: Updates an existing lead.

**Request Body (JSON)**:
```json
{
  "status": "Qualified"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "64b3c...",
    "status": "Qualified",
    ...
  }
}
```

### Delete a Lead
- **URL**: `/leads/:id`
- **Method**: `DELETE`
- **Access**: Protected (**Admin Only**)
- **Description**: Permanently deletes a lead from the database. Sales Users will receive a 403 Forbidden.

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Lead deleted successfully.",
  "data": {}
}
```

---

## 3. Data Export Routes

### Export Leads to CSV
- **URL**: `/csv/export`
- **Method**: `GET`
- **Access**: Protected (All Roles)
- **Description**: Streams a dynamically generated CSV file containing leads based on the provided filters. Data ownership rules apply (Sales Users only export their own leads).

**Query Parameters**: 
*(Same as `/leads` GET route, excluding pagination parameters)*
- `search`, `status`, `source`, `sortBy`

**Response (200 OK)**:
- **Content-Type**: `text/csv`
- **Header**: `Content-Disposition: attachment; filename="leads_export.csv"`
- Returns raw CSV data stream.
