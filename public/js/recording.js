//let APIServer =  "http://localhost:3000";
//let APIServer = "http://82.208.20.76";
let APIServer = "https://screengenius.io";
let clientIDOauth = "83540021534-j3c68n39ht71ojcep42o1qqhvfoh20cs.apps.googleusercontent.com";
let recordedVideoData = "";
let recordedVideoBlobData = "";
let recordedvideoSize = "";
let recordedVideoDuration = "";
let recordedVideoUpload = false;
let helpers;
window.addEventListener('focus', (event) => {
    // to display loggedIn state if user logged from dashboard
    chrome.storage.local.get('quixyLoginUserData', (result) =>
    {
        if(result.quixyLoginUserData == "" || result.quixyLoginUserData == null)
        {
            helpers.makeServerRequest("GET","", APIServer+"/user/get","", (res) =>
            {
                helpers.handleUserSession(res,"get");
            });
        }
    });
});

window.onbeforeunload = (event) =>
{
    chrome.runtime.sendMessage({type:"closeExtensionRecordingPage"});
}
window.onload = () =>
{
    helpers = new helperSG();
    // to get logged in user's data
    helpers.makeServerRequest("GET","", APIServer+"/user/get","", (res) =>
    {
        helpers.handleUserSession(res);
    });
    chrome.storage.local.get('quixyLoginUserData', (result) =>
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            jQuery(".loggedin-item").show();
            jQuery(".loggedOut-item").hide();
        }
        else
        {
            jQuery(".loggedin-item").hide();
            jQuery(".loggedOut-item").show();
        }
    });

    // to get duration of recorded video
    chrome.storage.local.get('recordedVideoDuration', async (obj) => {
        recordedVideoDuration = obj.recordedVideoDuration;
        jQuery(".recording-duration").text(recordedVideoDuration);
    });
    
    // to get recorded video stream
    chrome.storage.local.get('recordedVideoData', async (obj) => {
        recordedVideoData = obj.recordedVideoData;
        helpers.dataURItoBlob(recordedVideoData,(res) =>
        {
            recordedVideoBlobData = res;
            jQuery("#video-download-content-left-inner video").attr("src", recordedVideoData);
        });
    });

    // to get size of recorded video
    chrome.storage.local.get('recordedvideoSize', async (obj) => {
        recordedvideoSize = obj.recordedvideoSize;
        jQuery(".recording-size").text(helpers.formatBytes(recordedvideoSize));
        jQuery(".recording-date").text(helpers.getTodayDate());
    });

    // to get upload settings of recorded video
    chrome.storage.local.get('recordedVideoUpload', async (obj) => {
        recordedVideoUpload = obj.recordedVideoUpload;
        if(recordedVideoUpload)
        { 
            uploadVideoServer("manual");
        }
    });

    jQuery(".video-download-local").unbind('mouseover');
    jQuery(".video-download-local").on("mouseover",() =>{
        jQuery(".download-popup-outer").show();
    });
    jQuery(".video-download-local").unbind('mouseout');
    jQuery(".video-download-local").on("mouseout",() =>{
        let xx = jQuery(".video-download-local:hover").length;
        if(xx == 0)
        {
            jQuery(".download-popup-outer").hide();
        }
    });

    jQuery(".video-share-local").unbind('mouseover');
    jQuery(".video-share-local").on("mouseover",() =>{
        jQuery(".share-popup-outer").show();
    });
    jQuery(".video-share-local").unbind('mouseout');
    jQuery(".video-share-local").on("mouseout",() =>{
        let xx = jQuery(".video-share-local:hover").length;
        if(xx == 0)
        {
            jQuery(".share-popup-outer").hide();
        }
    });

    // action to download video 
    jQuery(".label-download-webm .download-col").unbind("click");
    jQuery(".label-download-webm .download-col").on("click",() =>
    {
        downloadCapturedVideo("webm");
        jQuery(".download-popup-outer").hide();
    });

    // action to download video 
    jQuery(".label-download-mp4 .download-col").unbind("click");
    jQuery(".label-download-mp4 .download-col").on("click",() =>
    {
        downloadCapturedVideo("mp4");
        jQuery(".download-popup-outer").hide();
    });

    // action to share feedback
    jQuery(".video-download-feedback").unbind("click");
    jQuery(".video-download-feedback").on("click",() =>
    {
        helpers.shareFeedbackPopup();
    });

    // action to share as link 
    jQuery(".label-share .download-col").unbind("click");
    jQuery(".label-share .download-col").on("click",() =>
    {
        helpers.shareVideoLinkPopup();
        jQuery(".share-popup-outer").hide();
    });

    // action to share in email
    jQuery(".label-email .download-col").unbind("click");
    jQuery(".label-email .download-col").on("click",() =>
    {
        helpers.shareVideoViaEmailPopup();
        jQuery(".share-popup-outer").hide();
    });

    // action to logout from screengenius
    jQuery(".video-download-logout span").unbind("click");
    jQuery(".video-download-logout span").on("click",() =>
    {
        helpers.handleQuixyLogOut();
    });

    // action to login to screengenius
    jQuery(".video-download-login span").unbind("click");
    jQuery(".video-download-login span").on("click",() =>
    {
        helpers.handleGoogleLogin();
    });

    // action to login to screengenius
    jQuery(".video-download-login-social span").unbind("click");
    jQuery(".video-download-login-social span").on("click",() =>
    {
        window.open(
            'https://screengenius.io/login',
            '_blank' // <- This is what makes it open in a new window.
        );
    });

    // action to login to screengenius
    jQuery(".video-download-signin .download-screen-button").unbind("click");
    jQuery(".video-download-signin .download-screen-button").on("click",() =>
    {
        helpers.handleGoogleLogin();
    });

    // action to upload video to screengenius server
    jQuery(".upload-to-server").unbind("click");
    jQuery(".upload-to-server").on("click",() =>
    {
        uploadVideoServer("manual");
    });

    // action to login to screengenius
    jQuery(".quix-signin-button").unbind("click");
    jQuery(".quix-signin-button").on("click",() =>
    {
        helpers.handleGoogleLogin();
        helpers.closeSignInpopup();
    });

    // action to login to screengenius
    jQuery(".quix-signin-button-social").unbind("click");
    jQuery(".quix-signin-button-social").on("click",() =>
    {
        window.open(
            'https://screengenius.io/login',
            '_blank' // <- This is what makes it open in a new window.
        );
    });

    // cancel login process
    jQuery(".quix-signin-close").unbind("click");
    jQuery(".quix-signin-close").on("click",() =>
    {
        helpers.closeSignInpopup();
    });

    // action to go to screengenius dashboard
    jQuery(".user-dashboard").unbind("click");
    jQuery(".user-dashboard").on("click",() =>
    {
        helpers.openDashboard();
    });

    // action to go to edit video page
    jQuery(".user-edit-video").unbind("click");
    jQuery(".user-edit-video").on("click",() =>
    {
        uploadEditVideo();
    });
    
};

// action to upload video to server
uploadVideoServer = async (type="manual") =>
{
    chrome.storage.local.get('quixyLoginUserData', (result) =>
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            chrome.storage.local.get('isVideoUploadedToServer', (res) =>
            {
                if(!res.isVideoUploadedToServer)
                {
                    if(type == "manual")
                    {
                        jQuery(".quix-popup-loader-inner img").attr("src", "images/UploadLoader.gif");
                        jQuery(".quix-popup-loader-inner img").css({"width":"200px","height": "auto"}); 
                        jQuery("#quix-popup-loader").show(); 
                    }
                    let sessionData = result.quixyLoginUserData;
                    uploadVideoServerRequest(sessionData, (res) => {
                        if(type == "manual")
                        { 
                            jQuery("#quix-popup-loader").hide(); 
                            jQuery(".quix-popup-loader-inner img").attr("src", "images/light-loader.gif");
                            jQuery(".quix-popup-loader-inner img").css({"width":"65px","height": "auto"});
                        }
                        if(res.success)
                        {
                            let data = { "isVideoUploadedToServer" : res.insertedId};
                            chrome.storage.local.set(data, () => {});
                            if(type == "manual")
                            {
                                helpers.successMessagePopup("Uploaded Successfully","Recording is uploaded Successfully.");
                            }
                        }
                        else
                        {
                            if(type == "manual")
                            {
                                if(res.message == "You exceeded Limit.")
                                {
                                    helpers.failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                }
                                else
                                {
                                    helpers.failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                } 
                            }
                        }
                    });
                }
                else
                {
                    if(type == "manual")
                    {
                        helpers.failureMessagePopup("Upload Failed", "You have already uploaded this file to server."); 
                    }
                }
            });
        }
        else
        {
            helpers.openSignInpopup(); 
        }
    });
    
    // jQuery.ajax({ 
    //     url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+token,
    //     success: function(result)
    //     {
    //         handleQuixyLogIn(result);
    //     }
    // });
}

// Go to edit video after uploading to server
uploadEditVideo = () =>
{
    chrome.storage.local.get('quixyLoginUserData', (result) =>
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            chrome.storage.local.get('isVideoUploadedToServer', (res) =>
            {
                if(!res.isVideoUploadedToServer)
                {
                    jQuery(".quix-popup-loader-inner img").attr("src", "images/UploadLoader.gif");
                    jQuery(".quix-popup-loader-inner img").css({"width":"200px","height": "auto"});
                    jQuery("#quix-popup-loader").show();
                    let sessionData = result.quixyLoginUserData;
                    uploadVideoServerRequest(sessionData, (resp) =>
                    {
                        if(resp.success)
                        { 
                            let data = { "isVideoUploadedToServer" : resp.insertedId};
                            chrome.storage.local.set(data, () => {});
                            jQuery("#quix-popup-loader").hide();
                            jQuery(".quix-popup-loader-inner img").attr("src", "images/light-loader.gif");
                            jQuery(".quix-popup-loader-inner img").css({"width":"65px","height": "auto"});
                            window.open(APIServer+"/edit-video/"+resp.insertedId,"_blank");
                        }
                        else
                        {
                            jQuery("#quix-popup-loader").hide();
                            jQuery(".quix-popup-loader-inner img").attr("src", "images/light-loader.gif");
                            jQuery(".quix-popup-loader-inner img").css({"width":"65px","height": "auto"});
                            if(resp.message == "You exceeded Limit.")
                            {
                                helpers.failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                            }
                            else
                            {
                                helpers.failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                            }
                        }
                    });
                }
                else
                {
                    window.open(APIServer+"/edit-video/"+res.isVideoUploadedToServer,"_blank");
                }
            });
        }
        else
        {
            helpers.openSignInpopup(); 
        }
    });
}

// upload video recording to server 
uploadVideoServerRequest = (sessionData,callback) =>
{
    // helpers.dataURItoBlob(recordedVideoData,function(res)
    // {
        let formd = new FormData();
        formd.append('name', 'test.webm');
        formd.append('user_id', parseInt(sessionData.id));
        formd.append('file_size', recordedvideoSize); //formatBytes(recordedvideoSize)
        formd.append('file_duration', recordedVideoDuration);
        formd.append('recording', recordedVideoBlobData);
        helpers.makeServerRequest("POST", "form-data", APIServer+"/videos/upload", formd, (res) =>
        {
            callback(res);
        });
    // });
}

// action to download video into webm and mp4 formats
downloadCapturedVideo = (downloadType) =>
{
  if(downloadType == "webm")
  {
    const link = document.createElement('a');
    link.href = recordedVideoData;
    link.download = "RecordedVideo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    helpers.successMessagePopup("Download Complete", "Recording is downloaded into downloads.");
  }
  else
  {
    jQuery("#quix-popup-loader").show();
    chrome.storage.local.get('quixyLoginUserData', (result) =>
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            let sessionData = result.quixyLoginUserData;
            chrome.storage.local.get('isVideoUploadedToServer', (res) =>
            {
                if(!res.isVideoUploadedToServer)
                {
                    // helpers.dataURItoBlob(recordedVideoData,function(res)
                    // {
                        let formd = new FormData();
                        formd.append('name', 'test.webm');
                        formd.append('user_id', parseInt(sessionData.id));
                        formd.append('file_size', recordedvideoSize); //formatBytes(recordedvideoSize)
                        formd.append('file_duration', recordedVideoDuration);
                        formd.append('recording', recordedVideoBlobData);
                        helpers.makeServerRequest("POST","form-data", APIServer+"/videos/upload",formd, (res) =>
                        {
                            if(res.success)
                            {

                                let data1 = { "isVideoUploadedToServer" : res.insertedId};
                                chrome.storage.local.set(data1, () => {});
                                let data2 = {"type":downloadType,"vid":res.insertedId};
                                helpers.makeServerRequest("POST","json", APIServer+"/videos/download",data2, (res) =>
                                {
                                    jQuery("#quix-popup-loader").hide();
                                    const link = document.createElement('a');
                                    link.href = APIServer+res.path;
                                    link.download = "RecordedVideo";
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    if(res.success)
                                    {
                                        helpers.successMessagePopup("Download Complete","Recording is downloaded into downloads."); 
                                    }
                                    else
                                    {
                                        jQuery("#quix-popup-loader").hide();
                                        helpers.failureMessagePopup("Download Failed", "Failed to Download Video.");
                                    }
                                });
                            }
                            else
                            {
                                jQuery("#quix-popup-loader").hide();
                                if(res.message == "You exceeded Limit.")
                                {
                                    helpers.failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                }
                                else
                                {
                                    helpers.failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                } 
                            }
                        });
                    // });
                }
                else
                {
                    let data = {"type":downloadType,"vid": res.isVideoUploadedToServer};
                    helpers.makeServerRequest("POST","json", APIServer+"/videos/download",data, (res) =>
                    {
                        jQuery("#quix-popup-loader").hide();
                        const link = document.createElement('a');
                        link.href = APIServer+res.path;
                        link.download = "RecordedVideo";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        if(res.success)
                        {
                            helpers.successMessagePopup("Download Complete","Recording is downloaded into downloads."); 
                        }
                        else
                        {
                            helpers.failureMessagePopup("Download Failed", "Failed to Download Video.");
                        }
                    });
                }
            });
        }
        else
        {
            helpers.openSignInpopup(); 
        }
    });
  }
}
