//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);


Alpine.store('processingMint', false);

function startRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/

	var constraints = { audio: true, video: false }

	/*
	  Disable the record button until we get a success or fail from getUserMedia() 
  */

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false

	/*
		We're using the standard promise based getUserMedia() 
		https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input, { numChannels: 1 })

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function (err) {
		//enable the record button if getUserMedia() fails
		recordButton.disabled = false;
		stopButton.disabled = true;
		pauseButton.disabled = true
	});
}

function pauseRecording() {
	console.log("pauseButton clicked rec.recording=", rec.recording);
	if (rec.recording) {
		//pause
		rec.stop();
		pauseButton.innerHTML = "Resume";
	} else {
		//resume
		rec.record()
		pauseButton.innerHTML = "Pause";

	}
}

function stopRecording() {
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML = "Pause";

	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	// link.href = url;
	// link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	// link.innerHTML = "<h1> Save to Disk <br> </h1>";

	//add the new audio element to li
	li.appendChild(au);

	//add the filename to the li
	li.appendChild(document.createTextNode(filename + ".wav "))

	//add the save to disk link to li
	li.appendChild(link);

	//upload link
	var upload = document.createElement('a');
	var results = document.getElementById('results');
	upload.href = "#";
	// this is the wrong way to do this. proper way would be to use  upload.createElement and upload.setAttribute but idk how
	upload.innerHTML = '<div class="px-6 py-2 border border-gray-300 shadow-sm rounded-full text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"> Premint NFT </div>';
	upload.addEventListener("click", function (event) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function (e) {
			if (this.readyState === 4) {
				console.log("Server returned: ", e.target.responseText);
			}
		};
		var fd = new FormData();
		fd.append("audio_data", blob, filename);
		fd.append("buyerAddress2", Alpine.store('buyerAddress'));
		xhr.open("POST", "/upload", true);
		xhr.send(fd);
		// get the POST response and print it to the console
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && xhr.status == 200) {
				Alpine.store('processingMint', false);

				let response = JSON.parse(xhr.responseText);
				let ipfs_url = response['ipfs_url']
				let tokenId = response['token_id']
				let fileId = response['file_id']
				let tx_hash = response['tx_hash']
				let tx_url = 'https://mumbai.polygonscan.com/tx/' + tx_hash
				let opensea_url = response['opensea_url']
				let rarible_url = response['rarible_url']
				// change inner html to response['ipfs_url']
				results.innerHTML = '<div> \
				<h1 class="text-2xl font-bold text-center"> Your NFT: </h1> \
				<img src="/i/' + fileId + '/waveform.png' +  '" alt="Your NFT!" style="width:100%;height:auto;" class="border-black	border rounded-3xl my-3" >\
				<p> <a href="' + tx_url + '" class="underline" target="_blank">View Transaction</a> </p>\
				<p> <a href="' + opensea_url + '" class="underline" target="_blank">View on OpenSea</a> &nbsp;&nbsp;  <a href="' + rarible_url + '" class="underline" target="_blank">View on Rarible</a> </p>\
				<p> </p>\
				</div>'
				console.log(response);
			}
		}
		Alpine.store('processingMint', true);
		upload.innerHTML = '<div></div>'
		// upload.innerHTML = '<div class="px-6 py-2 border border-gray-300 shadow rounded-2xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"> Minting your NFT... </div>';
		// remove onclick event
		upload.removeEventListener("click", function (event) {
		});
	});
	li.appendChild(document.createTextNode(" "))//add a space in between
	li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
}

