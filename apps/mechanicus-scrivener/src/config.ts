export const getEnvVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`⚠️ The ${name} environment variable is required.`);
  }
  return value;
};

export const config = {
  OUTPUT_DIR: getEnvVariable('OUTPUT_DIR'),
  CACHE_FILE: getEnvVariable('CACHE_FILE'),
  RSS_FILE: getEnvVariable('RSS_FILE'),
  MACHINE_SPIRIT_API_KEY: getEnvVariable('MACHINE_SPIRIT_API_KEY'),
};
