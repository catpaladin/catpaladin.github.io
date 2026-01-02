+++
date = '2025-01-25T12:05:27-08:00'
draft = false
title = 'Building a REST API with Go'
tags = ["go", "api", "rest", "jwt"]
featured_image = "/images/gophers/go-work.svg"
+++

Have you ever wondered how modern web applications handle user authentication and data securely? In
this guide, we'll explore building a secure REST API from the ground up using Go. Whether you're new
to Go or an experienced developer, you'll learn how to create an API that handles user
authentication.

For those who need to see the whole code before diving in, you can find all of this on
[Github](https://github.com/catpaladin/go-api-example)

## Technology Stack Overview

Our API implementation uses three main technologies:

- **Go**: A programming language designed for building efficient, secure network services with
  built-in concurrency support (My language of choice).
- **Gin**: A high-performance web framework for Go that provides excellent routing capabilities and
  middleware support.
- **SQLite**: A lightweight database that's ideal for development and applications with moderate
  traffic requirements.

## Understanding Our Project Structure

The project uses a standard Go application layout that separates concerns for maintainability:

```
myapp/
|-- main.go
|-- db/
|   |-- connection.go
|   |-- user.go
|-- handlers/
|   |-- auth.go
|   |-- signup.go
|   |-- login.go
|   |-- user.go
|-- internal/
|   |-- jwt/
|   |   |-- token.go
|   |   |-- middleware.go
|-- models/
|   |-- user.go
|   |-- errors.go
```

I like to separate domain specific logic. That way when another engineer starts exploring the
repository, they have some general idea where logic exists.

`db` -> database logic

`handlers` -> api handlers

`internal` -> contains repository specific packages (this is idiomatic Go)

`models` -> contains my data models

{{<admonition title="📝 NOTE" bg-color="#283593">}} I have opted to build out my models rather than
use something like an ORM because this is a simple example. You can use something like
[ent](https://github.com/ent/ent) for bigger and more complex projects. {{</admonition>}}

## Setting Up Your Development Environment

First, let's gather our ingredients (dependencies). Open your terminal and run:

```bash
# Create a new Go project
go mod init myapp

# Install our essential tools
go get github.com/gin-gonic/gin         # Our web framework
go get github.com/mattn/go-sqlite3      # Database driver
go get github.com/golang-jwt/jwt/v4     # For secure user tokens
```

## Define the Model

Create the `models` directory.

```
mkdir -p models
```

Next we will start creating go files under `models`. The user model will be defined in the
`models/user.go`.

### `models/user.go`

```go
package models

import (
	"encoding/json"
	"time"
)

type User struct {
	ID        int64     `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Password  string    `json:"-" db:"password"` // The "-" tag prevents password from being included in JSON
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// NewUser creates a new user with the current timestamp
func NewUser(username, password string) *User {
	now := time.Now()
	return &User{
		Username:  username,
		Password:  password,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// ValidateForCreation performs basic validation for user creation
func (u *User) ValidateForCreation() error {
	if len(u.Username) < 3 {
		return ErrUsernameTooShort
	}
	if len(u.Password) < 8 {
		return ErrPasswordTooWeak
	}
	return nil
}

// BeforeCreate is called before inserting the user into the database
func (u *User) BeforeCreate() {
	now := time.Now()
	u.CreatedAt = now
	u.UpdatedAt = now
}

// BeforeUpdate is called before updating the user in the database
func (u *User) BeforeUpdate() {
	u.UpdatedAt = time.Now()
}

// MarshalJSON implements custom JSON marshaling
func (u *User) MarshalJSON() ([]byte, error) {
	type Alias User // Prevents recursive MarshalJSON calls
	return json.Marshal(&struct {
		*Alias
		Password string `json:"-"` // Explicitly exclude password
	}{
		Alias: (*Alias)(u),
	})
}
```

If you have an IDE or your language server complaining right now, fear not. We will be defining the
missing error variables.

Define the errors in the `models/errors.go`

### `models/errors.go`

```go
package models

import "errors"

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrUsernameTooShort   = errors.New("username must be at least 3 characters")
	ErrPasswordTooWeak    = errors.New("password must be at least 8 characters")
	ErrUsernameExists     = errors.New("username already exists")
	ErrInvalidCredentials = errors.New("invalid credentials")
)

// ValidationError represents a domain validation error
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Field + ": " + e.Message
}

// NewValidationError creates a new validation error
func NewValidationError(field, message string) *ValidationError {
	return &ValidationError{
		Field:   field,
		Message: message,
	}
}
```

The models package provides several important features:

1. **Structured Data**: The User struct defines the shape of our user data with proper JSON and
   database tags.
2. **Data Validation**: The ValidateForCreation method ensures data integrity before database
   operations.
3. **Lifecycle Hooks**: BeforeCreate and BeforeUpdate methods handle timestamp management
   automatically.
4. **Security**: The Password field is explicitly excluded from JSON serialization using the "-"
   tag.
5. **Domain Errors**: Custom error types help with precise error handling throughout the
   application.

## Creating the Database

Next create the `db` directory. We will put all the database domain logic here.

```
mkdir -p db
```

Starting with the `db/connection.go`, let's create our functions to create the database and table.

### `db/connection.go`

```go
package db

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() error {
	var err error
	DB, err = sql.Open("sqlite3", "./myapp.db")
	if err != nil {
		return fmt.Errorf("database connection failed: %v", err)
	}

	if err := createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %v", err)
	}

	return nil
}

func createTables() error {
    query := `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
    );`

    _, err := DB.Exec(query)
    return err
}

func CloseDB() error {
	return DB.Close()
}
```

{{<admonition title="📝 NOTE" bg-color="#283593">}} This expects that you have sqlite3 on your
machine. {{</admonition>}}

## Define Database Operations

Now define the database operations to be used by the handlers. These will be in `db/user.go`.

### `db/user.go`

```go
package db

import (
	"database/sql"
	"strings"

	"myapp/models"
)

type UserStore struct {
	db *sql.DB
}

func NewUserStore(db *sql.DB) *UserStore {
	return &UserStore{db: db}
}

func (s *UserStore) CreateUser(username, hashedPassword string) error {
	user := models.NewUser(username, hashedPassword)

	if err := user.ValidateForCreation(); err != nil {
		return err
	}

	user.BeforeCreate()

	query := `INSERT INTO users (username, password, created_at, updated_at)
              VALUES (?, ?, ?, ?)`

	result, err := s.db.Exec(query,
		user.Username,
		user.Password,
		user.CreatedAt,
		user.UpdatedAt,
	)
	if err != nil {
		// Check for unique constraint violation
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return models.ErrUsernameExists
		}
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	user.ID = id
	return nil
}

func (s *UserStore) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	query := "SELECT id, username, password FROM users WHERE username = ?"
	err := s.db.QueryRow(query, username).Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
```

## JWT Token

The `jwt` internal package will contain all our jwt auth logic. Create the directory structure.

```
mkdir -p internal/jwt
```

The following is just quick and dirty logic for implementing it. Create the `internal/jwt/token.go`
with the following contents.

### `internal/jwt/token.go`

```go
package jwt

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var JwtKey = []byte("your-secret-key") // In production, use environment variables

type Claims struct {
	Username string `json:"username"`
	jwt.StandardClaims
}

func GenerateToken(username string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtKey)
}

func ValidateToken(tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return JwtKey, nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
```

## JWT Middleware

Now to add some Gin middleware for our auth. Create the `internal/jwt/middleware.go` with this
function.

### `internal/jwt/middleware.go`

```go
package jwt

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		claims, err := ValidateToken(tokenParts[1])
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("username", claims.Username)
		c.Next()
	}
}
```

## Create the handlers for the API

Start by defining a struct to pass a db pointer (and future inputs) to the handlers. Create the
`handlers` directory.

```
mkdir -p handlers
```

And start by creating `handlers/auth.go` with the following. `auth.go` will be used for the signup
and login methods. Technically we could just put all this domain logic in a single go file. But as
the application grows, you will start to notice that finding specific logic could start getting
scattered and inconsistent.

### `handlers/auth.go`

```go
package handlers

import (
	"myapp/db"
)

type AuthHandler struct {
	userStore *db.UserStore
}

func NewAuthHandler(userStore *db.UserStore) *AuthHandler {
	return &AuthHandler{userStore: userStore}
}
```

In the `handlers/signup.go` we add our signup logic.

### `handlers/signup.go`

```go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"myapp/models"
)

func (h *AuthHandler) Signup(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(user.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	if err := h.userStore.CreateUser(user.Username, string(hashedPassword)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.Status(http.StatusCreated)
}
```

Now under `handlers/login.go` add the login function.

### `handlers/login.go`

```go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"myapp/internal/jwt"
	"myapp/models"
)

func (h *AuthHandler) Login(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	storedUser, err := h.userStore.GetUserByUsername(user.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(storedUser.Password),
		[]byte(user.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := jwt.GenerateToken(user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}
```

Finally all the user logic under `handlers/user.go`. This contains the protected api logic for
users.

### `handlers/user.go`

```go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"myapp/db"
	"myapp/models"
)

type UserHandler struct {
	userStore *db.UserStore
}

func NewUserHandler(userStore *db.UserStore) *UserHandler {
	return &UserHandler{userStore: userStore}
}

func (h *UserHandler) GetUser(c *gin.Context) {
	// Get username from the JWT claims that were set in the middleware
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context not found"})
		return
	}

	// Fetch user details from the database
	user, err := h.userStore.GetUserByUsername(username.(string))
	if err != nil {
		if err == models.ErrUserNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
		return
	}

	// Return user data (password will be automatically excluded by json:"-" tag)
	c.JSON(http.StatusOK, user)
}
```

## Core Application Setup

The `main.go` file initializes the server and configures routing. It separates public and
authenticated routes.

### `main.go`

```go
package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"myapp/db"
	"myapp/handlers"
	"myapp/internal/jwt"
)

func main() {
	if err := db.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.CloseDB()

	userStore := db.NewUserStore(db.DB)
	authHandler := handlers.NewAuthHandler(userStore)

	r := gin.Default()

	// Public routes
	r.POST("/login", authHandler.Login)
	r.POST("/signup", authHandler.Signup)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userStore)

	// Protected routes
	authorized := r.Group("/")
	authorized.Use(jwt.AuthMiddleware())
	{
		authorized.GET("/user", userHandler.GetUser)
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```

## Running Your API

Simply tidy things up and run with

```
go mod tidy
go run main.go
```

## Testing Your API

Now that everything's set up, you can test your API using curl or any API testing tool:

1. Create a new user:

```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepass123"}'
```

2. Log in to get a token:

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepass123"}'
```

3. Use the token to access protected routes:

```bash
curl http://localhost:8080/user \
  -H "Authorization: Bearer <your-token-here>"
```

## Summary

Throughout this tutorial, we've followed several security best practices:

1. Password hashing using bcrypt
2. JWT-based authentication
3. Protected routes with middleware
4. No sensitive data exposure
5. Proper error handling without revealing system details
6. Input validation and sanitization

These are just some basics. A lot more can be done (e.g. Add password complexity requirements, rate
limiting, better logging, etc). In addition, there's the whole containerization and deployment to
consider.

{{<admonition title="📝 NOTE" bg-color="#283593">}} Here are some further considerations. Remember
that this is a development example. Remember to enable TLS, rotate passwords, and properly handle
JWT secrets. Also consider creating roles to create some RBAC to the API. {{</admonition>}}

Again, you can find all this code on [Github](https://github.com/catpaladin/go-api-example).

Thanks for reading. Happy coding! 🚀
