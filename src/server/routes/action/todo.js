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
        let id = req.query.id;
        if (id) {
            return res.json(todoJoDb.get2(id));
        }
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
        getDb();
        let data = req.body;
        todoJoDb.set(data);
        res.json(todoJoDb.get());
    },

    del (req, res) {
        getDb();
        let id = req.params.id;
        todoJoDb.remove(id);
        res.json(todoJoDb.get());
    }

}
