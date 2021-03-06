import { inspect } from 'util'

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
}

const serializeIssues = (fields: any[]) =>
  fields.map((f) => `\n - ${inspect(f, inspectOptions)}`)

export const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
}

export class UnauthorizedError extends Error {
  message: string
  status: number

  constructor(message = 'Unauthorized', status = codes.unauthorized) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, UnauthorizedError)
  }
  toString = () => `${super.toString()} (HTTP ${this.status})`
}

export class BadRequestError extends Error {
  message: string
  status: number

  constructor(message = 'Bad Request', status = codes.badRequest) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, BadRequestError)
  }
  toString() {
    return `${super.toString()} (HTTP ${this.status})`
  }
}

export class ValidationError extends BadRequestError {
  fields?: any[]

  constructor(fields?: any[]) {
    super()
    this.fields = fields
    Error.captureStackTrace(this, ValidationError)
  }
  toString() {
    const original = super.toString()
    if (!this.fields) return original // no custom validation
    if (Array.isArray(this.fields)) {
      return `${original}\nIssues:${serializeIssues(this.fields)}`
    }
    return this.fields
  }
}

export class NotFoundError extends Error {
  message: string
  status: number

  constructor(message = 'Not Found', status = codes.notFound) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, NotFoundError)
  }
  toString = () => `${super.toString()} (HTTP ${this.status})`
}
