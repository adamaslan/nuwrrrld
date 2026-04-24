# TypeScript Development Guidelines

A comprehensive set of coding standards and best practices for TypeScript development.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Object-Oriented Design](#object-oriented-design)
3. [Error Handling & Safety](#error-handling--safety)
4. [Immutability & Data Structures](#immutability--data-structures)
5. [Dependency Management](#dependency-management)
6. [Code Organization](#code-organization)
7. [Logging & Documentation](#logging--documentation)
8. [Collections & Resources](#collections--resources)
9. [Concurrency](#concurrency)
10. [Testing & Quality](#testing--quality)
11. [Reuse & Style](#reuse--style)
12. [Async & Promises](#async--promises)
13. [Type Safety](#type-safety)

---

## Core Principles

### 1. Law of Demeter

Only interact with immediate collaborators. Avoid chaining calls excessively.

```typescript
// Avoid
const theme = user.getAccount().getSettings().getPreferences().theme;

// Prefer
const theme = user.getThemePreference();
```

### 2. Single Responsibility Principle

Each class and function should have one clear purpose and one reason to change.

```typescript
// Avoid: Class doing too much
class UserManager {
  createUser(data: CreateUserDto): User { ... }
  sendWelcomeEmail(user: User): void { ... }
  generateReport(users: User[]): Report { ... }
}

// Prefer: Separate responsibilities
class UserRepository {
  create(data: CreateUserDto): User { ... }
}

class EmailService {
  sendWelcomeEmail(user: User): void { ... }
}

class UserReportGenerator {
  generate(users: User[]): Report { ... }
}
```

### 3. Early Returns (Guard Clauses)

Avoid deep nesting by using early returns to handle edge cases first.

```typescript
// Avoid
function process(data: Data | null): Result | null {
  if (data) {
    if (data.isValid) {
      if (data.hasItems) {
        // actual logic buried deep
        return result;
      }
    }
  }
  return null;
}

// Prefer
function process(data: Data | null): Result | null {
  if (!data) {
    return null;
  }
  
  if (!data.isValid) {
    throw new ValidationError('Invalid data');
  }
  
  if (!data.hasItems) {
    return null;
  }
  
  // actual logic at the top level
  return result;
}
```

### 4. Clean Code Principles

Write readable, concise, and easily understandable code. Prefer explicit over implicit.

```typescript
// Avoid
function calc(a: number, b: number, c: number): number {
  return a * Math.pow(1 + b, c);
}

// Prefer
function calculateCompoundAmount(
  principal: number,
  interestRate: number,
  periods: number
): number {
  return principal * Math.pow(1 + interestRate, periods);
}
```

### 5. Meaningful Names

Variables, functions, and classes should clearly convey their purpose.

```typescript
// Avoid
const d = getData();
const x = d[0];
const temp = process(x);

// Prefer
const userRecords = fetchUserRecords();
const primaryUser = userRecords[0];
const processedUser = enrichUserProfile(primaryUser);
```

---

## Object-Oriented Design

### 6. Object-Oriented Principles

Follow encapsulation, abstraction, polymorphism, and prefer composition over inheritance.

```typescript
// Composition over inheritance
interface Notifier {
  notify(message: string): void;
}

class EmailNotifier implements Notifier {
  notify(message: string): void {
    // send email
  }
}

class SMSNotifier implements Notifier {
  notify(message: string): void {
    // send SMS
  }
}

class NotificationService {
  constructor(private readonly notifiers: Notifier[]) {}

  notifyAll(message: string): void {
    this.notifiers.forEach(notifier => notifier.notify(message));
  }
}
```

### 7. Design Patterns

Implement suitable patterns (Factory, Strategy, Repository, etc.) for simplicity and clarity.

```typescript
// Strategy Pattern
interface PricingStrategy {
  calculatePrice(basePrice: number): number;
}

class RegularPricing implements PricingStrategy {
  calculatePrice(basePrice: number): number {
    return basePrice;
  }
}

class DiscountPricing implements PricingStrategy {
  constructor(private readonly discountPercent: number) {}

  calculatePrice(basePrice: number): number {
    return basePrice * (1 - this.discountPercent / 100);
  }
}

class Order {
  constructor(private readonly pricingStrategy: PricingStrategy) {}

  getTotal(basePrice: number): number {
    return this.pricingStrategy.calculatePrice(basePrice);
  }
}
```

### 8. Interfaces and Abstract Classes

Use interfaces for contracts and abstract classes for shared implementation.

```typescript
// Interface (structural typing)
interface Repository<T> {
  findById(id: string): T | null;
  save(entity: T): void;
  delete(id: string): void;
}

// Abstract Base Class
abstract class BaseRepository<T extends { id: string }> {
  protected items = new Map<string, T>();

  findById(id: string): T | null {
    return this.items.get(id) ?? null;
  }

  save(entity: T): void {
    this.items.set(entity.id, entity);
  }

  delete(id: string): void {
    this.items.delete(id);
  }

  abstract validate(entity: T): void;
}

class UserRepository extends BaseRepository<User> {
  validate(user: User): void {
    if (!user.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }
  }

  override save(user: User): void {
    this.validate(user);
    super.save(user);
  }
}
```

---

## Error Handling & Safety

### 9. Specific Exception Handling

Avoid catching generic errors. Handle specific error types.

```typescript
// Avoid
try {
  await process();
} catch (error) {
  // swallowing all errors
}

// Avoid
try {
  await process();
} catch (error) {
  console.error(error);
}

// Prefer
try {
  await process();
} catch (error) {
  if (error instanceof ValidationError) {
    logger.warn(`Validation failed: ${error.message}`);
    throw error;
  }
  
  if (error instanceof ConnectionError) {
    logger.error(`Connection failed: ${error.message}`);
    throw new ServiceUnavailableError(`Failed to connect: ${error.message}`, { cause: error });
  }
  
  if (error instanceof TimeoutError) {
    logger.error(`Operation timed out: ${error.message}`);
    throw error;
  }
  
  // Unexpected error
  throw error;
}
```

### 10. Custom Exception Hierarchy

Define domain-specific errors for clear error handling.

```typescript
class AppError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(
    public readonly resourceType: string,
    public readonly resourceId: string
  ) {
    super(
      `${resourceType} with id '${resourceId}' not found`,
      'NOT_FOUND'
    );
  }
}

class DuplicateError extends AppError {
  constructor(message: string) {
    super(message, 'DUPLICATE_ERROR');
  }
}
```

### 11. Null/Undefined Safety

Use strict null checks and guard against null/undefined values explicitly.

```typescript
// Enable in tsconfig.json: "strictNullChecks": true

function findUser(userId: string): User | null {
  // Find user, returns null if not found
  return null;
}

// Always check before use
const user = findUser(userId);
if (user === null) {
  throw new NotFoundError('User', userId);
}

// Or use early return
function getUserEmail(userId: string): string | null {
  const user = findUser(userId);
  if (user === null) {
    return null;
  }
  return user.email;
}

// Optional chaining for safe property access
const email = user?.profile?.email;

// Nullish coalescing for defaults
const displayName = user?.name ?? 'Anonymous';
```

---

## Immutability & Data Structures

### 12. Favor Immutability

Use readonly properties, const assertions, and immutable patterns.

```typescript
// Readonly interface
interface Money {
  readonly amount: number;
  readonly currency: string;
}

class MoneyImpl implements Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new MoneyImpl(this.amount + other.amount, this.currency);
  }
}

// Readonly arrays
function processItems(items: readonly string[]): string[] {
  // items.push('x'); // Error: Property 'push' does not exist on readonly array
  return items.map(item => item.toUpperCase());
}

// Const assertion for immutable objects
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} as const;

// config.timeout = 10000; // Error: Cannot assign to 'timeout' because it is a read-only property

// Record with readonly values
type Config = {
  readonly [K in string]: string | number;
};

// Immutable update patterns
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

function updateUserEmail(user: User, newEmail: string): User {
  return {
    ...user,
    email: newEmail,
  };
}
```

---

## Dependency Management

### 13. Dependency Injection

Pass dependencies explicitly rather than creating them internally.

```typescript
// Avoid: Hard-coded dependencies
class UserService {
  private repo = new UserRepository();
  private emailClient = new SMTPClient();

  async createUser(data: CreateUserRequest): Promise<User> {
    // ...
  }
}

// Prefer: Injected dependencies
interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

interface IEmailService {
  sendWelcome(user: User): Promise<void>;
}

class UserService {
  constructor(
    private readonly repo: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  async createUser(data: CreateUserRequest): Promise<User> {
    const user = User.fromRequest(data);
    await this.repo.save(user);
    await this.emailService.sendWelcome(user);
    return user;
  }
}

// Easy to test with mocks
describe('UserService', () => {
  it('creates user and sends welcome email', async () => {
    const mockRepo: IUserRepository = {
      save: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    
    const mockEmail: IEmailService = {
      sendWelcome: jest.fn(),
    };
    
    const service = new UserService(mockRepo, mockEmail);
    const request = { name: 'Alice', email: 'alice@example.com' };
    
    await service.createUser(request);
    
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(mockEmail.sendWelcome).toHaveBeenCalledTimes(1);
  });
});
```

---

## Code Organization

### 14. Code Decomposition

Break lengthy or complex functions into smaller, focused functions.

```typescript
// Avoid: Long function doing many things
async function processOrder(orderData: OrderData): Promise<Order> {
  // 100+ lines of validation, processing, saving, notifications...
}

// Prefer: Decomposed into focused functions
async function processOrder(orderData: OrderData): Promise<Order> {
  const validatedData = validateOrderData(orderData);
  const order = createOrderFromData(validatedData);
  const savedOrder = await saveOrder(order);
  await sendOrderConfirmation(savedOrder);
  return savedOrder;
}

function validateOrderData(data: OrderData): ValidatedOrderData {
  // Validate and sanitize order input data
  if (!data.items || data.items.length === 0) {
    throw new ValidationError('Order must contain at least one item');
  }
  return data as ValidatedOrderData;
}

function createOrderFromData(data: ValidatedOrderData): Order {
  // Create an Order entity from validated data
  return new Order(data);
}

async function saveOrder(order: Order): Promise<Order> {
  // Persist order to the database
  return await orderRepository.save(order);
}

async function sendOrderConfirmation(order: Order): Promise<void> {
  // Send confirmation email to customer
  await emailService.sendOrderConfirmation(order);
}
```

### 15. Avoid Magic Numbers

Use constants with descriptive names.

```typescript
// Avoid
if (retryCount > 3) {
  throw new MaxRetriesExceededError();
}

if (response.status === 429) {
  await sleep(60000);
}

// Prefer
const MAX_RETRY_ATTEMPTS = 3;
const RATE_LIMIT_STATUS_CODE = 429;
const RATE_LIMIT_BACKOFF_MS = 60_000; // underscore for readability

if (retryCount > MAX_RETRY_ATTEMPTS) {
  throw new MaxRetriesExceededError();
}

if (response.status === RATE_LIMIT_STATUS_CODE) {
  await sleep(RATE_LIMIT_BACKOFF_MS);
}

// Or use enums for related constants
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  RATE_LIMITED = 429,
  SERVER_ERROR = 500,
}

if (response.status === HttpStatus.RATE_LIMITED) {
  await sleep(RATE_LIMIT_BACKOFF_MS);
}
```

### 16. Eliminate Duplicate Code

Extract common logic into reusable functions or classes.

```typescript
// Avoid: Duplicated validation logic
function createUser(email: string): User {
  if (!email || !email.includes('@')) {
    throw new ValidationError('Invalid email');
  }
  // ...
}

function updateUserEmail(userId: string, email: string): User {
  if (!email || !email.includes('@')) {
    throw new ValidationError('Invalid email');
  }
  // ...
}

// Prefer: Extracted validation
function validateEmail(email: string): string {
  if (!email || !email.includes('@')) {
    throw new ValidationError('Invalid email');
  }
  return email.toLowerCase().trim();
}

function createUser(email: string): User {
  const validatedEmail = validateEmail(email);
  // ...
}

function updateUserEmail(userId: string, email: string): User {
  const validatedEmail = validateEmail(email);
  // ...
}

// Or use a validation library
import { z } from 'zod';

const emailSchema = z.string().email().toLowerCase().trim();

function createUser(email: string): User {
  const validatedEmail = emailSchema.parse(email);
  // ...
}
```

---

## Logging & Documentation

### 17. Proper Logging

Use a logging library like `winston`, `pino`, or `tslog`.

```typescript
import { Logger } from 'winston';

class OrderProcessor {
  constructor(private readonly logger: Logger) {}

  async process(order: Order): Promise<ProcessedOrder> {
    this.logger.info('Processing order', { orderId: order.id });
    
    try {
      const result = await this.doProcessing(order);
      this.logger.info('Order processed successfully', {
        orderId: order.id,
        total: result.total,
      });
      return result;
    } catch (error) {
      if (error instanceof PaymentError) {
        this.logger.warn('Payment failed for order', {
          orderId: order.id,
          error: error.message,
        });
        throw error;
      }
      
      this.logger.error('Unexpected error processing order', {
        orderId: order.id,
        error,
      });
      throw error;
    }
  }

  private async doProcessing(order: Order): Promise<ProcessedOrder> {
    // Processing logic
    return {} as ProcessedOrder;
  }
}
```

### 18. Comments

Code should be self-documenting. Use comments sparingly for complex logic only.

```typescript
// Avoid: Obvious comments
// Increment counter by 1
counter += 1;

// Get the user from the database
const user = await userRepo.findById(userId);

// Prefer: Comments for non-obvious logic
// Using binary search here because the list is sorted and can contain
// millions of items; linear search would be too slow
const index = binarySearch(sortedItems, target);

// The API returns dates in Unix timestamp format with milliseconds,
// but our domain expects seconds
const timestampSeconds = Math.floor(apiTimestamp / 1000);
```

### 19. JSDoc for All Public Functions and Methods

Use JSDoc comments consistently for public APIs.

```typescript
/**
 * Calculate compound interest for a given principal.
 * 
 * Uses the standard compound interest formula:
 * A = P(1 + r/n)^(nt)
 * 
 * @param principal - The initial investment amount. Must be positive.
 * @param rate - The annual interest rate as a decimal (e.g., 0.05 for 5%).
 * @param periods - The number of years.
 * @param compoundsPerPeriod - Number of times interest compounds per year. Defaults to 1 (annual).
 * @returns The final amount after compound interest, rounded to 2 decimal places.
 * @throws {ValidationError} If principal is negative or rate is negative.
 * 
 * @example
 * ```typescript
 * calculateCompoundInterest(1000, 0.05, 10); // Returns 1628.89
 * ```
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  periods: number,
  compoundsPerPeriod: number = 1
): number {
  if (principal < 0) {
    throw new ValidationError('Principal must be non-negative');
  }
  if (rate < 0) {
    throw new ValidationError('Rate must be non-negative');
  }
  
  const amount = principal * Math.pow(1 + rate / compoundsPerPeriod, compoundsPerPeriod * periods);
  return Math.round(amount * 100) / 100;
}
```

---

## Collections & Resources

### 20. Effective Use of Collections

Choose the appropriate collection type for the task.

```typescript
// Use Set for membership testing and uniqueness
const seenIds = new Set<string>();
if (seenIds.has(userId)) {
  throw new DuplicateError('User already processed');
}
seenIds.add(userId);

// Use Map for key-value mappings with better performance than objects
const userScores = new Map<string, number>();
userScores.set(userId, (userScores.get(userId) ?? 0) + points);

// Use Array methods for transformations
const activeUsers = users.filter(u => u.isActive);
const userNames = users.map(u => u.name);
const totalScore = scores.reduce((sum, score) => sum + score, 0);

// Use object for fixed-key mappings
interface Config {
  apiUrl: string;
  timeout: number;
  retries: number;
}

const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};

// Use tuple for fixed-size arrays
type Coordinate = [latitude: number, longitude: number];
const location: Coordinate = [37.7749, -122.4194];

// Use WeakMap/WeakSet for memory-sensitive caching
const cache = new WeakMap<object, CachedData>();
```

### 21. Resource Management

Use try-finally or async cleanup patterns to properly release resources.

```typescript
// File handling with try-finally
import { promises as fs } from 'fs';

async function readFile(path: string): Promise<string> {
  const handle = await fs.open(path, 'r');
  try {
    const content = await handle.readFile('utf-8');
    return content;
  } finally {
    await handle.close();
  }
}

// Database connections
async function queryDatabase<T>(query: string): Promise<T[]> {
  const connection = await pool.connect();
  try {
    const result = await connection.query<T>(query);
    return result.rows;
  } finally {
    connection.release();
  }
}

// HTTP clients
import axios from 'axios';

async function fetchData(url: string): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await axios.get<ApiResponse>(url, {
      signal: controller.signal,
    });
    return response.data;
  } finally {
    clearTimeout(timeout);
  }
}

// Custom resource management with Symbol.dispose (TC39 proposal)
class DatabaseConnection {
  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }

  async close(): Promise<void> {
    // Cleanup logic
  }
}

// Using the resource (when available)
{
  await using connection = new DatabaseConnection();
  // Use connection
} // Automatically disposed
```

---

## Concurrency

### 22. Asynchronous Programming

Use async/await for asynchronous operations. Handle concurrency carefully.

```typescript
// Basic async/await
async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}

// Parallel execution with Promise.all
async function fetchAllUsers(userIds: string[]): Promise<User[]> {
  const promises = userIds.map(id => fetchUser(id));
  return Promise.all(promises);
}

// Handle partial failures with Promise.allSettled
async function fetchUsersWithFailureHandling(
  userIds: string[]
): Promise<User[]> {
  const promises = userIds.map(id => fetchUser(id));
  const results = await Promise.allSettled(promises);
  
  const users: User[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      users.push(result.value);
    } else {
      logger.warn('Failed to fetch user', { error: result.reason });
    }
  }
  return users;
}

// Rate limiting with a semaphore
class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise<void>(resolve => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    const resolve = this.queue.shift();
    if (resolve) {
      this.permits--;
      resolve();
    }
  }
}

class RateLimiter {
  private semaphore: Semaphore;
  private periodMs: number;

  constructor(maxRequests: number, periodMs: number) {
    this.semaphore = new Semaphore(maxRequests);
    this.periodMs = periodMs;
  }

  async acquire(): Promise<void> {
    await this.semaphore.acquire();
    setTimeout(() => this.semaphore.release(), this.periodMs);
  }
}

// Mutex for critical sections
class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async lock(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    return new Promise<void>(resolve => {
      this.queue.push(resolve);
    });
  }

  unlock(): void {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift()!;
      resolve();
    } else {
      this.locked = false;
    }
  }

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await fn();
    } finally {
      this.unlock();
    }
  }
}

// Thread-safe cache
class Cache<K, V> {
  private data = new Map<K, V>();
  private mutex = new Mutex();

  async get(key: K): Promise<V | undefined> {
    return this.mutex.runExclusive(async () => {
      return this.data.get(key);
    });
  }

  async set(key: K, value: V): Promise<void> {
    await this.mutex.runExclusive(async () => {
      this.data.set(key, value);
    });
  }
}
```

---

## Testing & Quality

### 23. Unit Testing

Write comprehensive tests using `Jest`, `Vitest`, or similar frameworks.

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('UserService', () => {
  let mockRepo: jest.Mocked<IUserRepository>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let userService: UserService;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn(),
      findByEmail: jest.fn(),
    };

    mockEmailService = {
      sendWelcome: jest.fn(),
    };

    userService = new UserService(mockRepo, mockEmailService);
  });

  describe('createUser', () => {
    it('creates user with valid data', async () => {
      // Arrange
      const request: CreateUserRequest = {
        name: 'Alice',
        email: 'alice@example.com',
      };
      mockRepo.findByEmail.mockResolvedValue(null);

      // Act
      const user = await userService.createUser(request);

      // Assert
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendWelcome).toHaveBeenCalledWith(user);
    });

    it('throws error when email already exists', async () => {
      // Arrange
      const existingUser: User = {
        id: '1',
        name: 'Bob',
        email: 'alice@example.com',
      };
      mockRepo.findByEmail.mockResolvedValue(existingUser);
      
      const request: CreateUserRequest = {
        name: 'Alice',
        email: 'alice@example.com',
      };

      // Act & Assert
      await expect(userService.createUser(request))
        .rejects
        .toThrow(DuplicateEmailError);
      
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it.each([
      '',
      'not-an-email',
      '@missing-local.com',
      'missing-domain@',
    ])('throws validation error for invalid email: %s', async (invalidEmail) => {
      const request: CreateUserRequest = {
        name: 'Alice',
        email: invalidEmail,
      };

      await expect(userService.createUser(request))
        .rejects
        .toThrow(ValidationError);
    });
  });
});

// Integration tests
describe('UserController (integration)', () => {
  it('POST /users creates a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Alice',
      email: 'alice@example.com',
    });
    expect(response.body.id).toBeDefined();
  });
});
```

---

## Reuse & Style

### 24. Reuse Existing Libraries

Prefer well-maintained libraries over custom solutions.

```typescript
// HTTP requests: use axios or fetch
import axios from 'axios';

const response = await axios.get<User>(url);

// Data validation: use zod or yup
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// Retries: use p-retry
import pRetry from 'p-retry';

const result = await pRetry(
  async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  },
  {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    onFailedAttempt: (error) => {
      console.log(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
    },
  }
);

// Date handling: use date-fns or dayjs
import { addWeeks, format } from 'date-fns';

const now = new Date();
const nextWeek = addWeeks(now, 1);
const formatted = format(nextWeek, 'yyyy-MM-dd');

// Functional programming: use lodash or ramda
import { groupBy, sortBy } from 'lodash';

const usersByRole = groupBy(users, 'role');
const sortedUsers = sortBy(users, ['lastName', 'firstName']);
```

### 25. Consistent Formatting

Use ESLint and Prettier for code quality and formatting.

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/strict-boolean-expressions": "error"
  }
}

// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "avoid"
}

// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Async & Promises

### 26. Async/Await Best Practices

Use async/await for cleaner asynchronous code.

```typescript
// Express/Fastify route handler
import { Request, Response, NextFunction } from 'express';

interface UserParams {
  userId: string;
}

async function getUserHandler(
  req: Request<UserParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await userService.findById(req.params.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
}

// Parallel operations
async function getUserDashboard(userId: string): Promise<Dashboard> {
  const [user, orders, notifications] = await Promise.all([
    userService.findById(userId),
    orderService.findByUserId(userId),
    notificationService.findByUserId(userId),
  ]);

  return {
    user,
    orders,
    notifications,
  };
}

// Sequential operations when needed
async function processUserWorkflow(userId: string): Promise<void> {
  const user = await userService.findById(userId);
  const validated = await validationService.validate(user);
  const enriched = await enrichmentService.enrich(validated);
  await userService.update(enriched);
}

// Error handling with async/await
async function safeApiCall<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logger.error('API call failed', { url, error });
    return null;
  }
}
```

---

## Type Safety

### 27. Use Type Annotations Throughout

Leverage TypeScript's type system for safety and clarity.

```typescript
// Generic types
interface Result<T, E = Error> {
  readonly success: boolean;
  readonly value?: T;
  readonly error?: E;
}

class Ok<T> implements Result<T> {
  readonly success = true;
  
  constructor(readonly value: T) {}
}

class Err<E = Error> implements Result<never, E> {
  readonly success = false;
  
  constructor(readonly error: E) {}
}

function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

function err<E = Error>(error: E): Err<E> {
  return new Err(error);
}

// Function types
type ProcessorFn<T, R> = (item: T) => R;
type AsyncProcessorFn<T, R> = (item: T) => Promise<R>;
type PredicateFn<T> = (item: T) => boolean;

function processItems<T, R>(
  items: readonly T[],
  processor: ProcessorFn<T, R>,
  filter?: PredicateFn<T>
): R[] {
  const filteredItems = filter ? items.filter(filter) : items;
  return filteredItems.map(processor);
}

// Discriminated unions
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };

function handleResponse<T>(response: ApiResponse<T>): void {
  switch (response.status) {
    case 'success':
      console.log(response.data);
      break;
    case 'error':
      console.error(response.error);
      break;
    case 'loading':
      console.log('Loading...');
      break;
  }
}

// Utility types
type WithId<T> = T & { id: string };
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredKeys<T> = { [K in keyof T]-?: T[K] };

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

type CreateUserDto = Omit<User, 'id'>; // { name, email, phone? }
type UpdateUserDto = Partial<Omit<User, 'id'>>; // { name?, email?, phone? }

// Template literal types
type EventName = 'user.created' | 'user.updated' | 'user.deleted';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Route = `/${string}`;

// Branded types for type safety
type UserId = string & { readonly __brand: 'UserId' };
type Email = string & { readonly __brand: 'Email' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  if (!email.includes('@')) {
    throw new ValidationError('Invalid email');
  }
  return email as Email;
}

// This prevents mixing up different string types
function getUser(userId: UserId): User {
  // ...
  return {} as User;
}

const userId = createUserId('123');
const email = createEmail('user@example.com');
getUser(userId); // OK
// getUser(email); // Error: Type 'Email' is not assignable to type 'UserId'
```

---

## Quick Reference Checklist

- [ ] Single responsibility per function/class
- [ ] Early returns instead of deep nesting
- [ ] Meaningful, descriptive names
- [ ] Specific error handling with custom error classes
- [ ] Type annotations on all functions and complex variables
- [ ] JSDoc comments on all public APIs
- [ ] Immutable data structures (readonly, const)
- [ ] Dependencies injected, not created
- [ ] Proper resource cleanup (try-finally, await using)
- [ ] Async/await for I/O-bound operations
- [ ] Unit tests with good coverage
- [ ] ESLint + Prettier configured
- [ ] No magic numbers (use constants/enums)
- [ ] No duplicate code (DRY principle)
- [ ] Strict TypeScript settings enabled
- [ ] Use well-maintained libraries over custom solutions