
let intTimer;
let timeoutTimer;
// method to timeout a recording when it meets the autostop value
const timeoutTimerClass = function (callback, delay)
{
    let timerId, start, remaining = delay;

    this.pause = () => {
        window.clearTimeout(timerId);
        timerId = null;
        remaining -= Date.now() - start;
    };

    this.resume = () => {
        if (timerId) {
        return;
        }
        start = Date.now();
        timerId = window.setTimeout(callback, remaining);
    };
    this.resume();
};

// method to run the timer for video duration which can be paused and resumed
const IntervalTimer = function(callback, interval)
{
    let timerId, startTime, remaining = 0;
    let state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed
    
    this.pause = () => {
        if (state != 1) return;
    
        remaining = interval - (new Date() - startTime);
        window.clearInterval(timerId);
        state = 2;
    };
    
    this.resume = () => {
        if (state != 2) return;
    
        state = 3;
        window.setTimeout(this.timeoutCallback, remaining);
    };
    
    this.timeoutCallback = () => {
        if (state != 3) return;
    
        callback();
    
        startTime = new Date();
        timerId = window.setInterval(callback, interval);
        state = 1;
    };
    
    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
}

class recordScreenSG 
{
    constructor() 
    {
        // let mouseDown = 0;
        // let pos1 = 0;
        // let pos2 = 0;
        this.ctxR = "";
        this.lineLastPoint = "";
        this.imageObjR = "";
        this.annoType = "";
        this.annoEvents = false;
        this.anno_selectedColor = "#ff0000";
        this.VideoDuration = "0:00";
        this.selectedAnno = "";
        this.VideoUpload = false;
        this.audioId = "default";
        this.videoId = "default";
        this.prevSelectionH = 0;
        this.screenW = 0;
        this.screenH = 0;
        this.inPIPMode = false;
        this.limitStopVal = 299;
        this.limitStopStr = "05:00";
        this.recordingType = "";
        this.quix_displayMediaOptions = {};
        this.quix_videoElem = document.createElement('video');
        this.desktop_sharing = false;
        this.local_stream = null;
        this.cam_stream = null;
        this.screen_stream = null;
        this.combine_stream = null;
        this.audioStream = null;
        this.composedStream = null;
        this.screenStream = null;
        this.media_recorder = null;
        this.setTimerInterval = null;
        this.record_crop_startX; 
        this.record_crop_startY;
        this.video_crop = false;
        this.uploadTypeSettings = false;
        this.fullSLoaderINT = '';
        this.setBadgeText = '';
        this.isCancelledRecord = false;

        this.isCameraRecord = true;
        this.isMicrophoneRecord = true;
        this.isPanelRecord = true;
        this.isPlayRecord = true;
        this.userConfirmedClose = false;
        this.recordingStarted = false;

        this.imagesLimit = 30;
        this.videosLimit = 15;

        this.isDevicesAvailable = true;

        this.dragIcon= chrome.runtime.getURL("/images/quix-drag-icon.png");
        this.webcamIcon = chrome.runtime.getURL("/images/quix-webcam-tool.png");
        this.webcamDisIcon = chrome.runtime.getURL("/images/quix-webcam-disabled-tool.png");
        this.microphoneIcon = chrome.runtime.getURL("/images/quix-microphone-icon2.png");
        this.microphoneDisIcon = chrome.runtime.getURL("/images/quix-microphone-disabled-icon.png");
        this.cursorIcon1 = chrome.runtime.getURL("/images/quix-cursor-icon.png");
        this.cursorIcon2 = chrome.runtime.getURL("/images/quix-cursor-icon1.png");
        this.cursorIcon3 = chrome.runtime.getURL("/images/quix-cursor-icon2.png");
        this.cursorIcon4 = chrome.runtime.getURL("/images/quix-cursor-icon3.png");
        this.pencilIcon = chrome.runtime.getURL("/images/quix-pencil-icon.png");
        this.erasorIcon = chrome.runtime.getURL("/images/quix-eraser-icon.png");
        this.arrowLeftIcon = chrome.runtime.getURL("/images/quix-arrow-left-icon.png");
        this.arrowRightIcon = chrome.runtime.getURL("/images/quix-arrow-right-icon.png");
        this.freeLineIcon = chrome.runtime.getURL("/images/quix-free-line-icon.png");
        this.blockIcon = chrome.runtime.getURL("/images/quix-block-icon.png");
        this.arrowToolIcon = chrome.runtime.getURL("/images/quix-for-icon.png");
        this.toolPauseIcon  = chrome.runtime.getURL("/images/quix-tool-pause.png");
        this.toolPlayIcon  = chrome.runtime.getURL("/images/quix-tool-play.png");
        this.vcallIcon = chrome.runtime.getURL("images/quix-video-call-icon.png");
        this.userIcon = chrome.runtime.getURL("images/quix-user-icon.png");
        this.youtubeIcon = chrome.runtime.getURL("images/quix-youtube-icon.png");
        this.GDIcon = chrome.runtime.getURL("images/quix-google-drive-icon.png");
        this.feedbackIcon = chrome.runtime.getURL("images/quix-share-feedback-form.png");
        this.successIcon = chrome.runtime.getURL("/images/quix-success.png");
        this.failureIcon = chrome.runtime.getURL("/images/quix-failure.png");
        this.stopRecIcon = chrome.runtime.getURL("/images/quix-tool-stop.png");
        this.delRecIcon = chrome.runtime.getURL("/images/quix-delete-icon.png");
        this.camSelectIcon = chrome.runtime.getURL("/images/quix-webcam-options.png");
        this.camOp1Icon = chrome.runtime.getURL("/images/quix-webcam-option1.png");
        this.camOp2Icon = chrome.runtime.getURL("/images/quix-webcam-option2.png");
        this.camOp3Icon = chrome.runtime.getURL("/images/quix-webcam-option3.png");
        this.camOp4Icon = chrome.runtime.getURL("/images/quix-webcam-option4.png");
        this.closeIcon = chrome.runtime.getURL("/images/quix-close-icon.png");
        this.blankVideo = chrome.runtime.getURL("/images/blank-video.mp4");
    }

    // to Start screen Recording using mediarecorder
    startRecording = (stream,autostopVal) =>
    {
        //if(this.isCameraRecord){ this.toolbarToggleCam("enabled","load"); }else{ this.toolbarToggleCam("disabled","load"); }
        jQuery("#recorder-wait-overlay").hide();
        if(this.isMicrophoneRecord){ this.toolbarToggleMic("enabled"); }else{ this.toolbarToggleMic("disabled"); }
        chrome.runtime.sendMessage({type:"setIsRecorderStarted"});
        let options = {mimeType:'video/webm;codecs=vp9'};
        this.media_recorder = new MediaRecorder(stream,options);
        // var videoBitsPerSecond = 5 * 1024 * 1024; // 5 Mbps
        // var audioBitsPerSecond = 128000; // 128 Kbps
        // this.media_recorder.videoBitsPerSecond = videoBitsPerSecond;
        // this.media_recorder.audioBitsPerSecond = audioBitsPerSecond;
        let data = [];
        this.media_recorder.ondataavailable = event => data.push(event.data);
        this.media_recorder.start(1000);
        this.media_recorder.onstart = () =>
        {
            jQuery("#recorder-tool-controls .timer-rec").text("00:01");
            this.recordingStarted = true;
            let timer = 1;
            if(autostopVal > 0){ timer = autostopVal; }
            let duration = 0;
            let minutes = 0;
            let seconds = 1;
            intTimer = new IntervalTimer(() =>
            {
                if(autostopVal > 0)
                {
                    --timer; 
                }
                else
                {
                    ++timer;
                }
                if(timer < 0) 
                {
                    timer = 0;
                }
                minutes = parseInt(timer / 60, 10)
                seconds = parseInt(timer % 60, 10);
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;
                let timerStr = minutes + ":" + seconds;
                
                if(this.recordingType != 1)
                { 
                    jQuery("#recorder-tool-controls .timer-rec").text(timerStr); 
                }
                this.VideoDuration = timerStr;
                chrome.runtime.sendMessage({type:"setBadge",badgeText:timerStr,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord});
                chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord,recordingType:this.recordingType,isDevicesAvailable:this.isDevicesAvailable});
                if(this.recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabsTimer",badgeText:this.VideoDuration});}
            }, 1000);

            if(autostopVal > 0)
            {
                autostopVal = parseInt(autostopVal);
                timeoutTimer = new timeoutTimerClass(() => {
                    if(this.recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"});}
                    this.stopScreenRecording();
                }, (autostopVal*1000));
            }
            else
            {
                timeoutTimer = new timeoutTimerClass(() => 
                {
                    this.VideoDuration = this.limitStopStr;
                    chrome.runtime.sendMessage({type:"setBadge",badgeText:this.limitStopStr,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord});
                    chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord,recordingType:this.recordingType,isDevicesAvailable:this.isDevicesAvailable});
                    if(this.recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabsTimer",badgeText:this.VideoDuration});}
                    
                    if(this.recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"});}
                    if(this.recordingType != 1)
                    {
                    jQuery("#recorder-tool-controls .timer-rec").text(this.limitStopStr);
                    }
                    this.stopScreenRecording();
                    //this.stopScreenRecording();
                }, (this.limitStopVal*1000));
            }
        }
        let tracks = stream.getTracks();
        if(tracks.length > 0)
        {
            tracks.forEach((track) => {
            track.onended = () => {
                if(this.recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"}); }
                this.stopScreenRecording();
            };
            });
        }
        let stopped = new Promise((resolve, reject) => 
        {
            this.media_recorder.onstop = resolve;
            this.media_recorder.onerror = event => reject(event.name);
        });
        return Promise.all([
            stopped
        ])
        .then(() => data);
    }

    // method to combine screen and mic streams
    combineMultipleStreams = (screenStream, micStream, callback) =>
    {
        this.composedStream = new MediaStream();
        screenStream.getVideoTracks().forEach((videoTrack) => {
            this.composedStream.addTrack(videoTrack);
        });
        let context = new AudioContext();
        let audioDestinationNode = context.createMediaStreamDestination();
        if (screenStream && screenStream.getAudioTracks().length > 0) {
            //get the audio from the screen stream
            const systemSource = context.createMediaStreamSource(screenStream);

            //set it's volume (from 0.1 to 1.0)
            const systemGain = context.createGain();
            systemGain.gain.value = 1.0;

            //add it to the destination
            systemSource.connect(systemGain).connect(audioDestinationNode);

        }
        if (micStream && micStream.getAudioTracks().length > 0) {
            //get the audio from the microphone stream
            const micSource = context.createMediaStreamSource(micStream);

            //set it's volume
            const micGain = context.createGain();
            micGain.gain.value = 1.0;

            //add it to the destination
            micSource.connect(micGain).connect(audioDestinationNode);
        }

        //add the combined audio stream
        audioDestinationNode.stream.getAudioTracks().forEach((audioTrack) => {
            this.composedStream.addTrack(audioTrack);
        });
        callback(this.composedStream);
    }

    // to start screen recording for all modes 
    quix_startCapture = async (request,currentTab) =>
    {
        let type = request.event;
        this.recordingType = type;
        let isMicrophone = request.isMicrophone;
        let isCamera = request.isCamera;
        let autostopVal = request.autostopVal;
        let qualityVal = request.qualityVal;
        let recordDelay = request.recordDelay;
        let uploadType = request.uploadType;
        if(request.micID !== null && request.micID != ""){ this.audioId = request.micID; }
        if(request.camID !== null && request.camID != ""){ this.videoId = request.camID; }
        if(uploadType != "Local"){ this.VideoUpload = true; } 
        this.isCameraRecord = isCamera;
        // this.isCameraRecord = false;
        this.isMicrophoneRecord = isMicrophone;
        console.log("iscamerarecord",isCamera,   this.isCameraRecord)
        if(qualityVal == "360p"){ this.screenW = 480; this.screenH = 360; }
        else if(qualityVal == "480p"){ this.screenW = 720; this.screenH = 480; }
        else if(qualityVal == "720p"){ this.screenW = 1280; this.screenH = 720; }
        else if(qualityVal == "1080p"){ this.screenW = 1920; this.screenH = 1080; }
        else{ this.screenW = 3840; this.screenH = 2160; }

        if(type == 2) // to record camera only
        {
            this.isCameraRecord = true;
            if(this.recordingType == 1){ chrome.runtime.sendMessage({type:"executeScriptInallTabs",reqType: "displayToolbar",autostopVal: autostopVal,delayD: true,recordDelay: recordDelay, recordingType: this.recordingType,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord});}
            this.displayControls(autostopVal,true,recordDelay, this.isDevicesAvailable, async () =>
            {
            this.recordCameraScreen((stream) => {
                this.startRecording(stream,autostopVal).then (recordedChunks => {
                this.downloadCapturedVideo(recordedChunks);
                });
            });
            });
        }
        else if(type == 3 || type == 4) // to record this tab and select area
        {
            try
            {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                preferCurrentTab: true,
                audio: true,
                video: { 'deviceId': this.videoId, width: { ideal: this.screenW }, height: { ideal: this.screenH }}
            });
            let delay = true;
            if(type == 4)
            {
                delay = false;
            }
            this.displayControls(autostopVal,delay,recordDelay, this.isDevicesAvailable, async () =>
            {
                if(type == 4)
                {
                let cropTarget = await CropTarget.fromElement(document.querySelector(".screen-cap-content")); 
                const [videoTrack] = this.screenStream.getVideoTracks();
                await videoTrack.cropTo(cropTarget);
                }
                if(this.isDevicesAvailable)
                {
                this.audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                    mandatory: {
                        deviceId: this.audioId,
                        }
                    }, 
                    video: false 
                });
                this.combineMultipleStreams(this.screenStream, this.audioStream, (stream) => {
                    this.combine_stream = stream;
                    if(this.isCameraRecord){ this.recordCameraScreen(); }
                    this.startRecording(this.combine_stream,autostopVal).then (recordedChunks => {
                    this.downloadCapturedVideo(recordedChunks);
                    });
                }); 
                }
                else
                {
                this.combine_stream = this.screenStream;
                this.startRecording(this.combine_stream,autostopVal).then (recordedChunks => {
                    this.downloadCapturedVideo(recordedChunks);
                });
                }  
            });
            }
            catch(err)
            {
            console.log(err,"--err--");
            }
        }
        else // to record entire screen
        {
            try
            {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: { mediaSource: 'screen', displaySurface: 'monitor' } });
            if(this.recordingType == 1)
            { 
                chrome.runtime.sendMessage({type:"executeScriptInallTabs",reqType: "displayToolbar",autostopVal: autostopVal,delayD: true,recordDelay: recordDelay, recordingType: this.recordingType,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord});
            }
            this.displayControls(autostopVal, true, recordDelay, this.isDevicesAvailable, async () =>
            {
                if(this.isDevicesAvailable)
                {
                this.audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true, 
                    video: false 
                });
                this.combineMultipleStreams(this.screenStream, this.audioStream, async (stream) =>
                {
                    await chrome.tabs.update(currentTab.id, { active: true, selected: true });
                    this.combine_stream = stream;
                    if(this.isCameraRecord){ this.recordCameraScreen(); }
                    this.startRecording(this.combine_stream,autostopVal).then(recordedChunks => {
                    this.downloadCapturedVideo(recordedChunks);
                    });
                });         
                }
                else
                {
                await chrome.tabs.update(currentTab.id, { active: true, selected: true });
                this.combine_stream = this.screenStream;
                this.startRecording(this.combine_stream,autostopVal).then(recordedChunks => {
                    this.downloadCapturedVideo(recordedChunks);
                });
                }  
            });
            }
            catch(err)
            {
            await chrome.tabs.update(currentTab.id, { active: true, selected: true });
            window.top.close();
            }
        }
    }

    createObjectURL = (object) =>
    {
        return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
    }

    // to display camera stream
    displayCamStream = (stream) =>
    {
        let camPreview = document.getElementById("camera-recording-preview");
        camPreview.srcObject = stream;
        camPreview.play();
    }

    // to close camera stream
    stopCameraScreen = () =>
    {
        if(this.cam_stream && this.cam_stream !== null)
        {
            this.removeCamStreams();
            this.cam_stream = null;
            if(this.recordingType == 1){ this.exitPictureInPicture(); }
        }
    }

    // to start camera stream and picture in picture window
    recordCameraScreen = (callback) =>
    {
        chrome.storage.local.get('isPictureInPicture', async (obj) =>
        {
            if(!obj.isPictureInPicture && this.isCameraRecord)
            {
            if(this.cam_stream === undefined || this.cam_stream === null)
            {
                let camPreview = document.getElementById("camera-recording-preview");
                if(camPreview == undefined && camPreview == null)
                {
                camPreview = document.createElement("video");
                camPreview.id = "camera-recording-preview";
                camPreview.className = "camera-recording-preview";
                camPreview.src = this.blankVideo;
                if(this.recordingType != 1)
                {
                    camPreview.style.display = "none";
                }
                document.getElementsByTagName("body")[0].append(camPreview);
                }
                else
                {
                camPreview.src = this.blankVideo;
                }
                if(this.recordingType == 1)
                { 
                setTimeout(() =>
                { 
                    let data7 = { "isPictureInPicture" : true };
                    chrome.storage.local.set(data7, () =>{});
                    this.enablePictureInPicture();
                    jQuery('#camera-recording-preview').hide();
                },500); 
                }
                else
                {
                jQuery('#camera-recording-preview').show();
                }
                navigator.webkitGetUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            deviceId: this.videoId,
                            width: { ideal: this.screenW }, 
                            height: { ideal: this.screenH },
                            frameRate: { min: 15, ideal: 24, max: 30 }
                        }
                    }
                }, 
                (stream) => 
                {
                    this.cam_stream = stream;
                    camPreview.srcObject = stream;
                    camPreview.play();
                    if(callback && callback !== undefined && typeof callback == 'function'){ callback(stream); }
                },
                (err) => 
                {
                    this.isCameraRecord = false;
                    if(this.recordingType != 1)
                    { 
                    if(this.recordingType == 2)
                    {
                        this.isCancelledRecord = true;
                        this.stopScreenRecording();
                        failureMessagePopup("Recording Failed.", "Recording cannot be started due to lack of permissions.");
                    }
                    else
                    {
                        this.isCameraRecord = false;
                        if(this.recordingType != 1)
                        { 
                        if(this.cam_stream !== undefined && this.cam_stream !== null){ this.cam_stream.getVideoTracks()[0].enabled = false; }
                        jQuery("#video-outer").css({"display":"none","height":0});
                        }
                        jQuery("#floatable-recorder-tool-inner .cam-rec").show();
                        jQuery("#floatable-recorder-tool-inner .cam-rec-disable").hide();
                        this.stopCameraScreen();
                    }
                    }
                    else
                    {
                    this.inPIPMode = true;
                    this.exitPictureInPicture();
                    }
                    jQuery("#floatable-recorder-tool-inner .cam-rec").show();
                    jQuery("#floatable-recorder-tool-inner .cam-rec-disable").hide();
                    console.error(`The following error occurred: ${err.name}`);
                }
                );
            }
            else
            {
                if(callback && callback !== undefined && typeof callback == 'function'){ callback(this.cam_stream); }
            }
            }
            else
            {
                if((this.cam_stream !== undefined || this.cam_stream !== null) && (callback && callback !== undefined && typeof callback == 'function')){ callback(this.cam_stream); }
            }
        });
    }

    // To open picture in picture window
    enablePictureInPicture = async () => 
    {
        try 
        {
            let camPreview = document.getElementById("camera-recording-preview");
            // Check if the Picture-in-Picture API is available on the current browser
            if (document.pictureInPictureEnabled || camPreview.webkitSetPresentationMode) 
            {
            // Request Picture-in-Picture mode for the video
            await camPreview.requestPictureInPicture();
            this.inPIPMode = true;
            let camPreviewOuter = document.getElementById("video-outer");
            if(camPreviewOuter !== null){ camPreviewOuter.style.display = "none"; }
            camPreview.addEventListener('leavepictureinpicture', this.handleVisibilityChange);
            //document.addEventListener('visibilitychange', handleVisibilityChange);
            } 
            else 
            {
            console.log('Picture-in-Picture is not supported in this browser.');
            }
        } 
        catch (error) 
        {
            console.error('Error while entering Picture-in-Picture mode:', error);
        }
    }

    // event to manage if picture and picture window is closed
    handleVisibilityChange = () =>
    {
        if (document.visibilityState === 'visible' && this.inPIPMode) 
        {
            if(this.isCameraRecord)
            { 
            this.toolbarToggleCam("disabled"); 
            }
            this.inPIPMode = false;
            //document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }

    // To exit picture in picture window
    exitPictureInPicture = async () =>
    {
        try 
        {
            if(this.inPIPMode && document.exitPictureInPicture) 
            {
                if(document.pictureInPictureElement) { await document.exitPictureInPicture(); }
                this.inPIPMode = false;
                let data8 = { "isPictureInPicture" : false };
                chrome.storage.local.set(data8, () => {});
                jQuery(".camera-recording-preview").remove();
                chrome.runtime.sendMessage({type:"removeCameraPreview"});
            }
        } catch (error) {
            console.error('Error while exiting Picture-in-Picture mode:', error);
        }
    }

    // To open download video window
    downloadCapturedVideo = (recordedChunks) => 
    {
        if(!this.isCancelledRecord)
        {
            let recordedBlob = new Blob(recordedChunks, { type: "video/webm;codecs=vp9" });
            let videoSize = recordedBlob.size;
            const href =  URL.createObjectURL(recordedBlob);
            chrome.runtime.sendMessage({type:"openDownloadVideoTab",videodata:href,videoSize:videoSize,VideoDuration:this.VideoDuration,VideoUpload:this.VideoUpload});
            setTimeout(() =>{
            if(this.recordingType == 1)
            { 
                //window.top.close(); 
            }
            },2000);
        }
        else
        {
            setTimeout(() =>{
            if(this.recordingType == 1){ window.top.close(); }
            },500);
        }
        this.isCancelledRecord = false;
    }

    // deprecated feature
    startTimer = (duration, callback) =>
    {
        let timer = duration, minutes, seconds;
        this.setTimerInterval = setInterval(() => 
        {
            minutes = parseInt(timer / 60, 10)
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            callback(minutes + ":" + seconds);
            //display.textContent = minutes + ":" + seconds;

            if (++timer < 0) 
            {
                timer = 0;
            }
        }, 1000);
    }

    // request to display camera window next to toolbar 
    displayCameraWindow = (appendTo) =>
    {
        if(appendTo == undefined){ let appendTo = "body"; }
        let camBlock = document.getElementById("video-outer");
        if(camBlock === undefined || camBlock === null)
        {
            let camHTML = "";
            camHTML += '<div id="video-outer">\n\
            <div id="video-inner">';
            let camP = document.getElementById("camera-recording-preview");
            if(camP === undefined || camP === null)
            {
                camHTML += '<video muted id="camera-recording-preview"></video>';
            }
            camHTML += '</div>\n\
            <div id="camera-tool-controls">\n\
                <div id="camera-tool-controls-inner">\n\
                <div id="camera-tool-selector">\n\
                    <span><img src="'+this.camSelectIcon+'"/></span>\n\
                </div>\n\
                <div id="camera-tool-options">\n\
                    <!--<span class="select-camera-option" data-option="1"><img src="'+this.camOp1Icon+'"/></span>-->\n\
                    <span class="select-camera-option" data-option="2"><img src="'+this.camOp2Icon+'"/></span>\n\
                    <span class="select-camera-option" data-option="3"><img src="'+this.camOp3Icon+'"/></span>\n\
                    <span class="select-camera-option" data-option="4"><img src="'+this.camOp4Icon+'"/></span>\n\
                    <div class="sideBar-seperator">|</div>\n\
                    <span class="camera-close-option"><img src="'+this.closeIcon+'"/></span>\n\
                </div>\n\
                </div>\n\
            </div>\n\
            </div>';
            let toolBW = 325;
            let toolX = 20;
            let toolY = 20;
            let offset = {bottom:toolX, right:toolY};
            let newElement$ = $(camHTML)
            .width(toolBW)
            .draggable({
                cancel: "text",
                containment: appendTo,
                start: () =>{
                },
                stop: () =>{
                },
                scroll: false,
                drag: function(e, ui)
                {
                    let self = $(this);
                    let parent = $(appendTo);
                    let pos = self.position();
                    // Adjust for position of parent and border, gives Inner position
                    pos.left = pos.left - parent.offset().left - 2;
                    pos.top = pos.top - parent.offset().top - 2;
                    $("#" + self.data("index")).html("top: " + pos.top + " left:" + pos.left);
                }  
            })
            .css({
            'position': 'absolute'
            })
            .offset(offset)
            .appendTo(appendTo);
        }
    }

    // To display control bar when recording starts
    displayControls = (autostopVal,delay,recordDelay,controls, callback) =>
    {
        this.isDevicesAvailable = controls;
        if(jQuery("#floatable-recorder-tool").length > 0){ return; }
        let html = '';
        
        let htmlWaitOverlay = '';
        let delayVal = null;
        if(recordDelay > 0 && recordDelay !== undefined){ delayVal = recordDelay; }
        html += '<div id="floatable-recorder-tool">\n\
            <div id="floatable-recorder-tool-inner">\n\
            <div id="recorder-tool-controls">\n\
                <div id="recorder-tool-controls-inner">';
                html += '<span class="minimize-rec" title="Minimize Recording"><img src="'+this.arrowLeftIcon+'"/></span>\n\
                    <span class="maximize-rec" title="Maximize Recording"><img src="'+this.arrowRightIcon+'"/></span>\n\
                    <div class="toolbar-option-can-hide">\n\
                    <span class="close-rec" title="Cancel Recording"><img src="'+this.delRecIcon+'"/></span>';
                    if(this.recordingType != "2")
                    {
                        html += '<div class="remove-anno-effects" title="Remove All Annotations">\n\
                            <div class="remove-anno-choose"><span class="remove-all-annotations"><img src="'+this.erasorIcon+'"/></span></div>\n\
                        </div>\n\
                        <div class="anno-effects">\n\
                            <div class="anno-choose"><span title="Annotations"><img src="'+this.pencilIcon+'"/></span><div class="effect-child-options"><span class="anno-free-line" title="Draw Free Hand"><img src="'+this.freeLineIcon+'"/></span><span class="anno-reactangle" title="Draw Reactangle"><img src="'+this.blockIcon+'"/></span><span class="anno-arrow" title="Draw Arrow"><img src="'+this.arrowToolIcon+'"/></span><span title="Annotation Color" class="tool-color tool-color-red" data-color="#ff0000"></span><span title="Annotation Color" class="tool-color tool-color-blue" data-color="#0000ff"></span><span title="Annotation Color" class="tool-color tool-color-green" data-color="#008000"></span></div></div>\n\
                        </div>\n\
                        <div class="arrow-effects">\n\
                            <div class="arrow-effect-choose"><span title="Arrow Effects"><img src="'+this.cursorIcon1+'"/></span><div class="effect-child-options"><span class="arrow-spotlight" title="Spotlight Arrow"><img src="'+this.cursorIcon4+'"/></span><span class="arrow-highlight-click" title="Click Arrow"><img src="'+this.cursorIcon3+'"/></span><span class="arrow-highlight-mouse" title="Mouse Highlight Arrow"><img src="'+this.cursorIcon2+'"/></span><span class="arrow-default" title="Simple Arrow"><img src="'+this.cursorIcon1+'"/></span></div></div>\n\
                        </div>\n\
                        <div class="sideBar-seperator">|</div>';
                    }
                    html += '<span class="mic-rec-disable" title="Disable Microphone"><img src="'+this.microphoneIcon+'"/></span>\n\
                    <span class="mic-rec" title="Enable Microphone"><img src="'+this.microphoneDisIcon+'"/></span>';
                    if(this.recordingType != "2")
                    {
                        html += '<span class="cam-rec-disable" title="Disable Camera"><img src="'+this.webcamIcon+'"/></span>\n\
                    <span class="cam-rec" title="Enable Camera"><img src="'+this.webcamDisIcon+'"/></span>';
                    }
                    html += '<span class="stop-rec" title="Stop Recording"><img src="'+this.stopRecIcon+'"/></span>\n\
                    <span class="play-rec" title="Pause Recording"><img src="'+this.toolPlayIcon+'"/></span>\n\
                    <span class="pause-rec" title="Resume Recording"><img src="'+this.toolPauseIcon+'"/></span>\n\
                    </div>\n\
                <span class="timer-rec">00.00</span>\n\
                <span class="drag-icon"><img src="'+this.dragIcon+'"/></span>\n\
                </div>\n\
                <div id="recorder-tool-custom-tab">\n\
                <span id="custom-tab-start-recording"><img src="'+this.toolPlayIcon+'"/></span>\n\
                <span id="custom-tab-cancel-recording"><img src="'+this.closeIcon+'"/></span>\n\
                </div>\n\
            </div>\n\
            <div class="close-toobar" title="Close toolbar"><img src="'+this.closeIcon+'"/></div>\n\
            </div>\n\
        </div>';
        if(delay)
        {
            if(recordDelay !== undefined)
            {
            
            htmlWaitOverlay += '<div id="recorder-wait-overlay">\n\
                <div class="recorder-wait-overlay-inner">\n\
                <p>Your Screen Recording will start in <span class="timer-span">'+delayVal+'</span> seconds <span class="loader__dot">.</span><span class="loader__dot">.</span><span class="loader__dot">.</span></p>\n\
                </div>\n\
            </div><div id="floatable-recorder-tool-container"></div><div id="floatable-recorder-camera-container"></div>';
            jQuery("#floatable-recorder-tool").remove();
            jQuery("#video-outer").remove();
            jQuery("#recorder-wait-overlay").remove();
            jQuery("body").append(htmlWaitOverlay);
            this.delayBeforeRecording(delayVal,() =>{
                this.controlBarCallbacks("normal",html,delayVal,autostopVal,callback);
                this.controlBarButtonCallbacks(delayVal,autostopVal,callback);
            });
            }
            else
            {
            let inHTML = '<div id="recorder-wait-overlay"></div><div id="floatable-recorder-tool-container"></div><div id="floatable-recorder-camera-container"></div>';
            jQuery("body").append(inHTML);
            this.controlBarCallbacks("normal",html,delayVal,autostopVal,callback);
            this.controlBarButtonCallbacks(delayVal,autostopVal,callback);
            }
        }
        else
        {
            //delayVal = 1000;
            htmlWaitOverlay += '<div id="selected-screen-capture"><div id="selected-screen-capture-inner"><div class="screen-cap-top"></div><div class="screen-cap-right"></div><div class="screen-cap-left"></div><div class="screen-cap-bottom"></div><div class="screen-cap-content"></div></div></div><div id="floatable-recorder-tool-container"></div><div id="floatable-recorder-camera-container"></div>';
            jQuery("#floatable-recorder-tool").remove();
            jQuery("#video-outer").remove();
            jQuery("#recorder-wait-overlay").remove();
            jQuery("body").append(htmlWaitOverlay);
            this.controlBarCallbacks("custom",html,delayVal,autostopVal,callback);
        }
    }

    // to adjust camera position in toolbar 
    putCamOptionCenter = () =>
    {
        let camWid = jQuery("#video-outer").width();
        if(camWid < 0){ camWid = 325; }
        let camLeft = ((camWid/2)-20);
        if(this.recordingType != 1){ jQuery("#camera-tool-selector").css({"left":camLeft+"px"}); }
        jQuery("#camera-tool-options").hide();
    }

    // to adjust height of camera in toolbar
    assignCorrectVidHeight = () =>
    {
        let topVal = parseInt(jQuery("#floatable-recorder-tool").css("top"));
        let hh = 0;
        if(jQuery("#video-outer").hasClass("camera-view-1")){ hh = 75;}
        if(jQuery("#video-outer").hasClass("camera-view-2")){ hh = 125;}
        if(jQuery("#video-outer").hasClass("camera-view-3")){ hh = 200;}
        if(jQuery("#video-outer").hasClass("camera-view-4")){ hh = 206;}
        
        let hDiff = this.prevSelectionH-hh;
        let topM = topVal+hDiff;


        if(topM < 0){ topM = 0;}
        if(this.recordingType != 1)
        { 
            let camHeight = parseInt(jQuery("#camera-recording-preview").height());
            let toolTop = parseInt(jQuery("#floatable-recorder-tool").css("top"));
            let toolTopPos = toolTop - camHeight; 
            // if(load === undefined)
            // { 
            jQuery("#floatable-recorder-tool").css({"top":toolTopPos,"bottom": "unset"}); 
            // }
            jQuery("#floatable-recorder-tool-inner #video-outer").css({"height":hh});
        }
        jQuery("#floatable-recorder-tool").css({"top":topVal,"bottom": "unset"});
        if(this.prevSelectionH == 0)
        {
            this.prevSelectionH = hh;
        }
    }

    // callback methods for toolbar buttons
    controlBarButtonCallbacks = (delayVal,autostopVal,callback) =>
    {
        if(this.isCameraRecord && this.recordingType != 1)
        {
            jQuery("#video-outer").css({"display":"block","height":"auto"});
            // if(this.recordingType != 1 && this.recordingType != 2){ jQuery("#camera-tool-controls").show(); }
        }
        if(this.recordingType != 1 && this.recordingType != 2)
        { 
            if(callback && callback !== undefined){ callback(); }
        }
        else
        {
            if(callback && callback !== undefined){ callback(); }
        }
        jQuery("#floatable-recorder-tool").show();
        // jQuery("#video-outer").show();
        jQuery("#recorder-wait-overlay").hide();

        jQuery("#camera-tool-selector span").unbind("click");
        jQuery("#camera-tool-selector span").on("click",() =>{
            jQuery("#camera-tool-options").show();
        });

        jQuery("#video-outer").unbind("mouseover");
        jQuery("#video-outer").on("mouseover",() =>{
            jQuery("#camera-tool-controls").show();
        });

        jQuery("#video-outer").unbind("mouseout");
        jQuery("#video-outer").on("mouseout",() =>{
            jQuery("#camera-tool-controls").hide();
        });

        jQuery("#camera-tool-options img").unbind("click");
        jQuery("#camera-tool-options img").on("click",(elem) =>{
            let camOption = jQuery(elem.currentTarget).parent("span").attr("data-option");
            if(camOption !== undefined)
            {
                jQuery("#video-outer").removeAttr('class');
                jQuery("#video-outer").addClass("camera-view-"+camOption);
                this.assignCorrectVidHeight();   
                if(this.recordingType != 1){ this.putCamOptionCenter(); }
            }
        });

        jQuery(".camera-close-option").unbind("click");
        jQuery(".camera-close-option").on("click",() =>{
            jQuery("#camera-tool-options").hide();
        });

        jQuery("#floatable-recorder-tool-inner .close-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .close-rec").on("click", () =>{
            this.cancelScreenRecording();
        });

        jQuery(".arrow-effects .effect-child-options span").unbind("click");
        jQuery(".arrow-effects .effect-child-options span").on("click", (elm) =>
        {
            let elem = "body";
            //if(this.recordingType == 5){ elem = ".screen-cap-content"; }
            jQuery("#draw-recording-anno").css({"pointer-events":"none"});
            this.mouseAnnoEvents();
            let shape = "";
            jQuery(".shape-highlight-mouse").remove();
            jQuery(".shape-highlight-click").remove();
            jQuery(".arrow-spotlight-outer").remove();
            jQuery(elem).unbind("mousemove");
            jQuery(elem).unbind("mousedown");
            jQuery(elem).unbind("mouseup");
            if(jQuery(elm.currentTarget).hasClass("arrow-highlight-mouse"))
            {
                shape = '<div class="shape-highlight-mouse"></div>';
                jQuery(elem).append(shape);
                jQuery(elem).unbind("mousemove");
                jQuery(elem).on("mousemove",(e) => {
                    let top = e.pageY-15;
                    let left = e.pageX-15;
                    jQuery(".shape-highlight-mouse").css({"top":top,"left":left});
                });
            }
            else if(jQuery(elm.currentTarget).hasClass("arrow-highlight-click"))
            {
                shape = '<div class="shape-highlight-click"></div>';
                jQuery(elem).append(shape);
                jQuery(elem).unbind("mousemove");
                jQuery(elem).on("mousemove",(e) => {
                    let top = e.pageY-15;
                    let left = e.pageX-15;
                    jQuery(".shape-highlight-click").css({"top":top,"left":left});
                });
                jQuery(elem).unbind("mousedown");
                jQuery(elem).on("mousedown",(e) => {
                    jQuery(".shape-highlight-click").show();
                });
                jQuery(elem).unbind("mouseup");
                jQuery(elem).on("mouseup",(e) => {
                    jQuery(".shape-highlight-click").hide();
                });
            }
            else if(jQuery(elm.currentTarget).hasClass("arrow-spotlight"))
            {
                shape = '<div class="arrow-spotlight-outer"><div class="arrow-spotlight-cursor"></div></div>';
                jQuery(elem).append(shape);
                jQuery(elem).on("mousemove",(e) => {
                    let top = e.pageY-50;
                    let left = e.pageX-50;
                    jQuery(".arrow-spotlight-cursor").css({"top":top,"left":left});
                });
            }
        });

        jQuery(".anno-effects .effect-child-options span").unbind("click");
        jQuery(".anno-effects .effect-child-options span").on("click", (elem) =>
        {
            if(jQuery(elem.currentTarget).hasClass("anno-free-line"))
            {
            this.drawRecordingAnnotation("Line");
            }
            else if(jQuery(elem.currentTarget).hasClass("anno-reactangle"))
            {
            this.drawRecordingAnnotation("Reactangle");
            }
            else
            {
            this.drawRecordingAnnotation("Arrow");
            }
        });

        jQuery("#floatable-recorder-tool-inner .minimize-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .minimize-rec").on("click", () =>
        {
            jQuery(".toolbar-option-can-hide").hide();
            jQuery("#floatable-recorder-tool-inner .minimize-rec").hide();
            jQuery("#floatable-recorder-tool").css({"width":"145px"});
            jQuery("#floatable-recorder-tool-inner .maximize-rec").show();
        });

        jQuery("#floatable-recorder-tool-inner .maximize-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .maximize-rec").on("click", () =>{
            jQuery(".toolbar-option-can-hide").show();
            jQuery("#floatable-recorder-tool-inner .minimize-rec").show();
            if(this.recordingType != "2")
            {
            jQuery("#floatable-recorder-tool").css({"width":"450px"});
            }
            else
            {
            jQuery("#floatable-recorder-tool").css({"width":"285px"});
            }
            jQuery("#floatable-recorder-tool-inner .maximize-rec").hide();
        });

        jQuery("#floatable-recorder-tool-inner .stop-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .stop-rec").on("click", () =>
        {
            if(this.recordingType == 1){ chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"}); }
            this.stopScreenRecording();
        });

        jQuery("#floatable-recorder-tool-inner .cam-rec-disable").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec-disable").on("click", () =>{
            if(this.isDevicesAvailable){ this.toolbarToggleCam("disabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .mic-rec-disable").unbind("click");
        jQuery("#floatable-recorder-tool-inner .mic-rec-disable").on("click", () =>{
            if(this.isDevicesAvailable){ this.toolbarToggleMic("disabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .cam-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec").on("click", () =>{
            if(this.isDevicesAvailable){ this.toolbarToggleCam("enabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .mic-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .mic-rec").on("click", () =>{
            if(this.isDevicesAvailable){ this.toolbarToggleMic("enabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .play-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .play-rec").on("click", () =>{
            this.toolbarPlayPause("play");
        });

        jQuery("#floatable-recorder-tool-inner .pause-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .pause-rec").on("click", () =>{
            this.toolbarPlayPause("pause");
        });

        jQuery(".close-toobar").unbind("click");
        jQuery(".close-toobar").on("click", () =>{
            this.hidePanelRecording("disabled");
        });

        jQuery(".remove-all-annotations").unbind("click");
        jQuery(".remove-all-annotations").on("click", () =>{
            this.removeAnnotations();
        });

        jQuery(".tool-color").unbind("click");
        jQuery(".tool-color").on("click", (elem) =>{
            let selectedColor = jQuery(elem.currentTarget).attr("data-color");
            this.anno_selectedColor = selectedColor;
        });
    }

    // To open recording toolbar and add events to different buttons
    controlBarCallbacks = (type,html,delayVal,autostopVal,callback) =>
    {
        let toolBW = 285;
        let toolBH = 40;
        if(this.recordingType != "2")
        {
            toolBW = 450;
        }
        let toolX = 20;
        let toolY = 20;
        if(type == "custom")
        {
            toolBW = 76;
        }
        let offset = {bottom:toolX, left:toolY};
        this.displayCameraWindow("#floatable-recorder-camera-container");
        let newElement$ = $(html)
        .width(toolBW)
        .draggable({
            cancel: "text",
            containment: "#floatable-recorder-tool-container",
            start: () =>{
                jQuery("#floatable-recorder-tool").css({"bottom":"unset"});
            },
            stop: () =>{
            },
            scroll: false,
            drag: (e, ui) => {
                let self = $(this);
                let parent = $("#floatable-recorder-tool-container");
                let pos = self.position();
                // Adjust for position of parent and border, gives Inner position
                pos.left = pos.left - parent.offset().left - 2;
                pos.top = pos.top - parent.offset().top - 2;
                $("#" + self.data("index")).html("top: " + (pos.top) + " left:" + (pos.left));
            }  
        })
        .css({
            'position': 'fixed'
        })
        .offset(offset)
        .appendTo('#floatable-recorder-tool-container');
        if(this.recordingType != 1){ if(type != "custom"){ jQuery("#video-outer").addClass("camera-view-3"); this.prevSelectionH = 206; } }
        this.recorderControlPanelStates();
        if(this.recordingType != 1){ this.putCamOptionCenter(); }

        jQuery("#custom-tab-cancel-recording").unbind("click");
        jQuery("#custom-tab-cancel-recording").on("click", () =>
        {
            jQuery("#selected-screen-capture").remove();
            jQuery("#floatable-recorder-tool-container").remove();
            jQuery("#floatable-recorder-camera-container").remove();
            this.isCancelledRecord = true;
            if(this.recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "cancelToolbar"}); }
            this.stopScreenRecording();
        });

        jQuery("#custom-tab-start-recording").unbind("click");
        jQuery("#custom-tab-start-recording").on("click", () =>
        {
            let htmlWaitOverlay = "";
            htmlWaitOverlay += '<div id="recorder-wait-overlay">\n\
            <div class="recorder-wait-overlay-inner">\n\
                <p>Your Screen Recording will start in <span class="timer-span">'+delayVal+'</span> seconds <span class="loader__dot">.</span><span class="loader__dot">.</span><span class="loader__dot">.</span></p>\n\
            </div>\n\
            </div>';
            jQuery(".screen-cap-content").append(htmlWaitOverlay);
            this.delayBeforeRecording(delayVal,() =>
            {
            jQuery("#selected-screen-capture-inner").css({"pointer-events":"none"});
            jQuery("#recorder-tool-controls-inner").show();
            jQuery("#camera-recording-preview").show();
            // if(this.recordingType != 1 && this.recordingType != 2){ jQuery("#camera-tool-controls").show(); }
            jQuery(".close-toobar").show();
            jQuery("#recorder-tool-custom-tab").hide();
            jQuery("#floatable-recorder-tool").remove();
            jQuery("#video-outer").remove();
            let toolBW = 285;
            if(this.recordingType != "2")
            {
                toolBW = 450;
            }
            let toolX = 20;
            let toolY = 20;
            let offset = {bottom:toolY, left:toolX};
            let appendTo = ".screen-cap-content";
            let isDraggable = false;
            if(parseInt(jQuery(".screen-cap-content").css("width"))+50 < toolBW || parseInt(jQuery(".screen-cap-content").css("height"))+50 < 265)
            {
                appendTo = "#floatable-recorder-tool-container";
                isDraggable = true;
            }
            this.displayCameraWindow(appendTo);
            let newElement$ = $(html)
            .width(toolBW)
            .draggable({
                disabled: isDraggable,
                cancel: "text",
                containment: appendTo,
                start: () =>{
                    jQuery("#floatable-recorder-tool").css({"bottom":"unset"});
                },
                stop: () =>{
                },
                scroll: false,
                drag: (e, ui) => {
                    let self = $(this);
                    let parent = $(appendTo);
                    let pos = self.position();
                    // Adjust for position of parent and border, gives Inner position
                    pos.left = pos.left - parent.offset().left - 2;
                    pos.top = pos.top - parent.offset().top - 2;
                    $("#" + self.data("index")).html("top: " + pos.top + " left:" + pos.left);
                } 
            })
            .css({
                'position': 'absolute'
            })
            .offset(offset)
            .appendTo(appendTo);
            let capW = parseInt(jQuery(".screen-cap-content").css("width"));
            if(capW < 750)
            {
            //   toolBW = 310;
            //   // setTimeout(() =>
            //   // {
            //   //   jQuery(".anno-effects").hide();
            //   //   jQuery(".arrow-effects").hide();
            //   //   jQuery(".sideBar-seperator").hide();
            //   //   jQuery(".remove-anno-effects").hide();
            //   // },1000);
                jQuery("#video-outer").css({"bottom": "75px"});
            }
            if(appendTo == "#floatable-recorder-tool-container")
            {
                toolX = parseInt(jQuery(".screen-cap-content").css("left"));
                toolY = parseInt(jQuery(".screen-cap-content").css("top")) + parseInt(jQuery(".screen-cap-content").css("height"))-130;
                jQuery("#floatable-recorder-tool").css({"top": toolY+'px', "left": toolX+'px'});
                if(this.recordingType != 1){ jQuery("#video-outer").addClass("camera-view-2"); }
                this.prevSelectionH = 125;
            }
            else
            {
                if(this.recordingType != 1){ jQuery("#video-outer").addClass("camera-view-3"); }
                this.prevSelectionH = 206;
            }
            if(this.recordingType != 1){ this.putCamOptionCenter(); }
            this.recorderControlPanelStates();
            this.controlBarButtonCallbacks(delayVal,autostopVal,callback);
            });
        });

        
        jQuery("#selected-screen-capture-inner").unbind("mousedown");
        jQuery("#selected-screen-capture-inner").on("mousedown", (e) =>
        {
            this.video_crop = true;
            this.record_crop_startX = e.clientX;
            this.record_crop_startY = e.clientY;
        });

        jQuery("#selected-screen-capture-inner").unbind("mousemove");
        jQuery("#selected-screen-capture-inner").on("mousemove", (e) =>
        {
            if(this.video_crop)
            {
            jQuery("#selected-screen-capture-inner").css({"background-color": "transparent"});
            let winW = jQuery(e.currentTarget).width();
            let winH = jQuery(e.currentTarget).height();
            if(!jQuery("#dimensions-message").length)
            {
                jQuery(".screen-cap-content").html('<span id="dimensions-message">0*0 (min. 500*350)</span>');
            }
            let contentW = (e.clientX - this.record_crop_startX);
            let contentH = (e.clientY - this.record_crop_startY);
            
            jQuery("#dimensions-message").html(contentW+"*"+contentH+" (min. 500*350)");

            let contentT = this.record_crop_startY;
            let contentL = this.record_crop_startX;

            let topW = (this.record_crop_startX+contentW);
            let topH = this.record_crop_startY;

            let rightW = (winW-topW);
            let rightH = (topH+contentH);

            let leftW = this.record_crop_startX;
            let leftH = (winH-topH);
        
            let bottomW = (winW-leftW);
            let bottomH = (winH-rightH);

            contentW = contentW+"px";
            contentH = contentH+"px";
            contentT = contentT+"px";
            contentL = contentL+"px";
            topW = topW+"px";
            topH = topH+"px";
            rightW = rightW+"px";
            rightH = rightH+"px";
            leftW = leftW+"px";
            leftH = leftH+"px";
            bottomW = bottomW+"px";
            bottomH = bottomH+"px";

            jQuery(".screen-cap-top").css({"width": topW,"height":topH});
            jQuery(".screen-cap-right").css({"width": rightW,"height":rightH});
            jQuery(".screen-cap-left").css({"width": leftW,"height":leftH});
            jQuery(".screen-cap-bottom").css({"width": bottomW,"height":bottomH});
            jQuery(".screen-cap-content").css({"width": contentW,"height":contentH,"z-index": 2,"top": contentT,"left":contentL});
            }
        });
        jQuery("#selected-screen-capture-inner").unbind("mouseup");
        jQuery("#selected-screen-capture-inner").on("mouseup", () =>
        {
            let capW = parseInt(jQuery(".screen-cap-content").css("width"));
            let capH = parseInt(jQuery(".screen-cap-content").css("height"));
            if(capW < 500 || capH < 350)
            {
            this.video_crop = false;
            jQuery("#selected-screen-capture-inner").css({"background-color": "rgba(0, 0, 0, 0.3)"});
            jQuery(".screen-cap-top").css({"width": 0,"height":0});
            jQuery(".screen-cap-right").css({"width": 0,"height":0});
            jQuery(".screen-cap-left").css({"width": 0,"height":0});
            jQuery(".screen-cap-bottom").css({"width": 0,"height":0});
            jQuery(".screen-cap-content").css({"width": 0,"height":0,"z-index": 2,"top": 0,"left":0});
            alert("Selction must be more than 500*350.");
            return;
            }
            this.video_crop = false;
            jQuery("#recorder-tool-controls-inner").hide();
            jQuery("#camera-recording-preview").hide();
            // if(this.recordingType != 1 && this.recordingType != 2){ jQuery("#camera-tool-controls").hide(); }
            jQuery(".close-toobar").hide();
            jQuery("#recorder-tool-custom-tab").show();
            let toolX = 0;
            let toolY = 0;
            if(this.recordingType == "5")
            {
            toolX = (parseInt(jQuery(".screen-cap-content").css("left")) + parseInt(jQuery(".screen-cap-content").css("width")))-130;
            toolY = parseInt(jQuery(".screen-cap-content").css("top")) + parseInt(jQuery(".screen-cap-content").css("height"));
            }
            else
            {
            toolX = parseInt(jQuery(".screen-cap-content").css("left"));
            toolY = parseInt(jQuery(".screen-cap-content").css("top")) + parseInt(jQuery(".screen-cap-content").css("height"));
            }
            jQuery("#floatable-recorder-tool").css({"top": (toolY-45)+'px', "left": (toolX+5)+'px'});
            jQuery("#floatable-recorder-tool").show();
            if(this.isCameraRecord){ jQuery("#video-outer").show(); }
            jQuery("#selected-screen-capture-inner").unbind("mouseup");
            jQuery("#selected-screen-capture-inner").unbind("mousedown");
            jQuery("#selected-screen-capture-inner").unbind("mousemove");
        });
    }

    // To manage camera and mic toolbar states as per user gesture
    recorderControlPanelStates = () =>
    {
        if(this.isCameraRecord){ jQuery(".cam-rec-disable").show(); jQuery(".cam-rec").hide(); }else{ jQuery(".cam-rec-disable").hide(); jQuery(".cam-rec").show(); }
        if(this.isMicrophoneRecord){ jQuery(".mic-rec-disable").show(); jQuery(".mic-rec").hide(); }else{ jQuery(".mic-rec-disable").hide(); jQuery(".mic-rec").show(); }
    }

    // add deplay before starting of recording
    delayBeforeRecording = (delayVal,callback) =>
    {
        let intervalStart = delayVal;
        let delayTimer = setInterval(() =>{
            intervalStart = intervalStart-1;
            if(intervalStart > 0)
            {
            jQuery(".recorder-wait-overlay-inner .timer-span").text(intervalStart);
            }
            else
            {
            callback();
            clearInterval(delayTimer);
            }
        },1000);
    }

    // To cancel screen recording 
    cancelScreenRecording = (load) =>
    {
        this.isCancelledRecord = true;
        if((this.recordingType == 1) && load === undefined){ chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "cancelToolbar"}); }
        this.stopScreenRecording();
    }

    // to hide control panel including camera
    hidePanelRecording = (type,load) =>
    {
        if(type == "disabled")
        {
            this.isPanelRecord = false;
            jQuery("#floatable-recorder-tool").hide();
            jQuery("#video-outer").hide();
        }
        else
        {
            this.isPanelRecord = true;
            jQuery("#floatable-recorder-tool").show();
            jQuery("#video-outer").show();
        }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord,recordingType:this.recordingType,isDevicesAvailable:this.isDevicesAvailable});
        if((this.recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"panel",reqVal:this.isPanelRecord});}
    }

    // to remove all annotations from screen recording
    removeAnnotations = () =>
    {
        let c = document.getElementById("draw-recording-anno");
        this.ctxR = c.getContext("2d");
        this.ctxR.beginPath();
        this.ctxR.clearRect(0, 0, c.width, c.height);
        this.ctxR.beginPath();
        this.imageObjR.src = c.toDataURL("image/png",1);
    }

    // To stop screen recording on user command
    stopScreenRecording = () =>
    {
        this.recordingStarted = false;
        if(intTimer)
        { intTimer.pause(); }
        if(timeoutTimer)
        { timeoutTimer.pause(); }

        if(this.media_recorder  && this.media_recorder !== null)
        {
            this.media_recorder.stop();
        }
        this.removeStreams();
        chrome.runtime.sendMessage({type:"unsetBadge"});
        this.resetControlBarEvents();
        this.stopCameraScreen();
    }

    // To delete camera stream from browser window/tab
    removeCamStreams = () =>
    {
        if(this.cam_stream && this.cam_stream !== null)
        {
            let tracks = this.cam_stream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }
    }

    // To delete all media streams from browser window/tab
    removeStreams = () =>
    {
        if(this.composedStream && this.composedStream !== null)
        {
            let tracks = this.composedStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }
        
        if(this.audioStream && this.audioStream !== null)
        {
            let tracks = this.audioStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }

        if(this.screenStream && this.screenStream !== null)
        {
            let tracks = this.screenStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }

        if(this.combine_stream && this.combine_stream !== null)
        {
            let tracks = this.combine_stream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }
    }

    // To remove all mouse events from different elements
    resetControlBarEvents = () =>
    {
        jQuery("#floatable-recorder-tool-inner .play-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .pause-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .mic-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec-disable").unbind("click");
        jQuery("#floatable-recorder-tool-inner .stop-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .maximize-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .minimize-rec").unbind("click");
        jQuery(".remove-anno-effects .effect-child-options span").unbind("click");
        jQuery(".anno-effects .effect-child-options span").unbind("click");
        jQuery(".arrow-effects .effect-child-options span").unbind("click");
        jQuery("#floatable-recorder-tool-inner .close-rec").unbind("click");
        jQuery("#selected-screen-capture-inner").unbind("mousedown");
        jQuery("#selected-screen-capture-inner").unbind("mousemove");
        jQuery("#selected-screen-capture-inner").unbind("mouseup");
        if(jQuery("#draw-recording-anno")){ jQuery("#draw-recording-anno").remove(); }
        if(jQuery(".shape-highlight-mouse")){ jQuery(".shape-highlight-mouse").remove(); }
        if(jQuery(".shape-highlight-click")){ jQuery(".shape-highlight-click").remove(); }
        if(jQuery(".arrow-spotlight-outer")){ jQuery(".arrow-spotlight-outer").remove(); }
        if(jQuery("#floatable-recorder-tool")){ jQuery("#floatable-recorder-tool").remove(); }
        if(jQuery("#video-outer")){ jQuery("#video-outer").remove(); }
        if(jQuery("#selected-screen-capture")){ jQuery("#selected-screen-capture").remove(); }
        if(jQuery("#recorder-wait-overlay")){ jQuery("#recorder-wait-overlay").remove(); }
        this.mouseAnnoEvents();
    }

    // To remove events of arrow annotation
    removeArrowEvents = () =>
    {
        if(jQuery(".shape-highlight-mouse")){ jQuery(".shape-highlight-mouse").remove(); }
        if(jQuery(".shape-highlight-click")){ jQuery(".shape-highlight-click").remove(); }
        if(jQuery(".arrow-spotlight-outer")){ jQuery(".arrow-spotlight-outer").remove(); }
    }

    // To remove mouse events for annotations
    mouseAnnoEvents = () =>
    {
        let elem = "body";
        //if(this.recordingType == 5){ elem = ".screen-cap-content"; }
        jQuery(elem).unbind("mousemove");
        jQuery(elem).unbind("mousedown");
        jQuery(elem).unbind("mouseup");
        if(document.getElementById("draw-recording-anno"))
        {
            document.getElementById("draw-recording-anno").removeEventListener('mousedown', this.mouseDownLine);
            document.getElementById("draw-recording-anno").removeEventListener('mouseup', this.mouseUpLine);
            document.getElementById("draw-recording-anno").removeEventListener('mousemove', this.mouseMoveLine);
        }
        this.annoEvents = false;
    }

    // to toggle camera as per user gesture
    toolbarToggleCam = (type,load) =>
    {
        let hh = 0;
        if(jQuery("#video-outer").hasClass("camera-view-1")){ hh = 75;}
        if(jQuery("#video-outer").hasClass("camera-view-2")){ hh = 125;}
        if(jQuery("#video-outer").hasClass("camera-view-3")){ hh = 200;}
        if(jQuery("#video-outer").hasClass("camera-view-4")){ hh = 206;}
        if(type == "disabled")
        {
            let camHeight = parseInt(jQuery("#camera-recording-preview").height());
            let toolTop = parseInt(jQuery("#floatable-recorder-tool").css("top"));
            let toolTopPos = toolTop + camHeight; 

            this.isCameraRecord = false;
            if(this.recordingType != 1)
            { 
            if(this.cam_stream !== undefined && this.cam_stream !== null){ this.cam_stream.getVideoTracks()[0].enabled = false; }
            // jQuery("#camera-recording-preview").css({"visibility":"hidden","height":0});
            jQuery("#video-outer").css({"display":"none","height":0});
            // jQuery("#camera-tool-controls").hide();
            }
            jQuery("#floatable-recorder-tool-inner .cam-rec").show();
            jQuery("#floatable-recorder-tool-inner .cam-rec-disable").hide();
            this.stopCameraScreen();
        }
        else
        {
            this.isCameraRecord = true;
            if(this.recordingType != 1)
            { 
            // jQuery("#camera-recording-preview").css({"visibility":"visible","height":"auto"});
            jQuery("#video-outer").css({"display":"block"});
            this.assignCorrectVidHeight();
            // jQuery("#camera-tool-controls").show();
            if(this.cam_stream !== undefined && this.cam_stream !== null){ this.cam_stream.getVideoTracks()[0].enabled = true; }
            }
            jQuery("#floatable-recorder-tool-inner .cam-rec").hide();
            jQuery("#floatable-recorder-tool-inner .cam-rec-disable").show();
            if(load === undefined){ this.recordCameraScreen(); }
        }
        
        // if(toolTopPos < 0){ toolTopPos = 0;}
        // if(load === undefined){ jQuery("#floatable-recorder-tool").css({"top":toolTopPos,"bottom": "unset"}); }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord,recordingType:this.recordingType,isDevicesAvailable:this.isDevicesAvailable});
        if((this.recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"cam",reqVal:this.isCameraRecord});}
    }

    // to toggle microphone as per user gesture
    toolbarToggleMic = (type,load) =>
    {
        if(type == "disabled")
        {
            this.isMicrophoneRecord = false;
            if(this.audioStream !== undefined && this.audioStream !== null){ this.audioStream.getAudioTracks()[0].enabled = false; }
            jQuery("#floatable-recorder-tool-inner .mic-rec").show();
            jQuery("#floatable-recorder-tool-inner .mic-rec-disable").hide();
        }
        else
        {
            this.isMicrophoneRecord = true;
            if(this.audioStream !== undefined && this.audioStream !== null){ this.audioStream.getAudioTracks()[0].enabled = true; }
            jQuery("#floatable-recorder-tool-inner .mic-rec").hide();
            jQuery("#floatable-recorder-tool-inner .mic-rec-disable").show();
        }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord,recordingType:this.recordingType,isDevicesAvailable:this.isDevicesAvailable});
        if((this.recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"mic",reqVal:this.isMicrophoneRecord});}
    }

    // to toggle play/pause as per user gesture
    toolbarPlayPause = (type,load) =>
    {
        if(type == "play")
        {
            this.isPlayRecord = true;
            if(this.media_recorder && this.media_recorder !== null)
            {
                if(intTimer)
                { intTimer.resume(); }
                this.media_recorder.resume();
                if(timeoutTimer)
                { timeoutTimer.resume(); }
            }
            if(this.recordingType != "2")
            {
                jQuery("#floatable-recorder-tool").css({"width":"450px"});
            }
            else
            {
                jQuery("#floatable-recorder-tool").css({"width":"285px"});
            }
            jQuery("#floatable-recorder-tool-inner .play-rec").hide();
            jQuery("#floatable-recorder-tool-inner .pause-rec").show();
            // jQuery("#floatable-recorder-tool-inner .stop-rec").hide();
            // jQuery("#floatable-recorder-tool-inner .close-rec").hide();
        }
        else
        {
            this.isPlayRecord = false;
            if(this.media_recorder && this.media_recorder !== null)
            {
                if(intTimer)
                { intTimer.pause(); }
                this.media_recorder.pause();
                if(timeoutTimer)
                { timeoutTimer.pause(); }
            }
            if(this.recordingType != "2")
            {
                jQuery("#floatable-recorder-tool").css({"width":"450px"});
            }
            else
            {
                jQuery("#floatable-recorder-tool").css({"width":"285px"});
            }
            jQuery("#floatable-recorder-tool-inner .pause-rec").hide();
            jQuery("#floatable-recorder-tool-inner .play-rec").show();
            // jQuery("#floatable-recorder-tool-inner .stop-rec").show();
            // jQuery("#floatable-recorder-tool-inner .close-rec").show();
        }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:this.isCameraRecord,isMicrophone:this.isMicrophoneRecord,isPanel:this.isPanelRecord,isPlay:this.isPlayRecord,recordingType:this.recordingType,isDevicesAvailable:this.isDevicesAvailable});
        if((this.recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"play",reqVal:this.isPlayRecord});}
    }

    // to manage control bar states for entire screen method
    updateControlBarStates = (type,val) =>
    {
        let isenabled = "disabled";
        if(val){ isenabled = "enabled"; }else{ isenabled = "disabled";}
        switch (type) 
        {
            case "mic":
            this.toolbarToggleMic(isenabled,"other");
            break;
            case "cam":
            this.toolbarToggleCam(isenabled,"other");
            break;
            case "panel":
            this.hidePanelRecording(isenabled,"other");
            break;
            case "play":
            if(val){ isenabled = "play"; }else{ isenabled = "pause"; }
            this.toolbarPlayPause(isenabled,"other");
            break;
        }
    }

    // to update timer in control panel bar regularly while video is being recorded
    updateControlBarTime = (timerStr) =>
    {
        jQuery("#recorder-tool-controls .timer-rec").text(timerStr);
        this.VideoDuration = timerStr;
    }

    // Draw annotations on screen while recording
    drawRecordingAnnotation = (type) =>
    {
        let elem = "body";
        //if(this.recordingType == 5){ elem = ".screen-cap-content"; }
        this.removeArrowEvents();
        this.VideoDuration = type;
        let ww = window.innerWidth;
        let hh = jQuery(document).height(); //window.innerHeight;

        let canVA = null;
        if(!document.getElementById("draw-recording-anno"))
        {
            let canHtml = '<canvas id="draw-recording-anno" height="'+hh+'" width="'+(ww-10)+'"></canvas>';
            jQuery(elem).append(canHtml);
            canVA = document.getElementById("draw-recording-anno");
        }
        else
        {
            canVA = document.getElementById("draw-recording-anno");
        }
        jQuery("#draw-recording-anno").css({"pointer-events":"all"});
        if(!this.annoEvents)
        {
            this.mouseAnnoEvents();
            canVA = document.getElementById("draw-recording-anno");
            canVA.addEventListener('mousedown', this.mouseDownLine, false);
            canVA.addEventListener('mouseup', this.mouseUpLine, false);
            canVA.addEventListener('mousemove', this.mouseMoveLine, false); 
            this.annoEvents = true;
        }
        this.ctxR = canVA.getContext('2d');
        this.annoType = type;
        if(type == "Line")
        {
            canVA.addEventListener('mousedown', this.mouseDownLine, false);
            canVA.addEventListener('mouseup', this.mouseUpLine, false);
        }
        else if(type == "Reactangle" || type == "Arrow")
        {
            this.imageObjR = new Image();
            this.imageObjR.onload = () => 
            { 
                this.ctxR.drawImage(this.imageObjR, 0, 0);
            };
            this.imageObjR.src = canVA.toDataURL("image/png",1);
        }
    }

    // Mouse down event while recording screen 
    mouseDownLine = (e) =>
    {
        rectR.startX = e.pageX;
        rectR.startY = e.pageY;
        if(this.annoType == "Line")
        {
            let highlightColor = this.anno_selectedColor;
            let c = document.getElementById("draw-recording-anno");
            this.ctxR = c.getContext("2d");
            this.ctxR.globalCompositeOperation = "multiply";
            this.ctxR.fillStyle = highlightColor;
            this.ctxR.strokeStyle = highlightColor;
            //this.ctxR.globalAlpha = "0.01";
            this.ctxR.lineWidth = 0;
            this.lineLastPoint = { x: e.pageX, y: e.pageY };
            c.onmousemove = this.mouseMoveLine;
        }
        dragRecord = true;
    }

    // Mouse move event while recording screen 
    mouseMoveLine = (e) =>
    {
        if(dragRecord)
        {
            if(this.annoType == "Arrow")
            {
            rectR.w = e.pageX; 
            rectR.h = e.pageY;
            }
            else
            {
            rectR.w = ((e.pageX) - (rectR.startX)); 
            rectR.h = ((e.pageY) - (rectR.startY));
            } 
            if(this.annoType == "Line")
            { 
            let highlightH = 5;

            //rectR.w = e.pageX; 
            //rectR.h = e.pageY;
            let currentPoint = { x: (e.pageX), y: (e.pageY) };
            let dist = this.distanceBetween(this.lineLastPoint, currentPoint);
            let angle = this.angleBetween(this.lineLastPoint, currentPoint);
            for (let i = 0; i < dist; i+=3) 
            {
                let x = (this.lineLastPoint.x + (Math.sin(angle) * i) - highlightH+5);
                let y = (this.lineLastPoint.y + (Math.cos(angle) * i) - highlightH+5);
                this.ctxR.beginPath();
                this.ctxR.arc(x+(highlightH/2), y+(highlightH/2), highlightH, false, Math.PI * 2, false);
                this.ctxR.closePath();
                this.ctxR.fill();
                this.ctxR.stroke();
            }
            this.lineLastPoint = currentPoint;
            this.drawRecordingAnnotation("Line");
            }
            else
            {
            this.drawRecordShape(this.annoType);
            }
        }
    }

    // Mouse up event while recording screen 
    mouseUpLine = () =>
    {
        this.drawRecordingAnnotation(this.VideoDuration);
        dragRecord = false;
    }

    // distance between two cordinates
    distanceBetween = (point1, point2) => 
    {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    // angle between two cordinates
    angleBetween = (point1, point2) =>
    {
        return Math.atan2( point2.x - point1.x, point2.y - point1.y );
    }

    // draw different annotations on screen while recording
    drawRecordShape = (type) =>
    {
        let canvA = document.getElementById("draw-recording-anno");
        let fontOutline = this.anno_selectedColor;
        let fontOulineSize = 8;
        if(rectR.w > 0 && rectR.h > 0)
        {
            switch(type) 
            {
                case "Reactangle":
                    this.ctxR.beginPath();
                    this.ctxR.fillStyle = "transparent";
                    this.ctxR.clearRect(0, 0, canvA.width, canvA.height);
                    this.ctxR.filter = 'none';
                    this.ctxR.drawImage(this.imageObjR, 0, 0);
                    this.ctxR.strokeStyle = fontOutline;
                    this.ctxR.lineWidth = fontOulineSize;
                    this.ctxR.strokeRect(rectR.startX, rectR.startY, rectR.w, rectR.h);
                    this.ctxR.stroke();
                    this.ctxR.beginPath();
                break;
                case "Arrow":
                    let headlen = 32;
                    let dx = rectR.startX - rectR.w;
                    let dy = rectR.startY - rectR.h;
                    let angle = Math.atan2(dy, dx);
                    this.ctxR.beginPath();
                    this.ctxR.fillStyle = "transparent";
                    this.ctxR.clearRect(0, 0, canvA.width, canvA.height);
                    this.ctxR.filter = 'none';
                    this.ctxR.lineCap = "round";
                    this.ctxR.drawImage(this.imageObjR, 0, 0);
                    this.ctxR.strokeStyle = fontOutline;
                    this.ctxR.lineWidth = fontOulineSize;
                    this.ctxR.moveTo(rectR.startX, rectR.startY);
                    this.ctxR.lineTo(rectR.w, rectR.h);
                    delta = Math.PI/6;
                    for (i=0; i<2; i++) 
                    {
                        this.ctxR.moveTo(rectR.w, rectR.h);
                        let x = rectR.w + headlen * Math.cos(angle + delta)
                        let y = rectR.h + headlen * Math.sin(angle + delta)
                        this.ctxR.lineTo(x, y);
                        delta *= -1
                    }
                    this.ctxR.stroke();
                break;
            }
        }
    }

    // To handle error for MediaDevices
    handleError = (error) =>
    {
        if( error.name == "NotFoundError")
        {
            let data1 = { "isDevicesAvailable": false };
            let data2 = { "isDevicesPermitted": true };
            chrome.storage.local.set(data1, () =>  {});
            chrome.storage.local.set(data2, () =>  {});
            chrome.runtime.sendMessage({type:"getAttachedDevicesResponse", devices:[]});
        }
        else
        {
            let data1 = { "isDevicesAvailable": false };
            let data2 = { "isDevicesPermitted": false };
            chrome.storage.local.set(data1, () =>  {});
            chrome.storage.local.set(data2, () =>  {});
            chrome.runtime.sendMessage({type:"getAttachedDevicesResponse", devices: null});
        }
        console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    }

    // Handler to manage recorded streams
    handleGotStream = (stream) =>
    {
        window.stream = stream; // make stream available to console
        return navigator.mediaDevices.enumerateDevices();
    }

    // Handler to get list of devices 
    handleGetDevices = (isMic, isCam) =>
    {
        let constraints = {};
        constraints = {   
            audio: isMic,
            video: isCam
        };
        navigator.mediaDevices.getUserMedia(constraints).then(this.handleGotStream).then( (devices) =>
        {
            if (window.stream) 
            {
                window.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            let data1 = { "isDevicesAvailable": true };
            chrome.storage.local.set(data1, () =>  {});
            let data2 = { "isDevicesPermitted": true };
            chrome.storage.local.set(data2, () =>  {});
            chrome.runtime.sendMessage({type:"getAttachedDevicesResponse", devices:devices});
        }).catch(this.handleError);
    }
}