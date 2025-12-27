+++
date = '2025-02-07T15:30:00-08:00'
draft = false
title = 'Managing Development Environments with Dotfiles'
tags = ["dev", "dotfiles", "neovim"]
featured_image = "/images/gophers/go-magic.svg"
+++

Hello readers! Today I bring you a little blog around my development environment, using dotfiles and Neovim configurations.

Let me walk you through how I've structured my [dotfiles](https://github.com/catpaladin/dotfiles) for managing multiple environments while keeping everything clean and maintainable - and most importantly, version controlled.

## The Core Structure

First, let's look at how everything is organized:

```bash
./
├── alacritty-darwin/        # MacOS terminal config
│   └── .alacritty.yml
├── alacritty-linux/         # Linux terminal config
│   └── .alacritty.yml
├── backgrounds/             # Personal touch with retrowave
│   └── Pictures/
│       └── retrowave.jpg
├── nvim/                    # Neovim as a submodule
│   └── .config/
│       └── nvim/
├── tmux/                    # Terminal multiplexing
│   └── .tmux.conf
└── zsh/                     # Shell configuration
    ├── .zsh.d/
    │   ├── common_aliases.zsh
    │   ├── functions.zsh
    │   ├── paths.zsh
    │   └── prompt.zsh
    └── .zshrc
```

{{<admonition title="📝 NOTE" bg-color="#283593">}}
This directory structure is setup for `stow` (mentioned further below) to symlink configs.
{{</admonition>}}

## Neovim: The Development Environment

The Neovim configuration is simple - it's structured as a clean, modular setup:

```bash
./
├── init.lua                 # Entry point
├── lazy-lock.json          # Plugin version locking
├── lua/
│   ├── config/             # Core configuration
│   │   └── keymaps.lua     # Key bindings
│   └── plugins/            # Plugin configurations
       ├── codeium.lua      # AI completion
       ├── core.lua         # Essential plugins
       ├── lsp.lua          # Language server config
       └── telescope.lua    # Fuzzy finder setup
```

{{<admonition title="📝 NOTE" bg-color="#283593">}}
My actual config has more plugins. This tree is an example to show how I structure my Neovim config repo.
{{</admonition>}}

## Managing Multiple Environments with Submodules

Git submodules are one of those powerful features that, once mastered, completely change how you manage complex projects. Much like the satisfaction of mastering `git stash` (remember the first time you saved yourself from a messy branch switch?), understanding submodules opens up entirely new ways of structuring your repositories.

You can maintain separate Neovim configurations using submodules for work and personal use, even with private repositories. Here's how:

1. Create separate repositories for your configurations
2. Add them as submodules:

```bash
# Personal config (public)
git submodule add git@github.com:personal/nvim-config.git nvim-personal

# Work config (private)
git submodule add git@github.com:your-org/private-nvim-config.git nvim-work
```

You can maintain separate Neovim configurations by using Git submodules - your public dotfiles repo can reference a private Neovim config repository using SSH URLs (like `git@github.com:your-org/private-nvim-config.git`), and when users clone your dotfiles, only those with proper SSH authentication to the private repo (your-org) will be able to pull down that configuration.

This setup is perfect for keeping your work-specific Neovim configuration private while still maintaining a public dotfiles repository that others can learn from and use.

{{<admonition title="📌 IMPORTANT" bg-color="#01579B">}}
Do not version control your secrets or private keys in plaintext! (Even to a private repository!)
{{</admonition>}}

_The beauty of this approach is that it lets you share your dotfiles publicly while keeping sensitive configs completely separate._

## The Smart Setup Script

The `setup.sh` script in the dotfiles is the orchestrator of this whole system. Here is an example of mine:

```bash
#!/usr/bin/env bash
# This script requires you have stow installed

# make sure we have pulled in and updated any submodules
git submodule init
git submodule update

# OS-specific configuration
if [ $(uname) = 'Darwin' ]; then
  ALACRITTY=alacritty-darwin
else
  ALACRITTY=alacritty-linux
fi

# Base packages for all environments
base=(
    nvim
    tmux
    bash
    zsh
    $ALACRITTY
    backgrounds
    wezterm
)

# Our stow function
stowit() {
    usr=$1
    app=$2
    stow -v -R -t ${usr} ${app}
}

echo ""
echo "Stowing apps for user: ${whoami}"

# install apps available to local users and root
for app in ${base[@]}; do
    stowit "${HOME}" $app
done
```

_Here's the deal with `stow` and how it fits into our dotfiles management..._

Stow is the secret sauce in my setup script that handles all the symlinking of configuration files to their correct locations. Instead of manually creating symlinks or copying files around, my `setup.sh` script uses Stow to automatically create the necessary symlinks based on the directory structure.

When you look at my setup script, you'll see it's using the `stowit()` function that takes a target directory (like `$HOME`) and a package name (like `nvim` or `tmux`), then uses `stow -v -R -t` to recursively create all the required symlinks - this is what makes it so easy to handle OS-specific configurations like having separate Alacritty configs for Linux and MacOS while maintaining the same seamless installation process.

## Setting Up Multiple Environment Configurations

Seeing as I made a conditional to handle Alacritty, the same can be done with Neovim configs.

To maintain separate configurations:

1. First, adjust your setup script to detect the environment:

```bash
if [ -f ~/.work_machine ]; then
    NVIM_CONFIG="nvim-work"
else
    NVIM_CONFIG="nvim-personal"
fi
```

2. Modify the base array to use the correct config:

```bash
base=(
    $NVIM_CONFIG    # This will be either nvim-work or nvim-personal
    tmux
    bash
    zsh
    $ALACRITTY
    backgrounds
    wezterm
)
```

_When working with private repositories, always use SSH URLs in your .gitmodules file - it makes authentication much smoother._

### Getting Started

To set up this environment on a new machine:

```bash
# Clone with all submodules
git clone --recurse-submodules YOUR_REPO_URL
cd dotfiles

# Mark as work machine if needed
touch ~/.work_machine  # Only on work machines!

# Run the setup
./setup.sh
```

This approach gives you a clean separation between work and personal configurations while maintaining the flexibility to share common elements. The power of Git submodules combined with stow makes it seamless to manage multiple environments without sacrificing maintainability.

## Wrapping Up

Your dotfiles are more than just configurations - they're a reflection of how you work. By leveraging Git submodules for flexibility and stow for elegant symlink management, you create a development environment that feels like home on any machine. Whether you're keeping work configs private or sharing with the community, this setup grows with you while maintaining that consistent feel that makes terminal-based development such a joy.
