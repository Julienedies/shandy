/*!
 * Created by j on 2019-02-28.
 */

import electron from 'electron'

const {remote} = electron

import jhandy from 'jhandy-cli'

import Win from './window'


export default {
    open (url) {
        return new Win(url)
    },
    fetch (csdPath) {
        return jhandy.fetch(csdPath)
    }

}