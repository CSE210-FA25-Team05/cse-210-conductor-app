# Backend

Fastify server.

## Install Dependencies

Run this command to ensure all the dependencies are installed for the backend.
```bash
npm install
```

## Set up Database
We use a Postgres database for our backend. The url to connect to the database is defined in the environment variable `DATABASE_URL` (see .env.example for required format).

### Set up Database

**Note - Before running this step, ensure that you have a database created in your postgres instance and that the environment variable is set correctly.**

The following command will run all migrations to build the desired schema in your database. Additionally, it will run a seed script in order to populate some dummy data in the database.
```bash
npm run prisma:rebuild
```

**Note - This will lead to loss of data. DO NOT run this in a production environment**

### Seed Database

If you need to seed the database, you can run the following command.
```bash
npm run prisma:seed
```

## Run the dev server

```bash
npm run dev
```

> Runs at **[http://localhost:3001](http://localhost:3001/)**

## API Documentation

We have OpenAI Swagger documentation available for our project which can be accesses at
**[http://localhost:3001/docs](http://localhost:3001/docs)**.