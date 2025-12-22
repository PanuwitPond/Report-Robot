# Common Hooks Library - Documentation & Examples

## 📚 Overview

A collection of 4 reusable, generic hooks for common patterns in React applications:
- **useAsync** - Async operations with loading/error handling
- **useFormData** - Form state management
- **useTableFilter** - Table filtering logic
- **usePagination** - Pagination logic

All hooks are fully typed and ready to use across any page!

---

## 🔧 Hook Details & Usage Examples

### 1. **useAsync Hook**

Handles async operations (API calls) with automatic loading and error states.

#### API
```typescript
const {
    data,           // The loaded data
    loading,        // Is operation in progress?
    error,          // Error message if failed
    execute,        // Execute async function
    setData,        // Set data manually
    clearError,     // Clear error state
    reset           // Reset to initial state
} = useAsync<T>(initialData?)
```

#### Example Usage
```typescript
const { data: users, loading, error, execute } = useAsync<User[]>([]);

// Execute an async operation
const loadUsers = async () => {
    const result = await execute(async () => {
        return await usersService.getAllUsers();
    });
    
    if (result.success) {
        console.log('Users loaded:', result.data);
    }
};

useEffect(() => {
    loadUsers();
}, []);

// In JSX
if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
return <UsersList users={data} />;
```

#### Real-World Case
```typescript
// Before: Manual state management
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// After: One hook!
const { data: users, loading, error, execute } = useAsync<User[]>([]);
```

---

### 2. **useFormData Hook**

Generic form state management that works with any form structure.

#### API
```typescript
const {
    formData,       // Current form values
    setFormData,    // Replace entire form
    updateField,    // Update single field
    updateFields,   // Update multiple fields
    reset,          // Reset to initial state
    getField,       // Get specific field value
    hasField,       // Check if field has value
    isDirty         // Has form changed?
} = useFormData<FormType>(initialData)
```

#### Example Usage
```typescript
interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
}

const initialForm: LoginForm = {
    email: '',
    password: '',
    rememberMe: false
};

const {
    formData,
    updateField,
    reset,
    isDirty
} = useFormData(initialForm);

// Update field
<input
    value={formData.email}
    onChange={(e) => updateField('email', e.target.value)}
/>

// Check if changed
<button disabled={!isDirty()}>Save Changes</button>

// Reset form
<button onClick={reset}>Clear</button>
```

#### Real-World Case
```typescript
// Instead of:
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [rememberMe, setRememberMe] = useState(false);

// Use:
const { formData, updateField } = useFormData({
    email: '',
    password: '',
    rememberMe: false
});
```

---

### 3. **useTableFilter Hook**

Generic filtering for any list of items with search and custom filters.

#### API
```typescript
const {
    filters,           // Current filter values
    filteredItems,     // Filtered items array
    setFilter,         // Set single filter
    setSearchText,     // Set search text
    setFilters,        // Set multiple filters
    resetFilters,      // Reset all filters
    hasActiveFilters,  // Are filters active?
    itemCount          // Count of filtered items
} = useTableFilter<ItemType>(items, filterFn?, defaultFilters?)
```

#### Example Usage
```typescript
interface Robot {
    vin: string;
    name: string;
    site: string;
    active: boolean;
}

const robots: Robot[] = [...];

// Define filter function
const filterRobots = (robot: Robot, filters: FilterConfig<Robot>) => {
    // Search text filter
    const matchText = (
        robot.vin.includes(filters.searchText) ||
        robot.name.includes(filters.searchText) ||
        robot.site.includes(filters.searchText)
    );

    // Status filter
    let matchStatus = true;
    if (filters.status === 'active') matchStatus = robot.active;
    if (filters.status === 'inactive') matchStatus = !robot.active;

    return matchText && matchStatus;
};

const {
    filteredItems,
    filters,
    setSearchText,
    setFilter,
    resetFilters
} = useTableFilter(robots, filterRobots, { status: 'all' });

// Use in JSX
<input
    onChange={(e) => setSearchText(e.target.value)}
    placeholder="Search..."
/>

<select onChange={(e) => setFilter('status', e.target.value)}>
    <option value="all">All</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
</select>

{filteredItems.map(robot => <RobotRow key={robot.vin} robot={robot} />)}
```

#### Real-World Case
```typescript
// Before: Manual filter state
const [searchText, setSearchText] = useState('');
const [filterActive, setFilterActive] = useState('all');
const filteredRobots = robots.filter(r => {
    // ... complex filter logic
});

// After: One hook with logic
const { filteredItems: filteredRobots, setSearchText, setFilter } =
    useTableFilter(robots, filterFn, { status: 'all' });
```

---

### 4. **usePagination Hook**

Pagination for any list with page navigation and info.

#### API
```typescript
const {
    paginatedItems,    // Items for current page
    currentPage,       // Current page number
    totalPages,        // Total pages available
    pageInfo,          // { startIndex, endIndex, totalItems, etc }
    goToPage,          // Go to specific page
    nextPage,          // Go to next page
    prevPage,          // Go to previous page
    canGoNext,         // Can go next?
    canGoPrev,         // Can go previous?
    reset              // Reset to page 1
} = usePagination<ItemType>(items, pageSize?)
```

#### Example Usage
```typescript
const users: User[] = [...]; // 150 users

const {
    paginatedItems,
    currentPage,
    totalPages,
    pageInfo,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev
} = usePagination(users, 10); // 10 items per page

// In JSX
<div>
    {paginatedItems.map(user => (
        <UserCard key={user.id} user={user} />
    ))}
</div>

<div className="pagination">
    <button onClick={prevPage} disabled={!canGoPrev()}>
        Previous
    </button>
    
    <span>
        Page {pageInfo.currentPage} of {pageInfo.totalPages}
    </span>
    
    <button onClick={nextPage} disabled={!canGoNext()}>
        Next
    </button>
</div>

<p>
    Showing {pageInfo.startIndex}-{pageInfo.endIndex} of {pageInfo.totalItems}
</p>
```

---

## 🎯 Combined Usage Example

Using multiple hooks together for a complete table page:

```typescript
export const UserTablePage = () => {
    // Load users
    const { data: users, loading, error, execute: loadUsers } = 
        useAsync<User[]>([]);

    // Filter users
    const { filteredItems, setSearchText, setFilter } = 
        useTableFilter(users || [], filterUserFn);

    // Paginate users
    const { paginatedItems, currentPage, totalPages, nextPage, prevPage } = 
        usePagination(filteredItems, 10);

    // Load on mount
    useEffect(() => {
        loadUsers(async () => await usersService.getAllUsers());
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <SearchInput onChange={(e) => setSearchText(e.target.value)} />
            <UserTable users={paginatedItems} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onNext={nextPage}
                onPrev={prevPage}
            />
        </>
    );
};
```

---

## 💡 Benefits

| Benefit | Before | After |
|---------|--------|-------|
| **Lines of Code** | +50 lines per feature | -40% |
| **Reusability** | Copy-paste | Hook reuse |
| **Type Safety** | Generic <T> | Full typing |
| **Testing** | Hard to isolate | Test hook alone |
| **Maintainability** | Scattered logic | Centralized |

---

## 📝 Best Practices

1. **useAsync**: Use for all API calls and async operations
2. **useFormData**: Use for any form with 2+ fields
3. **useTableFilter**: Use for any filtered list
4. **usePagination**: Use for lists with 10+ items

---

## 🔗 Import in Any Page

```typescript
import { useAsync, useFormData, useTableFilter, usePagination } from '@/hooks';
```

These hooks are **production-ready** and can be used immediately in any page! 🚀
