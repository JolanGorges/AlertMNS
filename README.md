# AlertMNS

Welcome to the README for AlertMNS! This repository contains a Svelte project.

## Installation

To install and run this Svelte project locally, please follow these steps:

1. **Clone the Repository:**

```bash
    git clone https://github.com/JolanGorges/AlertMNS
```

2. **Navigate to the Project Directory:**

```bash
    cd AlertMNS
```

3. **Create a `.env` file:**

- Duplicate the `.env.example` file:
  ```
  cp .env.example .env
  ```
- Update the values in the `.env` file according to your environment and requirements.

4. **Install Dependencies:**

```bash
    pnpm i
```

5. **Prisma Setup:**

```bash
    pnpm prisma db push && pnpm prisma db seed
```

6. **Run the Development Server:**

```bash
    pnpm dev --open
```

## Additional Notes

- You may customize the project configuration and settings in the `svelte.config.js` file and other relevant configuration files.
- For production builds, you can run:

```bash
    pnpm build
```

This command will create an optimized version of your application in the `public/build` directory.
