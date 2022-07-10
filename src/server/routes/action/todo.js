/*!
 * Created by j on 20/5/30.
 */

import jodb from '../../../libs/jodb-data';

let todoJoDb;
let warnJoDb;

function getDb () {
    todoJoDb = jodb('todo', [], {joinType: 'push'});
    warnJoDb = jodb('warn', [], {joinType: 'push'});
}

export default {

    get (req, res) {
        getDb();
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

    post (req, res) {
        res.json({});
    },

    del (req, res) {
        let id = req.params.id;
    }

}
