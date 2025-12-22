# Middleware - Quick Reference

## Response Format

All successful responses follow this structure:

```typescript
{
    success: true,
    data: T,
    message: string,
    timestamp: ISO8601
}
```

## Error Format

All errors follow this structure:

```typescript
{
    success: false,
    error: {
        status: number,
        message: string,
        details?: any  // Development only
    },
    timestamp: ISO8601,
    path: string
}
```

## Logging Output

Requests are logged with this format:

```
→ METHOD PATH from IP          // Request starts
← METHOD PATH STATUS DURATIONms // Request completes (success)
✗ METHOD PATH STATUS DURATIONms: ERROR  // Request completes (error)
```

## Validation

Validation errors include detailed field messages:

```typescript
{
    success: false,
    error: {
        status: 400,
        message: "Validation failed",
        details: {
            errors: {
                fieldName: ["error message 1", "error message 2"]
            }
        }
    }
}
```

## Common HTTP Status Codes

| Status | Meaning | When |
|--------|---------|------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Unhandled exception |

## Examples

### Successful POST
```http
POST /api/robots
Content-Type: application/json

{
    "vin": "ABC123",
    "name": "Robot 1"
}
```

**Response (201 Created)**:
```json
{
    "success": true,
    "data": {
        "id": "1",
        "vin": "ABC123",
        "name": "Robot 1",
        "active": true,
        "created_at": "2024-12-22T10:00:00Z",
        "updated_at": "2024-12-22T10:00:00Z"
    },
    "message": "POST /api/robots executed successfully",
    "timestamp": "2024-12-22T10:30:45.123Z"
}
```

**Logs**:
```
→ POST /api/robots from ::1
← POST /api/robots 201 45ms
```

---

### Failed Validation
```http
POST /api/robots
Content-Type: application/json

{
    "vin": "AB",  // Too short
    "name": ""    // Empty
}
```

**Response (400 Bad Request)**:
```json
{
    "success": false,
    "error": {
        "status": 400,
        "message": "Validation failed",
        "details": {
            "errors": {
                "vin": ["must be longer than or equal to 3 characters"],
                "name": ["should not be empty"]
            }
        }
    },
    "timestamp": "2024-12-22T10:30:45.123Z",
    "path": "/api/robots"
}
```

**Logs**:
```
→ POST /api/robots from ::1
✗ POST /api/robots 400 12ms: Validation failed
```

---

### Not Found Error
```http
DELETE /api/robots/invalid-id
```

**Response (404 Not Found)**:
```json
{
    "success": false,
    "error": {
        "status": 404,
        "message": "Robot with identifier \"invalid-id\" not found"
    },
    "timestamp": "2024-12-22T10:30:45.123Z",
    "path": "/api/robots/invalid-id"
}
```

**Logs**:
```
→ DELETE /api/robots/invalid-id from ::1
✗ DELETE /api/robots/invalid-id 404 8ms: Robot with identifier "invalid-id" not found
```

---

### Conflict Error (Duplicate)
```http
POST /api/robots
Content-Type: application/json

{
    "vin": "ABC123",  // Already exists
    "name": "Robot 1"
}
```

**Response (409 Conflict)**:
```json
{
    "success": false,
    "error": {
        "status": 409,
        "message": "Robot with vin \"ABC123\" already exists"
    },
    "timestamp": "2024-12-22T10:30:45.123Z",
    "path": "/api/robots"
}
```

**Logs**:
```
→ POST /api/robots from ::1
✗ POST /api/robots 409 32ms: Robot with vin "ABC123" already exists
```

---

## Middleware Execution Order

```
1. LoggingInterceptor.intercept() - BEFORE
   └─ Log incoming request

2. ValidationPipe.transform() - VALIDATE
   └─ Validate request body against DTO

3. Controller.method()
   └─ Execute business logic

4. ResponseInterceptor.intercept() - WRAP
   └─ Wrap response in standard format

5. LoggingInterceptor.intercept() - AFTER
   └─ Log response or error

6. [If exception] GlobalExceptionFilter.catch()
   └─ Format and send error response
```

## Debugging Tips

### Enable Development Mode
In `.env`:
```
NODE_ENV=development
```

This includes detailed error information in responses.

### Check Logs
All requests are logged with:
- HTTP method and path
- Response status
- Duration in milliseconds
- Error messages (if any)

### Common Issues

**Validation failing?**
- Check DTO field names match request body
- Check decorators on DTO class
- See validation error details in response

**Middleware not applied?**
- Check `app.module.ts` for provider registration
- Verify `APP_*` tokens are used
- Restart dev server

**Response wrapping not working?**
- Check if response already has `success` property
- Check if data is null/undefined
- Check logs for interceptor order

## Testing Middleware

### Unit Test Example
```typescript
describe('GlobalExceptionFilter', () => {
    it('should format exception response', () => {
        const filter = new GlobalExceptionFilter();
        const mockHost = createMock<ArgumentsHost>();
        
        const exception = new ResourceNotFoundException('Robot', '123');
        filter.catch(exception, mockHost);
        
        expect(mockHost.getResponse().json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                    status: 404,
                })
            })
        );
    });
});
```

### Integration Test Example
```typescript
describe('API Response Format', () => {
    it('should return wrapped response on success', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/robots')
            .expect(200);
        
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                data: expect.any(Array),
                message: expect.stringContaining('executed successfully'),
                timestamp: expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
            })
        );
    });
});
```

## Production Considerations

✅ **Sensitive Data**: Not included in development errors  
✅ **Performance**: Minimal overhead from logging  
✅ **Scalability**: No state shared between requests  
✅ **Security**: No sensitive headers logged  
✅ **Compliance**: Timestamps in ISO8601 format  

## Advanced Configuration

### Custom Error Formatter
Extend GlobalExceptionFilter:
```typescript
export class CustomExceptionFilter extends GlobalExceptionFilter {
    // Override catch method
}
```

### Custom Validators
Add to DTO:
```typescript
@IsCustom()
fieldName: string;
```

### Per-Controller Validation
Override in controller:
```typescript
@Post()
@UsePipes(new ValidationPipe({ ...options }))
async create(@Body() dto: CreateDto) {}
```

