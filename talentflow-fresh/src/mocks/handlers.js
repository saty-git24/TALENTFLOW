import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/hello', () => {
    return HttpResponse.json({ message: 'Hello from MSW!' })
  }),

  http.post('/api/login', async ({ request }) => {
    const body = await request.json()
    if (body.username === 'admin' && body.password === '123') {
      return HttpResponse.json({ success: true })
    }
    return HttpResponse.json({ success: false }, { status: 401 })
  }),
]
