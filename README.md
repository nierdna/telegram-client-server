# Telegram Client Application

A NestJS-based application for managing and interacting with Telegram clients through a RESTful API.

## Overview

This project provides a robust backend service for managing multiple Telegram client instances, handling messages, and automating interactions. It uses the Telegram API library along with NestJS framework to provide a scalable and maintainable solution.

## Features

- **Multiple Client Management**: Create and manage multiple Telegram client instances
- **Database Integration**: Store and retrieve client configurations and data using TypeORM
- **API Documentation**: Auto-generated Swagger documentation
- **Health Checks**: Endpoint to verify the application's health status
- **Client Authentication**: Session management for Telegram clients
- **Message Handling**: Services for sending, receiving, and processing messages
- **Group Management**: Functionality for interacting with Telegram groups
- **AI Reply Assistant**: Configuration for automated replies using AI

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Swagger/OpenAPI
- **Telegram Client**: Telegram library
- **Configuration**: Environment-based using NestJS Config

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL database
- Telegram API credentials

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/telegram-client-server.git
   cd telegram-client-server
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=telegram_client
   
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   ```

4. Run the application:
   ```
   # Development
   pnpm start:dev
   
   # Production
   pnpm build
   pnpm start:prod
   ```

## API Documentation

After starting the application, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Deployment

The repository includes a `deploy.sh` script for simplified deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 