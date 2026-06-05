import { Elysia, NotFoundError, ParseError, ValidationError } from 'elysia'
import { logger } from '@shared/util/logger.util'
import { AppException } from '@core/exception/app.exception'

function getValidationErrors(error: ValidationError) {
  return error.all.map((item) => ({
    path: 'path' in item ? item.path : undefined,
    message: 'message' in item ? item.message : item.summary,
    summary: item.summary,
  }))
}

export const errorMiddleware = (app: Elysia) =>
  app.onError(({ error, set, request }) => {
    const { method, url } = request
    const path = new URL(url).pathname

    if (error instanceof AppException) {
      const logFn = (logger as any)[error.logLevel] || logger.error
      logFn(`${method} ${path} ${error.httpStatus} - ${error.message}`)
      set.status = error.httpStatus
      return {
        success: false,
        code: error.code,
        message: error.message,
        ticket: error.ticketCode,
        timestamp: new Date().toISOString()
      }
    }

    if (error instanceof NotFoundError) {
      logger.warn(`${method} ${path} 404 - Not Found`)
      set.status = 404
      return {
        success: false,
        code: 'NOT_FOUND',
        message: 'The requested resource was not found',
        error: null,
        timestamp: new Date().toISOString()
      }
    }

    if (error instanceof ValidationError) {
      const errors = getValidationErrors(error)

      logger.warn(`${method} ${path} 400 - Validation failed`)
      set.status = 400
      return {
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
      }
    }

    if (error instanceof ParseError) {
      logger.warn(`${method} ${path} 400 - Bad Request: ${error.message}`)
      set.status = 400
      return {
        success: false,
        code: 'BAD_REQUEST',
        message: error.message,
        error: null,
        timestamp: new Date().toISOString()
      }
    }

    const message = error instanceof Error
      ? error.message
      : 'Internal Server Error'

    logger.error(`${method} ${path} 500 - ${message}`)
    set.status = 500
    return {
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? message : null,
      timestamp: new Date().toISOString()
    }
  })
