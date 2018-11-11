/**
 * Created by j on 18/6/3.
 */

var speechSU = new window.SpeechSynthesisUtterance();
speechSU.volume = 0.1;

function voiceWarning() {
    var list = [];

    $('#point li').each(function () {
        let text = $(this).text();
        text && list.push(text);
    });

    var l = list.length;

    function xsp(e) {
        l += 1;
        let random = Math.random() * l * 1000;
        let first = list.shift();
        speechSU.text = first;
        list.push(first);
        setTimeout(function () {
            window.speechSynthesis.speak(speechSU);
        }, 4000);
    }

    speechSU.onend = xsp;

    xsp();
}

voiceWarning();


$('#voice_btn').toggle(function(){
    speechSynthesis.pause();
}, function(){
    speechSynthesis.resume();
});