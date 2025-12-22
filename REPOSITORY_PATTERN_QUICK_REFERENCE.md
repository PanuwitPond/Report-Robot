# Repository Pattern - Quick Reference

## Using BaseRepository

### Basic Operations

```typescript
// Find all
const robots = await robotRepository.findAll();

// Find by ID
const robot = await robotRepository.findById('123');

// Find one by condition
const robot = await robotRepository.findOneBy({ vin: 'ABC123' });

// Find many by condition
const robots = await robotRepository.findBy({ status: 'active' });

// Count all
const total = await robotRepository.count();

// Count by condition
const active = await robotRepository.findAllPaginated(10, 0).then(r => r.pagination.total);

// Check if exists
const exists = await robotRepository.exists('123');
```

### Pagination

```typescript
const result = await robotRepository.findAllPaginated(
    limit: 10,      // Records per page
    offset: 0,      // Skip first N records
    orderBy: 'created_at',
    orderDirection: 'DESC'
);

// Result structure:
{
    data: RobotEntity[],
    total: 100
}
```

### Create & Update

```typescript
// Create single
const robot = await robotRepository.create({
    vin: 'ABC123',
    name: 'Robot 1',
    active: true
});

// Update
const updated = await robotRepository.update('123', {
    name: 'Updated Name'
});

// Bulk create
const robots = await robotRepository.createMany([
    { vin: 'ABC123', name: 'Robot 1' },
    { vin: 'ABC124', name: 'Robot 2' }
]);
```

### Delete

```typescript
// Soft delete (marks as deleted)
const deleted = await robotRepository.delete('123');

// Hard delete (permanent)
const removed = await robotRepository.hardDelete('123');
```

## Custom Repository Methods

### RobotRepository Examples

```typescript
// Find by VIN
const robot = await robotRepository.findByVin('ABC123');

// Find all active
const active = await robotRepository.findAllActive();

// Find with filters
const results = await robotRepository.findAllPaginated(10, 0, {
    name: 'Test',        // ILIKE search
    status: 'active',    // Exact match
    is_active: true      // Boolean
});

// Get statistics
const stats = await robotRepository.getStatistics();
// { total: 100, active: 80, inactive: 20, by_status: {...} }
```

### UserRepository Examples

```typescript
// Find by username or email
const user = await userRepository.findByUsername('john');
const user = await userRepository.findByEmail('john@example.com');

// Check availability
const available = await userRepository.usernameExists('john');

// Get with roles
const user = await userRepository.findByIdWithRoles('123');

// Manage roles
await userRepository.assignRole('user-id', 'role-id');
await userRepository.removeRole('user-id', 'role-id');
```

## QueryBuilder (Complex Queries)

```typescript
// Build complex queries fluently
const results = await robotRepository.query()
    .select('id', 'name', 'vin', 'status')
    .where('status = $1', ['active'])
    .where('created_at >= $1', [new Date('2024-01-01')])
    .orderBy('name', 'ASC')
    .limit(20)
    .offset(0)
    .execute<RobotEntity>();

// Get single result
const result = await robotRepository.query()
    .where('vin = $1', ['ABC123'])
    .executeOne<RobotEntity>();
```

## Raw SQL Access

```typescript
// Execute raw SQL - returns array
const results = await robotRepository.execute<RobotEntity>(
    'SELECT * FROM robots WHERE status = $1',
    ['active']
);

// Execute and return single
const result = await robotRepository.executeOne<RobotEntity>(
    'SELECT * FROM robots WHERE id = $1',
    ['123']
);

// Execute and return count
const count = await robotRepository.executeCount(
    'SELECT COUNT(*) as count FROM robots WHERE status = $1',
    ['active']
);
```

## Transactions

```typescript
await robotRepository.transaction(async (repo) => {
    // All operations in this block are in a transaction
    const robot1 = await repo.create({ vin: 'A1', name: 'Robot 1' });
    const robot2 = await repo.create({ vin: 'A2', name: 'Robot 2' });
    // Auto-commits if no error, auto-rollbacks if error thrown
});
```

## Filtering Patterns

### Pagination + Filters Combined
```typescript
const results = await robotRepository.findAllPaginated(
    limit: 10,
    offset: 0,
    filters: {
        name: 'test',           // Will ILIKE search
        status: 'active'        // Will match exactly
    }
);
```

### Filter Examples
- **String columns**: Use ILIKE (case-insensitive contains)
- **Status/Category**: Use exact match
- **Boolean**: Use exact match
- **Dates**: Use raw execute() for range queries

## Error Handling

All methods throw exceptions from the shared exception system:

```typescript
try {
    const robot = await robotRepository.findById(invalidId);
    if (!robot) {
        throw new ResourceNotFoundException('Robot not found');
    }
} catch (error) {
    if (error instanceof ResourceNotFoundException) {
        // Handle 404
    }
}
```

## Performance Tips

1. **Use pagination** for large datasets
```typescript
const results = await repo.findAllPaginated(10, 0); // Not findAll()
```

2. **Use filters** instead of fetching all
```typescript
const active = await repo.findBy({ status: 'active' }); // Better than post-filtering
```

3. **Select specific columns** with QueryBuilder
```typescript
repo.query().select('id', 'name').execute();
```

4. **Use transactions** for multiple related operations
```typescript
await repo.transaction(async (r) => { /* operations */ });
```

## Next: Service Integration (Phase 3)

Repositories will be injected into services to replace raw SQL queries:

```typescript
// Before
async getRobots() {
    return this.dataSource.query('SELECT * FROM robots...');
}

// After
async getRobots() {
    return this.robotRepository.findAll();
}
```

