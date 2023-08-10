document.addEventListener('DOMContentLoaded', function () {

    const $ = (id) => document.getElementById(id);

    const $div = (cls) => {
        const el = document.createElement('div');
        el.setAttribute('class', cls);
        return el;
    }

    function msg(side, cls, text) {
        const el = $div('chat-bubble ' + cls);
        el.innerText = text;
        const wrapper = $div('chat ' + side);
        wrapper.appendChild(el);
        $('chat').appendChild(wrapper);
    }

    function assistant(text) {
        msg('chat-start', 'chat-bubble-accent', text);
        $('assistant-loading').style.display = 'none';
        $('prompt').disabled = false;
        $('prompt').focus();
    }

    function human(text) {
        msg('chat-end', 'chat-bubble-warning', text);
        $('assistant-loading').style.display = 'block';
        $('prompt').disabled = true;
    }

    function panic(text) {
        msg('chat-end', 'chat-bubble-error', text);
        $('assistant-loading').style.display = 'none';
        $('prompt').disabled = false;
        $('prompt').focus();
    }

    // send question to the back-end
    $('prompt').addEventListener('keydown', function handleKeyInput(event) {
        if (event.key === 'Enter') {
            const el = $('prompt');
            const prompt = el.value.trim();
            el.value = '';
            if (prompt.length > 0) {
                human(prompt);
                fetch('/question?' + encodeURIComponent(prompt)).catch(error => {
                    panic(error);
                }).then(response => {
                    response && response.ok && setTimeout(getAssistantAnswer, 300);
                })
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
    setTimeout(() => { assistant('Hi, I am your virtual assistant!'); }, 200);
    setTimeout(() => { assistant('How can I help you?'); }, 300);
    setTimeout(() => { human('What is the biggest planet in our solar system?'); }, 500);
    setTimeout(() => { assistant('Jupiter.'); }, 1100);
});