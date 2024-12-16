#!/bin/bash

# deploy.sh

# Set environment variables
export MAU_KEY='lW8!Drzar!P^Fq!8'
export MAU_SECRET='LE&0XbeKvYa4%vqWPfvsCEf%%izy35HcXdgEUIClxluBx'

# Check if environment variables are set
if [ -z "$MAU_KEY" ] || [ -z "$MAU_SECRET" ]; then
    echo "Error: MAU_KEY and MAU_SECRET must be set"
    exit 1
fi

# Print status message
echo "Deploying with MAU..."
echo "MAU_KEY and MAU_SECRET are configured."

# Run deployment command
if command -v mau &> /dev/null; then
    mau deploy --wait-for-service-stability
    
    # Check if deployment was successful
    if [ $? -eq 0 ]; then
        echo "Deployment completed successfully!"
    else
        echo "Deployment failed!"
        exit 1
    fi
else
    echo "Error: 'mau' command not found. Please install MAU CLI first."
    exit 1
fi