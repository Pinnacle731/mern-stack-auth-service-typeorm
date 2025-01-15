# migration command

- this both migration command run using git bash sell

- npm run migration:generate -- src/database/migrations/migration1 -d src/database/data-source.ts

- npm run migration:run -- -d src/database/data-source.ts

- npm run migration:revert -- -d src/database/data-source.ts

```javascript
//script (package.json)
 "migration:create": "typeorm-ts-node-commonjs migration:create",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert",
    "migration:generate": "typeorm-ts-node-commonjs migration:generate",
    "migration:run": "typeorm-ts-node-commonjs migration:run",
```

- our awsome service

- new added

# docker images command

- docker build -t my-auth-service:latest -f docker/production/Dockerfile .

- docker run -p 5503:5503 --name my-auth-service-container my-auth-service:latest

```javascript
console.log('NODE_ENV =>', process.env.NODE_ENV, 'PORT => ', process.env.PORT);

console.log('current Path', path.resolve(__dirname));

console.log(
  'folder ENV Path',
  path.resolve(__dirname, `../../.env.${process.env.NODE_ENV ?? 'dev'}`),
);

console.log('my host =>', process.env.DB_HOST);

// if any required then change the database/data-source
synchronize:true
 entities: ['src/database/entities/*.{ts,js}'], // Add all your entities here
  migrations: ['src/database/migrations/*.{ts,js}'],
```

```javascript
 let privateKey: string;

  if (!configEnv.privatekey) {
    const error = createHttpError(500, 'Private key not found');
    throw error;
  }

  try {
    privateKey = configEnv.privatekey;
  }
```
