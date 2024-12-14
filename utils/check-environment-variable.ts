/**
 * Check if the environment variables are set
 * @param args - Environment variables to check
 * @throws Error if any of the environment variables is not set
 * @returns void
 */
export function checkEnvVariables(...args: string[]) {
    const missingVariables = args.filter(arg => process.env[arg] === undefined);
    if (missingVariables.length > 0) {
        throw new Error(`The following environment variables are not set yet: ${missingVariables.join(', ')}. Please set them in .env file or pipeline environments.`);
    }
};

/**
 * Parses a string to a boolean value.
 * @param enable - The string to parse.
 * @returns {boolean} - Returns true if the string is "true" or "TRUE", otherwise false.
 */
export function booleanParser(enable: string | undefined): boolean {
    return enable?.toLowerCase() === 'true' || false;
}

/**
 * Checks if the input is an array and not empty.
 * @param inputArray - The array to check.
 * @returns {boolean} - Returns true if the input is an array and not empty, otherwise false.
 */
export function isNotEmptyArray<T>(inputArray: T[] | undefined): boolean {
    return !!inputArray?.length;
}

/**
 * Validates a password to ensure it meets the requirements. Password must be at least 16 characters long, maximum 128 characters, and contain a mix of uppercase, lowercase, numbers and special characters.
 * @param password - The password to validate.
 * @returns {boolean} - Returns true if the password is valid, otherwise false.
 */
export function validatePassword(password: string): boolean {
    // Check length requirements (16-128 characters)
    if (password.length < 16 || password.length > 128) {
        return false;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check for numbers
    if (!/[0-9]/.test(password)) {
        return false;
    }

    // Check for special characters
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
    }

    return true;
}

/**
 * Validates a Valkey engine version.
 * @param engineVersion - The engine version to validate.
 * @returns {boolean} - Returns true if the engine version is supported, otherwise false.
 */
export function validateRedisEngineVersion(engineVersion: string): boolean {
    return ['7', '8'].includes(engineVersion);
}

/**
 * Validates a Redis engine.
 * Supported engines are valkey, redis, memcached.
 * @param engine - The engine to validate.
 * @returns {boolean} - Returns true if the engine is supported, otherwise false.
 */
export function validateRedisEngine(engine: string): boolean {
    return ['valkey', 'redis', 'memcached'].includes(engine);
}

/**
 * Gets the short environment name.
 * @param environment - The environment to get the short name ('development' | 'staging' | 'production' | 'feature').
 * @returns {string} - Returns the short environment name.
 * @throws {Error} - Throws error if environment is not supported.
 */
export function getShortEnvironmentName(environment: string): string {
    const envMap: Record<string, string> = {
        'development': 'dev',
        'staging': 'stg',
        'production': 'prd',
        'feature': 'futr'
    };

    if (!envMap[environment]) {
        throw new Error(`Unsupported environment: ${environment}`);
    }

    return envMap[environment];
}
