/**
 * Created by j on 18/8/17.
 */

const ioHook = require('iohook');

ioHook.on('keydown', event => {
    console.log(event); // { type: 'mousemove', x: 700, y: 400 }
});

ioHook.on('mousewheel', event => {
    console.log(event); // { type: 'mousemove', x: 700, y: 400 }
});

// Register and start hook
ioHook.start();