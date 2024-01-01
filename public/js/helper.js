class helperSG 
{
    constructor() 
    {
        this.feedbackIcon = chrome.runtime.getURL("images/quix-share-feedback-form.png");
        this.successIcon = chrome.runtime.getURL("/images/quix-success.png");
        this.failureIcon = chrome.runtime.getURL("/images/quix-failure.png");
        this.loaderIcon = chrome.runtime.getURL("/images/light-loader.gif");
    }
    // Share screenshot via email request
    shareViaEmail = () =>
    {
        let _this = this;
        if(jQuery("#download-overlay-inner").hasClass("full-screen-view"))
        {
            _this.shareViaEmailPopup();
        }
        else
        {
            chrome.runtime.sendMessage({type:"googleAuth"});
        }     
    }

    // To captialize the text for text annotation
    capitalize = (str) => {
        let _this = this;
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

    // Validate email
    IsEmail = (email) => {
        let _this = this;
        var regex =
    /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!regex.test(email)) {
            return false;
        }
        else {
            return true;
        }
    }

    // Share screenshot via email
    shareViaEmailPopup = () =>
    {
        let _this = this;
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
            <div class="attachment-thumb" style="background-image:url('+attachmentic+');"><p>Screenshot is attached.</p></div>\n\
        </div>\n\
        <div class="email-share-submit">\n\
            <img class="loader-icon" src="'+loaderIcon+'"/>\n\
            <button class="send-email-share">Send</button>\n\
            <button class="close-email-share">Close</button>\n\
        </div>\n\
        </div>\n\
        </div>';
        chrome.storage.local.get('quixyLoginUserData', (result) =>
        {
            if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
            {
                jQuery("body").append(html);
                jQuery(".send-email-share").unbind('click');
                jQuery(".send-email-share").on("click",() => 
                {
                    jQuery("#email-share-popup-wrapper .loader-icon").show();
                    var toName = jQuery("input[name=to-name-feedback]").val();
                    var toEmail = jQuery("#email-share-popup-wrapper input[name=to-email]").val();
                    var emailMessage = jQuery("#email-share-popup-wrapper textarea[name=email-message]").val();
                    if(toName == ""){ alert("Please enter your name."); jQuery(".loader-icon").hide(); return; }
                    if(toEmail == ""){ alert("Please enter email Id."); jQuery("#email-share-popup-wrapper .loader-icon").hide(); return; }
                    if(!_this.IsEmail(toEmail)){ alert("Please enter correct email Id."); jQuery(".loader-icon").hide(); return;}

                    let senderName = result.quixyLoginUserData.name;
                    senderName = _this.capitalize(senderName);
                    let senderEmail = result.quixyLoginUserData.email;
                    chrome.storage.local.get('isScreenshotUploadedToServer', (res) =>
                    {
                        if(!res.isScreenshotUploadedToServer)
                        {
                            editScreenshot.uploadScreenshotServer("auto", (res) =>
                            {
                                var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"sid":res.insertedId};
                                _this.makeServerRequest("POST","json", editScreenshot.APIServer+"/screenshots/send-email",data,(res) =>
                                {
                                    _this.shareEmailResponseHandler(res);
                                });
                            });
                        }
                        else
                        {
                            var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"sid":res.isScreenshotUploadedToServer};
                            _this.makeServerRequest("POST","json", editScreenshot.APIServer+"/screenshots/send-email",data,(res) =>
                            {
                                _this.shareEmailResponseHandler(res);
                            });
                        }
                    });
                });

                jQuery("#email-message").keyup(() => {
                jQuery("#email-share-popup-wrapper .message-counter").text((300 - jQuery(this).val().length) + " characters left");
                });

                jQuery(".close-email-share").unbind('click');
                jQuery(".close-email-share").on("click",() => {
                    jQuery("#email-share-popup-wrapper").remove();
                    jQuery(".close-email-share").unbind('click');
                });
            }
            else
            {
                _this.openSignInpopup(); 
            }
        });
    }

    // Share video as a link
    shareVideoLinkPopup = () =>
    {
        let _this = this;
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
        console.log(_this,"----this-");
        chrome.storage.local.get('quixyLoginUserData', function(result)
        {
            console.log(_this,"-this-");
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
                        _this.makeServerRequest("POST","form-data", APIServer+"/videos/upload",formd,function(res)
                        {
                            if(res.success)
                            {
                                var path = "";
                                if(res.path){ path = res.path; }
                                _this.shareLinkResponseHandler(path);
                            }
                            else
                            {
                                jQuery("#link-share-popup-wrapper").remove();
                                jQuery("#link-share-popup-wrapper .loader-icon").hide();
                                if(res.message == "You exceeded Limit.")
                                {
                                    _this.failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                }
                                else
                                {
                                    _this.failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                } 
                            }
                        });
                    }
                    else
                    {
                        _this.makeServerRequest("GET","", APIServer+"/videos/details?vid="+res.isVideoUploadedToServer,"",function(res)
                        {
                            var path = "";
                            if(res.data.path){ path = res.data.path; }
                            _this.shareLinkResponseHandler(path);
                        });
                    }
                });
            }
            else
            {
                _this.openSignInpopup(); 
            }
        });
    }

    // Share video via email
    shareVideoViaEmailPopup = () =>
    {
        let _this = this;
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
                                _this.makeServerRequest("POST","form-data", APIServer+"/videos/upload",formd,function(res)
                                {
                                    if(res.success)
                                    {

                                        var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"vid":res.insertedId};
                                        _this.makeServerRequest("POST","json", APIServer+"/videos/send-email",data,function(res)
                                        {
                                            _this.shareEmailResponseHandler(res);
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
                            _this.makeServerRequest("POST","json", APIServer+"/videos/send-email",data,function(res)
                            {
                                _this.shareEmailResponseHandler(res);
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
                _this.openSignInpopup(); 
            }
        });
    }

    // To handle resonse after sharing screenshot via email
    shareEmailResponseHandler = (res) =>
    {
        let _this = this;
        if(res.success)
        {
            jQuery("#email-share-popup-wrapper").remove();
            jQuery(".close-email-share").unbind('click');
            _this.successMessagePopup("Email Shared Successfully", "Email has been shared successfully.");    
        }
        else
        {
            jQuery("#email-share-popup-wrapper").remove();
            jQuery("#email-share-popup-wrapper .loader-icon").hide();
            _this.failureMessagePopup("Email Sharing Failed", "Email couldn't be sent.");
        }
    }

    // Share screenshot as a link
    shareLinkPopup = () =>
    {
        let _this = this;
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
        editScreenshot.updateCanvasByAnno((source) =>
        {
            chrome.storage.local.get('quixyLoginUserData', (result) =>
            {
                if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
                {
                    jQuery("body").append(html);
                    jQuery("#link-share-popup-wrapper .loader-icon").show();
                    chrome.storage.local.get('isScreenshotUploadedToServer', (res) =>
                    {
                        if(!res.isScreenshotUploadedToServer)
                        {
                            editScreenshot.uploadScreenshotServer("auto", (res) =>
                            {
                                var path = "";
                                if(res.path){ path = res.path; }
                                _this.shareLinkResponseHandler(path);
                            });
                        }
                        else
                        {
                            _this.makeServerRequest("GET","", editScreenshot.APIServer+"/screenshots/details?sid="+res.isScreenshotUploadedToServer,"",(res) =>
                            {
                                var path = "";
                                if(res.data.path){ path = res.data.path; }
                                _this.shareLinkResponseHandler(path);
                            });
                        }
                    });
                }
                else
                {
                    _this.openSignInpopup(); 
                }
            });
        });
    }

    // To handle resonse after shared as a link
    shareLinkResponseHandler = (path) =>
    {
        let _this = this;
        if(path !== "")
        {
            var mHTML = '<input value="'+editScreenshot.APIServer+path+'" type="text" name="share-Link" id="share-screenshot-link"/><button class="send-link-share">Copy</button><button class="close-link-share">Close</button>';
            jQuery("#link-share-popup-wrapper .email-share-form").html(mHTML);
            jQuery(".send-link-share").unbind('click');
            jQuery(".send-link-share").on("click",() => {
                jQuery("#share-screenshot-link").select();
                navigator.clipboard.writeText(jQuery("#share-screenshot-link").val());
                jQuery(".send-link-share").unbind('click');
                jQuery("#link-share-popup-wrapper").remove();
                _this.successMessagePopup("Link copied Successfully", "Share link has been copied successfully.");
            });
            jQuery(".close-link-share").unbind('click');
            jQuery(".close-link-share").on("click",() => {
                jQuery("#link-share-popup-wrapper").remove();
                jQuery(".close-link-share").unbind('click');
            });
        }
        else
        {
            jQuery("#link-share-popup-wrapper").remove();
            jQuery("#link-share-popup-wrapper .loader-icon").hide();
            _this.failureMessagePopup("Share Link Failed", "Share link couldn't be copied.");
        }
    }

    // To display success message as a popup
    successMessagePopup = (text,description) =>
    {
        let _this = this;
        if(_this.successIcon === "")
        {
            _this.successIcon = "/images/quix-success.png";
        }
        var padTop = "40px";
        var html = '<div id="success-popup-wrapper">\n\
        <div class="success-popup">\n\
        <div class="success-heading" style="padding-top: '+padTop+';">\n\
        <img src="'+_this.successIcon+'"/>\n\
        <span class="success-message">'+text+'</span>\n\
        <span class="success-description">'+description+'</span>\n\
        </div>\n\
        </div>\n\
        </div>';
        jQuery("body").append(html);
        setTimeout(() => {
            jQuery("#success-popup-wrapper").remove();
        },2000);
    }

    // To display failure message as a popup
    failureMessagePopup = (text,description) =>
    {
        let _this = this;
        if(_this.failureIcon === "")
        {
           _this.failureIcon = "/images/quix-failure.png";
        }
        var padTop = "40px";
        var html = '<div id="failure-popup-wrapper">\n\
        <div class="failure-popup">\n\
        <div class="failure-heading" style="padding-top: '+padTop+';">\n\
        <img src="'+_this.failureIcon+'"/>\n\
        <span class="failure-message">'+text+'</span>\n\
        <span class="failure-description">'+description+'</span>\n\
        </div>\n\
        </div>\n\
        </div>';
        jQuery("body").append(html);
        setTimeout(() => {
            jQuery("#failure-popup-wrapper").remove();
        },2000);
    }

    // To open and submit popup for share feedback feature
    shareFeedbackPopup = () =>
    {
        let _this = this;
        if(_this.loaderIcon === "")
        {
            _this.loaderIcon = "/images/light-loader.gif";
        }
        if(_this.feedbackIcon === "")
        {
            _this.feedbackIcon = "/images/quix-share-feedback-form.png";
        }
        var html = '<div id="feedback-share-popup-wrapper">\n\
        <div class="feedback-share-popup">\n\
        <div class="feedback-share-heading">\n\
        <img src="'+_this.feedbackIcon+'"/>\n\
        <span>Share your feedback with us</span>\n\
        </div>\n\
        <div id="share-feedback-form" class="email-share-form">\n\
            <input type="text" name="to-email-feedback" placeholder="Enter Your Email">\n\
            <textarea id="email-message-feedback" placeholder="Enter Your Feedback" maxlength="900" name="email-message-feedback"></textarea>\n\
            <p class="message-counter"></p>\n\
        </div>\n\
        <div class="feedback-share-submit">\n\
            <img class="loader-icon" src="'+_this.loaderIcon+'" style="display: none;">\n\
            <button class="send-feedback-share">Send</button>\n\
            <button class="close-feedback-share">Close</button>\n\
        </div>\n\
        </div>\n\
        </div>';
        jQuery("body").append(html);

        jQuery(".send-feedback-share").unbind('click');
        jQuery(".send-feedback-share").on("click",() => 
        {
            jQuery(".loader-icon").show();
            var senderEmail = jQuery("input[name=to-email-feedback]").val();
            var emailMessage = jQuery("textarea[name=email-message-feedback]").val();
            if(senderEmail == ""){ alert("Please enter email Id."); jQuery(".loader-icon").hide(); return; }
            if(emailMessage == ""){ alert("Please enter your message."); jQuery(".loader-icon").hide(); return; }
            if(!_this.IsEmail(senderEmail)){ alert("Please enter correct email Id."); jQuery(".loader-icon").hide(); return;}
            var data = {"senderEmail":senderEmail,"userMessage":emailMessage};
            _this.makeServerRequest("POST","json", editScreenshot.APIServer+"/screenshots/send-feedback",data,(res) =>
            {
                _this.sharefeedbackResponseHandler(res);
            });
        });
        jQuery("#email-message-feedback").keyup(() => {
        jQuery("#feedback-share-popup-wrapper .message-counter").text((900 - jQuery(this).val().length) + " characters left");
        });
        jQuery(".close-feedback-share").unbind('click');
        jQuery(".close-feedback-share").on("click",() => {
            jQuery("#feedback-share-popup-wrapper").remove();
            jQuery(".close-feedback-share").unbind('click');
        });
    }

    // To handle share feedback feature response
    sharefeedbackResponseHandler = (res) =>
    {
        let _this = this;
        if(res.success)
        {
            jQuery("#feedback-share-popup-wrapper").remove();
            jQuery(".close-feedback-share").unbind('click');
            _this.successMessagePopup("Email Shared Successfully", "Email has been shared successfully.");    
        }
        else
        {
            jQuery("#feedback-share-popup-wrapper .loader-icon").hide();
            _this.failureMessagePopup("Email Sharing Failed", "Email couldn't be sent.");
        }
    }

    /* logout a user session*/
    handleQuixyLogOut = () =>
    {
        let _this = this;
        jQuery("#quix-popup-loader").show();
        _this.makeServerRequest("GET","", editScreenshot.APIServer+"/user/logout","",(res) =>
        {
            jQuery("#quix-popup-loader").hide();
            jQuery(".loggedin-item").hide();
            jQuery(".loggedOut-item").show();
            var data = { "quixyLoginUserData" : null};
            chrome.storage.local.set(data, () =>  {});
        });
    }

    // Handle user login into screengenius dashboard
    handleQuixyLogIn = (data,callback) =>
    {
        let _this = this;
        var email = data.email;
        var name = data.name;
        var pic = data.picture;
        var data = {"email":email,"name":name,"picture":pic};
        _this.makeServerRequest("POST","json", editScreenshot.APIServer+"/user/login",data,(res) =>
        {
            jQuery("#quix-popup-loader").hide();
            if(callback && callback !== null && callback !== undefined)
            {
                callback(res);
            }
            else
            {
                _this.handleUserSession(res,"login");
            }
        });
    }

    // Handle google login for screengenius dashboard
    handleGoogleLogin = () =>
    {
        let _this = this;
        jQuery("#quix-popup-loader").show();
        chrome.identity.launchWebAuthFlow({url: _this.create_oauth(),'interactive': true}, (token) => {
            var tokenStr = token.split("access_token=");
            var tokenStr1 = tokenStr[1].split("token_type=");
            var fToken = tokenStr1[0];
            jQuery.ajax({ 
                url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+fToken,
                success: (result) =>
                {
                    _this.handleQuixyLogIn(result);
                }
            });
        });
    }

    // Handle user session after successful user login
    handleUserSession = (res,type) =>
    {
        let _this = this;
        if(res.success)
        {
            var data = { "quixyLoginUserData" : res.data};
            chrome.storage.local.set(data, () =>  {});
            if(type == "login"){ if(screenshotUploadServer){ _this.uploadScreenshotServer("manual"); } }
            jQuery(".loggedin-item").show();
            jQuery(".loggedOut-item").hide();
            //jQuery(".user-dashboard a").attr("href", _this.APIServer+"/dashboard");
        }
        else
        {
            var data = { "quixyLoginUserData" : null};
            chrome.storage.local.set(data, () =>  {});
            jQuery(".loggedin-item").hide();
            jQuery(".loggedOut-item").show();
        }
    }

    // To convert data url to base64
    dataURItoBlob = (blobUrl,callback) =>
    {
        let _this = this;
        var xhr = new XMLHttpRequest;
        xhr.responseType = 'blob';
        xhr.onload = () =>  {
            var recoveredBlob = xhr.response;
            callback(recoveredBlob);
            // var reader = new FileReader;
            // reader.onload = () =>  {
            //     var blobAsDataUrl = reader.result;
            //     callback(blobAsDataUrl);
            // };
            // reader.readAsDataURL(recoveredBlob);
        };
        xhr.open('GET', blobUrl);
        xhr.send();
    }

    // Format byte data into KB, MB or GB
    formatBytes = (bytes, decimals = 2) =>
    {
        let _this = this;
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    // Get screenshot size as KB, MB or GB
    getImageSize = (base64String) =>
    {
        let _this = this;
        var stringLength = base64String.length - 'data:image/png;base64,'.length;
        var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
        return sizeInBytes;
    }

    // get today's date with format 
    getTodayDate = () =>
    {
        let _this = this;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = dd + '.' + mm + '.' + yyyy;
        return today;
    }

    // To make an API request to screengenius server
    makeServerRequest = (type,dataType,url,data,callback) =>
    {
        let _this = this;
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
            success: (data) => {
                callback(data);
            },
            error: (error) => {
                callback(error);
            },
            data: data
        });
    }

    // To open sign in popup
    openSignInpopup = () =>
    {
        jQuery("#quix-popup-loader").hide();
        jQuery("#quix-signin-wrapper").show();
    }

    // To close sign in popup
    closeSignInpopup = () =>
    {
        jQuery("#quix-signin-wrapper").hide();
    }

    // To open dashboard
    openDashboard = () =>
    {
        let _this = this;
        chrome.storage.local.get('quixyLoginUserData', (result) =>
        {
            if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
            {
                window.open(editScreenshot.APIServer+"/dashboard","_blank");
            }
            else
            {
                _this.openSignInpopup(); 
            }
        });
    }

    // To create oauth url for google request
    create_oauth = () =>
    {
        let _this = this;
        let auth_url = `https://accounts.google.com/o/oauth2/v2/auth?`
        var auth_params = {
        client_id: _this.clientIDOauth,
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

}