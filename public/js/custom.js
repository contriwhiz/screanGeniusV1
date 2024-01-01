/*global chrome*/
var start = {};
var end = {};
var isSelecting = false;
var winH = 0; 
var wScrolled = 0;
var docHeight = 0;
var baseImgArr = [];
var imagesposY = 0;
var lastScreenshotH = 0;
var fullScreenShotCan = "";
var fullScreenShotContext = "";
var rect = {};
var rectB = {};
var rectH = {};
var rectS = {};
var ctx = "";
var ctxB = "";
var ctxH = "";
var ctxS = "";
var imageObjB = null;
var imageObjS = null;
var imageObjH = null;
var canBGMain = null;
var canvasMain = null;
var drag = "";
var screenPriorToBlur= "";
var screenPriorToHighlight = "";
var screenPriorToShape = "";
var screenPriorToUpload = "";
var screenShotType = "Visible Part Screenshot";
var originalImage = "";
var screenshotName = "";
var updateScreenshot = "";
var canvas_background = null;
var screensHistoryData = [];
var screensHistoryStep = 0;
var canvasScale = 1;
var zoomValueX = 0;
var zoomValueY = 0;
var zoomValuePercent = 100;
var zoomValuePercentRatio = 1;
var cooridnatesDrawnAt = [];
var whiteSpaceAround = 200;
var isScreenshotUpdated = false;
var screenshotUploadServer = false;
var loaderIcon = "";
var feedbackIcon = "";
var successIcon = "";
var failureIcon = "";
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
                makeServerRequest("GET","", APIServer+"/user/get","",function(res)
                {
                    handleUserSession(res,"get");
                });
            }
        });
    }
});

window.onload = function()
{
    // get final screenshot image to use on download 
    chrome.storage.local.get('quixyScreenshotFinal', async function (obj) 
    {
        if(obj.quixyScreenshotFinal !== undefined && obj.quixyScreenshotFinal !== "")
        {
            screensHistory(obj.quixyScreenshotFinal,1);
            loadScreenshotOnCanvas(obj.quixyScreenshotFinal);
            addEventListeners();
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
    var text = "Are you sure you want to leave?"
    if(confirm(text) == true) 
    {
        clearFinalScreenshot();
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
        var dataURI = reader.result;
        loadEditableScreenshotOnCanvas(dataURI);
        var data = { "quixyScreenshot" : dataURI};
        chrome.storage.local.set(data, function() {});
        jQuery("#upload-custom-screenshot-outer").hide();
    }
    reader.onerror = function(error){ console.log(error); }
});

// Load screenshot on canvas for editing
function loadEditableScreenshotOnCanvas(screenshot,callback)
{
    var image = new Image();
    image.onload = function() 
    {
        setScreenshotName();
        var canvas = document.getElementById("captured-screen");
        canvas.height = image.height+((whiteSpaceAround/zoomValuePercentRatio)*2);
        canvas.width = image.width+((whiteSpaceAround/zoomValuePercentRatio)*2);
        var context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, (whiteSpaceAround/zoomValuePercentRatio), (whiteSpaceAround/zoomValuePercentRatio));
        var sshot = canvas.toDataURL("image/jpeg",1);
        originalImage = sshot;
        chrome.runtime.sendMessage({type:"updateCordinates",cooridnatesDrawnAt:cooridnatesDrawnAt});
        chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:sshot});
        var data2 = { "originalImage": sshot };
        chrome.storage.local.set(data2, function() {});
        autoadjustScreenshot(canvas.width,canvas.height);
        screensHistory(sshot);
        addEventListeners();
    };
    image.src = screenshot;
}