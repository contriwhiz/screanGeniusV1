/*global chrome*/
let start = {};
let end = {};
let isSelecting = false;
let winH = 0; 
let wScrolled = 0;
let docHeight = 0;
let baseImgArr = [];
let imagesposY = 0;
let lastScreenshotH = 0;
let fullScreenShotCan = "";
let fullScreenShotContext = "";
let rect = {};
let rectB = {};
let rectH = {};
let rectS = {};
let ctx = "";
let ctxB = "";
let ctxH = "";
let ctxS = "";
let imageObjB = null;
let imageObjS = null;
let imageObjH = null;
let canBGMain = null;
let canvasMain = null;
let drag = "";
let screenPriorToBlur= "";
let screenPriorToHighlight = "";
let screenPriorToShape = "";
let screenPriorToUpload = "";
let screenShotType = "Visible Part Screenshot";
let originalImage = "";
let screenshotName = "";
let updateScreenshot = "";
let canvas_background = null;
let screensHistoryData = [];
let screensHistoryStep = 0;
let canvasScale = 1;
let zoomValueX = 0;
let zoomValueY = 0;
let zoomValuePercent = 100;
let zoomValuePercentRatio = 1;
let cooridnatesDrawnAt = [];
let whiteSpaceAround = 200;
let isScreenshotUpdated = false;
let screenshotUploadServer = false;
let loaderIcon = "";
let feedbackIcon = "";
let successIcon = "";
let failureIcon = "";

let editScreenshot;
// window.onbeforeunload = function() 
// {
//     return 'Do you really want to exit? Your progress will be lost.';
// };

window.addEventListener('focus', function(event) {
    // to display loggedIn state if user logged from dashboard
    if(jQuery(".download-mode").css("display") == "block")
    {
        chrome.storage.local.get('quixyLoginUserData', function(result)
        {
            if(result.quixyLoginUserData == "" || result.quixyLoginUserData == null)
            {
                helpers.makeServerRequest("GET","", editScreenshot.APIServer+"/user/get","",function(res)
                {
                    helpers.handleUserSession(res,"get");
                });
            }
        });
    }
});

window.onload = function()
{
    editScreenshot = new editScreenshotSG();
    helpers = new helperSG();
    // get final screenshot image to use on download 
    chrome.storage.local.get('quixyScreenshotFinal', async function (obj) 
    {
        if(obj.quixyScreenshotFinal !== undefined && obj.quixyScreenshotFinal !== "")
        {
            editScreenshot.screensHistory(obj.quixyScreenshotFinal,1);
            editScreenshot.loadScreenshotOnCanvas(obj.quixyScreenshotFinal);
            addListenersToPage();
            editScreenshot.addEventListeners();
        }
        else
        {
            chrome.storage.local.get('quixyScreenshot', async function (obj) 
            {
                if(obj.quixyScreenshot !== undefined && obj.quixyScreenshot !== "")
                {
                    loadEditableScreenshotOnCanvas(obj.quixyScreenshot);
                }
                else
                {
                    jQuery("#upload-custom-screenshot-outer").css({"display":"table"});
                }
            });
        }
    });
    
    // get the original screenshot captured initially
    chrome.storage.local.get('originalImage', async function (obj) {
        if(obj.originalImage !== undefined && obj.originalImage !== "")
        {
            originalImage = obj.originalImage;
        }
    });

    // get the screenshot name
    chrome.storage.local.get('screenshotName', async function (obj) {
        if(obj.screenshotName !== undefined && obj.screenshotName !== "")
        {
            screenshotName = obj.screenshotName;
        }
    });

    // get the coordinates where annptations are drawn
    chrome.storage.local.get('cooridnatesDrawnAt', async function (obj) {
        if(obj.cooridnatesDrawnAt !== undefined && obj.cooridnatesDrawnAt !== "")
        {
            cooridnatesDrawnAt = obj.cooridnatesDrawnAt;
        }
    });

    // check if screenshot is uploaded to server or not
    chrome.storage.local.get('isScreenshotUploadedToServer', async function (obj) {
        if(obj.isScreenshotUploadedToServer !== undefined && obj.isScreenshotUploadedToServer !== "")
        {
            if(obj.isScreenshotUploadedToServer)
            {
                isScreenshotUpdated = false;
            }
        }
    });
    
    // get the screenshot type
    chrome.storage.local.get('quixyScreenShotType', async function (obj) {
        if(obj.quixyScreenShotType !== undefined && obj.quixyScreenShotType !== "")
        {
            jQuery("#screenshot-wrapper-top-left span").text(obj.quixyScreenShotType);
        }
    });
};

// deprecated feature
jQuery(".close-download-full").unbind("click");
jQuery(".close-download-full").on("click",function(){
    let text = "Are you sure you want to leave?"
    if(confirm(text) == true) 
    {
        editScreenshot.clearFinalScreenshot();
        window.close();
    } 
});

// To upload custom screenshot for editing
jQuery("#upload-custom-screenshot").unbind("change");
jQuery("#upload-custom-screenshot").on("change",function(){
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = function()
    { 
        let dataURI = reader.result;
        loadEditableScreenshotOnCanvas(dataURI);
        let data = { "quixyScreenshot" : dataURI};
        chrome.storage.local.set(data, function() {});
        jQuery("#upload-custom-screenshot-outer").hide();
    }
    reader.onerror = function(error){ console.log(error); }
});

// Load screenshot on canvas for editing
function loadEditableScreenshotOnCanvas(screenshot,callback)
{
    let image = new Image();
    image.onload = function() 
    {
        setScreenshotName();
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
        chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:sshot});
        let data2 = { "originalImage": sshot };
        chrome.storage.local.set(data2, function() {});
        editScreenshot.autoadjustScreenshot(canvas.width,canvas.height);
        editScreenshot.screensHistory(sshot);
        addListenersToPage();
        editScreenshot.addEventListeners();
    };
    image.src = screenshot;
}

const addListenersToPage = () =>
{
    jQuery(".icon-undo img").unbind('click');
    jQuery(".icon-undo img").on("click",() => 
    {
        editScreenshot.isPreviousAnnDone(() => 
        {
            editScreenshot.removeIconActiveState(".annotate-ul .sideBar-li");
            jQuery("#annotations-popup-outer").hide();
            editScreenshot.performUndoRedo('undo');
        });
    });

    jQuery(".icon-redo img").unbind('click');
    jQuery(".icon-redo img").on("click",() => 
    {
        editScreenshot.isPreviousAnnDone(() => 
        {
            editScreenshot.removeIconActiveState(".annotate-ul .sideBar-li");
            jQuery("#annotations-popup-outer").hide();
            editScreenshot.performUndoRedo('redo');
        });
    });

    jQuery(".zoom-quix-in").unbind('click');
    jQuery(".zoom-quix-in").on("click",() => 
    {
        editScreenshot.quixyZoomIn();
    });

    jQuery(".zoom-quix-out").unbind('click');
    jQuery(".zoom-quix-out").on("click",() => 
    {
        editScreenshot.quixyZoomOut();
    });

    jQuery(".label-reset").unbind('click');
    jQuery(".label-reset").on("click",() => 
    {
        editScreenshot.resetOriginalImage();
    });

    jQuery(".copy-clipboard").unbind('click');
    jQuery(".copy-clipboard").on("click",() => 
    {
        editScreenshot.copyClipboard();
    });

    jQuery(".label-email .download-col").unbind('click');
    jQuery(".label-email .download-col").on("click",() => 
    {
        helpers.shareViaEmail();
    });

    jQuery(".label-share .download-col").unbind('click');
    jQuery(".label-share .download-col").on("click",() => 
    {
        helpers.shareLinkPopup();
        jQuery(".share-popup-outer").hide();
    });

    // jQuery(".icon-share").unbind('click');
    // jQuery(".icon-share").on("click",() => 
    // {
    //     editScreenshot.shareLinkPopup();
    //     jQuery(".share-popup-outer").hide();
    // });

    jQuery(".sideBar-li").unbind('mouseover');
    jQuery(".sideBar-li").on("mouseover",(elem) => {
        editScreenshot.iconMouseOver(jQuery(elem.currentTarget))
    });

    jQuery(".sideBar-li").unbind('mouseout');
    jQuery(".sideBar-li").on("mouseout",(elem) => 
    {
        editScreenshot.iconMouseOut(jQuery(elem.currentTarget));
    });

    jQuery(".input-radio-custom").unbind('mouseover');
    jQuery(".input-radio-custom").on("mouseover",(elem) => {
        editScreenshot.iconMouseOver(jQuery(elem.currentTarget));
    });

    jQuery(".input-radio-custom").unbind('mouseout');
    jQuery(".input-radio-custom").on("mouseout",(elem) => 
    {
        editScreenshot.iconMouseOut(jQuery(elem.currentTarget));
    });

    jQuery(".input-radio-custom-align").unbind('click');
    jQuery(".input-radio-custom-align").on("click",(elem) => 
    {
        editScreenshot.iconMouseClick(jQuery(elem.currentTarget),".input-radio-custom-align");
    });

    jQuery(".input-radio-custom-style").unbind('click');
    jQuery(".input-radio-custom-style").on("click",() => 
    {
        editScreenshot.iconMouseToggle(this,".input-radio-custom-style");
    });   

    jQuery(".screenshot-close-inner img").unbind('click');
    jQuery(".screenshot-close-inner img").on("click",() => {
        var text = "Are you sure you want to leave?"
        if(confirm(text) == true) 
        {
            jQuery("body").css({"overflow": "auto"});
            jQuery("#download-overlay").remove();
            jQuery(".download-screenshot-half").unbind("click");
            jQuery(".download-screenshot-full").unbind("click");
            jQuery(".screenshot-close-inner img").unbind("click");
        }
    });

    jQuery(".selected-download-option").unbind('mouseover');
    jQuery(".selected-download-option").on("mouseover",() => {
        jQuery(".selected-download-list").show();
    });

    jQuery(".download-screenshot-half").unbind('mouseout');
    jQuery(".download-screenshot-half").on("mouseout",() => {
        var xx = jQuery(".download-screenshot-half:hover").length;
        if(xx == 0)
        {
            jQuery(".selected-download-list").hide();
        }
    });

    jQuery(".quix-shapes").unbind('mouseover');
    jQuery(".quix-shapes").on("mouseover",() => {
        jQuery(".shapes-popup-outer").show();
    });

    jQuery(".label-download").unbind('mouseover');
    jQuery(".label-download").on("mouseover",() => {
        jQuery(".download-popup-outer").show();
    });

    jQuery(".icon-shareable").unbind('mouseover');
    jQuery(".icon-shareable").on("mouseover",() => {
        jQuery(".share-popup-outer").show();
    });

    jQuery(".quix-shapes").unbind('mouseout');
    jQuery(".quix-shapes").on("mouseout",() => {
        var xx = jQuery(".quix-shapes:hover").length;
        if(xx == 0)
        {
            jQuery(".shapes-popup-outer").hide();
        }
    });

    jQuery(".label-download").unbind('mouseout');
    jQuery(".label-download").on("mouseout",() => {
        var xx = jQuery(".label-download:hover").length;
        if(xx == 0)
        {
            jQuery(".download-popup-outer").hide();
        }
    });

    jQuery(".icon-shareable").unbind('mouseout');
    jQuery(".icon-shareable").on("mouseout",() => {
        var xx = jQuery(".icon-shareable:hover").length;
        if(xx == 0)
        {
            jQuery(".share-popup-outer").hide();
        }
    });

    jQuery(".download-screenshot-full").unbind('mouseout');
    jQuery(".download-screenshot-full").on("mouseout",() => {
        var xx = jQuery(".download-screenshot-full:hover").length;
        if(xx == 0)
        {
            jQuery(".selected-download-list").hide();
        }
    });

    jQuery(".download-col span").unbind('click');
    jQuery(".download-col span").on("click",(elem) => {
        var tx = jQuery(elem.currentTarget).text();
        downloadScreenshot(tx);
        jQuery(".download-popup-outer").hide();
    });

    jQuery(".screenshot-title input").unbind('keyup');
    jQuery(".screenshot-title input").on("keyup",(elem) => {
        screenshotName = jQuery(elem.currentTarget).val();
        screenshotName = screenshotName.replace(/\s/g, '');
        jQuery(elem.currentTarget).val(screenshotName);
        var data = { "screenshotName":screenshotName };
        chrome.storage.local.set(data);
    });

    jQuery(".screenshot-maximize-inner img").unbind('click');
    jQuery(".screenshot-maximize-inner img").on("click",() => {
        var canvas = document.getElementById("captured-screen");
        var capturedScreen = canvas.toDataURL("image/jpeg",1);
        chrome.runtime.sendMessage({type:"openNewTab",screen:capturedScreen,originalImage:originalImage,screenshotName:screenshotName});
    });

    jQuery("#screenshot-wrapper-bottom").unbind('mouseout');
    jQuery("#screenshot-wrapper-bottom").on("mouseout",() => 
    {
        jQuery("body").on("mouseup", () => 
        {
            if(editScreenshot.drag)
            {
                editScreenshot.mouseUp();
            }
        });
    });

    setUiDimensions();

    jQuery(window).on("resize", () => {
        setUiDimensions("resize");
    });

    jQuery("#share-via-copy img").unbind('click');
    jQuery("#share-via-copy img").on("click",() => {
        editScreenshot.copyClipboard();
    });

    jQuery("#done-editing").unbind('click');
    jQuery("#done-editing").on("click",() => 
    {
        editScreenshot.isPreviousAnnDone(() => 
        {
            helpers.makeServerRequest("GET","", editScreenshot.APIServer+"/user/get","",(res) =>
            {
                helpers.handleUserSession(res,"get");
            });
            chrome.storage.local.get('screenshotUploadServer', async (obj) =>
            {
                if(obj.screenshotUploadServer !== undefined && obj.screenshotUploadServer !== "")
                {
                    screenshotUploadServer = obj.screenshotUploadServer;
                    if(isScreenshotUpdated && screenshotUploadServer)
                    {
                        chrome.storage.local.get('quixyLoginUserData', (result) =>
                        {
                            if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
                            {
                                uploadScreenshotServer("manual"); 
                            }
                        });
                    }
                }
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
            var canvas = document.getElementById("captured-screen");
            var capturedScreen = canvas.toDataURL("image/jpeg",1);
            chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:capturedScreen});
            loadScreenshotOnDownloadScreen();
            jQuery(".fulscreen-mode").hide();
            jQuery(".download-mode").show();
        });
    });

    jQuery("#page-back").unbind('click');
    jQuery("#page-back").on("click",() => 
    {
        location.reload();
    });
}

// To load screenshot on download screen
loadScreenshotOnDownloadScreen = () =>
{
    var canvas = document.getElementById("captured-screen");
    var source = canvas.toDataURL("image/jpeg",1);
    jQuery("#screenshot-area-left img").attr("src", source);
    jQuery(".screenshot-title input").val(screenshotName);
    setUiDimensionsDownloadScreen();
    addEventListenersDownloadsScreen();
}

// To add events for download screen
addEventListenersDownloadsScreen = () =>
{
    jQuery("#download-as-print").unbind('click');
    jQuery("#download-as-print").on("click",() => {
        var imgSrc = "http://i.stack.imgur.com/hCYTd.jpg";
        win = window.open(imgSrc,"_blank");
        win.onload = () =>  { win.print(); }
    });

    // jQuery("#share-via-email").unbind('click');
    // jQuery("#share-via-email").on("click",() => {
    //     editScreenshot.shareViaEmail();
    // });

    jQuery("#share-via-copy img").unbind('click');
    jQuery("#share-via-copy img").on("click",() => {
        editScreenshot.copyClipboard();
    });

    // jQuery("#share-via-link").unbind('click');
    // jQuery("#share-via-link").on("click",() => {
    //     editScreenshot.shareLinkPopup();
    // });

    jQuery("#share-feedback").unbind('click');
    jQuery("#share-feedback").on("click",() => {
        helpers.shareFeedbackPopup();
    });
    
    jQuery(".quix-upload .user-logIn").unbind('click');
    jQuery(".quix-upload .user-logIn").on("click",() => {
        helpers.handleGoogleLogin();
    });

    // action to login to screengenius
    jQuery(".quix-upload .user-logIn-social").unbind("click");
    jQuery(".quix-upload .user-logIn-social").on("click",() => 
    {
        window.open(
            'https://screengenius.io/login',
            '_blank' // <- This is what makes it open in a new window.
        );
    });

    jQuery(".quix-upload .user-upload").unbind('click');
    jQuery(".quix-upload .user-upload").on("click",() => {
        uploadScreenshotServer("manual");
    });

    jQuery(".quix-upload .user-logOut").unbind('click');
    jQuery(".quix-upload .user-logOut").on("click",() => {
        handleQuixyLogOut();
    });

    jQuery(".screenshot-title input").unbind('keyup');
    jQuery(".screenshot-title input").on("keyup",(elem) => {
        screenshotName = jQuery(elem.currentTarget).val();
        screenshotName = screenshotName.replace(/\s/g, '');
        jQuery(elem.currentTarget).val(screenshotName);
        var data = { "screenshotName":screenshotName };
        chrome.storage.local.set(data);
    });

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

    jQuery(".quix-signin-close").unbind("click");
    jQuery(".quix-signin-close").on("click",() => 
    {
        helpers.closeSignInpopup();
    });

    jQuery(".user-dashboard").unbind("click");
    jQuery(".user-dashboard").on("click",() => 
    {
        helpers.openDashboard();
    });
}

// Set dimesions on download page after load
setUiDimensionsDownloadScreen = () =>
{
    var screenW = jQuery("#download-overlay-inner").innerWidth();
    var screenH = jQuery(window).height();
    var topH = jQuery("#screenshot-wrapper-top").outerHeight();
    var bottomH = jQuery("#screenshot-wrapper-bottom-copyright").outerHeight();
    var remainH = screenH-(topH+bottomH);
    jQuery("#screenshot-area-left").css({"width":(screenW-30)+'px','height':(remainH-30)+'px'});
}

// Set dimesions on screenshot edit page after load
setUiDimensions = (type) =>
{
    var screenW = jQuery("#download-overlay-inner").innerWidth();
    var screenH = jQuery(window).height();
    var topH = jQuery("#screenshot-wrapper-top").outerHeight();
    var bottomH = jQuery("#screenshot-wrapper-bottom-copyright").outerHeight();
    var remainH = screenH-(topH+bottomH);
    jQuery("#screenshot-wrapper-bottom").css({"width":screenW+'px','height':remainH+'px'});
    if(type !== undefined && type === "resize")
    {
        var capturedScreen = document.getElementById("captured-screen");
        var imageURI = capturedScreen.toDataURL("image/jpeg",1); 
        editScreenshot.loadScreenshotOnCanvas(imageURI);
    }
}



// To perform download opertation as png/jpeg and pdf
downloadScreenshot = (selectedMethod) =>
{
    console.log("-downloadScreenshot-");
    editScreenshot.isPreviousAnnDone(() => 
    {
        console.log("-steps 1-");
        editScreenshot.removeIconActiveState(".annotate-ul .sideBar-li");
        jQuery("#annotations-popup-outer").hide();
        editScreenshot.updateCanvasByAnno((source) =>
        {
            console.log("-steps 1-");
            if(selectedMethod != "DOWNLOAD")
            {
                console.log(selectedMethod,"-steps 2-");
                if(selectedMethod == "JPG" || selectedMethod == "PNG")
                {
                    console.log("-steps 3-");
                    var fileName = screenshotName+".png";
                    if(selectedMethod == "JPG"){ fileName = screenshotName+".jpg"; }
                    var el = document.createElement("a");
                    el.setAttribute("href", source);
                    el.setAttribute("download", fileName);
                    document.body.appendChild(el);
                    try
                    {
                        el.click();
                    }
                    catch(err)
                    {
                        alert(err+"Please try to download in full screen mode as host page is retricting the pdf download.");
                    }
                    el.remove();    
                }
                else if(selectedMethod == "PDF")
                {
                    var base64EncodedPDF = source.split(',')[1];
                    var decodedPdfContent = atob(base64EncodedPDF);
                    var byteArray = new Uint8Array(decodedPdfContent.length)
                    for(var i=0; i<decodedPdfContent.length; i++){
                        byteArray[i] = decodedPdfContent.charCodeAt(i);
                    }
                    var blob = new Blob([byteArray.buffer], { type: 'image/jpeg' });
                    var source = URL.createObjectURL(blob);
                    getImageFromUrl(source, createPDF);
                }
            }
        });
    });
}

// To apply watermark to a screenshot
applyWatermark = (source,callback) =>
{
    var img = document.createElement('img');
    img.src = source;
    img.onload = () =>  
    {
        var text = "Quixy"; 
        var tempCanvas = document.createElement('canvas');
        tempCanvas.id = "captured-screen-watermark";
        tempCanvas.style.display = "none";
        var tempCtx = tempCanvas.getContext('2d');
        var cw,ch;
        cw = tempCanvas.width = img.width;
        ch = tempCanvas.height = img.height;
        tempCtx.drawImage(img,0,0);
        tempCtx.font = "36px verdana";
        var textWidth = tempCtx.measureText(text).width;
        var textHeight = 36;
        var x = cw - (textWidth+50);
        var y = ch - textHeight;
        tempCtx.globalAlpha = .50;
        tempCtx.fillStyle = 'white';
        tempCtx.fillText(text,x,y);
        tempCtx.fillStyle = 'black';
        tempCtx.fillText(text,x,y);
        document.body.appendChild(tempCanvas);
        callback();
    }
}

// Get image's base64 data from an image Url
getImageFromUrl = (url, callback) => {
    var img = new Image();
    img.onError = () =>  {
        alert('Cannot load image: "'+url+'"');
    };
    img.onload = () =>  {
        callback(img);
    };
    img.src = url;
}

// To create PDF for download operation
createPDF = (imgData) =>
{
    var doc = new jsPDF();
    var ww = imgData.width;
    var hh = imgData.height;
    var ar = ww/hh;
    var pdfW = parseInt(doc.internal.pageSize.width-20);
    var pdfH = parseInt(pdfW/ar);
    var position = 0;
    var heightLeft = pdfH;
    var pageHeight = parseInt(doc.internal.pageSize.height);
    doc.addImage(imgData, 'JPEG', 10, position, pdfW, pdfH); // Cache the image using the alias 'monkey'/
    heightLeft -= pageHeight;
    while (heightLeft >= 0) 
    {
    position += (pageHeight); // top padding for other pages
    doc.addPage();
    doc.addImage(imgData, 'JPEG', 10, -Math.abs(position), pdfW, pdfH);
    heightLeft -= pageHeight;
    }

    var fileName = screenshotName+".pdf";
    var source = doc.output('datauristring');
    var el = document.createElement("a");
    el.setAttribute("href", source);
    el.setAttribute("download", fileName);
    document.body.appendChild(el);
    try
    {
        el.click();
    }
    catch(err)
    {
        alert(err+"Please try to download in full screen mode as host page is retricting the pdf download.");
    }
    el.remove();
    
}

    // To upload screenshot to screengenius dashboard
    uploadScreenshotServer = async (type="manual",callback) =>
    {
        chrome.storage.local.get('quixyLoginUserData', (result) =>
        {
            if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
            {
                chrome.storage.local.get('isScreenshotUploadedToServer', async (obj) =>
                {
                    if(obj.isScreenshotUploadedToServer !== undefined && obj.screenshotUploadServer !== "")
                    {
                        var isScreenshotUploadedToServer = obj.isScreenshotUploadedToServer;
                        if(!isScreenshotUploadedToServer)
                        {
                            if(type == "manual"){ jQuery("#quix-popup-loader").show(); }
                            var sessionData = result.quixyLoginUserData;
                            editScreenshot.updateCanvasByAnno((source) =>
                            {
                                var imgS = helpers.getImageSize(source);
                                helpers.dataURItoBlob(source,(res) =>
                                {
                                    var fd = new FormData();
                                    fd.append('name', screenshotName+".jpg");
                                    fd.append('user_id', parseInt(sessionData.id));
                                    fd.append('file_size', imgS); //helpers.formatBytes(imgS)
                                    fd.append('screenshot', res);
                                    helpers.makeServerRequest("POST","form-data", editScreenshot.APIServer+"/screenshots/upload",fd,(res) =>
                                    {
                                        if(type == "manual"){ jQuery("#quix-popup-loader").hide(); }
                                        if(res.success)
                                        {
                                            if(callback !== undefined)
                                            { 
                                                callback(res); 
                                            }
                                            isScreenshotUpdated = false;
                                            var data = { "isScreenshotUploadedToServer" : res.insertedId};
                                            chrome.storage.local.set(data, () =>  {});
                                            if(type == "manual")
                                            {
                                                helpers.successMessagePopup("Uploaded Successfully", "Screenshot is uploaded Successfully.");
                                            }
                                        }
                                        else
                                        {
                                            // if(type == "manual")
                                            // {
                                                if(res.message == "You exceeded Limit.")
                                                {
                                                    jQuery("#email-share-popup-wrapper").remove();
                                                    jQuery("#link-share-popup-wrapper").remove();
                                                    helpers.failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                                }
                                                else
                                                {
                                                    jQuery("#email-share-popup-wrapper").remove();
                                                    jQuery("#link-share-popup-wrapper").remove();
                                                    helpers.failureMessagePopup("Upload Failed", "Something Went Wrong."); 
                                                }  
                                            // }
                                        }   
                                    });
                                });
                            });
                        }
                        else
                        {
                            if(type == "manual")
                            {
                                jQuery("#email-share-popup-wrapper").remove();
                                jQuery("#link-share-popup-wrapper").remove();
                                helpers.failureMessagePopup("Upload Failed", "You have already uploaded this file to server."); 
                            }
                        }
                    }
                });
            }
            else
            {
                helpers.openSignInpopup(); 
            }
        });
    }

    // To write screenshot name into field
    setScreenshotName = () =>
    {
        screenshotName = "IMG_"+(Math.floor(Math.random() * 10000));
        var data = { "screenshotName":screenshotName };
        chrome.storage.local.set(data);
        jQuery(".screenshot-title input").val(screenshotName);
    }