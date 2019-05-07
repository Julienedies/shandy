/**
 * Created by j on 18/6/15.
 */

// 存储要发音的文本队列
let q = [];
let isEnd = true;

function speak () {
    if (isEnd) {
        let o = q.shift();
        if (o) {
            isEnd = false;
            let speechSU = new SpeechSynthesisUtterance(o.text);
            speechSU.onend = function () {
                isEnd = true;
                speak();
            };
            console.log('voice', o.text, q, speechSU);
            speechSynthesis.speak(speechSU);
        }
    }
}

function voice (sign, text) {
    if (!text) {
        text = sign;
        sign = null;
    }
    q.push({sign, text});
    speak();
}

voice.remove = function (sign) {
    //speechSynthesis.cancel();
    isEnd = true;
    q.forEach(function (v, i) {
        if (v.sign === sign) {
            console.log('删除', sign, v.text);
            q.splice(i, 1);
        }
    });
};

voice.clear = voice.cancel = function () {
    //speechSynthesis.cancel();
    isEnd = true;
    q = [];
};

voice.pause = function () {
    //speechSynthesis.pause();
};

voice.resume = function () {
    //speechSynthesis.resume();
};

voice.debug = function () {
    console.log('voice debug =>', isEnd, q);
}


export default voice
