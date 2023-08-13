document.addEventListener('DOMContentLoaded', function () {

    const $ = (id) => document.getElementById(id);

    const $div = (cls) => {
        const el = document.createElement('div');
        el.setAttribute('class', cls);
        return el;
    }

    function msg(side, kind, text) {
        const el = $div(kind);
        el.innerText = text;
        const wrapper = $div('speech ' + side);
        wrapper.appendChild(el);
        $('chat').appendChild(wrapper);
    }

    function assistant(text) {
        msg('speech-assistant', 'speech-bubble-assistant color-assistant', text);
        $('assistant-loading').style.display = 'none';
        $('prompt').disabled = false;
        $('prompt').focus();
    }

    function human(text) {
        msg('speech-human', 'speech-bubble-human color-human', text);
        $('assistant-loading').style.display = 'block';
        $('prompt').disabled = true;
    }

    function panic(text) {
        msg('speech-panic', 'speech-bubble-panic color-panic', text);
        $('assistant-loading').style.display = 'none';
        $('prompt').disabled = false;
        $('prompt').focus();
    }

    // send question to the back-end
    function ask(question) {
        human(question);
        fetch('/question?' + encodeURIComponent(question)).catch(error => {
            panic(error);
        }).then(response => {
            response && response.ok && setTimeout(getAssistantAnswer, 300);
        })
    }

    $('prompt').addEventListener('keydown', function handleKeyInput(event) {
        if (event.key === 'Enter') {
            const el = $('prompt');
            const prompt = el.value.trim();
            if (prompt.length > 0) {
                el.value = '';
                ask(prompt);
            }
        }
    });

    // get up-to-date answer
    let assistantIndex = 0;
    function getAssistantAnswer() {
        fetch('/answer').catch(error => {
            panic(error);
        }).then(response => {
            return response && response.json();
        }).then(data => {
            if (!data) {
                return;
            }
            const { index, answer } = data;
            if (index > assistantIndex) {
                assistantIndex = index;
                assistant(answer);
                $('prompt').disabled = false;
                $('prompt').focus();
            } else {
                setTimeout(getAssistantAnswer, 100);
            }
        })
    }

    // poor man's coachmarks
    setTimeout(() => { assistant('Hi, I am your virtual assistant!'); }, 0);
    setTimeout(() => { assistant('How can I help you?'); }, 100);

    setTimeout(() => { ask('What is the biggest planet in our solar system?'); }, 200);
});