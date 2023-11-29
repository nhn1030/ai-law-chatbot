// 채팅 메시지를 표시할 DOM 요소
const chatMessages = document.querySelector('#chat-box');
// 사용자 입력 필드
const userInput = document.querySelector('#user-input');
// 전송 버튼
const sendButton = document.querySelector('.send-button');
// 챗봇이 답변을 생성 중일 때 사용자에게 알리는 함수

// 발급받은 OpenAI API 키를 변수로 저장
const apiKey = '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'; // 실제 키로 변경해주세요
// OpenAI API 엔드포인트 주소를 변수로 저장
const apiEndpoint = 'https://api.openai.com/v1/chat/completions';


// 채팅 메시지 추가 함수
function addChatMessage(sender, message) {
    // 새로운 div 생성
    const messageElement = document.createElement('div');
    // 생성된 요소에 클래스 추가
    messageElement.className = `message ${sender}`;
    // 채팅 메시지 목록에 새로운 메시지 추가
    messageElement.innerHTML = `${sender === 'user' ? '나' : '법률챗봇'}: ${message.replace(/\n/g, '<br>')}`;
    chatMessages.prepend(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function showThinkingIndicator() {
    addChatMessage('bot', '법률챗봇이 답변을 생성 중입니다. 잠시만 기다려주세요...');
}
// '답변을 생성 중입니다...' 메시지 삭제
function removeThinkingIndicator() {
    const thinkingMessages = document.querySelectorAll('.bot');
    for (let i = thinkingMessages.length - 1; i >= 0; i--) {
        if (thinkingMessages[i].textContent.includes('법률챗봇이 답변을 생성 중입니다. 잠시만 기다려주세요...')) {
            thinkingMessages[i].remove();
            break; // 첫 번째 발견된 메시지를 제거한 후 루프 종료
        }
    }
}
function handleInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // 줄바꿈을 막습니다.
        sendChat(); // 메시지 전송 함수를 호출합니다.
    } else if (event.key === 'Enter' && event.shiftKey) {
        // Shift + Enter 눌렀을 때 줄바꿈 (textarea에서 자동으로 처리됨)
    }
}
async function sendChat() {
    const message = userInput.value.trim();
    if (message.length === 0) return;
    addChatMessage('user', message);
    userInput.value = ''; // 입력창 초기화
    userInput.style.height = 'auto';

    const aiResponse = await fetchAIResponse(message); // AI 응답 받아오기
    addChatMessage('bot', aiResponse);
}

function addChatMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    // 여기에서 innerHTML을 사용하여 줄바꿈을 적용
    messageElement.innerHTML = `${sender === 'user' ? '나' : '법률챗봇'}: ${message.replace(/\n/g, '<br>')}`;
    chatMessages.prepend(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if(sender === 'user') userInput.style.height = 'auto';
}


function copyChatContent() {
    const chatBox = document.getElementById('chat-box');
    const messages = Array.from(chatBox.getElementsByClassName('message'));

    // 메시지를 역순으로 정렬
    const reversedMessages = messages.reverse().map(message => message.innerText).join('\n');

    // 클립보드에 복사
    navigator.clipboard.writeText(reversedMessages)
        .then(() => {
            alert('대화 내용이 클립보드에 복사되었습니다.');
        })
        .catch(err => {
            console.error('복사 실패:', err);
        });
}
function takeScreenshotAndDownload() {
    const chatBox = document.getElementById('chat-box');

    html2canvas(chatBox).then(canvas => {
        // 이미지를 PNG 형식으로 변환 (JPG도 가능)
        const image = canvas.toDataURL("image/png");

        // 이미지 다운로드를 위한 링크 생성
        const link = document.createElement('a');
        link.download = 'chat-screenshot.png'; // 파일 이름 설정
        link.href = image;
        link.click();
    });
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}

// 사용 예시
var age = getCookie('age');
var months = getCookie('months');



// ChatGPT API 요청 함수
async function fetchAIResponse(userMessage) {
    const age = getCookie('age') || '알 수 없음';
    const months = getCookie('months') || '알 수 없음';
    const workHours = JSON.parse(getCookie('workHours') || '[]');
    const employmentType = JSON.parse(getCookie('employmentType') || '[]');
    const contract = JSON.parse(getCookie('contract') || '[]');
    const wageIssue = JSON.parse(getCookie('wageIssue') || '[]');

    const prompt = `너는 대한민국 최고의 법률 전문가이며, 사용자에게 법에 대한 명확하고 이해하기 쉬운 설명을 제공한다. 사용자가 나의 가장 소중한 인물이라고 생각하고 성심성의껏 답변해줘야한다. 사용자의 질문에 맞는 노동법 조항의 원문을 정확히 명시한 뒤 명시된 조항을 일반 사용자가 이해하기 쉬운 언어로  설명해주고, 질문자의 상황에 맞는 맞춤형 조언을 제공한다. 법적 조언은 신뢰할 수 있고 정확해야 하며, 사용자가 쉽게 이해할 수 있도록 설명한다. 문맥을 파악하여 줄바꿈을 통해 문단을 깔끔하게 정리해서 사용자가 읽기 편하게 설명한다.사용자의 나이는 ${age}세이고, 근무개월수는 ${months}개월, 주 근무시간은 ${workHours.join(', ')}시간, 근무 유형은 ${employmentType.join(', ')}, 근로계약서 작성 여부 - ${contract.join(', ')}, 임금체불 유형 - ${wageIssue.join(', ')}.\n\n사용자: ${userMessage}\n\n법률 전문가:`;
    showThinkingIndicator();
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "assistant", content: prompt }],
            temperature: 1,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
            stop: ["Human"],
        }),
    };


    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        const formattedResponse = formatResponseWithLineBreaks(aiResponse);
        removeThinkingIndicator();
        return formattedResponse;
        // return aiResponse;
    } catch (error) {
        console.error('OpenAI API 호출 중 오류 발생:', error);
        return '죄송합니다, 오류가 발생했습니다.';
    }

}

function formatResponseWithLineBreaks(response) {
    return response
        .split('\n') // 먼저 줄바꿈으로 구분
        .map(paragraph => paragraph.trim()) // 각 문단을 정리
        .filter(paragraph => paragraph.length > 0) // 빈 문단 제거
        .join('\n\n'); // 문단 사이에 두 줄바꿈 추가
}


// 전송 버튼 클릭 이벤트 처리
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message.length === 0) return;
    addChatMessage('user', message);
    userInput.value = '';

    const aiResponse = await fetchAIResponse(message);
    addChatMessage('bot', aiResponse);

});

// 사용자 입력 필드에서 Enter 키 이벤트 처리
// userInput.addEventListener('keydown', (event) => {
//     if (event.key === 'Enter') {
//         sendButton.click();
//     }
// })
userInput.addEventListener('keydown', handleInputKeyDown);
