import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { config } from "../config";

// ─── Error Response Shape ────────────────────────────────────────────────────
interface IErrorResponse {
    statusCode: number;
    success: false;
    errorName: string;
    errorMessage: string;
    errorDetails?: Record<string, unknown> | null;
    errorPath: string;
    errorMethod: string;
    errorStack: string | null;
    timestamp: string;
}

// ─── Meta Extraction Helpers (handles both standard Prisma & driver adapter) ──

/**
 * P2002 – Unique constraint:
 *  Standard Prisma : meta.target  → string[]  e.g. ["email"]
 *  Driver adapter  : meta.driverAdapterError.cause.constraint.fields → string[]
 *                  : meta.driverAdapterError.cause.constraint.index  → string  e.g. "users_email_key"
 */
const extractUniqueFields = (meta: Record<string, unknown> | undefined): string => {
    if (!meta) return "unknown";

    // Standard Prisma path
    if (Array.isArray(meta.target) && meta.target.length > 0) {
        return (meta.target as string[]).join(", ");
    }

    // Driver adapter path
    const cause = (meta.driverAdapterError as any)?.cause;
    if (cause) {
        // prefer explicit fields array
        if (Array.isArray(cause.constraint?.fields) && cause.constraint.fields.length > 0) {
            return (cause.constraint.fields as string[]).join(", ");
        }
        // fall back to index name (e.g. "users_email_key" → strip prefix → "email")
        if (typeof cause.constraint?.index === "string") {
            const indexName: string = cause.constraint.index;
            // attempt to extract the column name from the index name
            // common pattern: "<table>_<column>_key" → take second-to-last segment
            const parts = indexName.split("_");
            if (parts.length >= 3) {
                // drop first (table) and last ("key" / "idx") segment
                const fieldPart = parts.slice(1, -1).join("_");
                return fieldPart || indexName;
            }
            return indexName;
        }
        // last resort: use the originalMessage if available
        if (typeof cause.originalMessage === "string") {
            return cause.originalMessage;
        }
    }

    return "unknown";
};

/**
 * P2003 – Foreign key constraint:
 *  Standard Prisma : meta.field_name → string
 *  Driver adapter  : meta.driverAdapterError.cause.constraint.fields → string[]
 */
const extractForeignKeyField = (meta: Record<string, unknown> | undefined): string => {
    if (!meta) return "unknown";

    // Standard Prisma path
    if (typeof meta.field_name === "string" && meta.field_name) {
        return meta.field_name;
    }

    // Driver adapter path
    const cause = (meta.driverAdapterError as any)?.cause;
    if (cause) {
        if (Array.isArray(cause.constraint?.fields) && cause.constraint.fields.length > 0) {
            return (cause.constraint.fields as string[]).join(", ");
        }
        if (typeof cause.constraint?.index === "string") {
            return cause.constraint.index;
        }
        if (typeof cause.originalMessage === "string") {
            return cause.originalMessage;
        }
    }

    return "unknown";
};

// ─── Global Error Handler ────────────────────────────────────────────────────
export const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const isProduction = config.node_env === "production";

    let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string = err.message || "Something went wrong";
    let errorName: string = err.name || "InternalServerError";
    let errorDetails: Record<string, unknown> | null = null;

    // ── 1. Prisma Validation Error (missing/wrong fields) ──────────────────
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        errorName = "PrismaValidationError";
        errorMessage = "Invalid field type or missing required fields";

    // ── 2. Prisma Known Request Error (DB constraint violations, etc.) ──────
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        errorName = "PrismaKnownRequestError";

        switch (err.code) {
            case "P2000":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "Input value is too long for this field";
                break;
            case "P2001":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "Record does not exist";
                break;
            case "P2002":
                statusCode = httpStatus.CONFLICT;
                errorMessage = `Unique constraint violation on field(s): ${extractUniqueFields(err.meta as Record<string, unknown> | undefined)}`;
                errorDetails = { prismaCode: err.code, meta: err.meta };
                break;
            case "P2003":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Foreign key constraint failed on field: ${extractForeignKeyField(err.meta as Record<string, unknown> | undefined)}`;
                errorDetails = { prismaCode: err.code, meta: err.meta };
                break;
            case "P2004":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = "A database constraint was violated";
                break;
            case "P2005":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Invalid value stored in database for field: ${err.meta?.field_name ?? "unknown"}`;
                break;
            case "P2006":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Provided value is not valid for field: ${err.meta?.field_name ?? "unknown"}`;
                break;
            case "P2011":
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Null constraint violation on field: ${err.meta?.constraint ?? "unknown"}`;
                break;
            case "P2025":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = (err.meta?.cause as string | undefined) ?? "Required record not found";
                errorDetails = { prismaCode: err.code, meta: err.meta };
                break;
            default:
                statusCode = httpStatus.BAD_REQUEST;
                errorMessage = `Database request error [${err.code}]`;
                errorDetails = { prismaCode: err.code, meta: err.meta };
        }

    // ── 3. Prisma Initialization Error (connection/auth issues) ────────────
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        errorName = "PrismaInitializationError";

        switch (err.errorCode) {
            case "P1000":
                statusCode = httpStatus.UNAUTHORIZED;
                errorMessage = "Database authentication failed. Please check credentials";
                break;
            case "P1001":
                statusCode = httpStatus.SERVICE_UNAVAILABLE;
                errorMessage = "Cannot reach the database server";
                break;
            case "P1002":
                statusCode = httpStatus.REQUEST_TIMEOUT;
                errorMessage = "Database server connection timed out";
                break;
            case "P1003":
                statusCode = httpStatus.NOT_FOUND;
                errorMessage = "Database does not exist";
                break;
            case "P1008":
                statusCode = httpStatus.REQUEST_TIMEOUT;
                errorMessage = "Database operation timed out";
                break;
            case "P1009":
                statusCode = httpStatus.CONFLICT;
                errorMessage = "Database already exists";
                break;
            case "P1010":
                statusCode = httpStatus.FORBIDDEN;
                errorMessage = "Database user was denied access";
                break;
            default:
                statusCode = httpStatus.INTERNAL_SERVER_ERROR;
                errorMessage = "Database initialization failed";
        }

    // ── 4. Prisma Unknown Request Error ────────────────────────────────────
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorName = "PrismaUnknownRequestError";
        errorMessage = "An unknown error occurred during the database query";

    // ── 5. Prisma Rust Panic Error ─────────────────────────────────────────
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorName = "PrismaRustPanicError";
        errorMessage = "A critical internal database engine error occurred";

    // ── 6. Zod Validation Error ─────────────────────────────────────────────
    } else if (err?.name === "ZodError") {
        statusCode = httpStatus.UNPROCESSABLE_ENTITY;
        errorName = "ZodValidationError";
        errorMessage = "Request validation failed";
        errorDetails = { issues: err.errors };

    // ── 7. JWT Errors ───────────────────────────────────────────────────────
    } else if (err?.name === "JsonWebTokenError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorName = "JsonWebTokenError";
        errorMessage = "Invalid or malformed token";
    } else if (err?.name === "TokenExpiredError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorName = "TokenExpiredError";
        errorMessage = "Your session has expired. Please log in again";
    } else if (err?.name === "NotBeforeError") {
        statusCode = httpStatus.UNAUTHORIZED;
        errorName = "NotBeforeError";
        errorMessage = "Token is not yet active";

    // ── 8. JSON Syntax Error (malformed request body) ───────────────────────
    } else if (err instanceof SyntaxError && "body" in err) {
        statusCode = httpStatus.BAD_REQUEST;
        errorName = "JSONSyntaxError";
        errorMessage = "Malformed JSON in request body";

    // ── 9. Generic HTTP Errors (e.g. from http-errors package) ─────────────
    } else if (err?.statusCode || err?.status) {
        statusCode = err.statusCode ?? err.status ?? httpStatus.INTERNAL_SERVER_ERROR;
        errorName = err.name ?? "HttpError";
        errorMessage = err.message ?? "An HTTP error occurred";

    // ── 10. Generic / Unhandled Error ──────────────────────────────────────
    } else if (err instanceof Error) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorName = err.name || "InternalServerError";
        errorMessage = err.message || "An unexpected error occurred";
    }

    // ── Build Response ──────────────────────────────────────────────────────
    const errorResponse: IErrorResponse = {
        statusCode,
        success: false,
        errorName,
        errorMessage,
        errorDetails: errorDetails ?? null,
        errorPath: req.originalUrl,
        errorMethod: req.method,
        errorStack: isProduction ? null : (err?.stack ?? null),
        timestamp: new Date().toISOString(),
    };

    // Log error in development for debugging
    if (!isProduction) {
        console.error("[GlobalErrorHandler]", {
            errorName,
            errorMessage,
            statusCode,
            path: req.originalUrl,
            method: req.method,
            stack: err?.stack,
        });
    }

    res.status(statusCode).json(errorResponse);
};