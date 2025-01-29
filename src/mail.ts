import { Hono } from "hono"
import PostalMime from 'postal-mime'

const router = new Hono<{ Bindings: CloudflareBindings }>()

router.get('/list', async (c) => {
    const { page = '0', pageSize = '10', sender = '', sort = '0' } = c.req.query()

    try {
        const sql = ['SELECT id, `subject`, `from`, `to`, `at` FROM mails WHERE `from`=?3 LIMIT ?1, ?2', page, pageSize]

        if (sender == '') {
            sql[0] = sql[0].replace('WHERE `from`=?3 ', '')
        } else {
            sql.push(sender)
        }

        let { success, results } = await c.env.DB.prepare(sql.shift() as string).bind(...sql).run()

        if (!success) {
            return c.json({
                msg: 'Get email lists failed'
            })
        }

        if (sort == '1') {
            results = results.reverse()
        }

        return c.json({
            msg: 'Get success.',
            page,
            pageSize,
            results
        })
    } catch (err) {
        return c.json({
            msg: 'Get email lists error: ' + err
        })
    }
})

router.get('/detail', async (c) => {
    const { id } = c.req.query()

    if (!id) {
        return c.json({
            msg: 'Please provide \'id\' query parameter.'
        })
    }

    try {
        const { raw } = await c.env.DB.prepare(
            'SELECT raw FROM mails WHERE id=? LIMIT 1'
        ).bind(id).first() as {
            raw: string
        }

        const paresMail = await PostalMime.parse(raw)

        return c.json({
            msg: 'Get email detail success.',
            results: paresMail
        })
    } catch (err) {
        return c.json({
            msg: 'Get email detail error: ' + err
        })
    }

})

router.post('/del', async (c) => {
    const { ids } = await c.req.json()
    const test = /^\d+(,\d+)*$/g.test(ids)

    if (!test) {
        return c.json({
            msg: 'ids is incorrect in body.'
        })
    }

    try {
        const { success } = await c.env.DB.prepare(
            `DELETE FROM mails WHERE id IN (${ids})`
        ).run()
    
        if (!success) {
            return c.json({
                msg: 'Delete email failed.'
            })
        }
    
        return c.json({
            msg: 'Delete email success.'
        })
    } catch(err) {
        return c.json({
            msg: 'Delete email error: ' + err
        })
    }
})

export default router