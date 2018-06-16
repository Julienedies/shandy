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

    speechSU.onend = setTimeout(s, 30);

    function voice(text) {
        q.push(text);
        s();
    }

    voice.timestamp = + new Date;

    voice.clear = function(){
        speechSynthesis.cancel();
        //console.log(q);
        q.length = 0;  //清空数组
    };

    voice.pause = function(){
        speechSynthesis.pause();
    };

    voice.resume = function(){
        speechSynthesis.resume();
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