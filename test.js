import express from "express";
import {
  success,
  failure,
  asyncHandler,
  ApiError,
  globalErrorHandler,
  notFound,
  paginate,
  HttpStatus,
} from "./index.js";

const app = express();
const PORT = process.env.PORT || 3000;

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

app.get("/", (req, res) => {
  success(res, { uptime: process.uptime() }, "Server is running");
});

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    if (page < 1) {
      throw new ApiError("Invalid page number", 400);
    }
    success(res, users, "Users retrieved successfully");
  })
);

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = users.find((u) => u.id === parseInt(req.params.id));
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    success(res, user, "User retrieved successfully");
  })
);

app.get("/error", (req, res) => {
  failure(res, "Something went wrong", 500);
});

app.get("/validation-error", (req, res) => {
  failure(res, "Validation failed", 400, {
    name: "Name is required",
    email: "Invalid email format",
  });
});

app.get(
  "/paginate",
  asyncHandler(async (req, res) => {
    const allUsers = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }));
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const start = (page - 1) * limit;
    const paged = allUsers.slice(start, start + limit);
    const result = paginate({ page, limit, total: allUsers.length, data: paged });
    success(res, result, "Users paginated successfully");
  })
);

app.get("/status-demo", (req, res) => {
  success(res, { httpStatus: HttpStatus }, "All HTTP status codes");
});

app.get(
  "/crash",
  asyncHandler(async () => {
    throw new ApiError("Intentional crash", 500);
  })
);

app.use(globalErrorHandler);
app.use(notFound);

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Try these routes:`);
  console.log(`  GET /`);
  console.log(`  GET /users`);
  console.log(`  GET /users/1`);
  console.log(`  GET /users/999`);
  console.log(`  GET /error`);
  console.log(`  GET /validation-error`);
  console.log(`  GET /crash`);
});
