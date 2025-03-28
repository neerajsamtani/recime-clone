# Engineering Proposal: Multi-User Support for Recipe Management System

## Overview
This proposal outlines the implementation plan for adding multi-user support to our recipe management system. This feature will allow users to create accounts, manage their own recipes, and optionally share recipes with others.

## Current State
The system currently:
- Stores recipes in DynamoDB without user association
- Has no authentication mechanism
- Makes all recipes globally accessible
- Uses a basic Recipe model without user ownership

## Proposed Changes

### 1. Data Model Updates

#### Users Table
```typescript
{
  id: string (primary key),
  email: string (GSI),
  name: string,
  created_at: number,
  updated_at: number
}
```

#### Updated Recipe Model Structure

##### BaseRecipe (Used for parsing)
```typescript
{
  name: string,
  servings: int,
  calories: decimal,
  fat: Macro | null,
  carbs: Macro | null,
  protein: Macro | null,
  ingredients: List[Ingredient],
  instructions: List[string]
}
```

##### Recipe (Stored in DynamoDB)
```typescript
{
  // Inherits all fields from BaseRecipe
  id: string (primary key),
  user_id: string (GSI),
  url: string,
  created_at: number,
  updated_at: number,
  image_url: string | null,
  is_public: boolean,
  original_user_id: string | null,  // For tracking shared recipe origins
  shared_with: List[string] | null  // List of user IDs with access
}
```

##### Ingredient
```typescript
{
  name: string,
  quantity: decimal | string,
  unit: string
}
```

##### Macro
```typescript
{
  amount: decimal,
  unit: string
}
```

### 2. Authentication Implementation

#### Technology Stack
- NextAuth.js for authentication
- JWT for session management
- Support for multiple providers (Google, GitHub)

#### Required Components
1. Authentication API routes
2. Session management middleware
3. Protected route handlers
4. User registration/login flows

### 3. Frontend Changes

#### New Pages
1. Login/Signup pages
2. User profile page
3. Personal recipe dashboard
4. Recipe sharing interface

#### Updated Components
1. Navigation bar with user context
2. Recipe cards with ownership/sharing controls
3. Recipe creation form with user association

### 4. API Routes

#### Authentication
```
/api/auth/[...nextauth]  # NextAuth.js routes
/api/auth/signup        # User registration
```

#### User Management
```
/api/users/me          # Get current user
/api/users/recipes     # Get user's recipes
/api/users/profile     # Update user profile
```

#### Recipe Management
```
/api/recipes/create    # Create new recipe
/api/recipes/public    # Get public recipes
/api/recipes/share     # Share a recipe
/api/recipes/:id       # Get/Update/Delete specific recipe
```

### 5. Security Considerations

1. Authentication & Authorization
   - JWT token validation
   - Route protection middleware
   - Role-based access control

2. Data Protection
   - Input validation
   - CORS configuration
   - Rate limiting
   - Request sanitization

3. Monitoring & Logging
   - Authentication events
   - Access patterns
   - Error tracking
   - Security incidents

### 6. DynamoDB Updates

1. New Indices
   - GSI on users table (email)
   - GSI on recipes table (user_id)
   - LSI on recipes table (created_at)

2. Access Patterns
   - Get user by email
   - Get recipes by user_id
   - Get public recipes
   - Get recipe by id with user verification

## Implementation Phases

### Phase 1: Foundation
1. Create Users table in DynamoDB
2. Update Recipes table schema
3. Add user authentication (NextAuth.js)
4. Implement basic user registration/login

### Phase 2: Core Features
1. Update recipe creation/editing with user association
2. Implement user-specific recipe views
3. Add recipe privacy controls
4. Create user profile management

### Phase 3: Sharing & Collaboration
1. Implement recipe sharing functionality
2. Add public recipe discovery
3. Create social features (likes, comments)
4. Add collaborative editing features

### Phase 4: Security & Performance
1. Implement comprehensive security measures
2. Add monitoring and logging
3. Optimize database queries
4. Add caching layer

## Technical Requirements

### Backend
- Python 3.8+
- Flask
- boto3 for DynamoDB
- pydantic for data validation

### Frontend
- Next.js 13+
- NextAuth.js
- TypeScript
- Tailwind CSS

### Infrastructure
- AWS DynamoDB
- AWS Lambda (optional)
- AWS CloudWatch for logging

## Testing Strategy

1. Unit Tests
   - Authentication flows
   - Data model validation
   - API route handlers

2. Integration Tests
   - User registration process
   - Recipe CRUD operations
   - Sharing functionality

3. Security Tests
   - Authentication bypass attempts
   - Authorization checks
   - Input validation
   - Rate limiting
