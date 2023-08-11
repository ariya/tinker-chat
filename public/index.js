document.addEventListener("DOMContentLoaded", function () {

    const $ = (id) => document.getElementById(id);

    // send question to the back-end
    $('prompt').addEventListener("keydown", function handleKeyInput(event) {
        if (event.key === "Enter") {
            const el = $('prompt');
            const prompt = el.value.trim();
            el.value = '';
            if (prompt.length > 0) {
                el.disabled = true;
                appendHumanMessage(prompt);
                fetch('/question?' + encodeURIComponent(prompt)).catch(error => {
                    showError(error);
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
            showError(error);
        }).then(response => {
            return response && response.json();
        }).then(data => {
            if (!data) {
                return;
            }
            const { index, answer } = data;
            if (index > assistantIndex) {
                assistantIndex = index;
                appendAssistantMessage(answer);
                $('prompt').disabled = false;
                $('prompt').focus();
            } else {
                setTimeout(getAssistantAnswer, 100);
            }
        })
    }

    function appendHumanMessage(text) {
        const msg = document.createElement('div');
        msg.setAttribute('class', 'chat-bubble chat-bubble-warning');
        msg.innerText = text;
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'chat chat-end');
        wrapper.appendChild(msg);
        $('chat').appendChild(wrapper);
        $("assistant-loading").style.visibility = 'visible';
    }

    function appendAssistantMessage(text) {
        const msg = document.createElement('div');
        msg.setAttribute('class', 'chat-bubble chat-bubble-accent');
        msg.innerText = text;
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'chat chat-start');
        wrapper.appendChild(msg);
        $('chat').appendChild(wrapper);

        $("assistant-loading").style.visibility = 'hidden';
    }

    function showError(text) {
        const msg = document.createElement('div');
        msg.setAttribute('class', 'chat-bubble chat-bubble-error');
        msg.innerText = text;
        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'chat chat-end');
        wrapper.appendChild(msg);
        $('chat').appendChild(wrapper);

        $("assistant-loading").style.visibility = 'hidden';
        $('prompt').disabled = false;
        $('prompt').focus();
    }

    // poor man's coachmarks
    setTimeout(() => { appendAssistantMessage('Halo, saya adalah asisten virtual!'); }, 200);
    setTimeout(() => { appendAssistantMessage('Ada yang bisa saya bantu?'); }, 300);
    setTimeout(() => { appendHumanMessage('Berapa jumlah penduduk Jakarta?'); }, 500);
    setTimeout(() => { appendAssistantMessage('Sekitar 10 juta jiwa.'); }, 1100);
});