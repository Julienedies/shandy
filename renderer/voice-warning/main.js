/**
 * Created by j on 18/6/3.
 */

function voiceWarning() {
    var list = [];

    $('#mistake li').each(function () {
        let text = $(this).text();
        text && list.push(text);
    });

    var l = list.length;

    var speechSU = new window.SpeechSynthesisUtterance();

    function xsp(e) {
        l += 1;
        console.log();
        let random = Math.random() * l * 1000;
        let first = list.shift();
        speechSU.text = first;
        list.push(first);
        setTimeout(function () {
            window.speechSynthesis.speak(speechSU);
        }, random);
    }

    speechSU.onend = xsp;

    xsp();
}

voiceWarning();