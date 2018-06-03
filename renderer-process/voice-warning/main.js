/**
 * Created by j on 18/6/3.
 */

function voiceWarning(){

}

var list = [];

$('#mistake li').each(function(){
    list.push($(this).text());
});


var speechSU = new window.SpeechSynthesisUtterance();

function xsp(e){
    console.log();
    let random = Math.random() * 10 * 1000;
    let first = list.shift();
    speechSU.text = first;
    list.push(first);
    setTimeout(function(){
        window.speechSynthesis.speak(speechSU);
    }, random);
}

speechSU.onend = xsp;

xsp();