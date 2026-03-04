#!/bin/bash

# Setup script to initialize development environment

echo "Installing node modules..."
npm install

# Setup git hooks
if [ -d ".git" ]; then
  echo "Setting up git hooks..."
  cp -r .github/hooks/ .git/hooks/
fi

echo "Development environment setup complete."