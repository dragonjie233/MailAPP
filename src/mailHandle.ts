import { sign } from "hono/jwt"

async function email (
    message: ForwardableEmailMessage,
    env: CloudflareBindings,
    ctx: ExecutionContext
) {
    const { from, to } = message
    const toPrefix = to.split('@')[0]
    const subject = message.headers.get('subject') || '(no subject)'
    const raw = await new Response(message.raw).text()
    let sqlId: number

    // save to database
    try {
        const { meta } = await env.DB.prepare(
            'INSERT INTO mails (`subject`, `from`, `to`, `raw`) VALUES (?, ?, ?, ?)'
        ).bind(
            subject, from, to, raw
        ).run()

        sqlId = meta.last_row_id
    } catch(err) {
        message.setReject(`Failed save email message.`)
        console.error('Save email message error: ', err)
    }

    // push notification
    const token = await sign({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 48
        }, env.jwtsecret)
    const pushUrl = env.pushurl.replace(/\$title|\$body|\$url/g,
        key => {
            return {
                $title: encodeURIComponent(subject),
                $body: `(${toPrefix}) ${from}`,
                $url: encodeURIComponent(`${env.siteurl}/#/detail?id=${sqlId}&t=${token}`)
            }[key] as string
        })

    try {
        const pushed = await fetch(pushUrl)
        const { code, message } = await pushed.json<{
            code: number,
            message: string,
            timestamp: number
        }>()

        if (code != 200 && message != 'success') {
            console.error('Push to ', pushUrl, ' failed.')
        }
    } catch(err) {
        console.error('Push notification to url error: ', err)
    }
}

export default email