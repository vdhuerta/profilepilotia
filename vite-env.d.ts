// Fix: Removed reference to "vite/client" which was causing a "Cannot find type definition file" error.
// Added type definitions for `process.env.API_KEY` to support its usage in the application code,
// aligning with the project's environment variable strategy.
declare var process: {
  env: {
    API_KEY: string;
  };
};
