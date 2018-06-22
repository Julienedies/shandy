/**
 * Created by j on 18/6/15.
 */
;
(function () {

    let q = [];
    let speechSU = new SpeechSynthesisUtterance();
    let is_end = true;

    function s() {
        if (is_end) {
            //console.info('s', q.length, +new Date);
            let o = q.shift();
            if (o) {
                is_end = false;
                speechSU.text = o.text;
                speechSynthesis.speak(speechSU);
            }
        }
    }

    speechSU.onend = function () {
        is_end = true;
        s();
    };

    function voice(sign, text) {
        if (!text) {
            text = sign;
            sign = 's' + new Date;
        }
        q.push({sign: sign, text: text});
        //console.log('push', q.length, +new Date);
        s();
    }

    voice.remove = function (sign) {
        q.forEach(function (v, i) {
            if (v.sign == sign) {
                console.log('删除', sign, v.text);
                q.splice(i, 1);
            }
        });
    };

    voice.clear = function () {
        speechSynthesis.cancel();
        q.length = 0;  //清空数组
    };

    voice.pause = function () {
        speechSynthesis.pause();
    };

    voice.resume = function () {
        speechSynthesis.resume();
    };


    if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
        module.exports = voice;
    } else {
        if (window.voice) {
            return console.err('window.voice already exist!');
        } else {
            window.voice = voice;
        }
    }

})();