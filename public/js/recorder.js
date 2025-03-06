// recorder.js
let audioContext;
let mediaStream;
let audioWorkletNode;
let mediaRecorder;
let recordedChunks = [];

// 🎤 Khởi động ghi âm
async function startRecording() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext({ sampleRate: 8000 }); // Giảm sample rate xuống 16kHz
        await audioContext.audioWorklet.addModule('processor.js');

        const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
        audioWorkletNode = new AudioWorkletNode(audioContext, 'my-audio-processor');

        mediaStreamSource.connect(audioWorkletNode);
        audioWorkletNode.connect(audioContext.destination);

        // Ghi dữ liệu vào MediaRecorder
        mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/wav' });
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };
        mediaRecorder.start();
    } catch (error) {
        console.error("Lỗi khi khởi động ghi âm:", error);
    }
}

// ⏹ Dừng ghi âm và xử lý file
async function stopRecording() {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach(track => track.stop());

    // Tạo file WAV từ dữ liệu đã ghi
    const audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
    sendAudioToAPI(audioBlob);
}

// 🚀 Gửi file WAV lên API
async function sendAudioToAPI(audioBlob) {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    try {
        const response = await fetch("https://your-api.com/evaluate", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Lỗi khi gửi file lên API");
        }

        const data = await response.json();
        console.log("Kết quả đánh giá:", data);
    } catch (error) {
        console.error("Lỗi:", error);
    }
}

// processor.js
class MyAudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (input.length > 0) {
            let inputChannel = input[0];
            let outputChannel = output[0];

            for (let i = 0; i < inputChannel.length; i++) {
                outputChannel[i] = inputChannel[i]; // Chuyển tiếp tín hiệu âm thanh
            }
        }

        return true; // Tiếp tục xử lý
    }
}

registerProcessor('my-audio-processor', MyAudioProcessor);
