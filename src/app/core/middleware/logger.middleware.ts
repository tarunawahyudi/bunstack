import { Elysia } from 'elysia'
import { logger } from '@shared/util/logger.util'

export const loggerMiddleware = (app: Elysia) =>
  app.onAfterHandle(({ set, request }) => {
    const { method, url } = request
    const status = set.status ?? 200
    const path = new URL(url).pathname
    const logMessage = `${method} ${path} ${status}`
    logger.info(logMessage)
  })
