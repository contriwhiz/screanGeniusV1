/*global chrome*/
if(!screenShotType)
{
    // // Global letiables defined to use across the screenshot and screen recording feature
    // let start = {};
    // let end = {};
    // let isSelecting = false;
    // let winH = 0; 
    // let wScrolled = 0;
    // let docHeight = 0;
    // // let baseImgArr = [];
    // let imagesposY = 0;
    // let lastScreenshotH = 0;
    // let fullScreenShotCan = "";
    // let fullScreenShotContext = "";
    // let rect = {};
    // let rectB = {};
    // let rectH = {};
    // let rectS = {};
    // let rectR = {};
    // let ctx = "";
    // let ctxB = "";
    // let ctxH = "";
    // let ctxS = "";
    // let imageObjB = null;
    // let imageObjS = null;
    // let canBGMain = null;
    // let canvasMain = null;
    // let drag = "";
    // let dragRecord = "";
    // let screenPriorToBlur= "";
    // let screenPriorToHighlight = "";
    // let screenPriorToShape = "";
    // let screenPriorToUpload = "";
    // let screensHistoryData = [];
    // let screensHistoryStep = 0;
    var screenShotType = "Visible Part";
    // let originalImage = "";
    // let FuturaBkBook1 = chrome.runtime.getURL("/fonts/FuturaBkBook.woff");
    // let FuturaBkBook2 = chrome.runtime.getURL("/fonts/FuturaBkBook.woff2");
    // let loaderIcon = chrome.runtime.getURL("/images/light-loader.gif");
    // let attachmentIcon = chrome.runtime.getURL("/images/attachment.png");

    // let blankVideo = chrome.runtime.getURL("/images/blank-video.mp4");

    // let textIcon2 = chrome.runtime.getURL("/images/quix-text2-icon.png");
    // let rectanleIcon2 = chrome.runtime.getURL("/images/quix-reactanle2-icon.png");
    // let downIcon1 = chrome.runtime.getURL("/images/quix-down-icon.png");
    // let rectanleIcon1 = chrome.runtime.getURL("/images/quix-reactanle-icon.png");
    // let ovalIcon = chrome.runtime.getURL("/images/quix-oval-icon.png");
    // let lineIcon = chrome.runtime.getURL("/images/quix-shape-line-icon.png");
    // let arrowIcon = chrome.runtime.getURL("/images/quix-shape-arrow-icon.png");
    // let markertoolIcon = chrome.runtime.getURL("/images/quix-markertool-icon.png");
    // let blurIcon = chrome.runtime.getURL("/images/quix-blur-icon.png");
    // let cropIcon = chrome.runtime.getURL("/images/quix-croptool-icon.png");
    // let uploadtoolIcon = chrome.runtime.getURL("/images/quix-uploadool-icon.png");
    // let closeIcon = chrome.runtime.getURL("/images/quix-close-icon.png");
    // let closeIconTool = chrome.runtime.getURL("/images/quix-tool-close2.png");
    // let expandIcon = chrome.runtime.getURL("/images/quix-expand-icon.png");
    // let minusIcon = chrome.runtime.getURL("/images/quix-minus-icon.png");
    // let plusIcon = chrome.runtime.getURL("/images/quix-plus-icon.png");
    // let copyIcon2 = chrome.runtime.getURL("/images/quix-copy2-icon.png");
    // let shareIcon2 = chrome.runtime.getURL("/images/quix-share2-icon.png");
    // let downIcon3 = chrome.runtime.getURL("/images/quix-down3-icon.png");
    // let downloadIcon2 = chrome.runtime.getURL("/images/quix-download2-icon.png");
    // let downIcon4 = chrome.runtime.getURL("/images/quix-down4-icon.png");
    // let undoIcon = chrome.runtime.getURL("/images/quix-undo-icon.png");
    // let redoIcon = chrome.runtime.getURL("/images/quix-redo-icon.png");
    // let resetIcon = chrome.runtime.getURL("/images/quix-reset-icon.png");
    // let italicIcon = chrome.runtime.getURL("/images/quix-italic-icon.png");
    // let boldIcon = chrome.runtime.getURL("/images/quix-bold-icon.png");
    // let underlineIcon = chrome.runtime.getURL("/images/quix-underline-icon.png");
    // let alignleftIcon = chrome.runtime.getURL("/images/quix-alignleft-icon.png");
    // let aligncenterIcon = chrome.runtime.getURL("/images/quix-aligncenter-icon.png");
    // let alignrightIcon = chrome.runtime.getURL("/images/quix-alignright-icon.png");
    // let logoIcon1 = chrome.runtime.getURL("/images/logo-48.png");
    // let logoIcon2 = chrome.runtime.getURL("/images/quixy-logo-footer.png");
    // let logoIcon3 = chrome.runtime.getURL("/images/quix-logo-main.png");
    // let linkIcon = chrome.runtime.getURL("/images/quix-link-green-icon.png");
    // let emailIcon = chrome.runtime.getURL("/images/quix-email-icon.png");
    // let stopRecIcon = chrome.runtime.getURL("/images/quix-tool-stop.png");
    // let delRecIcon = chrome.runtime.getURL("/images/quix-delete-icon.png");
    // let camSelectIcon = chrome.runtime.getURL("/images/quix-webcam-options.png");
    // let camOp1Icon = chrome.runtime.getURL("/images/quix-webcam-option1.png");
    // let camOp2Icon = chrome.runtime.getURL("/images/quix-webcam-option2.png");
    // let camOp3Icon = chrome.runtime.getURL("/images/quix-webcam-option3.png");
    // let camOp4Icon = chrome.runtime.getURL("/images/quix-webcam-option4.png");
    
    // let dragIcon= chrome.runtime.getURL("/images/quix-drag-icon.png");
    // let webcamIcon = chrome.runtime.getURL("/images/quix-webcam-tool.png");
    // let webcamDisIcon = chrome.runtime.getURL("/images/quix-webcam-disabled-tool.png");
    // let microphoneIcon = chrome.runtime.getURL("/images/quix-microphone-icon2.png");
    // let microphoneDisIcon = chrome.runtime.getURL("/images/quix-microphone-disabled-icon.png");
    // let cursorIcon1 = chrome.runtime.getURL("/images/quix-cursor-icon.png");
    // let cursorIcon2 = chrome.runtime.getURL("/images/quix-cursor-icon1.png");
    // let cursorIcon3 = chrome.runtime.getURL("/images/quix-cursor-icon2.png");
    // let cursorIcon4 = chrome.runtime.getURL("/images/quix-cursor-icon3.png");
    // let pencilIcon = chrome.runtime.getURL("/images/quix-pencil-icon.png");
    // let erasorIcon = chrome.runtime.getURL("/images/quix-eraser-icon.png");
    // let arrowLeftIcon = chrome.runtime.getURL("/images/quix-arrow-left-icon.png");
    // let arrowRightIcon = chrome.runtime.getURL("/images/quix-arrow-right-icon.png");
    // let freeLineIcon = chrome.runtime.getURL("/images/quix-free-line-icon.png");
    // let blockIcon = chrome.runtime.getURL("/images/quix-block-icon.png");
    // let arrowToolIcon = chrome.runtime.getURL("/images/quix-for-icon.png");
    // let toolPauseIcon  = chrome.runtime.getURL("/images/quix-tool-pause.png");
    // let toolPlayIcon  = chrome.runtime.getURL("/images/quix-tool-play.png");
    // let vcallIcon = chrome.runtime.getURL("images/quix-video-call-icon.png");
    // let userIcon = chrome.runtime.getURL("images/quix-user-icon.png");
    // let youtubeIcon = chrome.runtime.getURL("images/quix-youtube-icon.png");
    // let GDIcon = chrome.runtime.getURL("images/quix-google-drive-icon.png");
    // let feedbackIcon = chrome.runtime.getURL("images/quix-share-feedback-form.png");
    // let successIcon = chrome.runtime.getURL("/images/quix-success.png");
    // let failureIcon = chrome.runtime.getURL("/images/quix-failure.png");
    // let screenshotName = "";
    // let capturedFirstItem = 0;
    // // if(!requestSentToCaptureScreen || requestSentToCaptureScreen === undefined){ var requestSentToCaptureScreen = 0; }
    // // let requestReceivedOnceScreenCaptured = 0;
    // let preScreenshotLength = 0;
    // let selectedShape = "";
    // let isChanged = false;
    // let previouscolor = "";
    // let isReachedScreenshotlimit = 0;
    // let canvas_background = null;
    // let isCanvasBackground = 0;
    // let canvasScale = 1;
    // let updateScreenshot = "";
    // let zoomValueX = 0;
    // let zoomValueY = 0;
    // let zoomValuePercent = 100;
    // let zoomValuePercentRatio = 1;
    // let cooridnatesDrawnAt = [];
    // let whiteSpaceAround = 200;

    let captureScreenshot;
    let recordScreen;
    let helpers;
    let quixyuserData;
    let preScreenshotLength = 0;
    let isCameraRecord;
    let isMicrophoneRecord;
    let isPanelRecord;
    let isPlayRecord;

    window.onbeforeunload = function(event)
    {
        if (!recordScreen.userConfirmedClose && recordScreen.recordingStarted && recordScreen.recordingType != 1) 
        {
            const confirmationMessage = 'Screen Recording will be cancelled if you chose to reload the page?';
            (event || window.event).returnValue = confirmationMessage;
            return confirmationMessage;
        }
    }

    window.onload = function() 
    {
        captureScreenshot = new captureScreenshotSG();
        recordScreen = new recordScreenSG();
        helpers = new helperSG();
        // To load video recording tootlbar on page reload if video is still being recorded
        chrome.storage.local.get('isRecorderStarted', async function (obj) {
            if(obj.isRecorderStarted)
            {
                chrome.storage.local.get('setRecorderToolData', async function (obj) 
                {
                    let data = obj.setRecorderToolData;
                    let dataArr = data.split("-");
                    recordScreen.recordingType = dataArr[5];
                    if(recordScreen.recordingType == 1)
                    {
                        recordScreen.displayControls(undefined,true,undefined, dataArr[6], function()
                        {
                            //updateControlBarStates(dataArr[1],dataArr[2],dataArr[3],dataArr[4]);
                            recordScreen.updateControlBarTime(dataArr[0]);
                        });
                    }
                    else
                    {
                        recordScreen.isCancelledRecord = true; 
                        recordScreen.stopScreenRecording(); 
                    }
                });
            }
        });
    }
    // Event when a message is received from background or extension popup window
    chrome.runtime.onMessage.addListener( // this is the message listener
        async function(request, sender, sendResponse) 
        {
            if(request.type == "captureFirstTime") // Request to capture screneshot for full screen for first screen
            {
                chrome.runtime.sendMessage({type:"closeExtensionPages"});
                if(request.uploadType != "Local")
                {
                    chrome.storage.local.get('quixyLoginUserData', function(res)
                    {
                        quixyuserData = res.quixyLoginUserData;
                        if(quixyuserData && quixyuserData.screenshots && quixyuserData.screenshots == imagesLimit)
                        {
                            let text = "You have reached max upload limit so you cannot upload screenshots to cloud. Do you want to continue with local download?";
                            if(confirm(text))
                            {
                                request.uploadType = "Local";
                                captureScreenshot.captureFullScreenshotsRequest(request);
                            }
                        }
                        else
                        {
                            captureScreenshot.captureFullScreenshotsRequest(request);
                        }
                    });
                }
                else
                {
                    captureScreenshot.captureFullScreenshotsRequest(request);
                }
            }
            else if(request.type == "sendScroll") // Request to capture screneshot for full screen for scrolled screen 
            {
                console.log(request.dataUri, captureScreenshot.requestSentToCaptureScreen, preScreenshotLength, request.dataUri.length, "here we are.");
                if(request.dataUri !== undefined && request.dataUri != "data:," && captureScreenshot.requestSentToCaptureScreen > 0 && (preScreenshotLength == 0 || preScreenshotLength !== request.dataUri.length))
                {
                    preScreenshotLength = request.dataUri.length;
                    captureScreenshot.requestReceivedOnceScreenCaptured = captureScreenshot.requestReceivedOnceScreenCaptured+1;
                    captureScreenshot.baseImgArr.push(request.dataUri);
                    captureScreenshot.scrollWindowManual();  
                }
            }
            else if(request.type == "getGoogleAuth") // Request to google for login
            {
                jQuery.ajax({ 
                    url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+request.authToken,
                    success: function(result)
                    {
                        helpers.googleLoginPopup(result);
                    }
                });
            }
            else if(request.type == "closePreviousWindow") // Request to close previous window
            {
                captureScreenshot.canvas_background = null;
                captureScreenshot.isCanvasBackground = 0;
                if(document.getElementById("canvas_background"))
                {
                    document.getElementById("canvas_background").remove(); 
                    jQuery("#close-captureScreen").unbind('click');
            		jQuery("#close-captureScreen").remove();
                }
            }
            else if(request.type == "videocapture") // Request to record screen
            {
                chrome.runtime.sendMessage({type:"closeExtensionPages"});
                if(request.uploadType != "Local")
                {
                    chrome.storage.local.get('quixyLoginUserData', function(res)
                    {
                        quixyuserData = res.quixyLoginUserData;
                        if(quixyuserData.videos == videosLimit)
                        {
                            let text = "You have reached max upload limit so you cannot upload videos to cloud. Do you want to continue with local download?";
                            if(confirm(text)) 
                            {
                                request.uploadType = "Local";
                                chrome.storage.local.get('isDevicesPermitted', function(resultR)
                                {
                                    let isDevicesPermitted = resultR.isDevicesPermitted;
                                    if(!isDevicesPermitted)
                                    {
                                        let text = "You have blocked access to Camera and Microphone which cannot be allowed while recording. Permissions can be allowed under tab settings. Do you want to continue without Camera and Microphone permissions?";
                                        if(confirm(text)) 
                                        {
                                            chrome.runtime.sendMessage({type:"videocaptureScreen",event: request});
                                        }  
                                    }
                                    else
                                    {
                                        chrome.runtime.sendMessage({type:"videocaptureScreen",event: request});   
                                    } 
                                });
                            }
                        }
                        else
                        {
                            chrome.storage.local.get('isDevicesPermitted', function(resultR)
                            {
                                let isDevicesPermitted = resultR.isDevicesPermitted;
                                if(!isDevicesPermitted)
                                {
                                    let text = "You have blocked access to Camera and Microphone which cannot be allowed while recording. Permissions can be allowed under tab settings. Do you want to continue without Camera and Microphone permissions?";
                                    if(confirm(text)) 
                                    {
                                        chrome.runtime.sendMessage({type:"videocaptureScreen",event: request});
                                    }  
                                }
                                else
                                {
                                    chrome.runtime.sendMessage({type:"videocaptureScreen",event: request});   
                                } 
                            });
                        }
                    });
                }
                else
                {
                    chrome.storage.local.get('isDevicesPermitted', function(resultR)
                    {
                        let isDevicesPermitted = resultR.isDevicesPermitted;
                        if(!isDevicesPermitted)
                        {
                            let text = "You have blocked access to Camera and Microphone which cannot be allowed while recording. Permissions can be allowed under tab settings. Do you want to continue without Camera and Microphone permissions?";
                            if(confirm(text)) 
                            {
                                chrome.runtime.sendMessage({type:"videocaptureScreen",event: request});
                            }  
                        }
                        else
                        {
                            chrome.runtime.sendMessage({type:"videocaptureScreen",event: request});   
                        } 
                    });
                }  
            }
            else if(request.type == "videocaptureScreenResponseEntire") // Request to record for entire screen 
            {
                chrome.storage.local.get('isDevicesAvailable', function(resultR)
                {
                    recordScreen.isDevicesAvailable = resultR.isDevicesAvailable;
                    try 
                    {
                        recordScreen.quix_startCapture(request.event,request.currentTab);  
                    }
                    catch (error) 
                    {
                        window.top.close();
                    }
                });    
            }
            else if(request.type == "videocaptureScreenResponse") // Request to record screen for camera, this tab and cutom tab
            {
                chrome.storage.local.get('isDevicesAvailable', function(resultR)
                {
                    recordScreen.isDevicesAvailable = resultR.isDevicesAvailable;
                    let data7 = { "isPictureInPicture" : false };
                    chrome.storage.local.set(data7, function() {});
                    recordScreen.exitPictureInPicture();
                    setTimeout(function(){ recordScreen.quix_startCapture(request.event,''); },200);  
                });   
            }
            else if(request.type == "toolbarEvents") // Request to manage different toolbar actions from popup
            {
                switch(request.eventType) 
                {
                  case "cam":
                    recordScreen.toolbarToggleCam(request.eventVal);
                    break;
                  case "mic":
                    recordScreen.toolbarToggleMic(request.eventVal);
                    break;
                  case "timer":
                    // code block
                    break;
                  case "panel":
                    recordScreen.hidePanelRecording(request.eventVal);
                    break;
                  case "delete":
                    recordScreen.isCancelledRecord = true;
                    recordScreen.cancelScreenRecording();
                    break;
                  case "pause":
                    recordScreen.toolbarPlayPause(request.eventVal);
                    break;
                  case "stop":
                    recordScreen.isCancelledRecord = false;
                    if(recordScreen.recordingType == 1){ chrome.runtime.sendMessage({type:"executeScriptInallTabs", reqType: "hideToolbar"}); }
                    recordScreen.stopScreenRecording();
                    break;
                  default:
                    // code block
                }
            }
            else if(request.type == "quixyShareFeedback") // Request to share feedback from popup
            {
                shareFeedbackPopup();
            }
            else if(request.type == "quixyUserLogin") // Request to user login from popup
            {
                chrome.runtime.sendMessage({type:"quixyUserLoginCallback", event: request});
            }
            else if(request.type == "getActiveSession")
            {
                chrome.runtime.sendMessage({type:"getActiveSessionCall"});
            }
            else if(request.type == "quixyUserLoginResponse") // User login callback
            {
                jQuery.ajax({ 
                    url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+request.token,
                    success: function(result)
                    {
                        chrome.runtime.sendMessage({type:"quixyUserLoginXMLCall","res":result});
                        // handleQuixyLogIn(result,function(res)
                        // {
                        //     chrome.runtime.sendMessage({type:"quixyuserData",user:res.data});
                        //     let data = { "quixyLoginUserData" : res.data};
                        //     chrome.storage.local.set(data, function() {});
                        // });
                    }
                });
            }
            else if(request.type == "quixyUserLogout") // Request to user logout from popup
            {
                chrome.runtime.sendMessage({type:"quixyUserLogoutCall"});
            }
            else if(request.type == "getAttachedDevices") // Request to get list of devices from popup
            {
                recordScreen.handleGetDevices(request.isMic, request.isCam);
            }
            else if(request.type == "enableCamOnScreen") // Request to enable camera on screen
            {
                if(request.isCam)
                {
                    let data7 = { "isPictureInPicture" : false };
                    chrome.storage.local.set(data7, function() {});
                    recordScreen.recordingType = 1;
                    isCameraRecord = true;
                    recordScreen.recordCameraScreen();
                }
                else
                {
                    recordScreen.recordingType = 1;
                    isCameraRecord =  false;
                    recordScreen.stopCameraScreen();
                }
            }
            else if(request.type == "quixyGotoDashboard") // Request to go to dashboard from popup
            {
                chrome.runtime.sendMessage({type:"quixyGotoDashboardCallback", event: request}); 
            }  
            else if(request.type == "quixyGotoQuixy") // Request to go to quixy from popup
            {
                chrome.runtime.sendMessage({type:"quixyGotoQuixyCallback", event: request}); 
            }
            else if(request.type == "quixyGotoQuixyLogin") // Request to go to screenGenius Login Page
            {
                chrome.runtime.sendMessage({type:"quixyGotoQuixyLoginCallback", event: request}); 
            }
            else if(request.type == "quixyOpenEditor") // Request to open screenshot editor from popup
            {
                chrome.runtime.sendMessage({type:"quixyOpenEditorCallback", event: request}); 
            }
            else if(request.type == "extensionPopupClosed") // Event when extension popup is closed
            {
                if(!request.isRecording && inPIPMode)
                {
                    recordScreen.toolbarToggleCam("disabled");
                }
            }
            else if(request.type == "executeScriptInallTabsCallback") // Execute script in all tabs for entire screen feature
            {
                if(request.event.reqType == "hideToolbar") // request to hide toolbar
                {
                    recordScreen.isCancelledRecord = false;
                    recordScreen.stopScreenRecording("other");
                }
                else if(request.event.reqType == "cancelToolbar") // Request to cancel toolbar
                {
                    recordScreen.isCancelledRecord = true;
                    recordScreen.stopScreenRecording("other");
                }
                else if(request.event.reqType == "toolbarEventsAllTabsTimer") // Request to update timer in toolbar on all screens for entire screen recording
                {
                    recordScreen.updateControlBarTime(request.event.badgeText);
                }
                else if(request.event.reqType == "toolbarEventsAllTabs") // Request to update toolbar icons on all screens for entire screen recording
                {
                    // if(request.event.reqVal !== isCameraRecord)
                    // {
                        recordScreen.updateControlBarStates(request.event.reqSubType,request.event.reqVal);
                    // }
                }
                else // Request to display control panel
                {
                    let autostopVal = request.event.autostopVal;
                    let recordDelay = request.event.recordDelay;
                    let delayD = request.event.delayD;
                    let recType = request.event.recordingType;
                    isCameraRecord = request.event.isCamera;
                    isMicrophoneRecord  = request.event.isMicrophone;
                    isPanelRecord  = request.event.isPanel;
                    isPlayRecord  = request.event.isPlay;
                    recordScreen.recordingType = recType;
                    // cancelScreenRecording();
                    chrome.storage.local.get('isDevicesAvailable', function(resultR)
                    {
                        recordScreen.isDevicesAvailable = resultR.isDevicesAvailable;
                        recordScreen.displayControls(autostopVal,delayD,recordDelay,recordScreen.isDevicesAvailable,function(){ });
                    });
                }
            }    
            else // Request to capture screenshot for Visible part, selected area and custom upload
            {
                chrome.runtime.sendMessage({type:"closeExtensionPages"});
                if(request.uploadType != "Local")
                {
                    chrome.storage.local.get('quixyLoginUserData', function(res)
                    {
                        quixyuserData = res.quixyLoginUserData;
                        if(quixyuserData && quixyuserData.screenshots && quixyuserData.screenshots == imagesLimit)
                        {
                            let text = "You have reached max upload limit so you cannot upload screenshots to cloud. Do you want to continue with local download?";
                            if(confirm(text)) 
                            {
                                request.uploadType = "Local";
                                captureScreenshot.captureScreenshotsRequest(request);
                            }
                        }
                        else
                        {
                            captureScreenshot.captureScreenshotsRequest(request);
                        }
                    });
                }
                else
                {
                    captureScreenshot.captureScreenshotsRequest(request);
                }
            }
            
            let data = { "quixyScreenShotType" : screenShotType };
            chrome.storage.local.set(data, function() {});
            captureScreenshot.clearFinalScreenshot();
            sendResponse();
        }
    );
}

// Deprecated feature
function openDownloadArea(screenshot)
{
    screensHistory(screenshot);
    let html = '<div id="download-overlay" class="fulscreen-mode">\n\
        <div id="download-overlay-inner" class="download-overlay-inner half-screen-view">\n\
            <input type="hidden" value="'+loaderIcon+'" id="loader-icon-hid">\n\
            <input type="hidden" value="'+attachmentIcon+'" id="attachment-icon-hid">\n\
            <div id="screenshot-wrapper" >\n\
                <div id="screenshot-wrapper-top">\n\
                    <div class="screenshot-title"><input type="text" name=""></div>\n\
                    <ul class="sideBar-ul annotate-ul" >\n\
                        <li class="sideBar-li quix-text" title="Text"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+textIcon2+'"/></div></li>\n\
                        <li class="sideBar-li quix-shapes" title="Shapes"><div class="sideBar-li-inner"><img class="sideBar-icon  shape-parent-icon" src="'+rectanleIcon2+'"/><img class="sideBar-icon" src="'+downIcon1+'"/></div>\n\
                            <div class="shapes-popup-outer">\n\
                                <div class="shapes-popup-inner">\n\
                                    <div class="shape-row shape-reactangle"><div class="shape-col"><img src="'+rectanleIcon2+'"></div></div>\n\
                                    <div class="shape-row shape-oval"><div class="shape-col"><img src="'+ovalIcon+'"></div></div>\n\
                                    <div class="shape-row shape-line"><div class="shape-col"><img src="'+lineIcon+'"></div></div>\n\
                                    <div class="shape-row shape-arrow"><div class="shape-col"><img src="'+arrowIcon+'"></div></div>\n\
                                </div>\n\
                            </div>\n\
                        </li>\n\
                        <li class="sideBar-li quix-highlight" title="Highlight"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+markertoolIcon+'"/></div></li>\n\
                        <li class="sideBar-li quix-blur" title="Blur"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+blurIcon+'"/></div></li>\n\
                        <li class="sideBar-li quix-crop" title="Crop"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+cropIcon+'"/></div></li>\n\
                        <li class="sideBar-li quix-upload" title="Image Upload"><input type="file" id="imgUpload" name="imgUpload"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+uploadtoolIcon+'"/></div></li>\n\
                    </ul>\n\
                    <div class="screenshot-close">\n\
                        <span class="screenshot-close-inner"><img src="'+closeIcon+'" title="Close"></span>\n\
                    </div>\n\
                    <div class="screenshot-maximize">\n\
                        <span class="screenshot-maximize-inner"><img src="'+expandIcon+'" title="Maximize"></span>\n\
                    </div>\n\
                    <div class="sideBar-seperator">|</div>\n\
                    <div class="screenshot-zoom">\n\
                        <span class="zoom-quix-out"><img src="'+minusIcon+'" title=\'Shift + "+"\'></span>\n\
                        <span class="zoom-quix-status">100%</span>\n\
                        <span class="zoom-quix-in"><img src="'+plusIcon+'" title=\'Shift + "-"\'></span>\n\
                    </div>\n\
                    <div class="sideBar-seperator">|</div>\n\
                    <ul class="sideBar-ul share-ul" >\n\
                        <li class="sideBar-li copy-clipboard" title="Copy to Clipboard"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+copyIcon2+'"/></li>\n\
                        <li class="sideBar-li icon-shareable" title="Share">\n\
                            <div class="sideBar-li-inner">\n\
                                <img class="sideBar-icon" src="'+shareIcon2+'"/>\n\
                                <img class="sideBar-icon" src="'+downIcon3+'"/>\n\
                            </div>\n\
                            <div class="share-popup-outer">\n\
                                <div class="share-popup-inner">\n\
                                    <div class="share-row share-link label-share"><div class="download-col"><img class="download-col-img" src="'+linkIcon+'"/><span>Share Link</span></div></div>\n\
                                    <div class="share-row share-email label-email"><div class="download-col"><img class="download-col-img" src="'+emailIcon+'"/><span>Share via Email</span></div></div>\n\
                                </div>\n\
                            </div>\n\
                        </li>\n\
                        <li class="sideBar-li label-download" title="Download">\n\
                            <div class="sideBar-li-inner">\n\
                                <img class="sideBar-icon" src="'+downloadIcon2+'"/>\n\
                                <img class="sideBar-icon" src="'+downIcon4+'"/>\n\
                            </div>\n\
                            <div class="download-popup-outer">\n\
                                <div class="download-popup-inner">\n\
                                    <div class="download-row download-png"><div class="download-col"><span>PNG</span></div></div>\n\
                                    <div class="download-row download-jpeg"><div class="download-col"><span>JPG</span></div></div>\n\
                                    <div class="download-row download-pdf"><div class="download-col"><span>PDF</span></div></div>\n\
                                </div>\n\
                            </div>\n\
                        </li>\n\
                    </ul>\n\
                    <ul class="sideBar-ul manage-ul" >\n\
                        <li class="sideBar-li icon-undo" title="Undo"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+undoIcon+'"/></li>\n\
                        <li class="sideBar-li icon-redo" title="Redo"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+redoIcon+'"/></div></li>\n\
                        <li class="sideBar-li label-reset" title="Reset Changes"><div class="sideBar-li-inner"><img class="sideBar-icon" src="'+resetIcon+'"/></div></li>\n\
                    </ul>\n\
                </div>\n\
                <div id="annotations-popup-outer">\n\
                    <div class="annotations-popup-inner">\n\
                        <div class="annotation-row annotation-font-family">\n\
                            <div class="annotation-col">\n\
                                <select id="font-family">\n\
                                    <option value="Arial">Arial</option>\n\
                                    <option value="serif">serif</option>\n\
                                    <option value="sans-serif">Sans-serif</option>\n\
                                    <option value="Verdana">Verdana</option>\n\
                                    <option value="Times New Roman">Times New Roman</option>\n\
                                    <option value="Courier New">Courier New</option>\n\
                                </select>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-fonts">\n\
                            <div class="annotation-col">\n\
                                <select id="font-size">\n\
                                    <option value="10">10</option>\n\
                                    <option value="12">12</option>\n\
                                    <option selected value="14">14</option>\n\
                                    <option value="16">16</option>\n\
                                    <option value="22">22</option>\n\
                                    <option value="26">26</option>\n\
                                    <option value="32">32</option>\n\
                                    <option value="40">40</option>\n\
                                    <option value="48">48</option>\n\
                                    <option value="60">60</option>\n\
                                    <option value="72">72</option>\n\
                                </select>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-fonts-styles">\n\
                            <div class="annotation-col">\n\
                                <span class="input-radio-custom input-radio-custom-style">\n\
                                    <input type="checkbox" name="font_style[]" value="Italic">\n\
                                    <img src="'+italicIcon+'"/>\n\
                                </span>\n\
                                <span class="input-radio-custom input-radio-custom-style">\n\
                                    <input type="checkbox" name="font_style[]" value="Bold">\n\
                                    <img src="'+boldIcon+'"/>\n\
                                </span>\n\
                                <span class="input-radio-custom input-radio-custom-style">\n\
                                    <input type="checkbox" name="font_style[]" value="Underline">\n\
                                    <img src="'+underlineIcon+'"/>\n\
                                </span>\n\
                                <span class="input-radio-custom input-radio-custom-align active">\n\
                                    <input checked type="radio" name="text_alignment" value="start">\n\
                                    <img src="'+alignleftIcon+'"/>\n\
                                </span>\n\
                                <span class="input-radio-custom input-radio-custom-align">\n\
                                    <input type="radio" name="text_alignment" value="center">\n\
                                    <img src="'+aligncenterIcon+'"/>\n\
                                </span>\n\
                                <span class="input-radio-custom input-radio-custom-align">\n\
                                    <input type="radio" name="text_alignment" value="end">\n\
                                    <img src="'+alignrightIcon+'"/>\n\
                                </span>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-fonts-colors">\n\
                            <div class="annotation-col">\n\
                                <div class="fields-col5" title="Text Color">\n\
                                    <input id="font-color" value="#FF0000" type="text" readonly>\n\
                                    <div class="color-picker-wrapper"><span id="text-color-picker"></span></div>\n\
                                </div>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-fill-transparency">\n\
                            <div class="annotation-col">\n\
                                <div class="fields-col5" title="Fill/Transparency">\n\
                                    <input id="font-fill" value="#FFFF00" type="text" readonly>\n\
                                    <div class="color-picker-wrapper"><span id="fill-color-picker"></span></div>\n\
                                </div>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-outline">\n\
                            <div class="annotation-col">\n\
                                <div class="fields-col5" title="Outline">\n\
                                    <input id="font-outline" value="#000000" type="text" readonly>\n\
                                    <div class="color-picker-wrapper"><span id="outline-color-picker"></span></div>\n\
                                </div>\n\
                                <div class="fields-col2" title="Outline Size">\n\
                                    <input id="font-ouline-size" type="number" min="1" max="5" value="3">\n\
                                </div>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-blur">\n\
                            <div class="annotation-col">\n\
                                <div class="fields-col5">\n\
                                    <input id="blur-strength" type="number" min="1" max="5" value="3">\n\
                                </div>\n\
                             </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-highlight">\n\
                            <div class="annotation-col">\n\
                                <div class="highlight-type">\n\
                                    <select id="highlightType">\n\
                                        <option value="Brush">Brush</option>\n\
                                        <option value="Block">Block</option>\n\
                                    </select>\n\
                                </div>\n\
                                <div class="highlight-size">\n\
                                    <select id="highlight-size">\n\
                                        <option value="small">Small</option>\n\
                                        <option value="medium">Medium</option>\n\
                                        <option value="large">Large</option>\n\
                                    </select>\n\
                                </div>\n\
                                <input id="highlight-bg-input" value="#ff0" type="text" readonly>\n\
                                <div class="color-picker-wrapper"><span id="highlight-bg-color-picker"></span></div>\n\
                                <div class="highlight-pallette">\n\
                                    <span data-color="#ff0" style="background-color: #ff0;"></span>\n\
                                    <span data-color="#30FF00" style="background-color: #30FF00;"></span>\n\
                                    <span data-color="#FF004A" style="background-color: #FF004A;"></span>\n\
                                    <span data-color="#1600FF" style="background-color: #1600FF;"></span>\n\
                                    <span data-color="#000000" style="background-color: #000000;"></span>\n\
                                </div>\n\
                            </div>\n\
                        </div>\n\
                        <div class="annotation-row annotation-horizontal"><div class="annotation-col"><label>X</label><input id="x-val" value="0" type="text"></div></div>\n\
                        <div class="annotation-row annotation-vertical"><div class="annotation-col"><label>Y</label><input id="y-val" value="0" type="text"></div></div>\n\
                        <div class="annotation-row annotation-width"><div class="annotation-col"><label>W</label><input id="width-val" value="0" type="text"></div></div>\n\
                        <div class="annotation-row annotation-height"><div class="annotation-col"><label>H</label><input id="height-val" value="0" type="text"></div></div>\n\
                        <div class="annotation-row annotation-buttons">\n\
                            <div class="cancel-annotation">\n\
                                 <button>cancel</button>\n\
                            </div>\n\
                            <div class="save-annotation">\n\
                                 <button class="text-button">Save</button>\n\
                            </div>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
                <div id="screenshot-wrapper-bottom-copyright" class="screenshot-wrapper-bottom-copyright">\n\
                    <div class="copyright-logo"><img src="'+logoIcon1+'"><span>ScreenGenius</span></div>\n\
                    <div class="copyright-updates"><span class="copyright-updates-inner">Checkout ScreenGenius version 1.0 & enjoy the updated features!</span></div>\n\
                    <div class="copyright-logo-powered">\n\
                        <span class="copyright-reserved">powered by</span>\n\
                        <a target="_blank" href="https://quixy.com/"><img src="'+logoIcon2+'"></a>\n\
                    </div>\n\
                </div>\n\
                <div id="screenshot-wrapper-bottom">\n\
                    <div id="screenshot-wrapper-bottom-wrap">\n\
                        <div id="screenshot-wrapper-bottom-wrap-inner">\n\
                            <canvas id="captured-screen">\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
            </div>\n\
        </div>\n\
    </div>\n\
    <style>@font-face {font-family: "FuturaBkBook";src: url('+FuturaBkBook2+') format("woff2"), url('+FuturaBkBook1+') format("woff");}</style>';
    jQuery("body").append(html);
    let image = new Image();
    image.onload = function() 
    {
        screenshotName = "IMG_"+(Math.floor(Math.random() * 10000));
        jQuery(".screenshot-title input").val(screenshotName);
        //jQuery("#screenshot-wrapper-bottom-wrap").css({"width": parseInt((image.width+((whiteSpaceAround)*2)+30))+"px"});
        let canvas = document.getElementById("captured-screen");
        canvas.height = image.height+((whiteSpaceAround/zoomValuePercentRatio)*2);
        canvas.width = image.width+((whiteSpaceAround/zoomValuePercentRatio)*2);
        let context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, (whiteSpaceAround/zoomValuePercentRatio), (whiteSpaceAround/zoomValuePercentRatio));
        let sshot = canvas.toDataURL("image/jpeg",1);
        originalImage = sshot;
        chrome.runtime.sendMessage({type:"updateCordinates",cooridnatesDrawnAt:cooridnatesDrawnAt});
        autoadjustScreenshot(canvas.width,canvas.height);
        addEventListeners();
    };
    image.src = screenshot;
    
}