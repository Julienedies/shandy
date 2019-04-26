/**
 * Created by j on 18/6/15.
 */

window.onerror = function (e) {
    console.log('======', e)
}


let q = [];
let isEnd = true;
const speechSU = new SpeechSynthesisUtterance();

speechSU.onerror = function (err) {
    isEnd = true;
    console.error('speechSU onerror =>', err)
}

speechSU.onend = function () {
    isEnd = true;
    speak();
};

function speak () {
    if (isEnd) {
        let o = q.shift();
        if (o) {
            isEnd = false;
            speechSU.text = o.text;
            console.log('---------------', speechSU, speechSynthesis)
            speechSynthesis.speak(speechSU);
        }
    }
}

function voice (sign, text) {
    if (!text) {
        text = sign;
        sign = null;
    }
    q.push({sign: sign, text: text});
    speak();
}

voice.remove = function (sign) {
    speechSynthesis.cancel();
    q.forEach(function (v, i) {
        if (v.sign === sign) {
            console.log('删除', sign, v.text);
            q.splice(i, 1);
        }
    });
};

voice.clear = function () {
    speechSynthesis.cancel();
    isEnd = true;
    q = [];
};

voice.pause = function () {
    speechSynthesis.pause();
};

voice.resume = function () {
    speechSynthesis.resume();
};


export default voice
