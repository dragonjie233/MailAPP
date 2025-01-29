import { Hono } from "hono"
import { decode, sign, verify } from 'hono/jwt'
import { getCookie, setCookie } from 'hono/cookie'
import twoFA from "2fa-utils"

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get('/from/:code?', async (c) => {
    const code = c.req.param('code')

    if (!code) {
        return c.json({
            msg: 'Please provide code in url param.'
        })
    }

    const isTokenValid = twoFA.verifyTOTP(code, c.env.totpsecret, 1)

    if (!isTokenValid) {
        return c.json({
            msg: 'Incorrect code'
        })
    }

    try {
        const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 48 //48 hour
        const token = await sign({
            ok: true, exp
        }, c.env.jwtsecret)

        setCookie(c, 'token', token, {
            expires: new Date(exp * 1000) //to milliseconds
        })

        return c.json({
            msg: 'Sign token success.',
            token
        })
    } catch(err) {
        return c.json({
            msg: 'Token signed error: ' + err
        })
    }
})

router.get('/gensecret', async (c) => {
    return c.text(twoFA.generateSecret())
})

export default router