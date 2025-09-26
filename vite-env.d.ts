// Fix: To resolve the "Cannot redeclare block-scoped variable 'process'" error,
// the type definition for process.env.API_KEY is changed to augment the existing NodeJS.ProcessEnv interface.
// This avoids redeclaring the global 'process' variable while still providing the necessary type information
// for the application's use of environment variables.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
