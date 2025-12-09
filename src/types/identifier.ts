export interface Identifiable {
    id: string
}

/**
 * Represents a component version
 */
export interface Version extends Identifiable {

    // Major version
    major: number

    // Minor version
    minor: number

    // Patch version
    patch: number
}