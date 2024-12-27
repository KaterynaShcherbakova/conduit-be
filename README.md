# Conduit App (Medium Clone)

The backend of the Medium Clone application is built using **NestJS** and **PostgreSQL**, designed to provide a robust and scalable API for creating and managing a content publishing platform similar to Medium. It follows best practices in API development, ensuring security, maintainability, and performance.

## Project Features
- **User Authentication:** Implements secure user authentication using JWT (JSON Web Tokens) for stateless access control.
- **User Management:** Includes endpoints for user registration, login, and profile updates.
- **Article Management:** Allows users to create, read, update, and delete articles. Articles include rich-text content, tags, and metadata.
- **Tagging System:** Implements tagging for articles, allowing better categorization and discovery of content.
- **Data Validation:** Uses class-validator for request validation to ensure data integrity and prevent invalid inputs.
- **Database Integration:** Utilizes PostgreSQL as the primary database, managed with TypeORM for seamless object-relational mapping.

## Tech Stack:
- **NestJS:** A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript:** Ensures strong typing and maintainable code.
- **PostgreSQL:** A powerful, open-source relational database system.
- **TypeORM:** Handles database interactions with a declarative syntax and supports migrations for schema management.
- **Passport.js:** Manages authentication strategies, including JWT.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Database actions

```bash

# drop databse
$ npm run db:drop

# create new migration
$ npm run db:create src/common/migrations/MIGRATION_NAME

# run all migrations
$ npm run db:migrate
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docs Links:
- **NestJS**: https://nestjs.com/
- **Postgres:** https://www.postgresql.org/
