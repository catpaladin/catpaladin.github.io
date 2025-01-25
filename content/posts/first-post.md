+++
date = '2025-01-23T19:17:55-08:00'
draft = false
title = 'First Post'
tags = ["go", "htmx"]
+++

Hello readers. Welcome to my blog!

I was debating on if I would write out a full post for this initial one (to test, you know?).
Instead, I decided to go through my collection of notes and found a topic to post; Go & [htmx](https://htmx.org/docs/#introduction).

First start your project
```
go mod init <project>
```

You can use whatever http package you desire (even the base one!). For this example, I will use echo.
```
go get github.com/labstack/echo/v4
```

Next create a `main.go` in the project. Setting up the contents,
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
type TemplateRenderer struct {
	templates *template.Template
}

// Render renders a template document
func (t *TemplateRenderer) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	// Add global methods if data is a map
	if viewContext, isMap := data.(map[string]interface{}); isMap {
		viewContext["reverse"] = c.Echo().Reverse
	}

	return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
	// Echo instance
	e := echo.New()

	// Middleware
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Render
	renderer := &TemplateRenderer{
		templates: template.Must(template.ParseGlob("*.html")),
	}
	e.Renderer = renderer

	// Route => handler
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!\n")
	})

	e.GET("/hello", func(c echo.Context) error {
		res := map[string]interface{}{
			"Message": "This is a test",
		}
		return c.Render(http.StatusOK, "index", res)
	})

	// Start server
	e.Logger.Fatal(e.Start(":31000"))
}
```

Next, create an `index.html` file and throw the following in there.
```html
{{define "index"}}
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello World</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@1.9.7"
          integrity="sha384-EAzY246d6BpbWR7sQ8+WEm40J8c3dHFsqC58IgPlh4kMbRRI6P6WA+LA/qGAyAu8"
          crossorigin="anonymous"></script>
    </head>
    <body>
      <p>{{.Message}}</p>
    </body>
</html>
{{end}}
```

Now when you run,
```
go run main.go
```

Now access [http://localhost:31000](http://localhost:31000), you should see the simple Hello World.

If you add `/hello`, you should see the GET request render the `Message` with htmx.

You can see a more advanced version of all of this with a Chat App I wrote: [here](https://github.com/So-Sahari/jenn-ai)

That's all I had for this post. Thanks for reading.
