const video = document.querySelector('#webcam');
const enableWebcamButton = document.querySelector('#enableWebcamButton');
const disableWebcamButton = document.querySelector('#disableWebcamButton');
const canvas = document.querySelector('#outputCanvas');

const clf = knnClassifier.create();


/* Check if webcam access is supported. */
function getUserMediaSupported() {
    /* Check if both methods exists.*/
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);

    /* alternative approach 
    return ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
    */
}

/* 
 * If webcam is supported, add event listener to button for when user
 * wants to activate it to call enableCam function which we will 
 * define in the next step.
 */

if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
    disableWebcamButton.addEventListener('click', disableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

function enableCam(event) {
    /* disable this button once clicked.*/
    event.target.disabled = true;

    /* show the disable webcam button once clicked.*/
    disableWebcamButton.disabled = false;
    document.getElementById("class-a").disabled = false;
    document.getElementById("class-a").classList.remove("disabled");
    document.getElementById("class-b").disabled = false;
    document.getElementById("class-b").classList.remove("disabled");
    document.getElementById("class-c").disabled = false;
    document.getElementById("class-c").classList.remove("disabled");
    document.getElementById("resetButton").disabled = false;
    document.getElementById("resetButton").classList.remove("disabled");

    /* show the video and canvas elements */
    document.querySelector("#liveView").style.display = "block";

    // getUsermedia parameters to force video but not audio.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictCam);
    })
        .catch(function (err) {
            console.error('Error accessing media devices.', err);
        });
};

function disableCam(event) {
    event.target.disabled = true;
    enableWebcamButton.disabled = false;
    document.getElementById("class-a").disabled = true;
    document.getElementById("class-a").classList.add("disabled");
    document.getElementById("class-b").disabled = true;
    document.getElementById("class-b").classList.add("disabled");
    document.getElementById("class-c").disabled = true;
    document.getElementById("class-c").classList.add("disabled");
    document.getElementById("resetButton").disabled = true;
    document.getElementById("resetButton").classList.add("disabled");

    /* stop streaming */
    video.srcObject.getTracks().forEach(track => {
        track.stop();
    })

    /* clean up. some of these statements should be placed in processVid() */
    video.srcObject = null;
    video.removeEventListener('loadeddata', predictCam);
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.querySelector("#liveView").style.display = "none";
    resetKNN();
}

let model = undefined;

const classes = ['A', 'B', 'C'];

function predictCam() {
    if (video.srcObject == null) { return; }

    if (clf.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = model.infer(video, true);
        // Get the most likely class and confidence from the classifier module.
        clf.predictClass(activation).then((result) => {
            document.querySelector("#result").innerHTML =
                `prediction: ${classes[result.label]}, probability: ${result.confidences[result.label]}`;
        });
    }
    window.requestAnimationFrame(predictCam);
}

mobilenet.load().then((loadedModel) => {
    model = loadedModel;
    document.querySelector("#status").innerHTML = "model is loaded.";
    // document.querySelector("#predictBtn").disabled = false;
    document.getElementById('class-a').addEventListener('click', (e) => addExample(e, 0));
    document.getElementById('class-b').addEventListener('click', (e) => addExample(e, 1));
    document.getElementById('class-c').addEventListener('click', (e) => addExample(e, 2));
    document.getElementById('resetButton').addEventListener('click', (e) => resetKNN());
});

let clicks = { 0: 0, 1: 0, 2: 0 };

function addExample(event, classId) {

    if (video.srcObject == null) { return; }

    clicks[classId] += 1;

    const canvas = document.createElement('canvas');
    // canvas.setAttribute("class", "canvas")
    canvas.setAttribute('width', 170);
    canvas.setAttribute('height', 130);
    canvas.setAttribute('float', "left");
    const ctx = canvas.getContext('2d');

    switch (classId) {
        case 0:
            event.target.innerHTML = `Add A(${clicks[classId]})`;
            // document.getElementById("block1").appendChild(canvas); // append the child after
            var block1 = document.getElementById("block1");
            block1.insertBefore(canvas, block1.childNodes[0]);
            ctx.drawImage(video, 5, 5, 160, 120);
            break;
        case 1:
            event.target.innerHTML = `Add B(${clicks[classId]})`;
            // document.getElementById("block2").appendChild(canvas);
            var block2 = document.getElementById("block2");
            block2.insertBefore(canvas, block2.childNodes[0]);
            ctx.drawImage(video, 5, 5, 160, 120);
            break;
        case 2:
            event.target.innerHTML = `Add C(${clicks[classId]})`;
            // document.getElementById("block3").appendChild(canvas);
            var block3 = document.getElementById("block3");
            block3.insertBefore(canvas, block3.childNodes[0]);
            ctx.drawImage(video, 5, 5, 160, 120);
            break;
        default:
    }

    const embedding = model.infer(video, true)
    clf.addExample(embedding, classId);
}

function resetKNN() {
    document.getElementById('class-a').innerHTML = "Add A";
    document.getElementById('class-b').innerHTML = "Add B";
    document.getElementById('class-c').innerHTML = "Add C";
    clf.clearAllClasses();

    clicks = { 0: 0, 1: 0, 2: 0 };

    var childA = document.getElementById("block1");
    var childB = document.getElementById("block2");
    var childC = document.getElementById("block3");
    while (childA.hasChildNodes()) {
        childA.removeChild(childA.childNodes[0]);
    } // if()
    while (childB.hasChildNodes()) {
        childB.removeChild(childB.childNodes[0]);
    } // if()
    while (childC.hasChildNodes()) {
        childC.removeChild(childC.childNodes[0]);
    } // if()

}