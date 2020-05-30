/*!
 * Created by j on 20/5/30.
 */

import userJodb from '../../../libs/user-jodb'

const todoJoDb = userJodb('todo', [], {joinType: 'push'});
const warnJoDb = userJodb('warn', [], {joinType: 'push'});

export default {

    get(req, res) {
        let type = req.query.type;
        if (type === 'todo') {
            return res.json(todoJoDb.get());
        } else if (type === 'warn') {
            return res.json(warnJoDb.get());
        } else {
            return res.json({
                todo: todoJoDb.get(),
                warn: warnJoDb.get()
            });
        }
    },

    post(req, res) {
        res.json({});
    },

    del(req, res) {
        let id = req.params.id;
    }

}