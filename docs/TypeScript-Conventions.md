# TypeScript Conventions and Style Guide

This document establishes conventions for TypeScript usage in the codebase to ensure consistency, maintainability, and effective collaboration between engineers and LLMs.

## Table of Contents

1. [Type vs Interface](#type-vs-interface)
2. [Type Organization](#type-organization)
3. [Naming Conventions](#naming-conventions)
4. [Generic Type Parameters](#generic-type-parameters)
5. [React Component Types](#react-component-types)
6. [API and Data Models](#api-and-data-models)
7. [Redux Types](#redux-types)
8. [External Libraries](#external-libraries)
9. [Utility Functions](#utility-functions)
10. [Migration Patterns](#migration-patterns)
11. [Quick Reference](#quick-reference)

---

## Type vs Interface

### Use `interface` for:
- **React component props**
- **Data models and API responses**
- **Objects that may be extended or implemented**

```typescript
// ✅ Good: Component props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

// ✅ Good: API response
interface UserResponse {
  id: string
  name: string
  email: string
}

// ✅ Good: Extendable data model
interface BaseDevice {
  id: string
  name: string
}

interface Miner extends BaseDevice {
  hashRate: number
  temperature: number
}
```

### Use `type` for:
- **Union types**
- **Intersection types**
- **Mapped types and utility types**
- **Function types**
- **Primitive type aliases**

```typescript
// ✅ Good: Union type
type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance'

// ✅ Good: Intersection type
type AuthenticatedUser = User & { token: string; permissions: string[] }

// ✅ Good: Function type
type EventHandler = (event: Event) => void

// ✅ Good: Utility type
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
```

---

## Type Organization

### Directory Structure

```
src/
├── types/
│   ├── index.d.ts          # Global types, utilities, window extensions
│   ├── redux.d.ts          # Redux-specific types
│   ├── api.d.ts            # API request/response types (optional)
│   └── models.d.ts         # Shared domain models (optional)
├── Components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts  # Component-specific types (if complex)
│   │   └── index.ts
│   └── Dashboard/
│       ├── Dashboard.tsx    # Inline types if simple
│       └── index.ts
```

### Guidelines

1. **Shared/Global Types**: Place in `src/types/`
   - Common utilities (`Optional`, `RequiredFields`)
   - Global interfaces (`Window` extensions, environment variables)
   - Domain models used across multiple features (`Device`, `Site`, `User`)

2. **Component-Specific Types**: Colocate with the component
   - Simple props: define inline in the component file
   - Complex types: create a separate `.types.ts` file next to the component

3. **Feature-Specific Types**: Keep within the feature directory
   - If a type is only used within a feature (e.g., `Explorer`), keep it there

```typescript
// ✅ Good: Simple props inline
// src/Components/Button/Button.tsx
interface ButtonProps {
  label: string
  onClick: () => void
}

export const Button = ({ label, onClick }: ButtonProps) => { /* ... */ }

// ✅ Good: Complex types in separate file
// src/Components/Dashboard/Dashboard.types.ts
export interface DashboardConfig { /* ... */ }
export interface DashboardData { /* ... */ }
export type DashboardView = 'grid' | 'list' | 'compact'
```

---

## Naming Conventions

### Interfaces and Types

| Purpose | Convention | Example |
|---------|-----------|---------|
| Component props | Suffix with `Props` | `ButtonProps`, `DashboardProps` |
| API responses | Suffix with `Response` | `UserResponse`, `DeviceListResponse` |
| API requests | Suffix with `Request` | `CreateUserRequest`, `UpdateDeviceRequest` |
| Domain models | Descriptive noun | `Device`, `Site`, `User`, `Miner` |
| State shapes | Suffix with `State` | `ThemeState`, `AuthState` |
| Event handlers | Prefix with `on` or `handle` | `onSubmit`, `handleClick` |
| Type guards | Prefix with `is` | `isDevice`, `isError` |

```typescript
// ✅ Good examples
interface UserProfileProps {
  userId: string
  onUpdate: (user: User) => void
}

interface GetDevicesResponse {
  devices: Device[]
  total: number
  page: number
}

interface CreateSiteRequest {
  name: string
  location: string
  capacity: number
}

type DashboardView = 'overview' | 'detailed' | 'compact'

function isDevice(obj: unknown): obj is Device {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

### File Naming

- Type definition files: `*.types.ts` or `*.d.ts`
- Use PascalCase for type/interface names
- Use camelCase for file names containing multiple types: `dashboard.types.ts`

---

## Generic Type Parameters

### Single-Letter Generics (Allowed)

Use idiomatic single-letter type parameters for common generic patterns:

- **`T`** - Generic type (most common)
- **`K`** - Key type
- **`V`** - Value type

```typescript
// ✅ Good: Standard generic patterns
function identity<T>(value: T): T {
  return value
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // Implementation
}

type Dictionary<V> = Record<string, V>

interface ApiResponse<T> {
  data: T
  success: boolean
}
```

### Descriptive Names for Complex Generics

For complex scenarios or multiple type parameters, use descriptive names:

```typescript
// ✅ Good: Descriptive names for clarity
interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput
}

type AsyncResult<TData, TError = Error> = 
  | { success: true; data: TData }
  | { success: false; error: TError }

function mapApiResponse<TResponse, TModel>(
  response: TResponse,
  mapper: (data: TResponse) => TModel
): TModel {
  return mapper(response)
}
```

### Rule of Thumb

- **Single-letter (`T`, `K`, `V`)**: Use for simple, idiomatic generic patterns
- **Descriptive names**: Use when you have multiple type parameters or when clarity is needed

---

## React Component Types

### Component Props

Always use `interface` for component props:

```typescript
// ✅ Good: Interface for props
interface CardProps {
  title: string
  description?: string
  onClick?: () => void
  className?: string
}

export const Card = ({ title, description, onClick, className }: CardProps) => {
  // Implementation
}
```

### Extending HTML Element Attributes

For components that wrap native HTML elements, extend the appropriate HTML attributes interface to automatically inherit standard props:

```typescript
// ✅ Good: Button extending HTML button attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export const Button = ({ variant = 'primary', loading, ...props }: ButtonProps) => {
  // Automatically gets: type, disabled, aria-*, onClick, className, etc.
  return <button {...props} />
}

// ✅ Good: Link extending HTML anchor attributes
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  external?: boolean
}

export const Link = ({ external, ...props }: LinkProps) => {
  // Automatically gets: href, target, rel, aria-*, onClick, etc.
  return <a {...props} />
}

// ✅ Good: Input extending HTML input attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({ label, error, ...props }: InputProps) => {
  // Automatically gets: type, value, onChange, placeholder, disabled, etc.
  return (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  )
}
```

**Benefits:**
- Automatically inherits all standard HTML attributes
- Type-safe prop spreading with `{...props}`
- No need to manually type common props like `className`, `onClick`, `aria-*`
- Better IDE autocomplete for consumers

### Props with Children

Use React's built-in `PropsWithChildren` utility:

```typescript
import { PropsWithChildren } from 'react'

// ✅ Good: Using PropsWithChildren
interface ContainerProps {
  className?: string
  maxWidth?: number
}

export const Container = ({ 
  children, 
  className, 
  maxWidth 
}: PropsWithChildren<ContainerProps>) => {
  // Implementation
}

// Alternative: Explicit children prop
interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}
```

### Component Return Types

TypeScript infers component return types. Explicitly type only when necessary:

```typescript
// ✅ Good: Let TypeScript infer
export const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>
}

// ✅ Also good: Explicit when needed
export const ComplexComponent = ({ data }: ComplexProps): JSX.Element | null => {
  if (!data) return null
  return <div>{/* ... */}</div>
}
```

### Event Handlers

Use React's built-in event types:

```typescript
interface FormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}
```

---

## API and Data Models

### API Response Types

Use a consistent structure for API responses:

```typescript
// Base response wrapper
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Specific response types
interface GetDevicesResponse {
  devices: Device[]
  total: number
  page: number
  pageSize: number
}

interface CreateDeviceResponse {
  device: Device
  message: string
}

// Usage
async function fetchDevices(): Promise<ApiResponse<GetDevicesResponse>> {
  // Implementation
}
```

### API Request Types

Define request payloads with clear names:

```typescript
interface CreateDeviceRequest {
  name: string
  type: string
  siteId: string
  config?: DeviceConfig
}

interface UpdateDeviceRequest {
  id: string
  name?: string
  status?: DeviceStatus
  config?: Partial<DeviceConfig>
}

interface ListDevicesRequest {
  siteId?: string
  status?: DeviceStatus
  page?: number
  pageSize?: number
}
```

### Error Types

Define structured error types:

```typescript
interface ApiError {
  message: string
  code?: string | number
  details?: unknown
  timestamp?: string
}

interface ValidationError extends ApiError {
  fields: Record<string, string[]>
}
```

---

## Redux Types

### State Shape

Define the shape of each slice:

```typescript
// src/types/redux.d.ts
interface RootState {
  theme: ThemeState
  auth: AuthState
  devices: DevicesState
  // Add other slices
}

interface ThemeState {
  value: 'light' | 'dark'
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

interface DevicesState {
  items: Device[]
  selectedId: string | null
  loading: boolean
  error: string | null
}
```

### Actions

Use generic action types:

```typescript
interface BaseAction<TPayload = unknown> {
  type: string
  payload?: TPayload
}

// Specific action types
type SetThemeAction = BaseAction<'light' | 'dark'>
type SetUserAction = BaseAction<User>
type RemoveDeviceAction = BaseAction<{ deviceId: string }>
```

### Typed Hooks

Create typed versions of Redux hooks:

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './types/redux'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

---

## External Libraries

### Libraries with Built-in Types

Many modern libraries ship with TypeScript types. **Do not install `@types/*` packages** if the library already includes types:

✅ **Already include types** (no `@types` needed):
- `chart.js` v4+
- `styled-components` v6+
- `react-router-dom` v6+
- `jspdf` v3+
- `html2canvas`

```typescript
// ✅ Good: Types are built-in
import { Chart } from 'chart.js'
import styled from 'styled-components'
```

### Libraries Requiring @types

Install `@types/*` only when the library doesn't include types:

```bash
# Example: lodash-es doesn't ship with types
npm install -D @types/lodash-es
```

### Libraries Without Types

For libraries without official types, create ambient declarations:

```typescript
// src/types/external-lib.d.ts
declare module 'some-untyped-library' {
  export function doSomething(param: string): void
  export interface Config {
    option: boolean
  }
}
```

### Gradually Type External APIs

For complex external APIs, type incrementally:

```typescript
// Start minimal
interface PartialConfig {
  apiKey: string
  endpoint: string
  // Add more as needed
}

// Expand as you use more features
interface ExtendedConfig extends PartialConfig {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}
```

---

## Utility Functions

### Function Signatures

Always type function parameters and return values:

```typescript
// ✅ Good: Explicit types
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// ✅ Good: Generic utility
function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
    return result
  }, {} as Record<K, T[]>)
}
```

### Type Guards

Create type guards for runtime type checking:

```typescript
function isDevice(obj: unknown): obj is Device {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'status' in obj
  )
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  )
}

// Usage
if (isDevice(data)) {
  console.log(data.hashRate) // TypeScript knows data is Device
}
```

### Async Functions

Type async functions with `Promise<T>`:

```typescript
async function fetchDevices(siteId: string): Promise<Device[]> {
  const response = await fetch(`/api/sites/${siteId}/devices`)
  const data: GetDevicesResponse = await response.json()
  return data.devices
}

// With error handling
async function updateDevice(
  id: string,
  updates: Partial<Device>
): Promise<Device | null> {
  try {
    const response = await fetch(`/api/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return await response.json()
  } catch (error) {
    console.error('Update failed:', error)
    return null
  }
}
```

---

## Migration Patterns

### Migrating JavaScript Files

**Step 1**: Rename `.js` to `.ts` (or `.jsx` to `.tsx`)

**Step 2**: Add type annotations incrementally:

```typescript
// Before (JavaScript)
export function calculateHashRate(devices) {
  return devices.reduce((sum, device) => sum + device.hashRate, 0)
}

// After (TypeScript)
export function calculateHashRate(devices: Device[]): number {
  return devices.reduce((sum, device) => sum + device.hashRate, 0)
}
```

**Step 3**: Fix type errors one by one

**Step 4**: Enable stricter checks as the file matures

### Migrating React Components

```typescript
// Before (JavaScript)
export const Card = ({ title, description, onClick }) => {
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

// After (TypeScript)
interface CardProps {
  title: string
  description?: string
  onClick?: () => void
}

export const Card = ({ title, description, onClick }: CardProps) => {
  return (
    <div onClick={onClick}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}
```

### Dealing with `any`

Avoid `any` when possible. Use these alternatives:

```typescript
// ❌ Avoid
function processData(data: any) {
  return data.value
}

// ✅ Better: unknown with type guard
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return data.value
  }
  throw new Error('Invalid data')
}

// ✅ Best: Proper typing
interface DataWithValue {
  value: string
}

function processData(data: DataWithValue) {
  return data.value
}
```

### Handling Objects with Unknown Structure

For objects with unknown structure (like API responses or dynamic data), use `UnknownRecord`:

```typescript
// ✅ Good: Use UnknownRecord for objects with unknown structure
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

function processApiResponse(response: UnknownRecord) {
  const value = response['someKey']
  // TypeScript knows value is unknown, requiring type checking
}

// ✅ Good: Use UnknownRecord for Record types
const data: UnknownRecord = {}
data['key'] = 'value' // Safe - value is unknown

// ❌ Avoid: Using {} or any
function badExample(data: {}) {
  return data.value // Error: Property 'value' doesn't exist
}

function worseExample(data: any) {
  return data.value // No type safety at all
}
```

**Note**: `UnknownRecord` is defined as `Record<string, unknown>` and is available from `@/app/utils/deviceUtils/types`. It's exported in `src/types/index.d.ts` for convenience.

### Gradual Typing with JSDoc

For JavaScript files you can't migrate yet, use JSDoc with `// @ts-check`:

```javascript
// @ts-check

/**
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} name
 * @property {number} hashRate
 */

/**
 * @param {Device[]} devices
 * @returns {number}
 */
export function calculateHashRate(devices) {
  return devices.reduce((sum, device) => sum + device.hashRate, 0)
}
```

---

## Quick Reference

### Checklist for New TypeScript Files

- [ ] Use `interface` for props and data models
- [ ] Use `type` for unions, intersections, and utilities
- [ ] Name component props with `Props` suffix
- [ ] Name API responses with `Response` suffix
- [ ] Name API requests with `Request` suffix
- [ ] Use `T`, `K`, `V` for simple generics; descriptive names for complex ones
- [ ] Use `PropsWithChildren` for components with children
- [ ] Type all function parameters and return values
- [ ] Avoid `any` - use `unknown` with type guards instead
- [ ] Use `UnknownRecord` for objects with unknown structure (from `@/app/utils/deviceUtils/types`)
- [ ] Colocate component-specific types; share common types in `src/types/`
- [ ] Check if library has built-in types before installing `@types/*`

### Common Patterns

```typescript
// Component with props
interface MyComponentProps {
  title: string
  onAction: () => void
}

export const MyComponent = ({ title, onAction }: MyComponentProps) => {
  // Implementation
}

// API response
interface GetItemsResponse {
  items: Item[]
  total: number
}

// API request
interface CreateItemRequest {
  name: string
  type: string
}

// Generic utility
function wrap<T>(value: T): { data: T } {
  return { data: value }
}

// Type guard
function isError(value: unknown): value is Error {
  return value instanceof Error
}

// Union type
type Status = 'pending' | 'success' | 'error'

// UnknownRecord for objects with unknown structure
import type { UnknownRecord } from '@/app/utils/deviceUtils/types'

function processDynamicData(data: UnknownRecord) {
  const value = data['key'] // value is unknown, requires type checking
  return value
}

// Async function
async function fetchData(): Promise<Data[]> {
  // Implementation
}
```

---

## Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## Questions or Suggestions?

This is a living document. If you have suggestions for improvements or encounter patterns not covered here, please contribute to this guide.

