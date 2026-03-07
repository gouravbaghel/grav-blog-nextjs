export function hasPrismaErrorCode(
    error: unknown,
    code: string
): error is { code: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string" &&
        error.code === code
    );
}
