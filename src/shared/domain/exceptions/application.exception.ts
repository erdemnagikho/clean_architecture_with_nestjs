export enum ApplicationExceptionCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    CONFLICT = "CONFLICT",
    NOT_FOUND = "NOT_FOUND",
}

export class ApplicationException extends Error {
    constructor(
        message: string,
        public readonly code: ApplicationExceptionCode = ApplicationExceptionCode.VALIDATION_ERROR,
    ) {
        super(message);
        this.name = 'ApplicationException';
    }
}