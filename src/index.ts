import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { some } from 'hono/combine'
import { cors } from 'hono/cors'

import mailHandle from './mailHandle'
import mailApi from './mail'
import token from './token'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', cors())
app.use('/api/*', some(
    async (c, next) => {
        const jwtMiddleware = jwt({
            secret: c.env.jwtsecret,
            cookie: 'token'
        })

        await jwtMiddleware(c, next)
    },
    async (c, next) => {
        c.res = c.json({
            msg: 'unauthorized.'
        }, 401)
    }
))

app.route('/token', token)
app.route('/api', mailApi)

export default {
    fetch: app.fetch,
    email: mailHandle
}