//var APIServer =  "http://localhost:3000";
//var APIServer = "http://82.208.20.76";
var APIServer = "https://screengenius.io";
var clientIDOauth = "83540021534-j3c68n39ht71ojcep42o1qqhvfoh20cs.apps.googleusercontent.com";
var recordedVideoData = "";
var recordedVideoBlobData = "";
var recordedvideoSize = "";
var recordedVideoDuration = "";
var recordedVideoUpload = false;
window.addEventListener('focus', function(event) {
    // to display loggedIn state if user logged from dashboard
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData == "" || result.quixyLoginUserData == null)
        {
            makeServerRequest("GET","", APIServer+"/user/get","",function(res)
            {
                handleUserSession(res,"get");
            });
        }
    });
});

window.onbeforeunload = function(event)
{
    chrome.runtime.sendMessage({type:"closeExtensionRecordingPage"});
}
window.onload = function()
{
    // to get logged in user's data
    makeServerRequest("GET","", APIServer+"/user/get","",function(res)
    {
        handleUserSession(res);
    });
    chrome.storage.local.get('quixyLoginUserData', function(result)
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
    chrome.storage.local.get('recordedVideoDuration', async function (obj) {
        recordedVideoDuration = obj.recordedVideoDuration;
        jQuery(".recording-duration").text(recordedVideoDuration);
    });
    
    // to get recorded video stream
    chrome.storage.local.get('recordedVideoData', async function (obj) {
        recordedVideoData = obj.recordedVideoData;
        dataURItoBlob(recordedVideoData,function(res)
        {
            recordedVideoBlobData = res;
            jQuery("#video-download-content-left-inner video").attr("src", recordedVideoData);
        });
    });

    // to get size of recorded video
    chrome.storage.local.get('recordedvideoSize', async function (obj) {
        recordedvideoSize = obj.recordedvideoSize;
        jQuery(".recording-size").text(formatBytes(recordedvideoSize));
        jQuery(".recording-date").text(getTodayDate());
    });

    // to get upload settings of recorded video
    chrome.storage.local.get('recordedVideoUpload', async function (obj) {
        recordedVideoUpload = obj.recordedVideoUpload;
        if(recordedVideoUpload)
        { 
            uploadVideoServer("manual");
        }
    });

    jQuery(".video-download-local").unbind('mouseover');
    jQuery(".video-download-local").on("mouseover",function(){
        jQuery(".download-popup-outer").show();
    });
    jQuery(".video-download-local").unbind('mouseout');
    jQuery(".video-download-local").on("mouseout",function(){
        var xx = jQuery(".video-download-local:hover").length;
        if(xx == 0)
        {
            jQuery(".download-popup-outer").hide();
        }
    });

    jQuery(".video-share-local").unbind('mouseover');
    jQuery(".video-share-local").on("mouseover",function(){
        jQuery(".share-popup-outer").show();
    });
    jQuery(".video-share-local").unbind('mouseout');
    jQuery(".video-share-local").on("mouseout",function(){
        var xx = jQuery(".video-share-local:hover").length;
        if(xx == 0)
        {
            jQuery(".share-popup-outer").hide();
        }
    });

    // action to download video 
    jQuery(".label-download-webm .download-col").unbind("click");
    jQuery(".label-download-webm .download-col").on("click",function()
    {
        downloadCapturedVideo("webm");
        jQuery(".download-popup-outer").hide();
    });

    // action to download video 
    jQuery(".label-download-mp4 .download-col").unbind("click");
    jQuery(".label-download-mp4 .download-col").on("click",function()
    {
        downloadCapturedVideo("mp4");
        jQuery(".download-popup-outer").hide();
    });

    // action to share feedback
    jQuery(".video-download-feedback").unbind("click");
    jQuery(".video-download-feedback").on("click",function()
    {
        shareFeedbackPopup();
    });

    // action to share as link 
    jQuery(".label-share .download-col").unbind("click");
    jQuery(".label-share .download-col").on("click",function()
    {
        shareLinkPopup();
        jQuery(".share-popup-outer").hide();
    });

    // action to share in email
    jQuery(".label-email .download-col").unbind("click");
    jQuery(".label-email .download-col").on("click",function()
    {
        shareViaEmailPopup();
        jQuery(".share-popup-outer").hide();
    });

    // action to logout from screengenius
    jQuery(".video-download-logout span").unbind("click");
    jQuery(".video-download-logout span").on("click",function()
    {
        handleQuixyLogOut();
    });

    // action to login to screengenius
    jQuery(".video-download-login span").unbind("click");
    jQuery(".video-download-login span").on("click",function()
    {
        handleGoogleLogin();
    });

    // action to login to screengenius
    jQuery(".video-download-login-social span").unbind("click");
    jQuery(".video-download-login-social span").on("click",function()
    {
        window.open(
            'https://screengenius.io/login',
            '_blank' // <- This is what makes it open in a new window.
        );
    });

    // action to login to screengenius
    jQuery(".video-download-signin .download-screen-button").unbind("click");
    jQuery(".video-download-signin .download-screen-button").on("click",function()
    {
        handleGoogleLogin();
    });

    // action to upload video to screengenius server
    jQuery(".upload-to-server").unbind("click");
    jQuery(".upload-to-server").on("click",function()
    {
        uploadVideoServer("manual");
    });

    // action to login to screengenius
    jQuery(".quix-signin-button").unbind("click");
    jQuery(".quix-signin-button").on("click",function()
    {
        handleGoogleLogin();
        closeSignInpopup();
    });

    // action to login to screengenius
    jQuery(".quix-signin-button-social").unbind("click");
    jQuery(".quix-signin-button-social").on("click",function()
    {
        window.open(
            'https://screengenius.io/login',
            '_blank' // <- This is what makes it open in a new window.
        );
    });

    // cancel login process
    jQuery(".quix-signin-close").unbind("click");
    jQuery(".quix-signin-close").on("click",function()
    {
        closeSignInpopup();
    });

    // action to go to screengenius dashboard
    jQuery(".user-dashboard").unbind("click");
    jQuery(".user-dashboard").on("click",function()
    {
        openDashboard();
    });

    // action to go to edit video page
    jQuery(".user-edit-video").unbind("click");
    jQuery(".user-edit-video").on("click",function()
    {
        uploadEditVideo();
    });
    
};

// action to logout to screengenius
function handleQuixyLogOut()
{
    jQuery("#quix-popup-loader").show();
    makeServerRequest("GET","", APIServer+"/user/logout","",function(res)
    {
        jQuery("#quix-popup-loader").hide();
        jQuery(".loggedin-item").hide();
        jQuery(".loggedOut-item").show();
        var data = { "quixyLoginUserData" : null};
        chrome.storage.local.set(data, function() {});
    });
}

// action to login to screengenius
function handleQuixyLogIn(data)
{
    var email = data.email;
    var name = data.name;
    var pic = data.picture;
    var data = {"email":email,"name":name,"picture":pic};
    makeServerRequest("POST","json", APIServer+"/user/login",data,function(res)
    {
        jQuery("#quix-popup-loader").hide();
        handleUserSession(res);
    });
}

// action to login to screengenius via google
function handleGoogleLogin()
{
    jQuery("#quix-popup-loader").show();
    chrome.identity.launchWebAuthFlow({url: create_oauth(),'interactive': true}, function(token) {
        var tokenStr = token.split("access_token=");
        var tokenStr1 = tokenStr[1].split("token_type=");
        var fToken = tokenStr1[0];
        jQuery.ajax({ 
            url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+fToken,
            success: function(result)
            {
                handleQuixyLogIn(result);
            }
        });
    });
}

// action to handle session after login
function handleUserSession(res)
{
    if(res.success)
    {
        var data = { "quixyLoginUserData" : res.data};
        if(recordedVideoUpload){ uploadVideoServer("manual"); }
        chrome.storage.local.set(data, function() {});
        jQuery(".download-screen-link").attr("href", APIServer);
        jQuery(".loggedin-item").show();
        jQuery(".loggedOut-item").hide();
        //jQuery(".user-dashboard a").attr("href", APIServer+"/dashboard");
    }
    else
    {
        var data = { "quixyLoginUserData" : null};
        chrome.storage.local.set(data, function() {});
        jQuery(".loggedin-item").hide();
        jQuery(".loggedOut-item").show();
    }
}

// action to upload video to server
async function uploadVideoServer(type="manual")
{
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            chrome.storage.local.get('isVideoUploadedToServer', function(res)
            {
                if(!res.isVideoUploadedToServer)
                {
                    if(type == "manual")
                    {
                        jQuery(".quix-popup-loader-inner img").attr("src", "images/UploadLoader.gif");
                        jQuery(".quix-popup-loader-inner img").css({"width":"200px","height": "auto"}); 
                        jQuery("#quix-popup-loader").show(); 
                    }
                    var sessionData = result.quixyLoginUserData;
                    uploadVideoServerRequest(sessionData,function(res){
                        if(type == "manual")
                        { 
                            jQuery("#quix-popup-loader").hide(); 
                            jQuery(".quix-popup-loader-inner img").attr("src", "images/light-loader.gif");
                            jQuery(".quix-popup-loader-inner img").css({"width":"65px","height": "auto"});
                        }
                        if(res.success)
                        {
                            var data = { "isVideoUploadedToServer" : res.insertedId};
                            chrome.storage.local.set(data, function() {});
                            if(type == "manual")
                            {
                                successMessagePopup("Uploaded Successfully","Recording is uploaded Successfully.");
                            }
                        }
                        else
                        {
                            if(type == "manual")
                            {
                                if(res.message == "You exceeded Limit.")
                                {
                                    failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                }
                                else
                                {
                                    failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                } 
                            }
                        }
                    });
                }
                else
                {
                    if(type == "manual")
                    {
                        failureMessagePopup("Upload Failed", "You have already uploaded this file to server."); 
                    }
                }
            });
        }
        else
        {
            openSignInpopup(); 
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

// open signin popup
function openSignInpopup()
{
    jQuery("#quix-signin-wrapper").show();
}

// close signin popup
function closeSignInpopup()
{
    jQuery("#quix-signin-wrapper").hide();
}

// Go to screengenius dashboard
function openDashboard()
{
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            window.open(APIServer+"/dashboard","_blank");
        }
        else
        {
            openSignInpopup(); 
        }
    });
}

// Go to edit video after uploading to server
function uploadEditVideo()
{
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            chrome.storage.local.get('isVideoUploadedToServer', function(res)
            {
                if(!res.isVideoUploadedToServer)
                {
                    jQuery(".quix-popup-loader-inner img").attr("src", "images/UploadLoader.gif");
                    jQuery(".quix-popup-loader-inner img").css({"width":"200px","height": "auto"});
                    jQuery("#quix-popup-loader").show();
                    var sessionData = result.quixyLoginUserData;
                    uploadVideoServerRequest(sessionData,function(resp)
                    {
                        if(resp.success)
                        { 
                            var data = { "isVideoUploadedToServer" : resp.insertedId};
                            chrome.storage.local.set(data, function() {});
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
                                failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                            }
                            else
                            {
                                failureMessagePopup("Upload Failed", "Something Went Wrong."); 
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
            openSignInpopup(); 
        }
    });
}

// upload video recording to server 
function uploadVideoServerRequest(sessionData,callback)
{
    // dataURItoBlob(recordedVideoData,function(res)
    // {
        var formd = new FormData();
        formd.append('name', 'test.webm');
        formd.append('user_id', parseInt(sessionData.id));
        formd.append('file_size', recordedvideoSize); //formatBytes(recordedvideoSize)
        formd.append('file_duration', recordedVideoDuration);
        formd.append('recording', recordedVideoBlobData);
        makeServerRequest("POST", "form-data", APIServer+"/videos/upload", formd, function(res)
        {
            callback(res);
        });
    // });
}

// convert blob url to binay data
function dataURItoBlob(blobUrl,callback) 
{
    var xhr = new XMLHttpRequest;
    xhr.responseType = 'blob';
    xhr.onload = function() {
        var recoveredBlob = xhr.response;
        callback(recoveredBlob);
        // var reader = new FileReader;
        // reader.onload = function() {
        //     var blobAsDataUrl = reader.result;
        //     callback(blobAsDataUrl);
        // };
        // reader.readAsDataURL(recoveredBlob);
    };
    xhr.open('GET', blobUrl);
    xhr.send();
}

// get today's date with format 
function getTodayDate()
{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = dd + '.' + mm + '.' + yyyy;
  return today;
}

// format video data into KB, MB, GB
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// action to download video into webm and mp4 formats
function downloadCapturedVideo(downloadType)
{
  if(downloadType == "webm")
  {
    const link = document.createElement('a');
    link.href = recordedVideoData;
    link.download = "RecordedVideo";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    successMessagePopup("Download Complete", "Recording is downloaded into downloads.");
  }
  else
  {
    jQuery("#quix-popup-loader").show();
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            var sessionData = result.quixyLoginUserData;
            chrome.storage.local.get('isVideoUploadedToServer', function(res)
            {
                if(!res.isVideoUploadedToServer)
                {
                    // dataURItoBlob(recordedVideoData,function(res)
                    // {
                        var formd = new FormData();
                        formd.append('name', 'test.webm');
                        formd.append('user_id', parseInt(sessionData.id));
                        formd.append('file_size', recordedvideoSize); //formatBytes(recordedvideoSize)
                        formd.append('file_duration', recordedVideoDuration);
                        formd.append('recording', recordedVideoBlobData);
                        makeServerRequest("POST","form-data", APIServer+"/videos/upload",formd,function(res)
                        {
                            if(res.success)
                            {

                                var data = { "isVideoUploadedToServer" : res.insertedId};
                                chrome.storage.local.set(data, function() {});
                                var data = {"type":downloadType,"vid":res.insertedId};
                                makeServerRequest("POST","json", APIServer+"/videos/download",data,function(res)
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
                                        successMessagePopup("Download Complete","Recording is downloaded into downloads."); 
                                    }
                                    else
                                    {
                                        jQuery("#quix-popup-loader").hide();
                                        failureMessagePopup("Download Failed", "Failed to Download Video.");
                                    }
                                });
                            }
                            else
                            {
                                jQuery("#quix-popup-loader").hide();
                                if(res.message == "You exceeded Limit.")
                                {
                                    failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                }
                                else
                                {
                                    failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                } 
                            }
                        });
                    // });
                }
                else
                {
                    var data = {"type":downloadType,"vid": res.isVideoUploadedToServer};
                    makeServerRequest("POST","json", APIServer+"/videos/download",data,function(res)
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
                            successMessagePopup("Download Complete","Recording is downloaded into downloads."); 
                        }
                        else
                        {
                            failureMessagePopup("Download Failed", "Failed to Download Video.");
                        }
                    });
                }
            });
        }
        else
        {
            openSignInpopup(); 
        }
    });
  }
}

// Display popup is an API request is failed for some reason
function failureMessagePopup(text,description)
{
    var padTop = "40px";
    var html = '<div id="failure-popup-wrapper">\n\
    <div class="failure-popup">\n\
    <div class="failure-heading" style="padding-top: '+padTop+';">\n\
    <img src="/images/quix-failure.png"/>\n\
    <span class="failure-message">'+text+'</span>\n\
    <span class="failure-description">'+description+'</span>\n\
    </div>\n\
    </div>\n\
    </div>';
    jQuery("body").append(html);
    setTimeout(function(){
        jQuery("#failure-popup-wrapper").remove();
    },2000);
}

// to make an API request to screengenius server
function makeServerRequest(type,dataType,url,data,callback)
{
    var contentType = 'application/json';
    if(dataType == "json")
    {
        data = JSON.stringify(data); 
    }
    else if(dataType == "form-data")
    {
        contentType = false;
    }
    jQuery.ajax({
        url: url,
        type: type,
        contentType: contentType,
        cache: false,
        processData: false,
        success: function(data){
            callback(data);
        },
        error: function(error){
            callback(error);
        },
        data: data
    });
}

// To display success message after api request to server
function successMessagePopup(text,description)
{
    var padTop = "40px";
    var html = '<div id="success-popup-wrapper">\n\
    <div class="success-popup">\n\
    <div class="success-heading" style="padding-top: '+padTop+';">\n\
    <img src="/images/quix-success.png"/>\n\
    <span class="success-message">'+text+'</span>\n\
    <span class="success-description">'+description+'</span>\n\
    </div>\n\
    </div>\n\
    </div>';
    jQuery("body").append(html);
    setTimeout(function(){
        jQuery("#success-popup-wrapper").remove();
    },2000);
}

// validate email format
function IsEmail(email) {
    var regex =
/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!regex.test(email)) {
        return false;
    }
    else {
        return true;
    }
}

// to display feedback popup and send API request to share feedback
function shareFeedbackPopup()
{
    var loaderic = "/images/light-loader.gif";
    var feedbackic = "/images/quix-share-feedback-form.png";
    var html = '<div id="feedback-share-popup-wrapper">\n\
    <div class="feedback-share-popup">\n\
    <div class="feedback-share-heading">\n\
    <img src="'+feedbackic+'"/>\n\
    <span>Share your feedback with us</span>\n\
    </div>\n\
    <div id="share-feedback-form" class="email-share-form">\n\
        <input type="text" name="to-email-feedback" placeholder="Enter Your Email">\n\
        <textarea id="email-message-feedback" placeholder="Enter Your Feedback" maxlength="900" name="email-message-feedback"></textarea>\n\
        <p class="message-counter"></p>\n\
    </div>\n\
    <div class="feedback-share-submit">\n\
        <img class="loader-icon" src="'+loaderic+'" style="display: none;">\n\
        <button class="send-feedback-share">Send</button>\n\
        <button class="close-feedback-share">Close</button>\n\
    </div>\n\
    </div>\n\
    </div>';
    jQuery("body").append(html);

    jQuery(".send-feedback-share").unbind('click');
    jQuery(".send-feedback-share").on("click",function()
    {
        jQuery(".loader-icon").show();
        var senderEmail = jQuery("input[name=to-email-feedback]").val();
        var emailMessage = jQuery("textarea[name=email-message-feedback]").val();
        if(senderEmail == ""){ alert("Please enter email Id."); jQuery(".loader-icon").hide(); return; }
        if(emailMessage == ""){ alert("Please enter your message."); jQuery(".loader-icon").hide(); return; }
        if(!IsEmail(senderEmail)){ alert("Please enter correct email Id."); jQuery(".loader-icon").hide(); return;}
        var data = {"senderEmail":senderEmail,"userMessage":emailMessage};
        makeServerRequest("POST","json", APIServer+"/screenshots/send-feedback",data,function(res)
        {
           sharefeedbackResponseHandler(res);
        });
    });
    jQuery("#email-message-feedback").keyup(function(){
      jQuery("#feedback-share-popup-wrapper .message-counter").text((900 - jQuery(this).val().length) + " characters left");
    });
    jQuery(".close-feedback-share").unbind('click');
    jQuery(".close-feedback-share").on("click",function(){
        jQuery("#feedback-share-popup-wrapper").remove();
        jQuery(".close-feedback-share").unbind('click');
    });
}

// response handler after share feedback request
function sharefeedbackResponseHandler(res)
{
    if(res.success)
    {
        jQuery("#feedback-share-popup-wrapper").remove();
        jQuery(".close-feedback-share").unbind('click');
        successMessagePopup("Email Shared Successfully", "Email has been shared successfully.");    
    }
    else
    {
        jQuery("#feedback-share-popup-wrapper .loader-icon").hide();
        failureMessagePopup("Email Sharing Failed", "Email couldn't be sent.");
    }
}

// create oauth url for google login 
function create_oauth() 
{
    let auth_url = `https://accounts.google.com/o/oauth2/v2/auth?`
    var auth_params = {
      client_id: clientIDOauth,
      redirect_uri: chrome.identity.getRedirectURL("oauth2"),
      response_type: 'token',
      scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
      prompt:"select_account"
    };
    const url = new URLSearchParams(Object.entries(auth_params));
    url.toString();
    auth_url += url;
    return auth_url;
}

// To captialize the text for text annotation
function capitalize(str) {
    var strArr = str.split(" ");
    var Lststring = [];
    for (var i = 0; i < strArr.length; i++) 
    {
        const lower = strArr[i].toLowerCase();
        var out = strArr[i].charAt(0).toUpperCase() + lower.slice(1);
        Lststring.push(out);
    }
    return Lststring.join(" ");
}

// Share screenshot via email
function shareViaEmailPopup()
{
    
    var loaderIcon = "/images/light-loader.gif";
    var attachmentic = "/images/quix-save.png";
    var shareemailic = "/images/quix-share-link-popup.png";
    jQuery("#email-share-popup-wrapper").remove();
    var html = '<div id="email-share-popup-wrapper">\n\
    <div class="email-share-popup">\n\
    <div class="email-share-heading">\n\
    <img src="'+shareemailic+'"/>\n\
    <span>Send through Email</span>\n\
    </div>\n\
    <div class="email-share-form">\n\
        <input type="text" name="to-name-feedback" placeholder="Enter Recipient Name*">\n\
        <input type="text" name="to-email" placeholder="Enter Recipient Email*"/>\n\
        <textarea id="email-message" placeholder="Message" maxlength ="300" name="email-message"></textarea>\n\
        <p class="message-counter"></p>\n\
        <div class="attachment-thumb" style="background-image:url('+attachmentic+');"><p>Video is attached.</p></div>\n\
    </div>\n\
    <div class="email-share-submit">\n\
        <img class="loader-icon" src="'+loaderIcon+'"/>\n\
        <button class="send-email-share">Send</button>\n\
        <button class="close-email-share">Close</button>\n\
    </div>\n\
    </div>\n\
    </div>';

    
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            jQuery("body").append(html);
            jQuery(".send-email-share").unbind('click');
            jQuery(".send-email-share").on("click",function()
            {
                jQuery("#email-share-popup-wrapper .loader-icon").show();
                var toName = jQuery("input[name=to-name-feedback]").val();
                var toEmail = jQuery("#email-share-popup-wrapper input[name=to-email]").val();
                var emailMessage = jQuery("#email-share-popup-wrapper textarea[name=email-message]").val();
                if(toName == ""){ alert("Please enter your name."); jQuery(".loader-icon").hide(); return; }
                if(toEmail == ""){ alert("Please enter email Id."); jQuery("#email-share-popup-wrapper .loader-icon").hide(); return; }
                if(!IsEmail(toEmail)){ alert("Please enter correct email Id."); jQuery(".loader-icon").hide(); return;}
                var sessionData = result.quixyLoginUserData;
                let senderName = result.quixyLoginUserData.name;
                senderName = capitalize(senderName);
                let senderEmail = result.quixyLoginUserData.email;
                chrome.storage.local.get('isVideoUploadedToServer', function(res)
                {
                    if(!res.isVideoUploadedToServer)
                    {
                        // dataURItoBlob(recordedVideoData,function(res)
                        // {
                            var formd = new FormData();
                            formd.append('name', 'test.webm');
                            formd.append('user_id', parseInt(sessionData.id));
                            formd.append('file_size', recordedvideoSize); //formatBytes(recordedvideoSize)
                            formd.append('file_duration', recordedVideoDuration);
                            formd.append('recording', recordedVideoBlobData);
                            makeServerRequest("POST","form-data", APIServer+"/videos/upload",formd,function(res)
                            {
                                if(res.success)
                                {

                                    var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"vid":res.insertedId};
                                    makeServerRequest("POST","json", APIServer+"/videos/send-email",data,function(res)
                                    {
                                        shareEmailResponseHandler(res);
                                    });
                                }
                                else
                                {
                                    jQuery("#email-share-popup-wrapper").remove();
                                    jQuery("#email-share-popup-wrapper .loader-icon").hide();
                                    if(res.message == "You exceeded Limit.")
                                    {
                                        failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                    }
                                    else
                                    {
                                        failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                    }
                                }
                            });
                        // });
                    }
                    else
                    {
                        var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"vid":res.isVideoUploadedToServer};
                        makeServerRequest("POST","json", APIServer+"/videos/send-email",data,function(res)
                        {
                            shareEmailResponseHandler(res);
                        });
                    }
                });
            });
            jQuery("#email-message").keyup(function(){
                jQuery("#email-share-popup-wrapper .message-counter").text((300 - jQuery(this).val().length) + " characters left");
            });
        
            jQuery(".close-email-share").unbind('click');
            jQuery(".close-email-share").on("click",function(){
                jQuery("#email-share-popup-wrapper").remove();
                jQuery(".close-email-share").unbind('click');
            });
        }
        else
        {
            openSignInpopup(); 
        }
    });
}

// To handle resonse after sharing screenshot via email
function shareEmailResponseHandler(res)
{
    if(res.success)
    {
        jQuery("#email-share-popup-wrapper").remove();
        jQuery(".close-email-share").unbind('click');
        successMessagePopup("Email Shared Successfully", "Email has been shared successfully.");    
    }
    else
    {
        jQuery("#email-share-popup-wrapper .loader-icon").hide();
        failureMessagePopup("Email Sharing Failed", "Email couldn't be sent.");
    }
}

// Share screenshot as a link
function shareLinkPopup()
{
    var loaderIcon = "/images/light-loader.gif";
    var sharelinkic = "/images/quix-share-link-popup.png";
    jQuery("#link-share-popup-wrapper").remove();
    var html = '<div id="link-share-popup-wrapper">\n\
    <div class="email-share-popup">\n\
    <div class="email-share-heading">\n\
    <img src="'+sharelinkic+'"/>\n\
    <span>Share link with Anyone</span>\n\
    </div>\n\
    <div class="email-share-form">\n\
        <img class="loader-icon" src="'+loaderIcon+'"/>\n\
    </div>\n\
    </div>\n\
    </div>';
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            var sessionData = result.quixyLoginUserData;
            jQuery("body").append(html);
            jQuery("#link-share-popup-wrapper .loader-icon").show();
            chrome.storage.local.get('isVideoUploadedToServer', function(res)
            {
                if(!res.isVideoUploadedToServer)
                {
                    var formd = new FormData();
                    formd.append('name', 'test.webm');
                    formd.append('user_id', parseInt(sessionData.id));
                    formd.append('file_size', recordedvideoSize); //formatBytes(recordedvideoSize)
                    formd.append('file_duration', recordedVideoDuration);
                    formd.append('recording', recordedVideoBlobData);
                    makeServerRequest("POST","form-data", APIServer+"/videos/upload",formd,function(res)
                    {
                        if(res.success)
                        {
                            var path = "";
                            if(res.path){ path = res.path; }
                            shareLinkResponseHandler(path);
                        }
                        else
                        {
                            jQuery("#link-share-popup-wrapper").remove();
                            jQuery("#link-share-popup-wrapper .loader-icon").hide();
                            if(res.message == "You exceeded Limit.")
                            {
                                failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                            }
                            else
                            {
                                failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                            } 
                        }
                    });
                }
                else
                {
                    makeServerRequest("GET","", APIServer+"/videos/details?vid="+res.isVideoUploadedToServer,"",function(res)
                    {
                        var path = "";
                        if(res.data.path){ path = res.data.path; }
                        shareLinkResponseHandler(path);
                    });
                }
            });
        }
        else
        {
            openSignInpopup(); 
        }
    });
}

// To handle resonse after shared as a link
function shareLinkResponseHandler(path)
{
    if(path !== "")
    {
        var mHTML = '<input value="'+APIServer+path+'" type="text" name="share-Link" id="share-screenshot-link"/><button class="send-link-share">Copy</button><button class="close-link-share">Close</button>';
        jQuery("#link-share-popup-wrapper .email-share-form").html(mHTML);
        jQuery(".send-link-share").unbind('click');
        jQuery(".send-link-share").on("click",function(){
            jQuery("#share-screenshot-link").select();
            navigator.clipboard.writeText(jQuery("#share-screenshot-link").val());
            jQuery(".send-link-share").unbind('click');
            jQuery("#link-share-popup-wrapper").remove();
            successMessagePopup("Link copied Successfully", "Share link has been copied successfully.");
        });
        jQuery(".close-link-share").unbind('click');
        jQuery(".close-link-share").on("click",function(){
            jQuery("#link-share-popup-wrapper").remove();
            jQuery(".close-link-share").unbind('click');
        });
    }
    else
    {
        jQuery("#link-share-popup-wrapper").remove();
        jQuery("#link-share-popup-wrapper .loader-icon").hide();
        failureMessagePopup("Share Link Failed", "Share link couldn't be copied.");
    }
}