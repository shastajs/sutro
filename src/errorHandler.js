/* eslint no-unused-vars:0 */
import _debug from 'debug'
import mapValues from 'lodash.mapvalues'
const debug = _debug('sutro:errors')

const getError = (err) => {
  if (err.error) return getError(err.error)
  if (err.stack) return err.stack
  if (err.message) return err.message
  return err
}

const getErrorFields = (err) => {
  if (!err.errors) return
  return mapValues(err.errors, getError)
}

const sendError = (err, res) => {
  const error = {
    error: getError(err),
    fields: getErrorFields(err)
  }
  res.status(err.status || 500)
  res.json(error)
  res.end()
  return error
}

export default (err, req, res, next) => {
  const error = sendError(err, res)
  debug(error)
}
