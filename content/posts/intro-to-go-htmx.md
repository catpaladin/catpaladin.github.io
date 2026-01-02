+++
date = '2025-01-23T19:17:55-08:00'
draft = false
title = 'Introduction to Go and HTMX'
tags = ["go", "htmx"]
featured_image = "/images/gophers/go-space.svg"
+++

Hello readers. Welcome to my blog!

I was debating on if I would write out a full post for this initial one (to test, you know?).
Instead, I decided to go through my collection of notes and found a topic to post; Go &
[htmx](https://htmx.org/docs/#introduction).

However, if you'd like to learn more about me, check out my
[about](https://blog.mikesahari.com/about/) page.

## Introduction

When building modern web applications, we often seek solutions that combine the robustness of
server-side programming with the interactivity of client-side applications. Today, I'm excited to
share my experience working with Go and HTMX, a powerful combination that achieves exactly this
balance.

HTMX is a lightweight JavaScript library that allows you to access modern browser features directly
from HTML, without writing JavaScript. When paired with Go's excellent web capabilities, it creates
a streamlined development experience that's both powerful and maintainable.

## Project Setup

Let's start by creating a new Go project. First, initialize your Go module:

```bash
go mod init <project>
```

For our web server, we'll use Echo, a high-performance, minimalist Go web framework. While Go's
standard `net/http` package would work perfectly fine, Echo provides some nice quality-of-life
features that will make our development smoother. Install it using:

```bash
go get github.com/labstack/echo/v4
```

## Creating the Server

Create a `main.go` file in your project root. Here's our server implementation with detailed
explanations of each component:

```go
package main

import (
    "html/template"
    "io"
    "net/http"

    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
)

// TemplateRenderer is a custom html/template renderer for Echo framework
// This allows us to use Go's powerful templating system with Echo
type TemplateRenderer struct {
    templates *template.Template
}

// Render handles the execution of templates with the provided data
// This method is required to implement echo.Renderer interface
func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
    // Add global methods if data is a map
    // This makes route helpers available in templates
    if viewContext, isMap := data.(map[string]interface{}); isMap {
        viewContext["reverse"] = c.Echo().Reverse
    }

    return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
    // Create a new Echo instance
    e := echo.New()

    // Add essential middleware
    e.Pre(middleware.RemoveTrailingSlash())  // Handles URLs consistently with/without trailing slash
    e.Use(middleware.Logger())               // Logs HTTP requests
    e.Use(middleware.Recover())              // Recovers from panics

    // Set up template rendering
    renderer := &TemplateRenderer{
        templates: template.Must(template.ParseGlob("*.html")),
    }
    e.Renderer = renderer

    // Define routes
    e.GET("/", func(c echo.Context) error {
        return c.String(http.StatusOK, "Hello, World!\n")
    })

    e.GET("/hello", func(c echo.Context) error {
        res := map[string]interface{}{
            "Message": "This is a test",
        }
        return c.Render(http.StatusOK, "index", res)
    })

    // Start server on port 31000
    e.Logger.Fatal(e.Start(":31000"))
}
```

## Setting Up the Frontend

Create an `index.html` file in your project root. This template will handle our view layer:

```html
{{define "index"}}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello World</title>
    <!-- Include TailwindCSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Include HTMX for dynamic interactions -->
    <script
      src="https://unpkg.com/htmx.org@1.9.7"
      integrity="sha384-EAzY246d6BpbWR7sQ8+WEm40J8c3dHFsqC58IgPlh4kMbRRI6P6WA+LA/qGAyAu8"
      crossorigin="anonymous"
    ></script>
  </head>
  <body>
    <!-- Display the message passed from our Go handler -->
    <p>{{.Message}}</p>
  </body>
</html>
{{end}}
```

## Running the Application

To start your server, run:

```bash
go run main.go
```

You can now access your application:

- Visit `http://localhost:31000` to see the basic "Hello, World!" message
- Navigate to `http://localhost:31000/hello` to see the template-rendered message with HTMX
  capabilities

## Next Steps

This is just the beginning of what you can do with Go and HTMX. For a more complex implementation,
check out my chat application repository: [jenn-ai](https://github.com/So-Sahari/jenn-ai), which
demonstrates advanced features like real-time updates and dynamic content loading.

## Conclusion

The combination of Go and HTMX offers a powerful approach to building modern web applications. Go
provides the robust backend we need, while HTMX allows us to add dynamic features without the
complexity of a full JavaScript framework. This setup is particularly well-suited for applications
that need to be both interactive and maintainable.

I hope this guide helps you get started with your own Go and HTMX projects. Feel free to experiment
with the code and adapt it to your needs.

You can see a more advanced version of all of this with a Chat App I wrote:
[here](https://github.com/So-Sahari/jenn-ai)

That's all I had for this post. Thanks for reading.
