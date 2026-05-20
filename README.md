# express-error-shield

<p align="center">
  <img src="https://img.shields.io/npm/dw/express-error-shield" alt="npm weekly downloads" />
  <img src="https://img.shields.io/npm/dt/express-error-shield" alt="npm total downloads" />
  <img src="https://img.shields.io/npm/v/express-error-shield" alt="npm version" />
  <img src="https://img.shields.io/bundlephobia/min/express-error-shield" alt="bundle size" />
  <img src="https://img.shields.io/npm/l/express-error-shield" alt="license" />
</p>

A lightweight Express.js utility toolkit for handling async errors, standardized API responses, and global error middleware.

## Installation

```bash
npm install express-error-shield
```

## Usage

### Basic Response Helpers

```js
import { success, failure } from "express-error-shield";

app.get("/users", (req, res) => {
  const users = await getUsers();
  success(res, users);
});

app.get("/error", (req, res) => {
  failure(res, "Invalid token", 401);
});
```

### asyncHandler

Wrap async route handlers to automatically forward rejected promises to the Express error middleware.

```js
import { asyncHandler } from "express-error-shield";

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find();
    success(res, users);
  })
);
```

### ApiError

Throw structured HTTP errors that the global error handler will process.

```js
import { ApiError } from "express-error-shield";

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    success(res, user);
  })
);
```

### Global Error Middleware

Register the global error handler at the end of your middleware stack.

```js
import { globalErrorHandler } from "express-error-shield";

app.use(globalErrorHandler);
app.use(notFound);
```

## API

### `success(res, data, message?, status?)`

| Param   | Type      | Default     |
| ------- | --------- | ----------- |
| res     | Response  | required    |
| data    | any       | required    |
| message | string    | "Success"   |
| status  | number    | 200         |

### `failure(res, message?, status?, errors?)`

| Param   | Type      | Default              |
| ------- | --------- | -------------------- |
| res     | Response  | required             |
| message | string    | "Internal Server Error" |
| status  | number    | 500                  |
| errors  | any       | null                 |

### `asyncHandler(fn)`

Wraps an async route handler. Any rejected promise is forwarded to `next(err)`.

### `new ApiError(message, status?, errors?)`

| Param   | Type      | Default |
| ------- | --------- | ------- |
| message | string    | required |
| status  | number    | 500     |
| errors  | any       | null    |

### `globalErrorHandler(err, req, res, next)`

Express error middleware that returns consistent JSON:

```json
{
  "success": false,
  "message": "User not found",
  "errors": null
}
```

## Running Tests

```bash
node test.js
```

## License

### `notFound(req, res)`

Express middleware for unmatched routes. Returns a consistent 404 JSON response.

```js
import { notFound } from "express-error-shield";
app.use(notFound);
```

Response:

```json
{
  "success": false,
  "message": "Route not found: GET /unknown"
}
```

### `paginate({ page?, limit?, total, data })`

Wraps paginated data with pagination metadata. Safely clamped (`limit` max 100, `page` min 1).

| Param | Type   | Default |
|-------|--------|---------|
| page  | number | 1       |
| limit | number | 10      |
| total | number | required |
| data  | array  | required |

```js
import { paginate, success } from "express-error-shield";

app.get("/items", asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const items = await db.find().skip((page - 1) * limit).limit(limit);
  const total = await db.count();
  success(res, paginate({ page, limit, total, data: items }));
}));
```

Response shape:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### `HttpStatus`

Named constants for HTTP status codes. No more magic numbers.

```js
import { HttpStatus, ApiError } from "express-error-shield";

throw new ApiError("Not found", HttpStatus.NOT_FOUND);
// vs throw new ApiError("Not found", 404);
```

| Constant                 | Value |
|--------------------------|-------|
| `HttpStatus.OK`          | 200   |
| `HttpStatus.CREATED`     | 201   |
| `HttpStatus.BAD_REQUEST` | 400   |
| `HttpStatus.UNAUTHORIZED`| 401   |
| `HttpStatus.FORBIDDEN`   | 403   |
| `HttpStatus.NOT_FOUND`   | 404   |
| `HttpStatus.CONFLICT`    | 409   |
| `HttpStatus.UNPROCESSABLE_ENTITY` | 422 |
| `HttpStatus.TOO_MANY_REQUESTS`    | 429 |
| `HttpStatus.INTERNAL_SERVER_ERROR`| 500 |

See the source for the full list.

## Running Tests

```bash
node test.js
```

## License

MIT

## New in v1.1.0

- `HttpStatus` — named HTTP status code constants
- `notFound` — 404 middleware for unmatched routes
- `paginate` — pagination metadata wrapper
- Dev logging in `globalErrorHandler` when `NODE_ENV=development`
