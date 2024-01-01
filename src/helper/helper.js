/*global chrome*/
import React, { Component, useEffect } from 'react';
let secondsCounter = 0;
let captureEvent = 0;
let isCameraPopup = 0;
let isMicrophonePopup = 0;
let isPanelPopup = 0;
let isPlayPopup = 0;
let isBadgeTextPopup = "0.00";
let micOptions = false;
let camOptions = false;
let quixyuserData = "";
let quixyLastAction = "";
let quixyCamStarted = false;
export const handleCaptureScreen =(id, event)=>{
    console.log(id, event)
    let uploadType = document.querySelector('.quix-screenshot-video-upload').value;
    localStorage.setItem('sniprruploadType', uploadType);
    chrome.storage.local.get('quixyLoginUserData', function(res)
    {
      quixyuserData = res.quixyLoginUserData;
      if(uploadType === "Cloud" && (quixyuserData === "" || quixyuserData === null))
      {
        document.querySelector("#quix-signin-wrapper").style.display = "block";
        quixyLastAction = "Cloud";
      }
      else
      {
        if(captureEvent === 0)
        {
          captureEvent = 1;
          if(id === 3)
          {
            console.log("id==3 ")
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, 
              {
                  type: "closePreviousWindow"
              }, function(response) {
              });
              setTimeout(function(){
                chrome.tabs.captureVisibleTab(null, {'quality': 100}, function(dataUri) {
                  chrome.tabs.sendMessage(tabs[0].id, 
                  {
                      event: id,
                      dataUri: dataUri,
                      uploadType:uploadType
                  }, function(response) {
                    window.close();
                  });
                });                     
              },100);
            });
          }
          else if(id === 4)
          {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = function()
            { 
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 
                {
                    event: id,
                    dataUri: reader.result,
                    uploadType:uploadType
                }, function(response) {
                  document.querySelector(".quix-upload-image input").value = null;
                  window.close();
                });
              });
            }
            reader.onerror = function(error){ console.log(error); }
          }
          else
          {
            let timeDelayElem = parseInt(document.querySelector("#quix-plusMinus-outer input").value)*1000;
            console.log(timeDelayElem, "timeDelayElem")
            //let data = { "sniprrDelayTimer": (timeDelayElem/1000)+"s" };
            localStorage.setItem('sniprrDelayTimer', (timeDelayElem/1000));
            //chrome.storage.local.set(data, function() {});
            let intervalLimit = timeDelayElem;
            let loaderInt = setInterval(function(){
              if(intervalLimit < 0)
              {
                clearInterval(loaderInt);
                document.querySelector(".quix-capture-loading span").innerText = "";
                if(id === 1)
                { 
                  document.querySelector(".quix-capture-loading span").style.display = "none";
                  document.querySelector(".quix-full-inner-bottom").style.display = "block"; 
                }
              }
              else if(intervalLimit > 0)
              {
                document.querySelector(".quix-capture-loading span").style.display = "initial";
                document.querySelector(".quix-capture-loading span").innerText = "Screenshot capturing in "+ (intervalLimit/1000)+" seconds...";
              }
              intervalLimit = intervalLimit-1000;
            },1000);
            setTimeout(function()
            {
              if(id === 1)
              {
                document.querySelector(".quix-capture-area").style.display = "none";
                document.querySelector(".quix-fullscreen-loader").style.display = "block";
                chrome.runtime.onMessage.addListener(
                  function (request, sender, sendResponse) 
                  {
                    if (request.type === "closePopupWindow") 
                    {
                      window.close();
                    }
                  }
                );
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
                {
                    chrome.tabs.sendMessage(tabs[0].id, 
                    {
                      type:"captureFirstTime",
                      uploadType:uploadType
                    }, function(response) 
                    {
                      //window.close();
                    });
                });
              }
              else if(id === 2)
              {
                console.log("2vvbvbvnvvvv")
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                  chrome.tabs.captureVisibleTab(null, {'quality': 100}, function(dataUri) {
                    chrome.tabs.sendMessage(tabs[0].id, 
                    {
                        event: id,
                        dataUri: dataUri,
                        uploadType:uploadType,
                        action: 'hello'
                    }, function(response) {
                     // window.close();
                    });
                  });
                });
              }
            }, timeDelayElem); 
          }
        }
      }
    });
  };
  // Request to record screen for all modes
  export const handleRecordScreen = (id, event) => 
  {
    console.log("handleRecordScreen", id)
    let recordType = id+1;
    if(recordType === 2)
    {
      document.querySelector(".quix-camera-option input").checked = true;
      document.querySelector(".quix-microphone-option input").checked = true;
      document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio.png");
      document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera.png");
    }
    let isCamera = document.querySelector('input[name="is-camera"]:checked');
    let isMicrophone = document.querySelector('input[name="is-microphone"]:checked');
    let recordDelay = parseInt(document.querySelector('.quix-record-delay').value);
    // let qualityVal = document.querySelector('.quix-recorder-video-quality').value;
    let qualityVal =  document.querySelector('.quix-upload-options-selected').innerText;
    let uploadType = document.querySelector('.quix-recorder-video-upload').value;
    let micID = document.querySelector(".quix-recorder-ismic").value;
    let camID = document.querySelector(".quix-recorder-iscamera").value;
    chrome.storage.local.get('quixyLoginUserData', function(res)
    {
      quixyuserData = res.quixyLoginUserData;
      if(uploadType === "Cloud" && (quixyuserData === "" || quixyuserData === null))
      {
        document.querySelector("#quix-signin-wrapper").style.display = "block";
        quixyLastAction = "Cloud";
      }
      else
      {
        const camdis = document.querySelector('.quix-camera-option img').getAttribute("src") === 'data:image/png;base64,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'
        if(camdis){
          console.log("camdis>>>>>>>>>>>>>>>>>>>>>>>",camdis)
          isCamera = false;
        }
        else{
           isCamera = true;
           console.log("camdis>>>>>>>>>>>>>>>>>>>>>>>",camdis) 
          }
        // if(isCamera === null){ isCamera = false; }else{ isCamera = true; }
        if(isMicrophone === null){ isMicrophone = false; }else{ isMicrophone = true; }
        localStorage.setItem('sniprrRecorderDelayTimer', recordDelay);
        localStorage.setItem('sniprrRecorderuploadType', uploadType);
        localStorage.setItem('sniprrRecorderIsMicrophone', isMicrophone);
        localStorage.setItem('sniprrRecorderIsCamera', isCamera); 
        localStorage.setItem('sniprrRecorderVidQuality', qualityVal); 
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, 
          {
              event: recordType,
              isCamera: isCamera,
              camID: camID,
              isMicrophone: isMicrophone,
              micID: micID,
              recordDelay: recordDelay,
              qualityVal: qualityVal,
              uploadType: uploadType,
              type: "videocapture"
          }, function(response) {
            window.close();
          });
        });
      }
    });
  };

  // // Request to capture screenshot for all modes
  // handleRecordSelection = id => event => 
  // {
  //   let clickedBlock = id;
  //   let blocks = document.querySelectorAll(".quix-recording-block");
  //   if(clickedBlock === 1 || clickedBlock === 2)
  //   {
  //     let cameraSelection = document.querySelector(".quix-camera-option input");
  //     cameraSelection.checked = true;
  //   }

  //   for (let i = 0; i < blocks.length; i++) 
  //   {
  //     if(i === id)
  //     {
  //       blocks[id].classList.add("active");
  //       let blocksSelection = document.querySelectorAll(".quix-recording-block input")[id];
  //       blocksSelection.checked = true;
  //     }
  //     else
  //     {
  //       blocks[i].classList.remove("active");
  //     }
  //   }
  // };

  // Request to manage tabs for screenshot capture and screen recording
  export const handleCaptureMode = (mode, event) =>
  {
    if(mode === "screenshot")
    {
      if(document.querySelector(".quix-tab-toolbox"))
      {
        console.log("handleCaptureMode", mode)
        let timerDelay = localStorage.getItem('sniprrDelayTimer');
        let uploadType = localStorage.getItem('sniprruploadType');
        if(uploadType === undefined || uploadType === null){ uploadType = "Local";}else{uploadType = uploadType}
        if(timerDelay === undefined || timerDelay === null){ timerDelay = "0s";}else{ timerDelay = timerDelay+'s'; }
        console.log(timerDelay, uploadType, "timerDelay");
        document.querySelector(".quix-capture-delay").value = timerDelay;
        document.querySelector(".quix-upload-options-selected").innerText = uploadType;
        localStorage.setItem('snipprrMode', mode);
        document.querySelector(".quix-screenshot-capture").classList.remove("inactive");
        document.querySelector(".quix-video-capture").classList.remove("active");
        document.querySelector(".quix-screenshot-capture").classList.add("active");
        document.querySelector(".quix-video-capture").classList.add("inactive");
        // document.querySelector(".quix-tab-recorder").style.display = "none";
        document.querySelector(".quix-tab-toolbox").style.display = "block";
        document.querySelector(".quix-block-local-rec span").innerText = "Open Image Editor";
        document.querySelector(".quix-block-local-rec span").setAttribute("edit-type", "screenshot");

        document.querySelector(".quix-screenshot-upload-dropdown .quix-upload-options-selected").innerHTML = uploadType;
        document.querySelector(".quix-screenshot-upload-dropdown .quix-screenshot-video-upload").value = uploadType;
        var uploadDrop = document.querySelectorAll(".quix-screenshot-upload-dropdown .quix-recorder-video-upload-options .quix-upload-options-row");
        for (let k = 0; k < uploadDrop.length; k++) {
          var textVal = uploadDrop[k].querySelector("span").innerText;
          if(textVal === uploadType)
          {
            uploadDrop[k].classList.add("active");
            if(uploadDrop[k].querySelector("img"))
            {
              var activeIcon = uploadDrop[k].querySelector("img").getAttribute("data-active");
              uploadDrop[k].querySelector("img").src = activeIcon;
            }
          }
        }
      }
    }
    else if (mode === 'recorder')
    {
      if(document.querySelector(".quix-tab-recorder"))
      {
        setTimeout(() => 
        {
        console.log("mode  ====>", mode)
        if(!micOptions)
        {
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
          {
              chrome.tabs.sendMessage(tabs[0].id, 
              {
                type:"getAttachedDevices",
                isMic:true,
                isCam:true
              }, function(response) 
              {
                //window.close();
              });
          });
        }
        let recordtimerDelay = localStorage.getItem('sniprrRecorderDelayTimer');
        let recordUploadType = localStorage.getItem('sniprrRecorderuploadType');
        let recordIsMicrophone = localStorage.getItem('sniprrRecorderIsMicrophone');
        let recordIsCamera = localStorage.getItem('sniprrRecorderIsCamera');
        let sniprrRecorderVidQuality = localStorage.getItem('sniprrRecorderVidQuality');
        console.log(sniprrRecorderVidQuality,recordIsCamera, "sniprrRecorderVidQuality")
        if(recordUploadType === undefined || recordUploadType === null){ recordUploadType = "Local";}
        if(sniprrRecorderVidQuality === undefined || sniprrRecorderVidQuality === null){ sniprrRecorderVidQuality = "720p";}
        if(recordtimerDelay === undefined || recordtimerDelay === null){ recordtimerDelay = "3s";}else{ recordtimerDelay = recordtimerDelay+'s'; }

        if(recordIsMicrophone === 'false')
        { 
          recordIsMicrophone = false; 
          document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio-dis.png");
        }
        else
        { 
          recordIsMicrophone = true; 
          document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio.png");
        }
        // if(recordIsCamera === 'false'){ 
        //   recordIsCamera = false;
        //   document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera-dis.png");
        // }else{ 
        //   recordIsCamera = true; 
        //   document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera.png"); 
        // }
        console.log(document.querySelector(".quix-video-quality-dropdown .quix-upload-options-selected"));
        console.log(document.querySelector(".quix-upload-options-selected"));
        console.log(document.querySelector(".quix-video-quality-dropdown .quix-recorder-video-quality"));
        console.log(document.querySelector(".quix-recorder-video-quality"));
        document.querySelector(".quix-video-quality-dropdown .quix-upload-options-selected").innerHTML = sniprrRecorderVidQuality;
        document.querySelector(".quix-video-quality-dropdown .quix-recorder-video-quality").value = sniprrRecorderVidQuality;
        var qualityDrop = document.querySelectorAll(".quix-video-quality-dropdown .quix-recorder-video-upload-options .quix-upload-options-row");
        for (let j = 0; j < qualityDrop.length; j++) {
          var textVal = qualityDrop[j].querySelector("span").innerText;
          if(textVal === sniprrRecorderVidQuality)
          {
            qualityDrop[j].classList.add("active");
            if(qualityDrop[j].querySelector("img"))
            {
              var activeIcon = qualityDrop[j].querySelector("img").getAttribute("data-active");
              qualityDrop[j].querySelector("img").src = activeIcon;
            }
          }
        }
        // console.log(document.querySelector(".quix-video-upload-dropdown .quix-upload-options-selected"));
        // console.log(document.querySelector(".quix-video-upload-dropdown .quix-recorder-video-upload"));
        document.querySelector(".quix-video-upload-dropdown .quix-upload-options-selected").innerHTML = recordUploadType;
        document.querySelector(".quix-video-upload-dropdown .quix-recorder-video-upload").value = recordUploadType;
        var uploadDrop = document.querySelectorAll(".quix-video-upload-dropdown .quix-recorder-video-upload-options .quix-upload-options-row");
        
        for (let i = 0; i < uploadDrop.length; i++) {
          var textVal = uploadDrop[i].querySelector("span").innerText;
          if(textVal === recordUploadType)
          {
            uploadDrop[i].classList.add("active");
            if(uploadDrop[i].querySelector("img"))
            {
              var activeIcon = uploadDrop[i].querySelector("img").getAttribute("data-active");
              uploadDrop[i].querySelector("img").src = activeIcon;
            }
          }
        }

        let cameraSelection = document.querySelector(".quix-camera-option input");
        cameraSelection.checked = recordIsCamera;
        let micSelection = document.querySelector(".quix-microphone-option input");
        micSelection.checked = recordIsMicrophone;
        // console.log(document.querySelector(".quix-record-delay"), "quix-record-delay")
        document.querySelector("#quix-plusMinus-outer .quix-record-delay").value = recordtimerDelay;
        localStorage.setItem('snipprrMode', mode);
        document.querySelector(".quix-screenshot-capture").classList.remove("active");
        document.querySelector(".quix-video-capture").classList.remove("inactive");
        document.querySelector(".quix-screenshot-capture").classList.add("inactive");
        document.querySelector(".quix-video-capture").classList.add("active");
        // document.querySelector(".quix-tab-recorder").style.display = "block";
        // document.querySelector(".quix-tab-toolbox").style.display = "none";
        document.querySelector(".quix-block-local-rec span").innerText = "Open Video Editor";
        document.querySelector(".quix-block-local-rec span").setAttribute("edit-type", "recording");
      }, 1000);
      }
    }
  };

  // // deprecated feature
  // const showHelp =( type, event) => {
  //   if(document.querySelector(".quix-timer-help-outer") !== null)
  //   {
  //     document.querySelector(".quix-timer-help-outer").style.visibility = "visible";
  //   }
  // };

  // // deprecated feature
  // const exitHelp = (type, event) => {
  //   if(document.querySelector(".quix-timer-help-outer") !== null)
  //   {
  //     document.querySelector(".quix-timer-help-outer").style.visibility = "hidden";
  //   }
  // };
  
  // // deprecated feature
  // const handlefileClick = (type, event) => {
  //     document.querySelector(".quix-upload-image input").click();
  // };

//   // To manage delay timer for screenshot capture
//   handleIncementDecrementCaptureDelay = action => event => {  
//     secondsCounter = document.querySelector("#quix-plusMinus-outer .quix-capture-delay").value;
//     secondsCounter = parseInt(secondsCounter);
//     if(action === "plus")
//     {
//       if(secondsCounter <= 60)
//       {
//         secondsCounter = secondsCounter+1;
//       }
//     } 
//     else
//     {
//       if(secondsCounter > 0)
//       {
//         secondsCounter = secondsCounter-1;
//       }
//     } 
//     document.querySelector("#quix-plusMinus-outer .quix-capture-delay").value = secondsCounter+"s";
//   };

//   // To manage delay timer for screen recording
//   handleIncementDecrementRecordDelay = action => event => {  
//     secondsCounter = document.querySelector("#quix-plusMinus-outer .quix-record-delay").value;
//     secondsCounter = parseInt(secondsCounter);
//     if(action === "plus")
//     {
//       if(secondsCounter <= 60)
//       {
//         secondsCounter = secondsCounter+1;
//       }
//     } 
//     else
//     {
//       if(secondsCounter > 3)
//       {
//         secondsCounter = secondsCounter-1;
//       }
//     } 
//     document.querySelector("#quix-plusMinus-outer .quix-record-delay").value = secondsCounter+"s";
//   };

  // To manage autostop timer for screen recording
  //we are not invoking this function anywhere
//   handleIncementDecrementAutoStop = action => event => {  
//     secondsCounter = document.querySelector("#quix-plusMinus-outer .quix-auto-stop").value;
//     secondsCounter = parseInt(secondsCounter);
//     if(action === "plus")
//     {
//       if(secondsCounter <= 60)
//       {
//         secondsCounter = secondsCounter+1;
//       }
//     } 
//     else
//     {
//       if(secondsCounter > 0)
//       {
//         secondsCounter = secondsCounter-1;
//       }
//     } 
//     document.querySelector("#quix-plusMinus-outer .quix-auto-stop").value = secondsCounter+"s";
//   };

  // handle enable and disable actions for camera
  export const handleWebcam = (action) => 
  {
    if(camOptions)
    {
      let isCamera = document.querySelector('input[name="is-tool-camera"]:checked');
      if(isCamera !== null)
      {
        action = "enabled";
        document.querySelector('.quix-camera-option .quix-tool-enabled-icon-state').style.display = "block";
        document.querySelector('.quix-camera-option .quix-tool-disabled-icon-state').style.display = "none";
      }
      else
      {
        action = "disabled";
        document.querySelector('.quix-camera-option .quix-tool-enabled-icon-state').style.display = "none";
        document.querySelector('.quix-camera-option .quix-tool-disabled-icon-state').style.display = "block";
      }
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
        chrome.tabs.sendMessage(tabs[0].id, 
        {
            type: "toolbarEvents",
            eventType: "cam",
            eventVal: action,
        });
      });
    }
  };

  // handle enable and disable actions for microphone
  export const handleMicrophone = (action) => 
  {
    if(micOptions)
    {
      let isMicrophone = document.querySelector('input[name="is-tool-microphone"]:checked');
      if(isMicrophone !== null)
      {
        action = "enabled";
        document.querySelector('.quix-microphone-option .quix-tool-enabled-icon-state').style.display = "block";
        document.querySelector('.quix-microphone-option .quix-tool-disabled-icon-state').style.display = "none";
      }
      else
      {
        action = "disabled";
        document.querySelector('.quix-microphone-option .quix-tool-enabled-icon-state').style.display = "none";
        document.querySelector('.quix-microphone-option .quix-tool-disabled-icon-state').style.display = "block";
      }
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
        chrome.tabs.sendMessage(tabs[0].id, 
        {
            type: "toolbarEvents",
            eventType: "mic",
            eventVal: action,
        });
      });
    }
  }; 

  // handle enable and disable actions for toolbar panel
  export const handleToolbarPanel = (action)=>{
    let isToolbar = document.querySelector('input[name="is-tool-toobar"]:checked');
    if(isToolbar !== null)
    {
      action = "enabled";
      document.querySelector('.quix-toolbar-option .quix-tool-enabled-icon-state').style.display = "block";
      document.querySelector('.quix-toolbar-option .quix-tool-disabled-icon-state').style.display = "none";
    }
    else
    {
      action = "disabled";
      document.querySelector('.quix-toolbar-option .quix-tool-enabled-icon-state').style.display = "none";
      document.querySelector('.quix-toolbar-option .quix-tool-disabled-icon-state').style.display = "block";
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
    {
      chrome.tabs.sendMessage(tabs[0].id, 
      {
          type: "toolbarEvents",
          eventType: "panel",
          eventVal: action,
      });
    });
  }; 

  // Actions to close recording toolbar
  export const handleCloseToolbar = (action, event) => {
    window.close();
  }; 

// handle button to delete/cancel video recording
export const handleButtonDelete = (action, event )=> {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
        type: "toolbarEvents",
        eventType: "delete",
        eventVal: null,
    }, function(response) {
      chrome.storage.local.set({'isRecorderStarted': false}, function(){});
      window.close();
    });
  });
}; 

  // handle play and pause actions for recording toolbar
  export const handleButtonPause = (action, event) => {
    let isPlay = document.querySelector('input[name="is-play-toobar"]:checked');
    if(isPlay !== null)
    {
      action = "play";
      document.querySelector('.quix-play-option .quix-tool-enabled-icon-state').style.display = "block";
      document.querySelector('.quix-play-option .quix-tool-disabled-icon-state').style.display = "none";
    }
    else
    {
      action = "pause";
      document.querySelector('.quix-play-option .quix-tool-enabled-icon-state').style.display = "none";
      document.querySelector('.quix-play-option .quix-tool-disabled-icon-state').style.display = "block";
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
    {
      chrome.tabs.sendMessage(tabs[0].id, 
      {
          type: "toolbarEvents",
          eventType: "pause",
          eventVal: action,
      });
    });
  }; 

  // handle button to stop video recording
  export const handleButtonStop = (action, event) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
    {
      chrome.runtime.sendMessage({type:"unsetBadge"});
      chrome.tabs.sendMessage(tabs[0].id, 
      {
          type: "toolbarEvents",
          eventType: "stop",
          eventVal: null,
      }, function(response) {
        chrome.storage.local.set({'isRecorderStarted': false}, function(){});
        window.close();
      });
    });
  };

  // // Action to share feedback 
  // export const handleFeedbackShare = (action, event) => {
  //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  //   {
  //     chrome.tabs.sendMessage(tabs[0].id, 
  //     {
  //         type: "shareFeedback",
  //     }, function(response) 
  //     {
  //       window.close();
  //     });
  //   });
  // }; 

  // Open dropdown for mic, camera, save settings, video resolution
  export const openDropdown = (action, event) => 
  {
    if(!micOptions && (action === "video-mic-dropdown" || action === "video-cam-dropdown"))
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
          chrome.tabs.sendMessage(tabs[0].id, 
          {
            type:"getAttachedDevices",
            isMic:true,
            isCam:true
          }, function(response) 
          {
            //window.close();
          });
      });
    }
    let isDisplayed = document.querySelector(".quix-"+action+" .quix-recorder-video-upload-options").style.display;
    let allDropdowns = document.querySelectorAll(".quix-recorder-video-upload-options");
    if(allDropdowns.length > 0)
    {
      for (let index = 0; index < allDropdowns.length; index++) 
      {
        allDropdowns[index].style.display = "none";
      }
    }
    if(isDisplayed === "none" || isDisplayed === "")
    {
      document.querySelector(".quix-"+action+" .quix-recorder-video-upload-options").style.display = "block";
    }
  }; 

  // Perform selection on different dropdowns
  export const selectDropdownValue = (action, event) => 
  {
    // console.log(event)
    let selectedText = event.target.innerText;
    // console.log(selectedText, "selectedtext")
    chrome.storage.local.get('quixyLoginUserData', function(res)
    {
      quixyuserData = res.quixyLoginUserData;
      if(selectedText === "Cloud" && (quixyuserData === "" || quixyuserData === null))
      {
        document.querySelector("#quix-signin-wrapper").style.display = "block";
        quixyLastAction = "Cloud";
        document.querySelector(".quix-"+action+" .quix-upload-type-icon").src = "images/quix-save-cloud.png";
        document.querySelector(".quix-"+action+" .quix-upload-options-selected").innerText = selectedText;
        document.querySelector(".quix-"+action+" select").value = selectedText;
      }
      else
      {
        if(selectedText === "Cloud")
        {
          document.querySelector(".quix-"+action+" .quix-upload-type-icon").src = "images/quix-save-cloud.png";
        }
        if(selectedText === "Local")
        {
          document.querySelector(".quix-"+action+" .quix-upload-type-icon").src = "images/quix-save.png";
        }
        document.querySelector(".quix-"+action+" .quix-upload-options-selected").innerText = selectedText;
        document.querySelector(".quix-"+action+" select").value = selectedText;
      }
      var allRows = event.target.parentElement.parentElement.querySelectorAll(".quix-upload-options-row");
      for (let i = 0; i < allRows.length; i++) {
        allRows[i].classList.remove("active");
        if(allRows[i].querySelector("img"))
        {
          var activeIcon = allRows[i].querySelector("img").getAttribute("data-inactive");
          allRows[i].querySelector("img").src = activeIcon;
        }
      }

        var rows = event.target.parentElement;
        if(!rows.classList.contains("quix-upload-options-row"))
        {
          
          event.target.classList.add("active");
          if(rows.querySelector("img"))
          {
            var activeIcon = event.target.querySelector("img").getAttribute("data-active");
            event.target.querySelector("img").src = activeIcon;
          }
        }
        else
        {
          rows.classList.add("active");
          if(rows.querySelector("img"))
          {
            var activeIcon = rows.querySelector("img").getAttribute("data-active");
            rows.querySelector("img").src = activeIcon;
          }
        }
      
      document.querySelector(".quix-"+action+" .quix-recorder-video-upload-options").style.display = "none";
    });
  }; 

  // Select devices from list of devices dropdown
  const selectDropdownDevicesValue = (action, event) => 
  {
    if(action === "video-cam-dropdown")
    {
      let cameraSelection = document.querySelector(".quix-camera-option input");
      cameraSelection.checked = true;
      document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera.png");
      if(!quixyCamStarted)
      {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
        {
            chrome.tabs.sendMessage(tabs[0].id, 
            {
              type:"enableCamOnScreen",
              isCam:true
            }, function(response) 
            {
              //window.close();
              quixyCamStarted = true;
            });
        });
      }
    }
    else
    {
      let micSelection = document.querySelector(".quix-microphone-option input");
      micSelection.checked = true;
      document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio.png");
    }
    let selectedText = event.target.getAttribute("data-id");
    document.querySelector(".quix-"+action+" select").value = selectedText;
    document.querySelector(".quix-"+action+" .quix-recorder-video-upload-options").style.display = "none";

    var allRows = event.target.parentElement.parentElement.querySelectorAll(".quix-upload-options-row");
    for (let i = 0; i < allRows.length; i++) {
      allRows[i].classList.remove("active");
      if(allRows[i].querySelector("img"))
      {
        var activeIcon = allRows[i].querySelector("img").getAttribute("data-inactive");
        allRows[i].querySelector("img").src = activeIcon;
      }
    }
    event.target.parentElement.classList.add("active");
    if(event.target.parentElement.querySelector("img"))
    {
      var activeIcon = event.target.parentElement.querySelector("img").getAttribute("data-active");
      event.target.parentElement.querySelector("img").src = activeIcon;
    }
  }; 

  // Manage enable/disable events for camera and mic
  export const handleVideoEvents = (action, event) => 
  { 
    let isMic = document.querySelector('input[name="is-microphone"]:checked');
    let isCam = document.querySelector('input[name="is-camera"]:checked');
    if(isMic != null){ isMic = true; }else{ isMic = false;}
    if(isCam != null){ isCam = true; }else{ isCam = false;}
    if(action == "cam")
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
          chrome.tabs.sendMessage(tabs[0].id, 
          {
            type:"enableCamOnScreen",
            isCam:isCam
          }, function(response) 
          {
            //window.close();
            quixyCamStarted = true;
          });
      });
    }

    if(!micOptions && (isMic || isCam))
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
          chrome.tabs.sendMessage(tabs[0].id, 
          {
            type:"getAttachedDevices",
            isMic:isMic,
            isCam:isCam,
            action:action
          }, function(response) 
          {
            //window.close();
          });
      });
    }
    if(action === "mic")
    {
      if(isMic && micOptions)
      {
        document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio.png");
      }
      else
      {
        document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio-dis.png");
      }
    }
    else
    {
      if(isCam && camOptions)
      {
        document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera.png");
      }
      else
      {
        document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera-dis.png");
      }
    }
  };
  
//   // Toggle settings popup
//   handleSettingsTogglePopup = id => event => 
//   {
//     let isVideoSection = document.querySelector(".quix-tab-recorder").style.display;
//     if(document.querySelector(".quix-settings-wrapper"))
//     {
//       let isVisible = document.querySelector(".quix-settings-wrapper").style.display;
//       if(isVisible === "block")
//       {
//         document.querySelector(".quix-settings-wrapper").style.display = "none";
//       }
//       else
//       {
//         document.querySelector(".quix-settings-wrapper").style.display = "block";
//       }
//     }
//   }
  
  // Open video editor in new tab
  export const handleOpenEditor = (action, event) => 
  {
    var action = document.querySelector(".quix-block-local-rec span").getAttribute("edit-type");
    chrome.storage.local.get('quixyLoginUserData', function(res)
    {
      quixyuserData = res.quixyLoginUserData;
      if((quixyuserData === "" || quixyuserData === null) && action === "recording")
      {
        document.querySelector("#quix-signin-wrapper").style.display = "block";
        quixyLastAction = action;
      }
      else
      {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
        {
          chrome.tabs.sendMessage(tabs[0].id, 
          {
            type: "quixyOpenEditor",
            action: action
          }, function(response) 
          {
            window.close();
          });
        });
      }
    });
  }

// Action to go to screengenius dashboard    
export const handlegotoDashboard= (action, event) => 
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyGotoDashboard"
    },function(response) 
    {
      window.close();
    });
  });
}

// Action to go to quixy 
export const handlegotoQuixy= (action, event) => 
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyGotoQuixy"
    },function(response) 
    {
      window.close();
    });
  });
}

// Action to send request to share feedback
export const handleuserFeedback = (action, event) => 
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyShareFeedback"
    },function(response) 
    {
      window.close();
    });
  });
}


// Action to go to screenGenius Login Page 
export const handleuserSocialLogin = (action, event) => 
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyGotoQuixyLogin"
    },function(response) 
    {
      window.close();
    });
  });
}

// Action to send user login request 
export const handleuserLogin = (action, event) => 
{
  document.querySelector("#quix-popup-loader").style.display = "block";
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyUserLogin",
      tabId: tabs[0].id
    });

  });
}

// Action to send user logout request 
export const handleuserLogout = (action, event) => 
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyUserLogout"
    },function(response) 
    {
      document.querySelector('.quix-popup-user .quix-user-pic').src = "images/quix-user-icon.png";
      document.querySelector('.quix-popup-user .quix-user-name').innerText = "Hi Guest!";
      document.querySelector('.quix-popup-user .quix-user-name').title = "You can login at download page.";

      document.querySelector('.quix-settings-userinfo img').src = "images/quix-user-icon.png";
      document.querySelector('.quix-settings-userinfo span').innerText = "Hi Guest!";
      document.querySelector('.quix-settings-userinfo span').title = "You can login at download page.";
      
      var loggedIns = document.querySelectorAll('.user-loggedIn');
      for (let i = 0; i < loggedIns.length; i++) {
        loggedIns[i].style.display = "none";
      }
      var loggedOuts = document.querySelectorAll('.user-loggedOut');
      for (let i = 0; i < loggedOuts.length; i++) {
        loggedOuts[i].style.display = "block";
      }
    });
  });
}

// Action to send user login request 
export const handleSigninPopup = (action, event) => 
{
  document.querySelector("#quix-popup-loader").style.display = "block";
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type: "quixyUserLogin",
      tabId: tabs[0].id
    },function(){
      document.querySelector("#quix-signin-wrapper").style.display = "none";
    });
  });
}

// Action to manage if user chose to cancel login 
export const handleSigninClose = (action, event) => 
{
  document.querySelector("#quix-signin-wrapper").style.display = "none";
  if(quixyLastAction === "Cloud")
  {
    document.querySelector(".quix-screenshot-upload-dropdown .quix-upload-type-icon").src = "images/quix-save.png";
    document.querySelector(".quix-screenshot-upload-dropdown .quix-upload-options-selected").innerText = "Local";
    document.querySelector(".quix-screenshot-upload-dropdown select").value = "Local";

    document.querySelector(".quix-video-upload-dropdown .quix-upload-type-icon").src = "images/quix-save.png";
    document.querySelector(".quix-video-upload-dropdown .quix-upload-options-selected").innerText = "Local";
    document.querySelector(".quix-video-upload-dropdown select").value = "Local";

    var allRows = document.querySelectorAll(".quix-screenshot-upload-dropdown .quix-upload-options-row");
    for (let i = 0; i < allRows.length; i++) {
      allRows[i].classList.remove("active");
      if(allRows[i].querySelector("img"))
      {
        var activeIcon = allRows[i].querySelector("img").getAttribute("data-inactive");
        allRows[i].querySelector("img").src = activeIcon;
      }
    }
    var activeIcon = allRows[0].querySelector("img").getAttribute("data-active");
    allRows[0].querySelector("img").src = activeIcon;
    allRows[0].classList.add("active");

    var allRowsV = document.querySelectorAll(".quix-video-upload-dropdown .quix-upload-options-row");
    for (let i = 0; i < allRowsV.length; i++) {
      allRowsV[i].classList.remove("active");
      if(allRowsV[i].querySelector("img"))
      {
        var activeIcon = allRowsV[i].querySelector("img").getAttribute("data-inactive");
        allRowsV[i].querySelector("img").src = activeIcon;
      }
    }
    var activeIcon = allRowsV[0].querySelector("img").getAttribute("data-active");
    allRowsV[0].querySelector("img").src = activeIcon;
    allRowsV[0].classList.add("active");
  }
  quixyLastAction = "";
}


// Event to manage on popup features on popup window load
export const customEffect = () => {
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    chrome.tabs.sendMessage(tabs[0].id, 
    {
      type:"getActiveSession",
    }, function(response) 
    {
    });
  });
  let clsOBJ = this;
  var port = chrome.runtime.connect();

  // Event when popup is clicked anywhere to close the open dropdown
  document.addEventListener('click', function(event)
  {
    var childUpload = document.querySelector('.quix-screenshot-upload-dropdown');
    var childSettings = document.querySelector('#quix-settings-wrapper');
    var childQuality = document.querySelector('.quix-video-quality-dropdown');
    var childMic = document.querySelector('.quix-video-mic-dropdown');
    var childCam = document.querySelector('.quix-video-cam-dropdown');
    var childRecUpload = document.querySelector('.quix-video-upload-dropdown');
    var childClose = document.querySelector('.quix-popup-close');
    var childUser = document.querySelector('.quix-popup-user');
  
    // Check if the clicked element is inside the parent or child elements
    var isClickedInsideChildUpload = childUpload?.contains(event.target);
    var isClickedInsideChildSettings = childSettings?.contains(event.target);
    var isClickedInsideChildQuality = childQuality?.contains(event.target);
    var isClickedInsideChildMic = childMic?.contains(event.target);
    var isClickedInsideChildCam = childCam?.contains(event.target);
    var isClickedInsideChildRecUpload = childRecUpload?.contains(event.target);
    var isClickedInsideChildClose = childClose?.contains(event.target);
    var isClickedInsideChildUser = childUser?.contains(event.target);
    if(!isClickedInsideChildUpload && !isClickedInsideChildSettings && !isClickedInsideChildQuality && !isClickedInsideChildMic && !isClickedInsideChildCam && !isClickedInsideChildRecUpload && !isClickedInsideChildClose && !isClickedInsideChildUser)
    {
      var uploadOptions = document.querySelectorAll('.quix-recorder-video-upload-options');
      for (let i = 0; i < uploadOptions.length; i++) {
        uploadOptions[i].style.display = 'none';
      }
      // document.querySelector('#quix-settings-wrapper').style.display = 'none';
    }
    if((isClickedInsideChildSettings && !isClickedInsideChildQuality))
    {
      document.querySelector('.quix-video-quality-dropdown .quix-recorder-video-upload-options').style.display = 'none';
    }
    if(isClickedInsideChildClose)
    {
      var uploadOptions = document.querySelectorAll('.quix-recorder-video-upload-options');
      for (let i = 0; i < uploadOptions.length; i++) {
        uploadOptions[i].style.display = 'none';
      }
    }
  });
  
  // Get logged in user's information from local storage
  // chrome.storage.local.get('quixyLoginUserData', function(res)
  // {
  //   quixyuserData = res.quixyLoginUserData;
  //   if(quixyuserData !== "" && quixyuserData !== undefined && quixyuserData !== null)
  //   {
  //     document.querySelector('.quix-popup-user .quix-user-pic').src = quixyuserData.picture;
  //     document.querySelector('.quix-popup-user .quix-user-name').innerText = quixyuserData.name;
  //     document.querySelector('.quix-popup-user .quix-user-name').title = quixyuserData.name;
      
  //     document.querySelector('.quix-settings-userinfo img').src = quixyuserData.picture;
  //     document.querySelector('.quix-settings-userinfo span').innerText = quixyuserData.name;
  //     document.querySelector('.quix-settings-userinfo span').title = quixyuserData.name;

  //     var loggedIns = document.querySelectorAll('.user-loggedIn');
  //     for (let i = 0; i < loggedIns.length; i++) {
  //       loggedIns[i].style.display = "block";
  //     }
  //     var loggedOuts = document.querySelectorAll('.user-loggedOut');
  //     for (let i = 0; i < loggedOuts.length; i++) {
  //       loggedOuts[i].style.display = "none";
  //     }
  //   }
  // });

  // Event when a message is received from background or extension popup window
  chrome.runtime.onMessage.addListener( // this is the message listener
  function(request, sender, sendResponse) 
  {
    if(request.type === "removeCameraPreview") // Event when camera is closed
    {
      document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera-dis.png");
      let cameraSelection = document.querySelector(".quix-camera-option input");
      cameraSelection.checked = false;
    }
    else if(request.type === "quixyuserData") // Event when user data is received 
    {
      quixyuserData = request.user;
      if(quixyuserData !== "" && quixyuserData !== undefined && quixyuserData !== null)
      {
        document.querySelector('.quix-popup-user .quix-user-pic').src = quixyuserData.picture;
        document.querySelector('.quix-popup-user .quix-user-name').innerText = quixyuserData.name;
        document.querySelector('.quix-popup-user .quix-user-name').title = quixyuserData.name;
        
        document.querySelector('.quix-settings-userinfo img').src = quixyuserData.picture;
        document.querySelector('.quix-settings-userinfo span').innerText = quixyuserData.name;
        document.querySelector('.quix-settings-userinfo span').title = quixyuserData.name;
        var loggedIns = document.querySelectorAll('.user-loggedIn');
        for (let i = 0; i < loggedIns.length; i++) {
          loggedIns[i].style.display = "block";
        }
        var loggedOuts = document.querySelectorAll('.user-loggedOut');
        for (let i = 0; i < loggedOuts.length; i++) {
          loggedOuts[i].style.display = "none";
        }
        document.querySelector("#quix-popup-loader").style.display = "none";
      }
      else
      {
        document.querySelector('.quix-popup-user .quix-user-pic').src = "images/quix-user-icon.png";
        document.querySelector('.quix-popup-user .quix-user-name').innerText = "Hi Guest!";
        document.querySelector('.quix-popup-user .quix-user-name').title = "You can login at download page.";

        document.querySelector('.quix-settings-userinfo img').src = "images/quix-user-icon.png";
        document.querySelector('.quix-settings-userinfo span').innerText = "Hi Guest!";
        document.querySelector('.quix-settings-userinfo span').title = "You can login at download page.";
        
        var loggedIns = document.querySelectorAll('.user-loggedIn');
        for (let i = 0; i < loggedIns.length; i++) {
          loggedIns[i].style.display = "none";
        }
        var loggedOuts = document.querySelectorAll('.user-loggedOut');
        for (let i = 0; i < loggedOuts.length; i++) {
          loggedOuts[i].style.display = "block";
        }
      }
      if(quixyLastAction === "recording")
      {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
        {
          chrome.tabs.sendMessage(tabs[0].id, 
          {
            type: "quixyOpenEditor",
            action: "recording"
          }, function(response) 
          {
            window.close();
          });
        });
      }
    }
    else if(request.type === "setBadge") // set recording timer to toolbar window
    {
      isBadgeTextPopup = request.badgeText;
      document.querySelector(".quix-popup-toolbar-timer-inner span").innerText = request.badgeText;
      isCameraPopup = request.isCamera;
      isMicrophonePopup = request.isMicrophone;
      isPanelPopup = request.isPanel;
      isPlayPopup = request.isPlay;
    }
    else if(request.type === "getAttachedDevicesResponse") // get list of attached devices
    {
      let deviceInfos = request.devices;
      document.querySelector('.quix-recorder-ismic').innerHTML = "";
      document.querySelector('.quix-recorder-iscamera').innerHTML = "";
      document.querySelector('.quix-microphone-option .quix-recorder-video-upload-options-inner').innerHTML = "";
      document.querySelector('.quix-camera-option .quix-recorder-video-upload-options-inner').innerHTML = "";
      if(deviceInfos == null || deviceInfos.length <= 0)
      {
        
        let option = document.createElement("option");
        option.value = "";
        option.innerText = "No Device";
        document.querySelector('.quix-recorder-ismic').appendChild(option);

        let span = document.createElement("span");
        span.innerText = "No Device";
        span.setAttribute('data-id', "");

        let div = document.createElement("div");
        div.className = "quix-upload-options-row active";
        div.appendChild(span);
        document.querySelector('.quix-microphone-option .quix-recorder-video-upload-options-inner').appendChild(div);

        let option2 = document.createElement("option");
        option2.value = "";
        option2.innerText = "No Device";
        document.querySelector('.quix-recorder-iscamera').appendChild(option2);

        let span2 = document.createElement("span");
        span2.innerText = "No Device";
        span2.setAttribute('data-id', "");

        let div2 = document.createElement("div");
        div2.className = "quix-upload-options-row active";
        div2.appendChild(span2);
        document.querySelector('.quix-camera-option .quix-recorder-video-upload-options-inner').appendChild(div2);

        document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio-dis.png");
        let micSelection = document.querySelector(".quix-microphone-option input");
        micSelection.checked = false;

        document.querySelector('.quix-recording-block:nth-child(2)').classList.add("inactive");

      }
      // if(deviceInfos != null && deviceInfos.length <= 0)
      // {
      //   document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio-dis.png");
      //   let micSelection = document.querySelector(".quix-microphone-option input");
      //   micSelection.checked = false;
      //   document.querySelector('.quix-recording-block:nth-child(2)').classList.add("inactive");
      // }
      var camCount = 0;
      for (let i = 0; i !== deviceInfos.length; ++i) 
      {
        const deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === 'audioinput') 
        {
          if(deviceInfo.deviceId !== "communications")
          {
            micOptions = true;
            let option = document.createElement("option");
            option.value = deviceInfo.deviceId;
            option.innerText = deviceInfo.label;
            document.querySelector('.quix-recorder-ismic').appendChild(option);

            let span = document.createElement("span");
            span.innerText = deviceInfo.label;
            span.setAttribute('data-id', deviceInfo.deviceId);
            var activeDevice = "";
            if(deviceInfo.deviceId == "default"){ activeDevice = "active"; }
            let div = document.createElement("div");
            div.className = "quix-upload-options-row "+activeDevice;
            div.onclick = function(event) {
              selectDropdownDevicesValue('video-mic-dropdown', event);
          };
            div.appendChild(span);
            document.querySelector('.quix-microphone-option .quix-recorder-video-upload-options-inner').appendChild(div);
          }
        }
        else if (deviceInfo.kind === 'videoinput') 
        {
          camOptions = true;
          let option = document.createElement("option");
          option.value = deviceInfo.deviceId;
          option.innerText = deviceInfo.label;
          document.querySelector('.quix-recorder-iscamera').appendChild(option);

          if(camCount == 0)
          {
            let span = document.createElement("span");
            span.innerText = 'Default';
            span.setAttribute('data-id', 'default');

            let div = document.createElement("div");
            div.className = "quix-upload-options-row active";
            // div.onclick = selectDropdownDevicesValue('video-cam-dropdown');
            div.onclick = function(event) {
              selectDropdownDevicesValue('video-cam-dropdown', event);
          };
            div.appendChild(span);
            document.querySelector('.quix-camera-option .quix-recorder-video-upload-options-inner').appendChild(div);
          }

          let span = document.createElement("span");
          span.innerText = deviceInfo.label;
          span.setAttribute('data-id', deviceInfo.deviceId);

          let div = document.createElement("div");
          div.className = "quix-upload-options-row";
          // div.onclick = clsOBJ.selectDropdownDevicesValue('video-cam-dropdown');
          div.onclick = function(event) {
            selectDropdownDevicesValue('video-cam-dropdown', event);
        };
          div.appendChild(span);
          document.querySelector('.quix-camera-option .quix-recorder-video-upload-options-inner').appendChild(div);
          camCount++;
        }
      }
    }
    else if(request.type === "progressLoader")
    {
      document.querySelector(".quix-fullscreen-loader-progress-inner").style.width = request.width+ "%";
    }
  });

  // check if video recording is going on from local to display between recording toolbar and usual popup view
  chrome.storage.local.get('isRecorderStarted', function(resultR)
  {
    let isRecorder = resultR.isRecorderStarted;
    let snipprrMode = localStorage.getItem('snipprrMode');
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
    // {
    //   chrome.tabs.sendMessage(tabs[0].id, {type: "quixyPopupAllowedCall"});
    // });
    if(isRecorder !== undefined && isRecorder === true)
    {
      let setRecorderInterval = setInterval(function()
      {
        if(isBadgeTextPopup !== "0.00")
        {
          clearInterval(setRecorderInterval);
          document.querySelector(".quix-popup-toolbar-timer-inner span").innerText = isBadgeTextPopup;

          if(isMicrophonePopup && isMicrophonePopup === true)
          {
            document.querySelector('input[name="is-tool-microphone"]').checked = true;
            document.querySelector('.quix-microphone-option .quix-tool-enabled-icon-state').style.display = "block";
            document.querySelector('.quix-microphone-option .quix-tool-disabled-icon-state').style.display = "none";
          }
          else
          {
            document.querySelector('input[name="is-tool-microphone"]').checked = false;
            document.querySelector('.quix-microphone-option .quix-tool-enabled-icon-state').style.display = "none";
            document.querySelector('.quix-microphone-option .quix-tool-disabled-icon-state').style.display = "block";
          }
          if(isCameraPopup && isCameraPopup === true)
          {
            document.querySelector('input[name="is-tool-camera"]').checked = true;
            document.querySelector('.quix-camera-option .quix-tool-enabled-icon-state').style.display = "block";
            document.querySelector('.quix-camera-option .quix-tool-disabled-icon-state').style.display = "none";
          }
          else
          {
            document.querySelector('input[name="is-tool-camera"]').checked = false;
            document.querySelector('.quix-camera-option .quix-tool-enabled-icon-state').style.display = "none";
            document.querySelector('.quix-camera-option .quix-tool-disabled-icon-state').style.display = "block";
          }
          if(isPanelPopup && isPanelPopup === true)
          {
            document.querySelector('input[name="is-tool-toobar"]').checked = true;
            document.querySelector('.quix-toolbar-option .quix-tool-enabled-icon-state').style.display = "block";
            document.querySelector('.quix-toolbar-option .quix-tool-disabled-icon-state').style.display = "none";
          }
          else
          {
            document.querySelector('input[name="is-tool-toobar"]').checked = false;
            document.querySelector('.quix-toolbar-option .quix-tool-enabled-icon-state').style.display = "none";
            document.querySelector('.quix-toolbar-option .quix-tool-disabled-icon-state').style.display = "block";
          }
          if(isPlayPopup && isPlayPopup === true)
          {
            document.querySelector('input[name="is-play-toobar"]').checked = true;
            document.querySelector('.quix-play-option .quix-tool-enabled-icon-state').style.display = "block";
            document.querySelector('.quix-play-option .quix-tool-disabled-icon-state').style.display = "none";
          }
          else
          {
            document.querySelector('input[name="is-play-toobar"]').checked = false;
            document.querySelector('.quix-play-option .quix-tool-enabled-icon-state').style.display = "none";
            document.querySelector('.quix-play-option .quix-tool-disabled-icon-state').style.display = "block";
          }
        }
      },500);
      if(isBadgeTextPopup === "0.00")
      {
        chrome.storage.local.get('setRecorderToolData', function(resultR)
        {
          let data = resultR.setRecorderToolData;
          let dataArr = data.split("-");
          isBadgeTextPopup = dataArr[0];
          if(dataArr[1] === "true"){ isCameraPopup = true; }else{ isCameraPopup = false; }
          if(dataArr[2] === "true"){ isMicrophonePopup = true; }else{ isMicrophonePopup = false; }
          if(dataArr[3] === "true"){ isPanelPopup = true; }else{ isPanelPopup = false; }
          if(dataArr[4] === "true"){ isPlayPopup = true; }else{ isPlayPopup = false; }
        });
      }
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Retrieve the URL of the first tab
        var url = tabs[0].url;
        if(url.indexOf("chrome-extension:") < 0 && url.indexOf("chrome:") < 0)
        {
          document.querySelector(".quix-capture-area").style.display = "none";
          document.querySelector(".quix-record-tool-area").style.display = "block";
          document.querySelector(".quix-not-available-area").style.display = "none";
        }
        else 
        {
          document.querySelector(".quix-capture-area").style.display = "none";
          document.querySelector(".quix-record-tool-area").style.display = "none";
          document.querySelector(".quix-not-available-area").style.display = "block";
        }
      });
    } 
    else
    {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url;
        if(url.indexOf("chrome-extension:") < 0 && url.indexOf("chrome:") < 0 && url.indexOf("chrome.google.com") < 0)
        {
          document.querySelector(".quix-capture-area").style.display = "block";
          document.querySelector(".quix-record-tool-area").style.display = "none";
          document.querySelector(".quix-not-available-area").style.display = "none";
        }
        else 
        {
          document.querySelector(".quix-capture-area").style.display = "none";
          document.querySelector(".quix-record-tool-area").style.display = "none";
          document.querySelector(".quix-not-available-area").style.display = "block";
        }
      });

      // display screenshot capture tab in popup
      if(snipprrMode === "screenshot")
      {
        let timerDelay = localStorage.getItem('sniprrDelayTimer');
        let uploadType = localStorage.getItem('sniprruploadType');
        if(uploadType === undefined || uploadType === null){ uploadType = "Local";}
        if(timerDelay === undefined || timerDelay === null){ timerDelay = "0s";}else{ timerDelay = timerDelay+'s'; }
        document.querySelector("#quix-plusMinus-outer .quix-capture-delay").value = timerDelay;
        localStorage.setItem('snipprrMode', snipprrMode);
        document.querySelector(".quix-screenshot-capture").classList.remove("inactive");
        document.querySelector(".quix-video-capture").classList.remove("active");
        document.querySelector(".quix-screenshot-capture").classList.add("active");
        document.querySelector(".quix-video-capture").classList.add("inactive");
        document.querySelector(".quix-tab-recorder").style.display = "none";
        document.querySelector(".quix-tab-toolbox").style.display = "block";
        document.querySelector(".quix-block-local-rec span").innerText = "Open Image Editor";
        document.querySelector(".quix-block-local-rec span").setAttribute("edit-type", "screenshot");

        document.querySelector(".quix-screenshot-upload-dropdown .quix-upload-options-selected").innerHTML = uploadType;
        document.querySelector(".quix-screenshot-upload-dropdown .quix-screenshot-video-upload").value = uploadType;
        var uploadDrop = document.querySelectorAll(".quix-screenshot-upload-dropdown .quix-recorder-video-upload-options .quix-upload-options-row");
        for (let k = 0; k < uploadDrop.length; k++) {
          var textVal = uploadDrop[k].querySelector("span").innerText;
          if(textVal === uploadType)
          {
            uploadDrop[k].classList.add("active");
            if(uploadDrop[k].querySelector("img"))
            {
              var activeIcon = uploadDrop[k].querySelector("img").getAttribute("data-active");
              uploadDrop[k].querySelector("img").src = activeIcon;
            }
          }
        }
      }
      else // display screen recording tab in popup
      {
        //get List of Devices Available
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
        {
            chrome.tabs.sendMessage(tabs[0].id, 
            {
              type:"getAttachedDevices",
              isMic:true,
              isCam:true
            }, function(response) 
            {
              //window.close();
            });
        });

        let recordtimerDelay = localStorage.getItem('sniprrRecorderDelayTimer');
        let recordUploadType = localStorage.getItem('sniprrRecorderuploadType');
        let recordIsMicrophone = localStorage.getItem('sniprrRecorderIsMicrophone');
        let recordIsCamera = false; //localStorage.getItem('sniprrRecorderIsCamera');
        let sniprrRecorderVidQuality = localStorage.getItem('sniprrRecorderVidQuality');

        if(recordUploadType === undefined || recordUploadType === null){ recordUploadType = "Local";}
        if(sniprrRecorderVidQuality === undefined || sniprrRecorderVidQuality === null){ sniprrRecorderVidQuality = "720p";}
        if(recordtimerDelay === undefined || recordtimerDelay === null){ recordtimerDelay = "3s";}else{ recordtimerDelay = recordtimerDelay+'s'; }
        if(recordIsMicrophone === 'false')
        { 
          recordIsMicrophone = false; 
          document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio-dis.png");
        }
        else
        { 
          recordIsMicrophone = true; 
          document.querySelector('.quix-microphone-option img').setAttribute("src", "images/quix-audio.png");
        }
        // if(recordIsCamera === 'false'){ 
        //   recordIsCamera = false;
        //   document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera-dis.png");
        // }else{ 
        //   recordIsCamera = true; 
        //   document.querySelector('.quix-camera-option img').setAttribute("src", "images/quix-camera.png"); 
        // }

        document.querySelector(".quix-video-quality-dropdown .quix-upload-options-selected").innerHTML = sniprrRecorderVidQuality;
        document.querySelector(".quix-video-quality-dropdown .quix-recorder-video-quality").value = sniprrRecorderVidQuality;
        var qualityDrop = document.querySelectorAll(".quix-video-quality-dropdown .quix-recorder-video-upload-options .quix-upload-options-row");
        for (let j = 0; j < qualityDrop.length; j++) {
          var textVal = qualityDrop[j].querySelector("span").innerText;
          if(textVal === sniprrRecorderVidQuality)
          {
            qualityDrop[j].classList.add("active");
            if(qualityDrop[j].querySelector("img"))
            {
              var activeIcon = qualityDrop[j].querySelector("img").getAttribute("data-active");
              qualityDrop[j].querySelector("img").src = activeIcon;
            }
          }
        }

        document.querySelector(".quix-video-upload-dropdown .quix-upload-options-selected").innerHTML = recordUploadType;
        document.querySelector(".quix-video-upload-dropdown .quix-recorder-video-upload").value = recordUploadType;
        var uploadDrop = document.querySelectorAll(".quix-video-upload-dropdown .quix-recorder-video-upload-options .quix-upload-options-row");
        for (let i = 0; i < uploadDrop.length; i++) {
          var textVal = uploadDrop[i].querySelector("span").innerText;
          if(textVal === recordUploadType)
          {
            uploadDrop[i].classList.add("active");
            if(uploadDrop[i].querySelector("img"))
            {
              var activeIcon = uploadDrop[i].querySelector("img").getAttribute("data-active");
              uploadDrop[i].querySelector("img").src = activeIcon;
            }
          }
        }

        // let cameraSelection = document.querySelector(".quix-camera-option input");
        // cameraSelection.checked = recordIsCamera;
        let micSelection = document.querySelector(".quix-microphone-option input");
        micSelection.checked = recordIsMicrophone;

        document.querySelector("#quix-plusMinus-outer .quix-record-delay").value = recordtimerDelay;
        localStorage.setItem('snipprrMode', snipprrMode);
        document.querySelector(".quix-screenshot-capture").classList.remove("active");
        document.querySelector(".quix-video-capture").classList.remove("inactive");
        document.querySelector(".quix-screenshot-capture").classList.add("inactive");
        document.querySelector(".quix-video-capture").classList.add("active");
        document.querySelector(".quix-tab-recorder").style.display = "block";
        document.querySelector(".quix-tab-toolbox").style.display = "none";
        document.querySelector(".quix-block-local-rec span").innerText = "Open Video Editor";
        document.querySelector(".quix-block-local-rec span").setAttribute("edit-type", "recording");
      }
    }
  }); 
};
