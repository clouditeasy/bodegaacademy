// Artillery processor for custom functions

module.exports = {
  captureAuthToken,
  setTestUser,
};

/**
 * Capture authentication token from response
 */
function captureAuthToken(requestParams, response, context, ee, next) {
  if (response.body) {
    try {
      const body = JSON.parse(response.body);
      if (body.token) {
        context.vars.authToken = body.token;
      }
      if (body.access_token) {
        context.vars.authToken = body.access_token;
      }
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  }
  return next();
}

/**
 * Set test user credentials
 */
function setTestUser(context, events, done) {
  // Generate random test user
  const randomNum = Math.floor(Math.random() * 10000);
  context.vars.testEmail = `loadtest${randomNum}@bodega.ma`;
  context.vars.testPassword = 'LoadTest123!';
  return done();
}
