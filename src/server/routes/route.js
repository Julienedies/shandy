/*!
 * Created by j on 2019-02-12.
 */

// filter
import crossDomain from './filter/cross-domain'
import $404 from './filter/404'
import $500 from './filter/500'

// action
import upload from './action/upload'
import file from './action/file'

import csd from './action/csd'
import stock from './action/stock'
import concept from './action/concept'
import mashup from './action/mashup'
import logic from './action/logic'
import news from './action/news'
import plan from './action/plan'
import replay from './action/replay'
import rp from './action/rp'
import tags from './action/tags'
import system from './action/system'
import memo from './action/memo'
import diary from './action/diary'
import viewer from './action/viewer'

import todo from './action/todo'

import note from './action/note'
import note2 from './action/note2'
import txt from './action/txt'
import reader from './action/reader'

export default function (app) {

    app.use(crossDomain)

    app.post('/upload', upload)

    app.get('/file/', file.get)
    app.get('/file/random/', file.random)

    app.get('/csd/days', csd.getDays)
    app.get('/csd/tick', csd.getTick)

    app.get('/stock/concept', concept.get)
    app.get('/stock/concept/(:name)?', concept.get)
    app.get('/stock/c/:code', stock.get)
    app.post('/stock/c/:code', stock.post)
    app.get('/stock/list', stock.list)
    app.get('/stock/map', stock.map)

    app.get('/mashup/:code', mashup.get)
    app.get('/mashup/basic/:code', mashup.basic)
    app.get('/mashup/news/:code', mashup.news)

    app.get('/stock/logic', logic.get)
    app.post('/stock/logic', logic.post)
    app.delete('/stock/logic/:id', logic.del)
    app.get('/stock/logic/focus/:id', logic.focus)

    app.get('/stock/diary', diary.get)
    app.post('/stock/diary', diary.post)
    app.delete('/stock/diary/:id', diary.del)
    app.get('/stock/diary/up/:id', diary.up)

    app.get('/stock/todo/', todo.get)
    app.post('/stock/todo/', todo.post)
    app.delete('/stock/todo/:id', todo.del)

    app.get('/stock/news', news.get)
    app.post('/stock/news', news.post)
    app.delete('/stock/news/:id', news.del)

    app.get('/stock/rp', rp.get)
    app.post('/stock/rp', rp.post)
    app.delete('/stock/rp/:id', rp.del)
    app.post('/stock/rp/move', rp.move)

    app.get('/stock/plan', plan.get)
    app.post('/stock/plan', plan.post)
    app.delete('/stock/plan/:id', plan.del)

    app.get('/stock/replay/:date?', replay.get)
    app.post('/stock/replay', replay.post)
    app.post('/stock/replay/news', replay.news)
    app.delete('/stock/replay/:id', replay.del)

    app.get('/stock/tags/:type?', tags.get)
    app.post('/stock/tags', tags.post)
    app.delete('/stock/tags/:id', tags.del)

    app.get('/stock/system', system.get)
    app.post('/stock/system', system.post)
    app.delete('/stock/system/:id', system.del)
    app.get('/stock/system/move/:id/(:dest)?', system.move)

    app.get('/stock/memo', memo.get)
    app.post('/stock/memo', memo.post)
    app.delete('/stock/memo/:id', memo.del)
    app.get('/stock/memo/focus/:id', memo.focus)

    app.get('/viewer/refresh', viewer.refresh)
    app.get('/stock/viewer/:id?', viewer.get)
    app.post('/stock/viewer', viewer.post)
    app.delete('/stock/viewer/:id', viewer.del)

    app.get('/note', note.get)
    app.post('/note', note.post)
    app.delete('/note/:id', note.del)
    app.get('/stock/note/focus/:id', note.focus)

    app.get('/note2', note2.get)
    app.post('/note2', note2.post)
    app.delete('/note2/:id', note2.del)
    app.get('/stock/note2/focus/:id', note2.focus)

    app.get('/txt', txt.get)
    app.post('/txt', txt.post)
    app.delete('/txt/:id', txt.del)

    app.get('/reader/:id?', reader.get)
    app.post('/reader', reader.post)
    app.delete('/reader/:id', reader.del)

    app.use($404)
    app.use($500)

}
