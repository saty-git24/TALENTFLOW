export async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  // Read body once as text to avoid "body stream already read" errors
  const text = await response.text();

  // If the response looks like JSON, try to parse it
  let parsed = null;
  if (contentType.includes('application/json')) {
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // parsing failed, leave parsed as null and fall back to text
      parsed = null;
    }
  }

  // If response is not OK, throw an Error including status and body
  if (!response.ok) {
    const body = parsed !== null ? parsed : text;
    const message = parsed && parsed.error ? parsed.error : (typeof body === 'string' ? body : JSON.stringify(body));
    const err = new Error(message || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.body = body;
    throw err;
  }

  // If OK, return parsed JSON when available, otherwise raw text
  return parsed !== null ? parsed : text;
}
