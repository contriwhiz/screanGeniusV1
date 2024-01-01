class recordAnnotationSG 
{
    constructor() 
    {
    }
    // to Start screen Recording using mediarecorder
    startRecording = (stream,autostopVal) =>
    {
        //if(isCameraRecord){ this.toolbarToggleCam("enabled","load"); }else{ this.toolbarToggleCam("disabled","load"); }
        jQuery("#recorder-wait-overlay").hide();
        if(isMicrophoneRecord){ this.toolbarToggleMic("enabled"); }else{ this.toolbarToggleMic("disabled"); }
        chrome.runtime.sendMessage({type:"setIsRecorderStarted"});
        let options = {mimeType:'video/webm;codecs=vp9'};
        media_recorder = new MediaRecorder(stream,options);
        var videoBitsPerSecond = 5 * 1024 * 1024; // 5 Mbps
        var audioBitsPerSecond = 128000; // 128 Kbps
        media_recorder.videoBitsPerSecond = videoBitsPerSecond;
        media_recorder.audioBitsPerSecond = audioBitsPerSecond;
        let data = [];
        media_recorder.ondataavailable = event => data.push(event.data);
        media_recorder.start(1000);
        media_recorder.onstart = () =>
        {
            jQuery("#recorder-tool-controls .timer-rec").text("00:01");
            recordingStarted = true;
            var timer = 1;
            if(autostopVal > 0){ timer = autostopVal; }
            var duration = minutes = 0;
            var seconds = 1;
            this.intTimer = new IntervalTimer(() =>
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
            var timerStr = minutes + ":" + seconds;
            
            if(recordingType != 1)
            { 
                jQuery("#recorder-tool-controls .timer-rec").text(timerStr); 
            }
            this.VideoDuration = timerStr;
            chrome.runtime.sendMessage({type:"setBadge",badgeText:timerStr,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord});
            chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord,recordingType:recordingType,isDevicesAvailable:isDevicesAvailable});
            if(recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabsTimer",badgeText:this.VideoDuration});}
            }, 1000);
            if(autostopVal > 0)
            {
            autostopVal = parseInt(autostopVal);
            this.timeoutTimer = new timeoutTimerClass(() => {
                if(recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"});}
                this.stopScreenRecording();
            }, (autostopVal*1000));
            }
            else
            {
            this.timeoutTimer = new timeoutTimerClass(() => 
            {
                this.VideoDuration = this.limitStopStr;
                chrome.runtime.sendMessage({type:"setBadge",badgeText:this.limitStopStr,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord});
                chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord,recordingType:recordingType,isDevicesAvailable:isDevicesAvailable});
                if(recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabsTimer",badgeText:this.VideoDuration});}
                
                if(recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"});}
                if(recordingType != 1)
                {
                jQuery("#recorder-tool-controls .timer-rec").text(this.limitStopStr);
                }
                this.stopScreenRecording();
                //this.stopScreenRecording();
            }, (this.limitStopVal*1000));
            }
        }
        var tracks = stream.getTracks();
        if(tracks.length > 0)
        {
            tracks.forEach((track) => {
            track.onended = () => {
                if(recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"}); }
                this.stopScreenRecording();
            };
            });
        }
        let stopped = new Promise((resolve, reject) => 
        {
            media_recorder.onstop = resolve;
            media_recorder.onerror = event => reject(event.name);
        });
        return Promise.all([
            stopped
        ])
        .then(() => data);
    }

    // method to combine screen and mic streams
    combineMultipleStreams = (screenStream, micStream, callback) =>
    {
        composedStream = new MediaStream();
        screenStream.getVideoTracks().forEach((videoTrack) => {
            composedStream.addTrack(videoTrack);
        });
        var context = new AudioContext();
        var audioDestinationNode = context.createMediaStreamDestination();
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
            composedStream.addTrack(audioTrack);
        });
        callback(composedStream);
    }

    // to start screen recording for all modes 
    quix_startCapture = async (request,currentTab) =>
    {
        var type = request.event;
        recordingType = type;
        var isMicrophone = request.isMicrophone;
        var isCamera = request.isCamera;
        var autostopVal = request.autostopVal;
        var qualityVal = request.qualityVal;
        var recordDelay = request.recordDelay;
        var uploadType = request.uploadType;
        if(request.micID !== null && request.micID != ""){ this.audioId = request.micID; }
        if(request.camID !== null && request.camID != ""){ this.videoId = request.camID; }
        if(uploadType != "Local"){ this.VideoUpload = true; } 
        isCameraRecord = isCamera;
        isMicrophoneRecord = isMicrophone;

        if(qualityVal == "360p"){ this.screenW = 480; this.screenH = 360; }
        else if(qualityVal == "480p"){ this.screenW = 720; this.screenH = 480; }
        else if(qualityVal == "720p"){ this.screenW = 1280; this.screenH = 720; }
        else if(qualityVal == "1080p"){ this.screenW = 1920; this.screenH = 1080; }
        else{ this.screenW = 3840; this.screenH = 2160; }

        if(type == 2) // to record camera only
        {
            isCameraRecord = true;
            if(recordingType == 1){ chrome.runtime.sendMessage({type:"executeScriptInallTabs",reqType: "displayToolbar",autostopVal: autostopVal,delayD: true,recordDelay: recordDelay, recordingType: recordingType,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord});}
            this.displayControls(autostopVal,true,recordDelay, isDevicesAvailable, async () =>
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
            screenStream = await navigator.mediaDevices.getDisplayMedia({
                preferCurrentTab: true,
                audio: true,
                video: { 'deviceId': this.videoId, width: { ideal: this.screenW }, height: { ideal: this.screenH }}
            });
            var delay = true;
            if(type == 4)
            {
                delay = false;
            }
            this.displayControls(autostopVal,delay,recordDelay, isDevicesAvailable, async () =>
            {
                if(type == 4)
                {
                var cropTarget = await CropTarget.fromElement(document.querySelector(".screen-cap-content")); 
                const [videoTrack] = screenStream.getVideoTracks();
                await videoTrack.cropTo(cropTarget);
                }
                if(isDevicesAvailable)
                {
                audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                    mandatory: {
                        deviceId: this.audioId,
                        }
                    }, 
                    video: false 
                });
                this.combineMultipleStreams(screenStream, audioStream, (stream) => {
                    combine_stream = stream;
                    if(isCameraRecord){ this.recordCameraScreen(); }
                    this.startRecording(combine_stream,autostopVal).then (recordedChunks => {
                    this.downloadCapturedVideo(recordedChunks);
                    });
                }); 
                }
                else
                {
                combine_stream = screenStream;
                this.startRecording(combine_stream,autostopVal).then (recordedChunks => {
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
            screenStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: { mediaSource: 'screen', displaySurface: 'monitor' } });
            if(recordingType == 1)
            { 
                chrome.runtime.sendMessage({type:"executeScriptInallTabs",reqType: "displayToolbar",autostopVal: autostopVal,delayD: true,recordDelay: recordDelay, recordingType: recordingType,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord});
            }
            this.displayControls(autostopVal, true, recordDelay, isDevicesAvailable, async () =>
            {
                if(isDevicesAvailable)
                {
                audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true, 
                    video: false 
                });
                this.combineMultipleStreams(screenStream, audioStream, async (stream) =>
                {
                    await chrome.tabs.update(currentTab.id, { active: true, selected: true });
                    combine_stream = stream;
                    if(isCameraRecord){ this.recordCameraScreen(); }
                    this.startRecording(combine_stream,autostopVal).then(recordedChunks => {
                    this.downloadCapturedVideo(recordedChunks);
                    });
                });         
                }
                else
                {
                await chrome.tabs.update(currentTab.id, { active: true, selected: true });
                combine_stream = screenStream;
                this.startRecording(combine_stream,autostopVal).then(recordedChunks => {
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
        var camPreview = document.getElementById("camera-recording-preview");
        camPreview.srcObject = stream;
        camPreview.play();
    }

    // to close camera stream
    stopCameraScreen = () =>
    {
        if(cam_stream && cam_stream !== null)
        {
            this.removeCamStreams();
            cam_stream = null;
            if(recordingType == 1){ this.exitPictureInPicture(); }
        }
    }

    // to start camera stream and picture in picture window
    recordCameraScreen = (callback) =>
    {
        chrome.storage.local.get('isPictureInPicture', async (obj) =>
        {
            if(!obj.isPictureInPicture && isCameraRecord)
            {
            if(cam_stream === undefined || cam_stream === null)
            {
                var camPreview = document.getElementById("camera-recording-preview");
                if(camPreview == undefined && camPreview == null)
                {
                camPreview = document.createElement("video");
                camPreview.id = "camera-recording-preview";
                camPreview.className = "camera-recording-preview";
                camPreview.src = blankVideo;
                if(recordingType != 1)
                {
                    camPreview.style.display = "none";
                }
                document.getElementsByTagName("body")[0].append(camPreview);
                }
                else
                {
                camPreview.src = blankVideo;
                }
                if(recordingType == 1)
                { 
                setTimeout(() =>
                { 
                    var data7 = { "isPictureInPicture" : true };
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
                    cam_stream = stream;
                    camPreview.srcObject = stream;
                    camPreview.play();
                    if(callback && callback !== undefined && typeof callback == 'function'){ callback(stream); }
                },
                (err) => 
                {
                    isCameraRecord = false;
                    if(recordingType != 1)
                    { 
                    if(recordingType == 2)
                    {
                        isCancelledRecord = true;
                        this.stopScreenRecording();
                        failureMessagePopup("Recording Failed.", "Recording cannot be started due to lack of permissions.");
                    }
                    else
                    {
                        isCameraRecord = false;
                        if(recordingType != 1)
                        { 
                        if(cam_stream !== undefined && cam_stream !== null){ cam_stream.getVideoTracks()[0].enabled = false; }
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
                if(callback && callback !== undefined && typeof callback == 'function'){ callback(cam_stream); }
            }
            }
            else
            {
                if((cam_stream !== undefined || cam_stream !== null) && (callback && callback !== undefined && typeof callback == 'function')){ callback(cam_stream); }
            }
        });
    }

    // To open picture in picture window
    enablePictureInPicture = async () => 
    {
        try 
        {
            var camPreview = document.getElementById("camera-recording-preview");
            // Check if the Picture-in-Picture API is available on the current browser
            if (document.pictureInPictureEnabled || camPreview.webkitSetPresentationMode) 
            {
            // Request Picture-in-Picture mode for the video
            await camPreview.requestPictureInPicture();
            this.inPIPMode = true;
            var camPreviewOuter = document.getElementById("video-outer");
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
            if(isCameraRecord)
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
                var data8 = { "isPictureInPicture" : false };
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
        if(!isCancelledRecord)
        {
            let recordedBlob = new Blob(recordedChunks, { type: "video/webm;codecs=vp9" });
            var videoSize = recordedBlob.size;
            const href =  URL.createObjectURL(recordedBlob);
            chrome.runtime.sendMessage({type:"openDownloadVideoTab",videodata:href,videoSize:videoSize,VideoDuration:this.VideoDuration,VideoUpload:this.VideoUpload});
            setTimeout(() =>{
            if(recordingType == 1)
            { 
                //window.top.close(); 
            }
            },2000);
        }
        else
        {
            setTimeout(() =>{
            if(recordingType == 1){ window.top.close(); }
            },500);
        }
        isCancelledRecord = false;
    }

    // deprecated feature
    startTimer = (duration, callback) =>
    {
        var timer = duration, minutes, seconds;
        setTimerInterval = setInterval(() => 
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
        if(appendTo == undefined){ var appendTo = "body"; }
        var camBlock = document.getElementById("video-outer");
        if(camBlock === undefined || camBlock === null)
        {
            var camHTML = "";
            camHTML += '<div id="video-outer">\n\
            <div id="video-inner">';
            var camP = document.getElementById("camera-recording-preview");
            if(camP === undefined || camP === null)
            {
                camHTML += '<video muted id="camera-recording-preview"></video>';
            }
            camHTML += '</div>\n\
            <div id="camera-tool-controls">\n\
                <div id="camera-tool-controls-inner">\n\
                <div id="camera-tool-selector">\n\
                    <span><img src="'+camSelectIcon+'"/></span>\n\
                </div>\n\
                <div id="camera-tool-options">\n\
                    <!--<span class="select-camera-option" data-option="1"><img src="'+camOp1Icon+'"/></span>-->\n\
                    <span class="select-camera-option" data-option="2"><img src="'+camOp2Icon+'"/></span>\n\
                    <span class="select-camera-option" data-option="3"><img src="'+camOp3Icon+'"/></span>\n\
                    <span class="select-camera-option" data-option="4"><img src="'+camOp4Icon+'"/></span>\n\
                    <div class="sideBar-seperator">|</div>\n\
                    <span class="camera-close-option"><img src="'+closeIcon+'"/></span>\n\
                </div>\n\
                </div>\n\
            </div>\n\
            </div>';
            var toolBW = 325;
            var toolX = 20;
            var toolY = 20;
            var offset = {bottom:toolX, right:toolY};
            var newElement$ = $(camHTML)
            .width(toolBW)
            .draggable({
                cancel: "text",
                containment: appendTo,
                start: () =>{
                },
                stop: () =>{
                },
                scroll: false,
                drag: (e, ui) =>
                {
                var self = $(this);
                var parent = $(appendTo);
                var pos = self.position();
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
        isDevicesAvailable = controls;
        if(jQuery("#floatable-recorder-tool").length > 0){ return; }
        var html = '';
        
        var htmlWaitOverlay = '';
        var delayVal = null;
        if(recordDelay > 0 && recordDelay !== undefined){ delayVal = recordDelay; }
        html += '<div id="floatable-recorder-tool">\n\
            <div id="floatable-recorder-tool-inner">\n\
            <div id="recorder-tool-controls">\n\
                <div id="recorder-tool-controls-inner">';
                html += '<span class="minimize-rec" title="Minimize Recording"><img src="'+arrowLeftIcon+'"/></span>\n\
                    <span class="maximize-rec" title="Maximize Recording"><img src="'+arrowRightIcon+'"/></span>\n\
                    <div class="toolbar-option-can-hide">\n\
                    <span class="close-rec" title="Cancel Recording"><img src="'+delRecIcon+'"/></span>';
                    if(recordingType != "2")
                    {
                        html += '<div class="remove-anno-effects" title="Remove All Annotations">\n\
                            <div class="remove-anno-choose"><span class="remove-all-annotations"><img src="'+erasorIcon+'"/></span></div>\n\
                        </div>\n\
                        <div class="anno-effects">\n\
                            <div class="anno-choose"><span title="Annotations"><img src="'+pencilIcon+'"/></span><div class="effect-child-options"><span class="anno-free-line" title="Draw Free Hand"><img src="'+freeLineIcon+'"/></span><span class="anno-reactangle" title="Draw Reactangle"><img src="'+blockIcon+'"/></span><span class="anno-arrow" title="Draw Arrow"><img src="'+arrowToolIcon+'"/></span><span title="Annotation Color" class="tool-color tool-color-red" data-color="#ff0000"></span><span title="Annotation Color" class="tool-color tool-color-blue" data-color="#0000ff"></span><span title="Annotation Color" class="tool-color tool-color-green" data-color="#008000"></span></div></div>\n\
                        </div>\n\
                        <div class="arrow-effects">\n\
                            <div class="arrow-effect-choose"><span title="Arrow Effects"><img src="'+cursorIcon1+'"/></span><div class="effect-child-options"><span class="arrow-spotlight" title="Spotlight Arrow"><img src="'+cursorIcon4+'"/></span><span class="arrow-highlight-click" title="Click Arrow"><img src="'+cursorIcon3+'"/></span><span class="arrow-highlight-mouse" title="Mouse Highlight Arrow"><img src="'+cursorIcon2+'"/></span><span class="arrow-default" title="Simple Arrow"><img src="'+cursorIcon1+'"/></span></div></div>\n\
                        </div>\n\
                        <div class="sideBar-seperator">|</div>';
                    }
                    html += '<span class="mic-rec-disable" title="Disable Microphone"><img src="'+microphoneIcon+'"/></span>\n\
                    <span class="mic-rec" title="Enable Microphone"><img src="'+microphoneDisIcon+'"/></span>';
                    if(recordingType != "2")
                    {
                        html += '<span class="cam-rec-disable" title="Disable Camera"><img src="'+webcamIcon+'"/></span>\n\
                    <span class="cam-rec" title="Enable Camera"><img src="'+webcamDisIcon+'"/></span>';
                    }
                    html += '<span class="stop-rec" title="Stop Recording"><img src="'+stopRecIcon+'"/></span>\n\
                    <span class="play-rec" title="Pause Recording"><img src="'+toolPlayIcon+'"/></span>\n\
                    <span class="pause-rec" title="Resume Recording"><img src="'+toolPauseIcon+'"/></span>\n\
                    </div>\n\
                <span class="timer-rec">00.00</span>\n\
                <span class="drag-icon"><img src="'+dragIcon+'"/></span>\n\
                </div>\n\
                <div id="recorder-tool-custom-tab">\n\
                <span id="custom-tab-start-recording"><img src="'+toolPlayIcon+'"/></span>\n\
                <span id="custom-tab-cancel-recording"><img src="'+closeIcon+'"/></span>\n\
                </div>\n\
            </div>\n\
            <div class="close-toobar" title="Close toolbar"><img src="'+closeIcon+'"/></div>\n\
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
            var inHTML = '<div id="recorder-wait-overlay"></div><div id="floatable-recorder-tool-container"></div><div id="floatable-recorder-camera-container"></div>';
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
        var camWid = jQuery("#video-outer").width();
        if(camWid < 0){ camWid = 325; }
        var camLeft = ((camWid/2)-20);
        if(recordingType != 1){ jQuery("#camera-tool-selector").css({"left":camLeft+"px"}); }
        jQuery("#camera-tool-options").hide();
    }

    // to adjust height of camera in toolbar
    assignCorrectVidHeight = () =>
    {
        var topVal = parseInt(jQuery("#floatable-recorder-tool").css("top"));
        var hh = 0;
        if(jQuery("#video-outer").hasClass("camera-view-1")){ hh = 75;}
        if(jQuery("#video-outer").hasClass("camera-view-2")){ hh = 125;}
        if(jQuery("#video-outer").hasClass("camera-view-3")){ hh = 200;}
        if(jQuery("#video-outer").hasClass("camera-view-4")){ hh = 206;}
        
        var hDiff = this.prevSelectionH-hh;
        var topM = topVal+hDiff;


        if(topM < 0){ topM = 0;}
        if(recordingType != 1)
        { 
            var camHeight = parseInt(jQuery("#camera-recording-preview").height());
            var toolTop = parseInt(jQuery("#floatable-recorder-tool").css("top"));
            var toolTopPos = toolTop - camHeight; 
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
        if(isCameraRecord && recordingType != 1)
        {
            jQuery("#video-outer").css({"display":"block","height":"auto"});
            // if(recordingType != 1 && recordingType != 2){ jQuery("#camera-tool-controls").show(); }
        }
        if(recordingType != 1 && recordingType != 2)
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
        jQuery("#camera-tool-options img").on("click",() =>{
            var camOption = jQuery(this).parent("span").attr("data-option");
            if(camOption !== undefined)
            {
                jQuery("#video-outer").removeAttr('class');
                jQuery("#video-outer").addClass("camera-view-"+camOption);
                this.assignCorrectVidHeight();   
                if(recordingType != 1){ this.putCamOptionCenter(); }
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
        jQuery(".arrow-effects .effect-child-options span").on("click", () =>
        {
            var elem = "body";
            //if(recordingType == 5){ elem = ".screen-cap-content"; }
            jQuery("#draw-recording-anno").css({"pointer-events":"none"});
            this.mouseAnnoEvents();
            var shape = "";
            jQuery(".shape-highlight-mouse").remove();
            jQuery(".shape-highlight-click").remove();
            jQuery(".arrow-spotlight-outer").remove();
            jQuery(elem).unbind("mousemove");
            jQuery(elem).unbind("mousedown");
            jQuery(elem).unbind("mouseup");
            if(jQuery(this).hasClass("arrow-highlight-mouse"))
            {
            shape = '<div class="shape-highlight-mouse"></div>';
            jQuery(elem).append(shape);
            jQuery(elem).unbind("mousemove");
            jQuery(elem).on("mousemove",(e) => {
                var top = e.pageY-15;
                var left = e.pageX-15;
                jQuery(".shape-highlight-mouse").css({"top":top,"left":left});
            });
            }
            else if(jQuery(this).hasClass("arrow-highlight-click"))
            {
            shape = '<div class="shape-highlight-click"></div>';
            jQuery(elem).append(shape);
            jQuery(elem).unbind("mousemove");
            jQuery(elem).on("mousemove",(e) => {
                var top = e.pageY-15;
                var left = e.pageX-15;
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
            else if(jQuery(this).hasClass("arrow-spotlight"))
            {
            shape = '<div class="arrow-spotlight-outer"><div class="arrow-spotlight-cursor"></div></div>';
            jQuery(elem).append(shape);
            jQuery(elem).on("mousemove",(e) => {
                var top = e.pageY-50;
                var left = e.pageX-50;
                jQuery(".arrow-spotlight-cursor").css({"top":top,"left":left});
            });
            }
        });

        jQuery(".anno-effects .effect-child-options span").unbind("click");
        jQuery(".anno-effects .effect-child-options span").on("click", () =>
        {
            if(jQuery(this).hasClass("anno-free-line"))
            {
            this.drawRecordingAnnotation("Line");
            }
            else if(jQuery(this).hasClass("anno-reactangle"))
            {
            this.drawRecordingAnnotation("Reactangle");
            }
            else
            {
            this.drawRecordingAnnotation("Arrow");
            }
        });

        // jQuery(".remove-anno-effects .effect-child-options span").unbind("click");
        // jQuery(".remove-anno-effects .effect-child-options span").on("click", () =>
        // {
        //   if(jQuery(this).hasClass("anno-remove-one"))
        //   {

        //   }
        //   else
        //   {
            
        //   }
        // });

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
            if(recordingType != "2")
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
            if(recordingType == 1){ chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"}); }
            this.stopScreenRecording();
        });

        jQuery("#floatable-recorder-tool-inner .cam-rec-disable").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec-disable").on("click", () =>{
            if(isDevicesAvailable){ this.toolbarToggleCam("disabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .mic-rec-disable").unbind("click");
        jQuery("#floatable-recorder-tool-inner .mic-rec-disable").on("click", () =>{
            if(isDevicesAvailable){ this.toolbarToggleMic("disabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .cam-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .cam-rec").on("click", () =>{
            if(isDevicesAvailable){ this.toolbarToggleCam("enabled"); }
        });

        jQuery("#floatable-recorder-tool-inner .mic-rec").unbind("click");
        jQuery("#floatable-recorder-tool-inner .mic-rec").on("click", () =>{
            if(isDevicesAvailable){ this.toolbarToggleMic("enabled"); }
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
        jQuery(".tool-color").on("click", () =>{
            var selectedColor = jQuery(this).attr("data-color");
            this.anno_selectedColor = selectedColor;
        });
    }

    // To open recording toolbar and add events to different buttons
    controlBarCallbacks = (type,html,delayVal,autostopVal,callback) =>
    {
        if(recordingType != "2")
        {
            var toolBW = 450;
        }
        else
        {
            var toolBW = 285;
        }
        var toolX = 20;
        var toolY = 20;
        if(type == "custom")
        {
            toolBW = 76;
            toolBH = 40;
        }
        var offset = {bottom:toolX, left:toolY};
        this.displayCameraWindow("#floatable-recorder-camera-container");
        var newElement$ = $(html)
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
                var self = $(this);
                var parent = $("#floatable-recorder-tool-container");
                var pos = self.position();
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
        if(recordingType != 1){ if(type != "custom"){ jQuery("#video-outer").addClass("camera-view-3"); this.prevSelectionH = 206; } }
        this.recorderControlPanelStates();
        if(recordingType != 1){ this.putCamOptionCenter(); }

        jQuery("#custom-tab-cancel-recording").unbind("click");
        jQuery("#custom-tab-cancel-recording").on("click", () =>
        {
            jQuery("#selected-screen-capture").remove();
            jQuery("#floatable-recorder-tool-container").remove();
            jQuery("#floatable-recorder-camera-container").remove();
            isCancelledRecord = true;
            if(recordingType == 1){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "cancelToolbar"}); }
            this.stopScreenRecording();
        });

        jQuery("#custom-tab-start-recording").unbind("click");
        jQuery("#custom-tab-start-recording").on("click", () =>
        {
            var htmlWaitOverlay = "";
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
            // if(recordingType != 1 && recordingType != 2){ jQuery("#camera-tool-controls").show(); }
            jQuery(".close-toobar").show();
            jQuery("#recorder-tool-custom-tab").hide();
            jQuery("#floatable-recorder-tool").remove();
            jQuery("#video-outer").remove();
            if(recordingType != "2")
            {
                var toolBW = 450;
            }
            else
            {
                var toolBW = 285;
            }
            var toolX = 20;
            var toolY = 20;
            var offset = {bottom:toolY, left:toolX};
            var appendTo = ".screen-cap-content";
            var isDraggable = false;
            if(parseInt(jQuery(".screen-cap-content").css("width"))+50 < toolBW || parseInt(jQuery(".screen-cap-content").css("height"))+50 < 265)
            {
                appendTo = "#floatable-recorder-tool-container";
                isDraggable = true;
            }
            this.displayCameraWindow(appendTo);
            var newElement$ = $(html)
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
                    var self = $(this);
                    var parent = $(appendTo);
                    var pos = self.position();
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
            var capW = parseInt(jQuery(".screen-cap-content").css("width"));
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
                if(recordingType != 1){ jQuery("#video-outer").addClass("camera-view-2"); }
                this.prevSelectionH = 125;
            }
            else
            {
                if(recordingType != 1){ jQuery("#video-outer").addClass("camera-view-3"); }
                this.prevSelectionH = 206;
            }
            if(recordingType != 1){ this.putCamOptionCenter(); }
            this.recorderControlPanelStates();
            this.controlBarButtonCallbacks(delayVal,autostopVal,callback);
            });
        });

        
        jQuery("#selected-screen-capture-inner").unbind("mousedown");
        jQuery("#selected-screen-capture-inner").on("mousedown", (e) =>
        {
            video_crop = true;
            record_crop_startX = e.clientX;
            record_crop_startY = e.clientY;
        });

        jQuery("#selected-screen-capture-inner").unbind("mousemove");
        jQuery("#selected-screen-capture-inner").on("mousemove", (e) =>
        {
            if(video_crop)
            {
            jQuery("#selected-screen-capture-inner").css({"background-color": "transparent"});
            var winW = jQuery(this).width();
            var winH = jQuery(this).height();
            if(!jQuery("#dimensions-message").length)
            {
                jQuery(".screen-cap-content").html('<span id="dimensions-message">0*0 (min. 500*350)</span>');
            }
            var contentW = (e.clientX - record_crop_startX);
            var contentH = (e.clientY - record_crop_startY);
            
            jQuery("#dimensions-message").html(contentW+"*"+contentH+" (min. 500*350)");

            var contentT = record_crop_startY;
            var contentL = record_crop_startX;

            var topW = (record_crop_startX+contentW);
            var topH = record_crop_startY;

            var rightW = (winW-topW);
            var rightH = (topH+contentH);

            var leftW = record_crop_startX;
            var leftH = (winH-topH);
        
            var bottomW = (winW-leftW);
            var bottomH = (winH-rightH);

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
            var capW = parseInt(jQuery(".screen-cap-content").css("width"));
            var capH = parseInt(jQuery(".screen-cap-content").css("height"));
            if(capW < 500 || capH < 350)
            {
            video_crop = false;
            jQuery("#selected-screen-capture-inner").css({"background-color": "rgba(0, 0, 0, 0.3)"});
            jQuery(".screen-cap-top").css({"width": 0,"height":0});
            jQuery(".screen-cap-right").css({"width": 0,"height":0});
            jQuery(".screen-cap-left").css({"width": 0,"height":0});
            jQuery(".screen-cap-bottom").css({"width": 0,"height":0});
            jQuery(".screen-cap-content").css({"width": 0,"height":0,"z-index": 2,"top": 0,"left":0});
            alert("Selction must be more than 500*350.");
            return;
            }
            video_crop = false;
            jQuery("#recorder-tool-controls-inner").hide();
            jQuery("#camera-recording-preview").hide();
            // if(recordingType != 1 && recordingType != 2){ jQuery("#camera-tool-controls").hide(); }
            jQuery(".close-toobar").hide();
            jQuery("#recorder-tool-custom-tab").show();
            var toolX = 0;
            var toolY = 0;
            if(recordingType == "5")
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
            if(isCameraRecord){ jQuery("#video-outer").show(); }
            jQuery("#selected-screen-capture-inner").unbind("mouseup");
            jQuery("#selected-screen-capture-inner").unbind("mousedown");
            jQuery("#selected-screen-capture-inner").unbind("mousemove");
        });
    }

    // To manage camera and mic toolbar states as per user gesture
    recorderControlPanelStates = () =>
    {
        if(isCameraRecord){ jQuery(".cam-rec-disable").show(); jQuery(".cam-rec").hide(); }else{ jQuery(".cam-rec-disable").hide(); jQuery(".cam-rec").show(); }
        if(isMicrophoneRecord){ jQuery(".mic-rec-disable").show(); jQuery(".mic-rec").hide(); }else{ jQuery(".mic-rec-disable").hide(); jQuery(".mic-rec").show(); }
    }

    // add deplay before starting of recording
    delayBeforeRecording = (delayVal,callback) =>
    {
        var intervalStart = delayVal;
        var delayTimer = setInterval(() =>{
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
        isCancelledRecord = true;
        if((recordingType == 1) && load === undefined){ chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "cancelToolbar"}); }
        this.stopScreenRecording();
    }

    // to hide control panel including camera
    hidePanelRecording = (type,load) =>
    {
        if(type == "disabled")
        {
            isPanelRecord = false;
            jQuery("#floatable-recorder-tool").hide();
            jQuery("#video-outer").hide();
        }
        else
        {
            isPanelRecord = true;
            jQuery("#floatable-recorder-tool").show();
            jQuery("#video-outer").show();
        }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord,recordingType:recordingType,isDevicesAvailable:isDevicesAvailable});
        if((recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"panel",reqVal:isPanelRecord});}
    }

    // to remove all annotations from screen recording
    removeAnnotations = () =>
    {
        var c = document.getElementById("draw-recording-anno");
        this.ctxR = c.getContext("2d");
        this.ctxR.beginPath();
        this.ctxR.clearRect(0, 0, c.width, c.height);
        this.ctxR.beginPath();
        this.imageObjR.src = c.toDataURL("image/png",1);
    }

    // To stop screen recording on user command
    stopScreenRecording = () =>
    {
        recordingStarted = false;
        if(this.intTimer)
        { this.intTimer.pause(); }
        if(this.timeoutTimer)
        { this.timeoutTimer.pause(); }

        if(media_recorder  && media_recorder !== null)
        {
            media_recorder.stop();
        }
        this.removeStreams();
        chrome.runtime.sendMessage({type:"unsetBadge"});
        this.resetControlBarEvents();
        this.stopCameraScreen();
    }

    // To delete camera stream from browser window/tab
    removeCamStreams = () =>
    {
        if(cam_stream && cam_stream !== null)
        {
            var tracks = cam_stream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }
    }

    // To delete all media streams from browser window/tab
    removeStreams = () =>
    {
        if(composedStream && composedStream !== null)
        {
            var tracks = composedStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }
        
        if(audioStream && audioStream !== null)
        {
            var tracks = audioStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }

        if(screenStream && screenStream !== null)
        {
            var tracks = screenStream.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        }

        if(combine_stream && combine_stream !== null)
        {
            var tracks = combine_stream.getTracks();
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
        var elem = "body";
        //if(recordingType == 5){ elem = ".screen-cap-content"; }
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
        var hh = 0;
        if(jQuery("#video-outer").hasClass("camera-view-1")){ hh = 75;}
        if(jQuery("#video-outer").hasClass("camera-view-2")){ hh = 125;}
        if(jQuery("#video-outer").hasClass("camera-view-3")){ hh = 200;}
        if(jQuery("#video-outer").hasClass("camera-view-4")){ hh = 206;}
        if(type == "disabled")
        {
            var camHeight = parseInt(jQuery("#camera-recording-preview").height());
            var toolTop = parseInt(jQuery("#floatable-recorder-tool").css("top"));
            var toolTopPos = toolTop + camHeight; 

            isCameraRecord = false;
            if(recordingType != 1)
            { 
            if(cam_stream !== undefined && cam_stream !== null){ cam_stream.getVideoTracks()[0].enabled = false; }
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
            isCameraRecord = true;
            if(recordingType != 1)
            { 
            // jQuery("#camera-recording-preview").css({"visibility":"visible","height":"auto"});
            jQuery("#video-outer").css({"display":"block"});
            this.assignCorrectVidHeight();
            // jQuery("#camera-tool-controls").show();
            if(cam_stream !== undefined && cam_stream !== null){ cam_stream.getVideoTracks()[0].enabled = true; }
            }
            jQuery("#floatable-recorder-tool-inner .cam-rec").hide();
            jQuery("#floatable-recorder-tool-inner .cam-rec-disable").show();
            if(load === undefined){ this.recordCameraScreen(); }
        }
        
        // if(toolTopPos < 0){ toolTopPos = 0;}
        // if(load === undefined){ jQuery("#floatable-recorder-tool").css({"top":toolTopPos,"bottom": "unset"}); }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord,recordingType:recordingType,isDevicesAvailable:isDevicesAvailable});
        if((recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"cam",reqVal:isCameraRecord});}
    }

    // to toggle microphone as per user gesture
    toolbarToggleMic = (type,load) =>
    {
        if(type == "disabled")
        {
            isMicrophoneRecord = false;
            if(audioStream !== undefined && audioStream !== null){ audioStream.getAudioTracks()[0].enabled = false; }
            jQuery("#floatable-recorder-tool-inner .mic-rec").show();
            jQuery("#floatable-recorder-tool-inner .mic-rec-disable").hide();
        }
        else
        {
            isMicrophoneRecord = true;
            if(audioStream !== undefined && audioStream !== null){ audioStream.getAudioTracks()[0].enabled = true; }
            jQuery("#floatable-recorder-tool-inner .mic-rec").hide();
            jQuery("#floatable-recorder-tool-inner .mic-rec-disable").show();
        }
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord,recordingType:recordingType,isDevicesAvailable:isDevicesAvailable});
        if((recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"mic",reqVal:isMicrophoneRecord});}
    }

    // to toggle play/pause as per user gesture
    toolbarPlayPause = (type,load) =>
    {
        if(type == "play")
        {
            isPlayRecord = true;
            if(media_recorder && media_recorder !== null)
            {
                if(this.intTimer)
                { this.intTimer.resume(); }
                media_recorder.resume();
                if(this.timeoutTimer)
                { this.timeoutTimer.resume(); }
            }
            if(recordingType != "2")
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
            isPlayRecord = false;
            if(media_recorder && media_recorder !== null)
            {
                if(this.intTimer)
                { this.intTimer.pause(); }
                media_recorder.pause();
                if(this.timeoutTimer)
                { this.timeoutTimer.pause(); }
            }
            if(recordingType != "2")
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
        chrome.runtime.sendMessage({type:"sendRecorderToolData",badgeText:this.VideoDuration,isCamera:isCameraRecord,isMicrophone:isMicrophoneRecord,isPanel:isPanelRecord,isPlay:isPlayRecord,recordingType:recordingType,isDevicesAvailable:isDevicesAvailable});
        if((recordingType == 1) && load === undefined){chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "toolbarEventsAllTabs",reqSubType:"play",reqVal:isPlayRecord});}
    }

    // to manage control bar states for entire screen method
    updateControlBarStates = (type,val) =>
    {
        var isenabled = "disabled";
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
        var elem = "body";
        //if(recordingType == 5){ elem = ".screen-cap-content"; }
        this.removeArrowEvents();
        this.VideoDuration = type;
        var ww = window.innerWidth;
        var hh = jQuery(document).height(); //window.innerHeight;

        var canVA = null;
        if(!document.getElementById("draw-recording-anno"))
        {
            var canHtml = '<canvas id="draw-recording-anno" height="'+hh+'" width="'+(ww-10)+'"></canvas>';
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
            var highlightColor = this.anno_selectedColor;
            var c = document.getElementById("draw-recording-anno");
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
            var highlightH = 5;

            //rectR.w = e.pageX; 
            //rectR.h = e.pageY;
            var currentPoint = { x: (e.pageX), y: (e.pageY) };
            var dist = this.distanceBetween(this.lineLastPoint, currentPoint);
            var angle = this.angleBetween(this.lineLastPoint, currentPoint);
            for (var i = 0; i < dist; i+=3) 
            {
                x = (this.lineLastPoint.x + (Math.sin(angle) * i) - highlightH+5);
                y = (this.lineLastPoint.y + (Math.cos(angle) * i) - highlightH+5);
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
        var canvA = document.getElementById("draw-recording-anno");
        var fontOutline = this.anno_selectedColor;
        var fontOulineSize = 8;
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
                    var headlen = 32;
                    var dx = rectR.startX - rectR.w;
                    var dy = rectR.startY - rectR.h;
                    var angle = Math.atan2(dy, dx);
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
                        x = rectR.w + headlen * Math.cos(angle + delta)
                        y = rectR.h + headlen * Math.sin(angle + delta)
                        this.ctxR.lineTo(x, y);
                        delta *= -1
                    }
                    this.ctxR.stroke();
                break;
            }
        }
    }    
}