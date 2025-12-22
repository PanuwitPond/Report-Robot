# Backend Refactoring Plan - Phase by Phase

## Executive Summary

The backend follows NestJS module-based architecture with database-driven services. Current state:
- **Good**: Modular structure with separate modules
- **Needs Improvement**: Within modules, services are monolithic with mixed concerns, lacking clear data access layer, no DTOs, minimal type safety, error handling inconsistencies

## Phase Overview

```
Phase 1: Structure & Type Safety
├─ Create comprehensive type/interface system
├─ Define DTOs for all endpoints
├─ Add entity definitions
└─ Add error handling utilities

Phase 2: Data Access Layer (DAL)
├─ Create Repository pattern for database access
├─ Separate query logic from business logic
├─ Add query builders
└─ Improve database abstraction

Phase 3: Service Layer Refactoring
├─ Refactor services to use repositories
├─ Extract business logic into separate methods
├─ Add validation layer
└─ Improve error handling

Phase 4: Controller & API Enhancement
├─ Standardize response formats
├─ Add comprehensive error handling
├─ Improve API documentation
└─ Add request/response validation

Phase 5: Code Organization & Utilities
├─ Create shared utilities/helpers
├─ Add common decorators
├─ Improve logging
└─ Add configuration management
```

## Detailed Breakdown

### Phase 1: Type Safety & Data Structures

**Current Issues:**
- Parameters use `any` type extensively
- No DTOs for request/response validation
- Database entities not clearly defined
- No type-safe error handling

**What We'll Do:**
1. Create DTO files for each module
2. Create Entity interfaces
3. Create Response DTOs
4. Create Error types
5. Add validation decorators

**Example Structure:**
```
modules/robots/
├─ dtos/
│  ├─ create-robot.dto.ts
│  ├─ update-robot.dto.ts
│  ├─ robot.dto.ts
│  └─ robot-query.dto.ts
├─ entities/
│  └─ robot.entity.ts
├─ types/
│  └─ robot.types.ts
├─ robots.controller.ts
├─ robots.service.ts
└─ robots.module.ts
```

### Phase 2: Repository Pattern

**Current Issue:**
- Raw SQL queries scattered in services
- Business logic mixed with database queries
- Difficult to test or change database provider

**What We'll Do:**
1. Create Repository base class
2. Implement module-specific repositories
3. Add query builder utilities
4. Separate concerns cleanly

**Example:**
```typescript
// repositories/robot.repository.ts
@Injectable()
export class RobotRepository extends BaseRepository<RobotEntity> {
    async findByVin(vin: string): Promise<RobotEntity> { }
    async findAllActive(): Promise<RobotEntity[]> { }
    async updateByVin(vin: string, data: any): Promise<RobotEntity> { }
}
```

### Phase 3: Service Refactoring

**Current Issues:**
- Services contain both business logic and data access
- Long methods doing multiple things
- Inconsistent error handling
- Missing validation

**What We'll Do:**
1. Extract data access to repositories
2. Keep business logic in services
3. Add proper validation
4. Standardize error handling
5. Break large methods into smaller ones

### Phase 4: Controller Enhancement

**Current Issues:**
- Manual response wrapping
- Inconsistent error handling in controllers
- No request validation
- No API documentation

**What We'll Do:**
1. Create response interceptor
2. Add request validation
3. Improve error handling
4. Add Swagger documentation
5. Standardize HTTP status codes

### Phase 5: Shared Utilities

**What We'll Create:**
1. Common error handling utilities
2. Custom decorators (@Paginate, @Filter, etc.)
3. Logger service
4. Email service wrapper
5. Configuration management
6. Helper functions

## Implementation Order

### Step 1: Type Safety & DTOs (Est. 2-3 hours)
- Create base types
- Add DTOs for all modules (robots, users, auth, reports, tasks, images)
- Add entity definitions
- Add validation rules

### Step 2: Repository Pattern (Est. 2-3 hours)
- Create BaseRepository
- Implement repositories for each module
- Add query helpers
- Migrate services to use repositories

### Step 3: Service Refactoring (Est. 3-4 hours)
- Refactor each service to use repositories
- Extract validation logic
- Improve error handling
- Add logging

### Step 4: Controller Enhancement (Est. 2 hours)
- Add response interceptor
- Implement error middleware
- Add validation pipes
- Document APIs

### Step 5: Utilities & Polish (Est. 1-2 hours)
- Create shared utilities
- Add decorators
- Improve logging
- Final testing

## Quality Gates

✅ **Code Quality:**
- No `any` types (except where necessary)
- Consistent naming conventions
- Single responsibility principle
- DRY (Don't Repeat Yourself)

✅ **Type Safety:**
- All parameters and returns are typed
- DTOs for all API endpoints
- Entity definitions complete
- Error types defined

✅ **Error Handling:**
- Consistent exception handling
- Custom HTTP exceptions
- Proper logging
- User-friendly error messages

✅ **Testing:**
- No functionality broken
- All endpoints working
- Database operations correct
- Error scenarios handled

## Affected Modules

1. **Auth Module** - JWT strategies, guards, decorators
2. **Users Module** - User management via Keycloak
3. **Robots Module** - Robot CRUD operations
4. **Tasks Module** - Task management
5. **Reports Module** - Report generation
6. **Images Module** - Image upload/storage
7. **MROI Module** - Multiple ROI management

## Success Criteria

- ✅ All endpoints working without breaking changes
- ✅ Type safety improved significantly (no more `any`)
- ✅ Code is more maintainable and testable
- ✅ Clear separation of concerns
- ✅ Better error handling and logging
- ✅ Comprehensive documentation
- ✅ Build completes without errors
- ✅ All API responses consistent

## Timeline

**Total Estimated Time: 10-15 hours**

- Phase 1 (Type Safety): 2-3 hours
- Phase 2 (Repository): 2-3 hours
- Phase 3 (Services): 3-4 hours
- Phase 4 (Controllers): 2 hours
- Phase 5 (Utilities): 1-2 hours
- Testing & Refinement: 1-2 hours

## Notes

- Frontend refactoring complete, backend is next priority
- Similar approach to frontend: modular, type-safe, maintainable
- No breaking changes to existing APIs
- Backwards compatible with frontend
- Can be done incrementally, one module at a time

---

**Status**: Ready to begin Phase 1 ✅
