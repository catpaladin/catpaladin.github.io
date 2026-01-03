+++
date = '2025-02-08T08:15:00-08:00'
draft = false
title = 'Building Beautiful CLIs with Huh'
tags = ["go", "commandline", "cli", "charmbracelet"]
featured_image = "/images/gophers/go-fish.svg"
+++

_Hey there, fellow Go enthusiasts! Today, I'm going to share something that completely changed my
CLI development game. Buckle up – we're diving deep into making CLIs that users will actually enjoy
using!_

## The CLI Development Evolution

You know how we all instinctively reach for [cobra](https://github.com/spf13/cobra) when building
command-line tools in Go? Well, here is the perfect companion that's transformed how I think about
CLI interactions: [huh](https://github.com/charmbracelet/huh) by Charmbracelet.

![huh](/images/gifs/huh-cat.gif 'huh')

_Here's the thing that got me excited:_ While `cobra` handles all the heavy lifting of command
structure and flags (and does it beautifully, I might add), `huh` brings something entirely
different to the table. It's all about creating those smooth, interactive forms and prompts that
make your CLIs feel professional and polished. Think of it as the difference between a bare-bones
terminal app and something that feels like it belongs in 2025.

## Getting Started with huh

First things first, let's get the package:

```go
go get github.com/charmbracelet/huh
```

_This is where the magic starts._ Here's the simplest way to get going with a basic input prompt:

```go
var name string

huh.NewInput().
    Title("What's your name?").
    Value(&name).
    Run() // Watch out - this is blocking!

fmt.Printf("Hey, %s!\n", name)
```

If you're already using `cobra`'s `StringVarP` for flags, you can create this sweet fallback system.
When a flag isn't provided, your CLI smoothly transitions to an interactive prompt. It's like having
the best of both worlds!

## The Real MVP: Select Prompts

_Okay, this is where things get really interesting._ Remember struggling with
[promptui](https://github.com/manifoldco/promptui) for selection menus? (I sure do, and let me tell
you, it wasn't pretty.) Check this out:

```go
huh.NewSelect[string]().
    Title("Pick a country.").
    Options(
        huh.NewOption("United States", "US"),
        huh.NewOption("Germany", "DE"),
        huh.NewOption("Brazil", "BR"),
        huh.NewOption("Canada", "CA"),
    ).
    Value(&country)
```

Not only is it clean and intuitive, but it comes with built-in navigation, filtering, and selection
handling. No more wrestling with keyboard events and terminal codes!

## Real-World Implementation: `net-tools` Deep Dive

Let me walk you through a real-world project where I put all this into practice. I built this
network troubleshooting toolkit called [net-tools](https://github.com/catpaladin/net-tools) that
combines everything we've talked about. It's my Swiss Army knife for network diagnostics, built with
Go.

### The Dig Command: Simple but Powerful

_Here's where validation really shines:_

```go
func interactiveDig() {
    form := huh.NewForm(
        huh.NewGroup(
            huh.NewInput().
                Title("Domain/Subdomain:").
                Prompt("? ").
                Validate(func(str string) error {
                    if !strings.Contains(str, ".") {
                        return errors.New("domains should have a '.' in them")
                    }
                    return nil
                }).
                Value(&domain),
        ),
    )
}
```

{{<admonition title="📝 NOTE" bg-color="#283593">}} That validation function isn't just error
checking - it's about guiding users to success. {{</admonition>}}

### The IP Command: Elegant Selection

_This is where select forms really shine:_

```go
func interactiveIP() {
    form := huh.NewForm(
        huh.NewGroup(
            huh.NewSelect[string]().
                Title("IP Type:").
                Options(
                    huh.NewOption("Both", "both"),
                    huh.NewOption("Private", "private"),
                    huh.NewOption("Public", "public"),
                ).
                Value(&ipType),
        ),
    )
}
```

#### Extra: Dynamic Selection Options

![you hardcoded..](/images/2025/02/20250207-meme1.png)

{{<admonition title="📝 NOTE" bg-color="#283593">}} This section is a little advanced and requires
some knowledge on generics. I thought I would share because I couldn't find much documentation
online about this. {{</admonition>}}

My example above is simple and hardcoded. Let's face it; not every situation can handle the options
being known and hardcoded. Let's make our forms more dynamic and reusable. I've developed a couple
of utility functions (outside this project) that have saved me countless hours when dealing with
dynamic select options.

```go
// NewSelectForm creates a new select form
func NewSelectForm[T comparable](options []huh.Option[T], title string) (T, error) {
    var output T

    form := huh.NewForm(
        huh.NewGroup(
            huh.NewSelect[T]().
                Title(title).
                Options(options...).
                Value(&output),
        ),
    )

    err := form.Run()
    if err != nil {
        return output, err
    }
    return output, nil
}

// GenerateGenericOptions generates options dynamically
func GenerateGenericOptions[T comparable](items []T) []huh.Option[T] {
    options := make([]huh.Option[T], len(items))
    for i, item := range items {
        options[i] = huh.Option[T]{
            Key:   fmt.Sprintf("%v", item),
            Value: item,
        }
    }
    return options
}
```

Let me break down why these functions are game-changers:

- **Type-Safe Generics**: The `[T comparable]` constraint ensures our functions work with any
  comparable type (This means you can use it with strings, ints, or even custom types!)
- **Simplified Form Creation**: Using the above, we can do the following:

```go
// Example usage with a slice of strings
protocols := []string{"HTTP", "HTTPS", "FTP", "SSH"}
options := GenerateGenericOptions(protocols)
selectedProtocol, err := NewSelectForm(options, "Select Protocol")
```

- **Dynamic Option Generation**: You can feed it any slice of comparable items. This will
  automatically generate the display keys and values (Remember, the Key is what users see, Value is
  what your code gets!).

### The Netcat Command: Advanced Form Handling

_Now this is where we really level up our game with multiple inputs and sophisticated validation:_

```go
func interactiveNetcat() {
    form := huh.NewForm(
        huh.NewGroup(
            huh.NewInput().
                Title("IP to check:").
                Prompt("? ").
                Validate(func(str string) error {
                    // autopass localhost - because hey, we all need a quick local test sometimes!
                    if str == "localhost" {
                        return nil
                    }

                    // Here's where the magic happens - we test both IPv4 and IPv6
                    parsedIP := net.ParseIP(str)
                    if parsedIP == nil {
                        // If it's not an IP, maybe it's a hostname?
                        _, err := net.LookupHost(str)
                        if err != nil {
                            return errors.New("not a valid IP address")
                        }
                    }
                    return nil
                }).
                Value(&host),
            // Now for the port validation - this is crucial!
            huh.NewInput().
                Title("Port to check:").
                Prompt("? ").
                Validate(func(str string) error {
                    portNum, err := strconv.Atoi(str)
                    if err != nil {
                        return errors.New("not a valid port")
                    }
                    // Always validate port ranges!
                    isValidPort := portNum > 0 && portNum <= 65535
                    if !isValidPort {
                        return errors.New("port provided is outside of valid port range")
                    }
                    return nil
                }).
                Value(&port),
        ),
    )
    err := form.Run()
    if err != nil {
        log.Fatal(err)
    }
}
```

Let's break down what makes this netcat implementation special:

1. **Form Structure**:
   - A single `NewGroup` contains two inputs - IP/hostname and port
   - _Grouping related inputs makes the UX more intuitive!_

2. **IP/Hostname Validation**:
   - Fast-tracks "localhost" for quick local testing
   - Handles both direct IP addresses and domain names
   - _Gotcha alert:_ Don't forget the DNS lookup for hostnames!

3. **Port Validation**:
   - Converts string input to numeric port
   - Validates against the full port range (1-65535)
   - _Fun fact:_ This prevents those "why isn't it working?" moments when someone tries port 0!

4. **Error Handling**:
   - Blocking `form.Run()` ensures valid input
   - Comprehensive error catching at the form level
   - The blocking nature means your subsequent code can trust the input!

## Taking It to the Next Level: Visual Polish ✨

Want to make your CLI even more professional? Meet
[lipgloss](https://github.com/charmbracelet/lipgloss) - think of it as CSS for your terminal apps.
It works seamlessly with `huh`!

Here's some suggestions on using `lipgloss`:

- Green for successful operations
- Red for errors and warnings
- Clear visual hierarchy for scan results

## Why This Matters

Remember: great CLIs aren't just about functionality - they're about creating an experience that
makes users actually want to use your tools. With `huh`, you're:

- Reducing user errors through validation
- Providing intuitive interfaces
- Making your tools more approachable
- Building professional-grade experiences

## Getting Started with Your Own Project

Ready to build something amazing? Here's your quick start guide:

1. Set up your project with `cobra` for command structure
2. Add `huh` for interactive elements
3. Consider `lipgloss` for styling
4. Check out [net-tools](https://github.com/catpaladin/net-tools) for implementation examples

Start simple with basic prompts, then gradually add validation and complexity as you get comfortable
with the library.

## Wrapping Up

The combination of `cobra` for structure and `huh` for interaction is powerful stuff. Whether you're
building developer tools, system utilities, or anything in between, these libraries give you the
building blocks for creating CLIs that users will love.

Remember: the best tools aren't just functional - they're a joy to use. Now go forth and build
something awesome!
