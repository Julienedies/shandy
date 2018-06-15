/**
 * Created by j on 18/6/15.
 */
;
(function () {

    let q = [];
    let speechSU = new SpeechSynthesisUtterance();

    function s() {
        let text = q.shift();
        if (text) {
            speechSU.text = text;
            speechSynthesis.speak(speechSU);
        }
    }

    speechSU.onend = s;

    function voice(text) {
        q.push(text);
        s();
    }

    voice.timestamp = + new Date;

    voice.clear = function(){
        q.length = 0;  //清空数组
    };

    if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
        module.exports = voice;
    } else {
        if(window.voice){
            return console.err('window.voice already exist!');
        }else{
            window.voice = voice;
        }
    }

})();