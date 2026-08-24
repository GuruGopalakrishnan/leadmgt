const serverless = require('serverless-http')

let handlerPromise

exports.handler = async (event, context) => {
  if (!handlerPromise) {
    handlerPromise = import('../../server/app.js').then(({ default: app }) => serverless(app))
  }
  const handler = await handlerPromise
  return handler(event, context)
}
