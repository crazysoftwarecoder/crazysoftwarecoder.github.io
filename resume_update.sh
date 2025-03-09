#!/bin/bash

# Script to update the resume submodule to the latest version

echo "Updating resume submodule..."
git submodule update --remote resume

# Check if there are changes to commit
if git diff --quiet resume; then
    echo "No changes to the resume submodule."
else
    echo "Changes detected in resume submodule. Committing..."
    git add resume
    git commit -m "Update resume submodule to latest version"
    echo "Submodule update committed successfully."
fi

echo "Resume submodule refresh complete!"