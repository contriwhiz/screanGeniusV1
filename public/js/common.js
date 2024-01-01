var clientIDOauth = "83540021534-j3c68n39ht71ojcep42o1qqhvfoh20cs.apps.googleusercontent.com";
var actionSave = "";
var GoogleAuth; // Google Auth object.
var XAxis = 15;
var YAxis = 15;
var cropPoints = 0;
var highlightStartPos = "";
var prevHighlightStartPos = "";
var ctxH = "";
var highlightLastPoint = "";
var selectedShapeAnno = "";
//var APIServer = "http://localhost:3000";
//var APIServer = "http://82.208.20.76";
var APIServer = "https://screengenius.io";
var shapeOutline = "3";
var shapeOutlineColor = "#525FB0";
// To get image which is between the selected coorinates for crop and selected screen screenshot features 
async function get_image(coords,callback) 
{
    let data = coords;
    let proceed = true;
    if(proceed) 
    {
        chrome.runtime.sendMessage({ "message": "wait" }, (response) => { });
        let dataUrl = data[6];
        let img = new Image();
        img.src = dataUrl;
        img.onload = function () 
        {
            let resize_canvas = document.createElement("canvas");
            let resize_canvas_width = data[4];
            let resize_canvas_height = data[5];
            resize_canvas.width = resize_canvas_width;
            resize_canvas.height = resize_canvas_height;
            resize_canvas.style.width = resize_canvas_width;
            resize_canvas.style.height = resize_canvas_height;
            let resize_context = resize_canvas.getContext("2d");
            resize_context.drawImage(this, 0, 0, this.width, this.height, 0, 0, resize_canvas_width, resize_canvas_height);
            let resized_img = new Image();
            resized_img.src = resize_canvas.toDataURL("image/jpeg",1);
            resized_img.onload = function () 
            {
                let canvas = document.createElement('canvas');
                canvas.setAttribute("id", "visible_screen");
                canvas.height = data[3];
                canvas.width = data[2];
                canvas.style.height = data[3];
                canvas.style.width = data[2];
                let context = canvas.getContext("2d");
                context.drawImage(this, data[0], data[1], data[2], data[3], 0, 0, data[2], data[3]);
                var imageURI = canvas.toDataURL("image/jpeg",1);
                callback(imageURI);
            }
        }
    }
    else
    {
        alert("Select a valid region to perform text extraction.");
        canvas_background = null;
        isCanvasBackground = 0;
        return;
    }
}
// To get selected coordinates by user for selected screen screenshot feature
async function get_coords_screenshot(dataUri, callback) {
    disableScrolling();
    if(document.getElementById("canvas_background"))
    {
        document.getElementById("canvas_background").remove();
        jQuery("#close-captureScreen").unbind('click');
        jQuery("#close-captureScreen").remove();
    }
    setTimeout(function()
    {
        canvas_background = document.createElement('canvas');
        canvas_background.id = "canvas_background";
        canvas_background.style.width = window.innerWidth;
        canvas_background.style.height = window.innerHeight;
        canvas_background.width = window.innerWidth;
        canvas_background.height = window.innerHeight;
        canvas_background.style.position = "absolute";
        canvas_background.style.left = 0;
        canvas_background.style.top = window.scrollY+"px";
        canvas_background.style.zIndex = "9999999999";
        canvas_background.style.cursor = "crosshair";

        document.body.appendChild(canvas_background);
        var closeCapture = '<span id="close-captureScreen" style="top:'+(window.scrollY+10)+'px;"><img src="'+closeIcon+'"></span>';
        jQuery("body").append(closeCapture);

        jQuery("#close-captureScreen").unbind('click');
	    jQuery("#close-captureScreen").on("click",function()
	    {
	        jQuery("#canvas_background").remove();
	        canvas_background = null;
            isCanvasBackground = 0;
	        jQuery("#close-captureScreen").unbind('click');
	        jQuery("#close-captureScreen").remove();
            enableScrolling();
	    });
        ctx = canvas_background.getContext('2d');
        ctx.fillStyle = "rgba(0, 0, 0, .7)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight); //jQuery("body").prop('scrollHeight')
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText("Select Your Area to Capture Screenshot", canvas_background.width/2, window.innerHeight/2);
        drag = false;

        init('screenshot');

        rect.startX = (parseFloat(rect.startX));
        rect.startY = (parseFloat(rect.startY));
        rect.w = (parseFloat(rect.w));
        rect.h = (parseFloat(rect.h));
        document.getElementById("canvas_background").addEventListener("click", () => {
            // removeOverlay('screenshot').then(() => {
            //   	get_image([rect.startX, rect.startY, rect.w, rect.h, window.innerWidth, window.innerHeight, dataUri],function(imageURI){ callback(imageURI); });
            //     jQuery("#close-captureScreen").unbind('click');
            //     jQuery("#close-captureScreen").remove();
            //     canvas_background = null;
            //     isCanvasBackground = 0;
            // });
            var xxCord = (rect.startX+rect.w) - 85;
            var yyCord = (rect.startY+rect.h+window.scrollY) - 40;
            var screenCaptureControls = '<div id="quix-screen-capture-outer" style="left:'+xxCord+'px;top:'+yyCord+'px;"><img id="quix-screen-capture-close" src="'+closeIcon+'"><img id="quix-screen-capture-crop" src="'+cropIcon+'"></div>';
            jQuery("body").append(screenCaptureControls);
            jQuery("#quix-screen-capture-close").unbind('click');
            jQuery("#quix-screen-capture-close").on("click",function()
            {
                jQuery("#canvas_background").remove();
                canvas_background = null;
                isCanvasBackground = 0;
                jQuery("#quix-screen-capture-close").unbind('click');
                jQuery("#quix-screen-capture-outer").remove();
                jQuery("#close-captureScreen").unbind('click');
                jQuery("#close-captureScreen").remove();
                enableScrolling();
            });
            jQuery("#quix-screen-capture-crop").unbind('click');
            jQuery("#quix-screen-capture-crop").on("click",function()
            {
                screenshotCropDrawnImage("screenshot",dataUri,callback);
                jQuery("#canvas_background").remove();
                canvas_background = null;
                isCanvasBackground = 0;
                jQuery("#quix-screen-capture").unbind('click');
                jQuery("#quix-screen-capture-outer").remove();
                jQuery("#close-captureScreen").unbind('click');
                jQuery("#close-captureScreen").remove();
            });
        });
    },500);
}
// To remove overlay and request to crop image for selected screenshot capture
function screenshotCropDrawnImage(type,dataUri,callback)
{
    // actionSave = "";
    // applyCropDimensions();
    // var canvas = document.getElementById("captured-screen");
    // var dataUri = canvas.toDataURL("image/jpeg",1);
    removeOverlay('screenshot').then(() => {
        get_image([rect.startX, rect.startY, rect.w, rect.h, window.innerWidth, window.innerHeight, dataUri],function(imageURI)
        {
            callback(imageURI); 
        });
        jQuery("#close-captureScreen").unbind('click');
        jQuery("#close-captureScreen").remove();
        canvas_background = null;
        isCanvasBackground = 0;
    });
}

// To get selected coordinates by user for screenshot crop feature
async function get_coords_crop(dataUri) 
{
	if(document.getElementById("canvas_background"))
    {
        document.getElementById("canvas_background").remove();
        jQuery("#close-captureScreen").unbind('click');
        jQuery("#close-captureScreen").remove(); 
    }
    setTimeout(function()
    {
        canvas_background = document.createElement('canvas');
        canvas_background.id = "canvas_background";
        canvas_background.style.width = jQuery("#captured-screen").width();
        canvas_background.style.height = jQuery("#captured-screen").height();
        canvas_background.width = jQuery("#captured-screen").width();
        canvas_background.height = jQuery("#captured-screen").height(); 
        var canOff = jQuery("#captured-screen").offset();
        canvas_background.style.position = "absolute";   
        //canvas_background.style.left = XAxis+"px";
        //canvas_background.style.top = YAxis+"px";
        canvas_background.style.zIndex = "9999999999";
        canvas_background.style.cursor = "crosshair";
        document.getElementById("screenshot-wrapper-bottom-wrap-inner").appendChild(canvas_background);
        
        ctx = canvas_background.getContext('2d');
        ctx.fillStyle = "rgba(0, 0, 0, .7)";
        ctx.fillRect(0, 0, jQuery("#captured-screen").width(), jQuery("#captured-screen").height());

        init('crop');

        rect.startX = (parseFloat(rect.startX));
        rect.startY = (parseFloat(rect.startY));
        rect.w = (parseFloat(rect.w));
        rect.h = (parseFloat(rect.h));
    },500);
}
// To request to draw blur while mouse is moving 
async function mouseMoveBlur(e) 
{
    if (drag) 
    {
        rectB.w = (((e.pageX) - (canBGMain.left + (rectB.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
        rectB.h = (((e.pageY) - (canBGMain.top + (rectB.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
        if(rectB.w > 0 && rectB.h > 0)
        {
            drawBlur();
        }
    }
}

// To draw blur on the captured screenshot
function drawBlur()
{
    if(rectB.w > 0 && rectB.h > 0)
    {
        var blurStrength = jQuery("#blur-strength").val();
        blurStrength = (blurStrength*2)+"px";
        ctxB.clearRect(0, 0, 500, 500);
        ctxB.filter = 'blur('+blurStrength+')';
        ctxB.drawImage(imageObjB, 0, 0);
        
        ctxB.strokeStyle = 'transparent';
        imgData = ctxB.getImageData(rectB.startX, rectB.startY, rectB.w, rectB.h);
        ctxB.clearRect(0, 0, canvasMain.width, canvasMain.height);
        ctxB.filter = 'none';
        ctxB.drawImage(imageObjB, 0, 0);
        if(rectB.w<0){
        rw=rectB.startX+rectB.w;
        }else{
        rw=rectB.startX;
        }
        if(rectB.h<0){
        rh=rectB.startY+rectB.h;
        }else{
        rh=rectB.startY;
        }
        ctxB.lineWidth = 3;
        ctxB.putImageData(imgData,rw, rh); 
        ctxB.strokeRect(rectB.startX, rectB.startY, rectB.w, rectB.h);
        if(parseInt(rectB.startX) >= 0){ jQuery("#x-val").val(parseInt(rectB.startX)); }
        if(parseInt(rectB.startY) >= 0){ jQuery("#y-val").val(parseInt(rectB.startY)); }
        if(parseInt(rectB.w) >= 0){ jQuery("#width-val").val(parseInt(rectB.w)); }
        if(parseInt(rectB.h) >= 0){ jQuery("#height-val").val(parseInt(rectB.h)); }
    }
}

// To remove overlay and request to crop image for crop capture
function cropDrawnImage(type)
{
    actionSave = "";
    applyCropDimensions();
    var canvas = document.getElementById("captured-screen");
    var dataUri = canvas.toDataURL("image/jpeg",1);
    removeOverlay('crop').then(() => {
        get_image([rect.startX, rect.startY, rect.w, rect.h, jQuery("#captured-screen").width(), jQuery("#captured-screen").height(), dataUri],function(imageURI)
        { 
            jQuery("#annotations-popup-outer").hide(); 
            screensHistory(imageURI); 
            cropResetListeners();
            loadScreenshotOnCanvas(imageURI);
        });
    });
}

// To adjust positioning and scale of screenshot on download screen
function autoadjustScreenshot(wid,hei)
{
    var nW = wid;
    var nH = hei;
    //jQuery("#screenshot-wrapper-bottom-wrap").css({"width":(nW+30)+"px"});
    jQuery("#captured-screen").css({ "width":nW+"px","height":nH+"px" });
    var windW = (jQuery("#screenshot-wrapper-bottom").width()-30);
    var CW = (nW/windW);
    var percent = Math.floor((100/CW)/10)*10;
    var stati = (100-percent);
    zoomValuePercent = 100;
    if(stati < 0){ stati = 0; }
    quixyZoomOut(stati);
}

// To draw shpae on captured screenshot
function ShapeDrawnImage(type)
{
    var capturedScreen = document.getElementById("captured-screen");
    if(type !== "immidiate")
    {
        actionSave = "";
        jQuery("#annotations-popup-outer").hide(); 
        capturedScreen.removeEventListener('mousedown', mouseDownShape);
        capturedScreen.removeEventListener('mouseup', mouseUpShape);
        capturedScreen.removeEventListener('mousemove', mouseMoveShape);
        shapeResetListeners(); 
    }
    else
    {
        var imageURI = capturedScreen.toDataURL("image/jpeg",1); 
        loadScreenshotOnCanvas(imageURI,"anno");
        screensHistory(imageURI);
        imageObjS.onload = function () { ctxS.drawImage(imageObjS, 0, 0); };
        imageObjS.src = imageURI;
    }
}

// To draw blur on captured screenshot
function blurDrawnImage(type)
{
    var capturedScreen = document.getElementById("captured-screen");
    if(type !== "immidiate")
    {
        actionSave = "";
        jQuery("#annotations-popup-outer").hide();
        blurResetListeners();
    }
    else
    {
        var imageURI = capturedScreen.toDataURL("image/jpeg",1);
        loadScreenshotOnCanvas(imageURI,"anno");
        screensHistory(imageURI);
        imageObjB.onload = function () { ctxB.drawImage(imageObjB, 0, 0); };
        imageObjB.src = imageURI;
    }
}

// To draw highlights on captured screenshot
function highlightDrawnImage(type)
{
    var capturedScreen = document.getElementById("captured-screen");
    if(type !== "immidiate")
    {
        actionSave = "";
        jQuery("#annotations-popup-outer").hide(); 
        highlightStartPos = "";
        prevHighlightStartPos = "";
        highlightResetListeners();
    }
    else
    {
        var imageURI = capturedScreen.toDataURL("image/jpeg",1); 
        loadScreenshotOnCanvas(imageURI,"anno");
        screensHistory(imageURI);
        imageObjH.onload = function () { ctxH.drawImage(imageObjH, 0, 0); };
        imageObjH.src = imageURI;
    }
}

// To disable scrolling of webpage prior to capturing the full page screenshot
function disableScrolling() {
    var x = window.scrollX;
    var y = window.scrollY;
    window.onscroll = function () { window.scrollTo(x, y); };
}

// To enable scrolling of webpage after full page screenshot is captured
function enableScrolling() {
    window.onscroll = function () { };
}

// To add mouse events on canvas while cropping or capturing selected screen screenshot
function init(type) 
{
    canvas_background = document.getElementById("canvas_background");
    if(type == "screenshot" && canvas_background !== null) 
    {
        canvas_background.addEventListener('mousedown', mouseDownScreenshot, false);
        canvas_background.addEventListener('mouseup', mouseUp, false);
        canvas_background.addEventListener('mousemove', mouseMoveScreenshot, false);
        jQuery("#canvas_background").unbind('mouseout');
        jQuery("#canvas_background").on("mouseout",function()
        {
            if(drag)
            {
                mouseUp();
                jQuery("#canvas_background").trigger("click");
            }
        });
    }
    else if(type == "crop" && canvas_background !== null)
    {
        canvas_background.addEventListener('mousedown', mouseDownCrop, false);
        canvas_background.addEventListener('mouseup', mouseUp, false);
        canvas_background.addEventListener('mousemove', mouseMoveCrop, false);
    }
}

// Mouse down event on captured selected screen screenshot feature
function mouseDownScreenshot(e) 
{
    canvas_background = document.getElementById("canvas_background");
    rect.startX = (((e.clientX)));
    rect.startY = (((e.clientY)));
    drag = true;
    jQuery("#quix-screen-capture-outer").remove();
}

// Mouse down event on crop feature
function mouseDownCrop(e) 
{
    var canBG = jQuery("#canvas_background").offset();
    rect.startX = (((e.pageX) - parseFloat(canBG.left)));
    rect.startY = (((e.pageY) - parseFloat(canBG.top)));
    drag = true;
}

// Mouse down event on Blur feature
function mouseDownBlur(e) 
{
    canBGMain = jQuery("#captured-screen").offset();
    rectB.startX = (((e.pageX) - parseFloat(canBGMain.left))/zoomValuePercentRatio);
    rectB.startY = (((e.pageY) - parseFloat(canBGMain.top))/zoomValuePercentRatio);
    drag = true;
}

// Mouse down event on Shape feature
function mouseDownShape(e) 
{
    canBGMain = jQuery("#captured-screen").offset();
    rectS.startX = (((e.pageX) - parseFloat(canBGMain.left))/zoomValuePercentRatio);
    rectS.startY = (((e.pageY) - parseFloat(canBGMain.top))/zoomValuePercentRatio);
    drag = true;
}

// Mouse down event on Highlight feature
function mouseDownHighlight(e) 
{
    var highlightColor = jQuery("#highlight-bg-input").val();
    canBGMain = jQuery("#captured-screen").offset();
    rectH.startX = (((e.pageX) - parseFloat(canBGMain.left))/zoomValuePercentRatio);
    rectH.startY = (((e.pageY) - parseFloat(canBGMain.top))/zoomValuePercentRatio);
    var c = document.getElementById("captured-screen");
    ctxH = c.getContext("2d");
    ctxH.globalCompositeOperation = "multiply";
    ctxH.fillStyle = highlightColor;
    ctxH.strokeStyle = highlightColor;
    ctx.globalAlpha = "0.01";
    ctxH.lineWidth = 0;
    highlightLastPoint = { x: e.pageX, y: e.pageY };
    c.onmousemove = mouseMoveHighlight;
    drag = true;
}
// Mouse up event on blur and selected screen capture feature
function mouseUp() {
    addCoordinatestoLoop();
    drag = false;
}

// Mouse up event on Blur feature
function mouseUpBlur() 
{
    addCoordinatestoLoop();
    blurDrawnImage("immidiate")
    drag = false;
}
// Mouse up event on highlight feature
function mouseUpHighlight() 
{
    addCoordinatestoLoop();
    highlightDrawnImage("immidiate");
    drag = false;
}
// Mouse up event on shape feature
function mouseUpShape() 
{
    selectedShape = selectedShapeAnno;
    drawShapesEvent(selectedShapeAnno);
    addCoordinatestoLoop();
    ShapeDrawnImage("immidiate");
    drag = false;
}
// Mouse move event on highlight feature
function mouseMoveHighlight(e)
{
    if(drag)
    { 
        var highlightSize = jQuery("#highlight-size").val();
        var highlightW = 20;
        var highlightH = 20;
        if(highlightSize == "small")
        {
            highlightH = 8;
        }
        else if(highlightSize == "medium")
        {
            highlightH = 13;
        }
        else
        {
            highlightH = 18;
        }
        var hType = jQuery("#highlightType").val();
        if(hType == "Brush")
        {
            rectH.w = (((e.pageX) - (canBGMain.left + (rectH.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
            rectH.h = (((e.pageY) - (canBGMain.top + (rectH.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
            var currentPoint = { x: (e.pageX), y: (e.pageY) };
            var dist = distanceBetween(highlightLastPoint, currentPoint);
            var angle = angleBetween(highlightLastPoint, currentPoint);

            for (var i = 0; i < dist; i+=3) 
            {
                x = ((highlightLastPoint.x + (Math.sin(angle) * i) - highlightH+5) - (canBGMain.left))/zoomValuePercentRatio;
                y = ((highlightLastPoint.y + (Math.cos(angle) * i) - highlightH+5) - (canBGMain.top))/zoomValuePercentRatio;
                ctxH.beginPath();
                ctxH.arc(x+(highlightH/2), y+(highlightH/2), highlightH, false, Math.PI * 2, false);
                ctxH.closePath();
                ctxH.fill();
                ctxH.stroke();
            }
            highlightLastPoint = currentPoint;
        }
        else
        {
            rectH.w = (((e.pageX) - (canBGMain.left + (rectH.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
            rectH.h = (((e.pageY) - (canBGMain.top + (rectH.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
            var highlightColor = jQuery("#highlight-bg-input").val();
            ctxH.strokeStyle = highlightColor;
            ctxH.clearRect(0, 0, canvasMain.width, canvasMain.height);
            ctxH.filter = 'none';
            ctxH.drawImage(imageObjH, 0, 0);
            ctxH.fillRect(rectH.startX, rectH.startY, rectH.w, rectH.h);
        }

        if(parseInt(rectH.startX) >= 0){ jQuery("#x-val").val(parseInt(rectH.startX)); }
        if(parseInt(rectH.startY) >= 0){ jQuery("#y-val").val(parseInt(rectH.startY)); }
        if(parseInt(rectH.w) >= 0){ jQuery("#width-val").val(parseInt(rectH.w)); }
        if(parseInt(rectH.h) >= 0){ jQuery("#height-val").val(parseInt(rectH.h)); }
    }
}
// To get distance between two coordinates
function distanceBetween(point1, point2) {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// To get angle between two coordinates
function angleBetween(point1, point2) {
  return Math.atan2( point2.x - point1.x, point2.y - point1.y );
}

// Mouse move event on selected screen screenshot feature
function mouseMoveScreenshot(e) 
{
    if (drag) 
    {
        canvas_background = jQuery("#canvas_background").offset();
        //rect.w = (((e.clientX) - canvas_background.left - rect.startX));
        //rect.h = (((e.clientY) - canvas_background.top - rect.startY));
        rect.w = (((e.pageX) - canvas_background.left - (rect.startX)));
        rect.h = (((e.pageY) - canvas_background.top - (rect.startY)));
        draw("screenshot");
        //scrollWhileCropping(e, "screenshot");
    }
}
// Mouse move event on crop screenshot feature
function mouseMoveCrop(e) {
    if (drag) 
    {
        cropPoints = 1;
        var canBG = jQuery("#canvas_background").offset();
        rect.w = (((e.pageX) - canBG.left - (rect.startX)));
        rect.h = (((e.pageY) - canBG.top - (rect.startY)));
        draw("crop");
        scrollWhileCropping(e, "crop");
    }
}

// To draw selection for crop and selected screen screenshot capture
function draw(type) 
{
    var winWid = window.innerWidth;
    var winHei = window.innerHeight;
    if(type == "crop")
    {
        winWid = jQuery("#captured-screen").width();
        winHei = jQuery("#captured-screen").height();
        cropDimensionsWrite(parseInt(rect.startX),parseInt(rect.startY),rect.w,rect.h);
    } 
    if ((rect.startX < rect.startX + rect.w) && (rect.startY < rect.startY + rect.h)) 
    {
        ctx.fillStyle = "rgba(0, 0, 0, .7)";
        ctx.clearRect(0, 0, winWid, winHei);
        ctx.strokeStyle = "#525FB0";
        ctx.lineWidth = 3;
        ctx.fillRect(0, 0, winWid, rect.startY);
        ctx.fillRect(0, rect.startY, rect.startX, winHei - rect.startY);
        ctx.fillRect(rect.startX, rect.startY + rect.h, winWid - rect.startX, winHei - rect.startY - rect.h);
        ctx.fillRect(rect.startX + rect.w, rect.startY, winWid - rect.startX - rect.w, rect.h);
        ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
        ctx.stroke();
    }
}

// To removed overlay after crop or selected screen screenshot is captured
async function removeOverlay(type) {
    canvas_background = document.getElementById("canvas_background");
    if(canvas_background !== null)
    {
        ctx.clearRect(0, 0, canvas_background.width, canvas_background.height);
        if(type == "screenshot")
        {
             document.body.removeChild(canvas_background);
        }
        else if(type == "crop")
        {
            document.getElementById("screenshot-wrapper-bottom-wrap-inner").removeChild(canvas_background);
        }
    }
    enableScrolling();
}

// Mouse move event on shape feature
async function mouseMoveShape(e) 
{
    if (drag) 
    {
        if(selectedShape == "reactangle" || selectedShape == "oval")
        {
            rectS.w = (((e.pageX) - (canBGMain.left + (rectS.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
            rectS.h = (((e.pageY) - (canBGMain.top + (rectS.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
        }
        else if(selectedShape == "line" || selectedShape == "arrow")
        {
            rectS.w = (((e.pageX) - canBGMain.left)/zoomValuePercentRatio);
            rectS.h = (((e.pageY) - canBGMain.top)/zoomValuePercentRatio);
        }
        if(rectS.w > 0 && rectS.h > 0)
        {
            drawShape(selectedShape);
        }
    }
}

// Draw shape on captured screenshot
function drawShape(type)
{
    var fontOutline = jQuery("#font-outline").val();
    var fontOulineSize = jQuery("#font-ouline-size").val();
    if(rectS.w > 0 && rectS.h > 0)
    {
        var shapeW = 0;
        var shapeH = 0;
        switch(type) {
            case "reactangle":
                    ctxS.beginPath();
                    ctxS.fillStyle = "transparent";
                    ctxS.clearRect(0, 0, canvasMain.width, canvasMain.height);
                    ctxS.filter = 'none';
                    ctxS.drawImage(imageObjS, 0, 0);
                    ctxS.strokeStyle = fontOutline;
                    ctxS.lineWidth = fontOulineSize;
                    ctxS.strokeRect(rectS.startX, rectS.startY, rectS.w, rectS.h);
                    ctxS.stroke();
                    ctxS.beginPath();
                    shapeW = parseInt(rectS.w);
                    shapeH = parseInt(rectS.h);
            break;
            case "oval":
                    ctxS.beginPath();
                    ctxS.fillStyle = "transparent";
                    ctxS.clearRect(0, 0, canvasMain.width, canvasMain.height);
                    ctxS.filter = 'none';
                    ctxS.drawImage(imageObjS, 0, 0);
                    ctxS.strokeStyle = fontOutline;
                    ctxS.lineWidth = fontOulineSize;
                    drawEllipse(ctxS, rectS.startX, rectS.startY, rectS.w, rectS.h); 
                    shapeW = parseInt(rectS.w);
                    shapeH = parseInt(rectS.h);
            break;
            case "line":
                var headlen = 10;
                ctxS.beginPath();
                ctxS.fillStyle = "transparent";
                ctxS.clearRect(0, 0, canvasMain.width, canvasMain.height);
                ctxS.filter = 'none';
                ctxS.drawImage(imageObjS, 0, 0);
                ctxS.strokeStyle = fontOutline;
                ctxS.lineWidth = fontOulineSize;
                ctxS.moveTo(rectS.startX, rectS.startY);
                ctxS.lineTo(rectS.w, rectS.h);
                ctxS.stroke();  
                shapeW = parseInt(rectS.w-rectS.startX);
                shapeH = parseInt(rectS.h-rectS.startY);
            break;
            case "arrow":
                var headlen = 12;
                var dx = rectS.startX - rectS.w;
                var dy = rectS.startY - rectS.h;
                var angle = Math.atan2(dy, dx);
                ctxS.beginPath();
                ctxS.fillStyle = "transparent";
                ctxS.clearRect(0, 0, canvasMain.width, canvasMain.height);
                ctxS.filter = 'none';
                ctxS.lineCap = "round";
                ctxS.drawImage(imageObjS, 0, 0);
                ctxS.strokeStyle = fontOutline;
                ctxS.lineWidth = fontOulineSize;
                ctxS.moveTo(rectS.startX, rectS.startY);
                ctxS.lineTo(rectS.w, rectS.h);
                delta = Math.PI/6  
                for (i=0; i<2; i++) 
                {
                    ctxS.moveTo(rectS.w, rectS.h);
                    x = rectS.w + headlen * Math.cos(angle + delta)
                    y = rectS.h + headlen * Math.sin(angle + delta)
                    ctxS.lineTo(x, y);
                    delta *= -1
                }
                ctxS.stroke();
                shapeW = parseInt(rectS.w-rectS.startX);
                shapeH = parseInt(rectS.h-rectS.startY);
            break;
        }
        if(parseInt(rectS.startX) >= 0){ jQuery("#x-val").val(parseInt(rectS.startX)); }
        if(parseInt(rectS.startY) >= 0){ jQuery("#y-val").val(parseInt(rectS.startY)); }
        if(parseInt(rectS.w) >= 0){ jQuery("#width-val").val(parseInt(rectS.w-rectS.startX)); }
        if(parseInt(rectS.h) >= 0){ jQuery("#height-val").val(parseInt(rectS.h-rectS.startY)); }
	}
}

// Draw Ellipse shape on captured screenshot
function drawEllipse(ctx, x, y, w, h) {
  var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.stroke();
}

// To add events on page load for different elements
function addEventListeners(type)
{
    jQuery("#screenshot-wrapper-bottom").unbind('mouseout');
    jQuery("#screenshot-wrapper-bottom").on("mouseout",function()
    {
        jQuery("body").on("mouseup", function()
        {
            if(drag)
            {
                mouseUp();
            }
        });
    });

    if(type === undefined)
    {
        setUiDimensions();
    }
    jQuery(window).on("resize", function(){
        setUiDimensions("resize");
    });

    jQuery("#font-ouline-size").unbind('keyup');
    jQuery("#font-ouline-size").on("keyup",function(e)
    {
        var outSize = jQuery(this).val();
        if(outSize > 5)
        {
            jQuery(this).val(5);
        }
        else if(outSize < 1)
        {
            jQuery(this).val(1);
        }
    });

    jQuery(document).unbind('keyup');
    jQuery(document).on("keyup",function(e)
    {

        var evt = window.event || e;   
        if (evt.keyCode == 90 && evt.ctrlKey) 
        {
            isPreviousAnnDone(function()
            {
                removeIconActiveState(".annotate-ul .sideBar-li");
                jQuery("#annotations-popup-outer").hide();
                performUndoRedo('undo');
            });  
        }
        else if (evt.keyCode == 89 && evt.ctrlKey) 
        { 
            isPreviousAnnDone(function()
            {
                removeIconActiveState(".annotate-ul .sideBar-li");
                jQuery("#annotations-popup-outer").hide();
                performUndoRedo('redo');
            }); 
        }
        else if (evt.keyCode == 27) 
        {
            jQuery("#canvas_background").remove();
            canvas_background = null;
            isCanvasBackground = 0;
            jQuery("#close-captureScreen").unbind('click');
            jQuery("#close-captureScreen").remove();
            enableScrolling();
            jQuery("#annotations-popup-outer").hide();
        } 
        else if(evt.keyCode == 189 && evt.shiftKey) 
        {
            quixyZoomOut()
        }
        else if(evt.keyCode == 187 && evt.shiftKey) 
        {
            quixyZoomIn()
        }
        else if(evt.keyCode == 48 && evt.shiftKey) 
        {
            quixyZoomIn(1);
        }
    });

    // jQuery(".icon-email").unbind('click');
    // jQuery(".icon-email").on("click",function()
    // {
    //     shareViaEmail();
    // });

    jQuery(".icon-undo img").unbind('click');
    jQuery(".icon-undo img").on("click",function()
    {
        isPreviousAnnDone(function()
        {
            removeIconActiveState(".annotate-ul .sideBar-li");
            jQuery("#annotations-popup-outer").hide();
            performUndoRedo('undo');
        });
    });

    jQuery(".icon-redo img").unbind('click');
    jQuery(".icon-redo img").on("click",function()
    {
        isPreviousAnnDone(function()
        {
            removeIconActiveState(".annotate-ul .sideBar-li");
            jQuery("#annotations-popup-outer").hide();
            performUndoRedo('redo');
        });
    });

    jQuery(".zoom-quix-in").unbind('click');
    jQuery(".zoom-quix-in").on("click",function()
    {
        quixyZoomIn();
    });

    jQuery(".zoom-quix-out").unbind('click');
    jQuery(".zoom-quix-out").on("click",function()
    {
        quixyZoomOut();
    });

    jQuery(".label-reset").unbind('click');
    jQuery(".label-reset").on("click",function()
    {
        resetOriginalImage();
    });

    jQuery(".copy-clipboard").unbind('click');
    jQuery(".copy-clipboard").on("click",function()
    {
        copyClipboard();
    });

    jQuery(".label-email .download-col").unbind('click');
    jQuery(".label-email .download-col").on("click",function()
    {
        shareViaEmail();
    });

    jQuery(".label-share .download-col").unbind('click');
    jQuery(".label-share .download-col").on("click",function()
    {
        shareLinkPopup();
        jQuery(".share-popup-outer").hide();
    });

    // jQuery(".icon-share").unbind('click');
    // jQuery(".icon-share").on("click",function()
    // {
    //     shareLinkPopup();
    //     jQuery(".share-popup-outer").hide();
    // });

    jQuery(".sideBar-li").unbind('mouseover');
    jQuery(".sideBar-li").on("mouseover",function(){
        iconMouseOver(this)
    });

    jQuery(".sideBar-li").unbind('mouseout');
    jQuery(".sideBar-li").on("mouseout",function()
    {
        iconMouseOut(this);
    });

    jQuery(".input-radio-custom").unbind('mouseover');
    jQuery(".input-radio-custom").on("mouseover",function(){
        iconMouseOver(this);
    });

    jQuery(".input-radio-custom").unbind('mouseout');
    jQuery(".input-radio-custom").on("mouseout",function()
    {
        iconMouseOut(this);
    });

    jQuery(".input-radio-custom-align").unbind('click');
    jQuery(".input-radio-custom-align").on("click",function()
    {
        iconMouseClick(this,".input-radio-custom-align");
    });

    jQuery(".input-radio-custom-style").unbind('click');
    jQuery(".input-radio-custom-style").on("click",function()
    {
        iconMouseToggle(this,".input-radio-custom-style");
    });   

    jQuery(".screenshot-close-inner img").unbind('click');
    jQuery(".screenshot-close-inner img").on("click",function(){
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
    jQuery(".selected-download-option").on("mouseover",function(){
        jQuery(".selected-download-list").show();
    });

    jQuery(".download-screenshot-half").unbind('mouseout');
    jQuery(".download-screenshot-half").on("mouseout",function(){
        var xx = jQuery(".download-screenshot-half:hover").length;
        if(xx == 0)
        {
            jQuery(".selected-download-list").hide();
        }
    });

    jQuery(".quix-shapes").unbind('mouseover');
    jQuery(".quix-shapes").on("mouseover",function(){
        jQuery(".shapes-popup-outer").show();
    });

    jQuery(".label-download").unbind('mouseover');
    jQuery(".label-download").on("mouseover",function(){
        jQuery(".download-popup-outer").show();
    });

    jQuery(".icon-shareable").unbind('mouseover');
    jQuery(".icon-shareable").on("mouseover",function(){
        jQuery(".share-popup-outer").show();
    });

    jQuery(".quix-shapes").unbind('mouseout');
    jQuery(".quix-shapes").on("mouseout",function(){
        var xx = jQuery(".quix-shapes:hover").length;
        if(xx == 0)
        {
            jQuery(".shapes-popup-outer").hide();
        }
    });

    jQuery(".label-download").unbind('mouseout');
    jQuery(".label-download").on("mouseout",function(){
        var xx = jQuery(".label-download:hover").length;
        if(xx == 0)
        {
            jQuery(".download-popup-outer").hide();
        }
    });

    jQuery(".icon-shareable").unbind('mouseout');
    jQuery(".icon-shareable").on("mouseout",function(){
        var xx = jQuery(".icon-shareable:hover").length;
        if(xx == 0)
        {
            jQuery(".share-popup-outer").hide();
        }
    });

    jQuery(".download-screenshot-full").unbind('mouseout');
    jQuery(".download-screenshot-full").on("mouseout",function(){
        var xx = jQuery(".download-screenshot-full:hover").length;
        if(xx == 0)
        {
            jQuery(".selected-download-list").hide();
        }
    });

    jQuery(".download-col span").unbind('click');
    jQuery(".download-col span").on("click",function(){
        var tx = jQuery(this).text();
        downloadScreenshot(tx);
        jQuery(".download-popup-outer").hide();
    });

    jQuery(".screenshot-title input").unbind('keyup');
    jQuery(".screenshot-title input").on("keyup",function(){
        screenshotName = jQuery(this).val();
        screenshotName = screenshotName.replace(/\s/g, '');
        jQuery(this).val(screenshotName);
        var data = { "screenshotName":screenshotName };
        chrome.storage.local.set(data);
    });

    jQuery(".screenshot-maximize-inner img").unbind('click');
    jQuery(".screenshot-maximize-inner img").on("click",function(){
        var canvas = document.getElementById("captured-screen");
        var capturedScreen = canvas.toDataURL("image/jpeg",1);
        chrome.runtime.sendMessage({type:"openNewTab",screen:capturedScreen,originalImage:originalImage,screenshotName:screenshotName});
    });

    jQuery("#done-editing").unbind('click');
    jQuery("#done-editing").on("click",function()
    {
        isPreviousAnnDone(function()
        {
            makeServerRequest("GET","", APIServer+"/user/get","",function(res)
            {
                handleUserSession(res,"get");
            });
            chrome.storage.local.get('screenshotUploadServer', async function (obj) 
            {
                if(obj.screenshotUploadServer !== undefined && obj.screenshotUploadServer !== "")
                {
                    screenshotUploadServer = obj.screenshotUploadServer;
                    if(isScreenshotUpdated && screenshotUploadServer)
                    {
                        chrome.storage.local.get('quixyLoginUserData', function(result)
                        {
                            if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
                            {
                                uploadScreenshotServer("manual"); 
                            }
                        });
                    }
                }
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
            var canvas = document.getElementById("captured-screen");
            var capturedScreen = canvas.toDataURL("image/jpeg",1);
            chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:capturedScreen});
            loadScreenshotOnDownloadScreen();
            jQuery(".fulscreen-mode").hide();
            jQuery(".download-mode").show();
        });
    });

    jQuery("#page-back").unbind('click');
    jQuery("#page-back").on("click",function()
    {
        location.reload();
    });

    jQuery(".cancel-annotation button").unbind('click');
    jQuery(".cancel-annotation button").on("click",function()
    {
        cancelAnnotation();
    });

    // jQuery(".quix-email").unbind('click');
    // jQuery(".quix-email").on("click",function()
    // {
    //     shareViaEmail();
    // });
    
    // jQuery(".quix-share").unbind('click');
    // jQuery(".quix-share").on("click",function()
    // {
    //     shareLinkPopup();
    // });

    jQuery("#share-via-copy img").unbind('click');
    jQuery("#share-via-copy img").on("click",function(){
        copyClipboard();
    });

    jQuery(".quix-crop").unbind('click');
    jQuery(".quix-crop").on("click",function()
    {
        jQuery(".annotation-buttons").show();
        cropPoints = 0;
        var obj = this;
        isPreviousAnnDone(function()
        {
            iconMouseClick(obj,".annotate-ul .sideBar-li");
            actionSave = "crop";
            selectedShape = "";
            if(jQuery("#annotations-popup-outer") !== undefined)
            { 
                showRightSidebar("crop");
                setTimeout(function(){
                    jQuery(".crop .save-annotation button").unbind('click');
                    jQuery(".crop .save-annotation button").on("click",function()
                    {
                        cropDrawnImage("manual"); 
                        removeIconActiveState(".annotate-ul .sideBar-li");
                        jQuery(".crop .save-annotation button").unbind('click');
                    });
                },100);
                jQuery(".crop #x-val").unbind('change');
                jQuery(".crop #x-val").on("change",function()
                {
                    applyCropDimensions();
                });
                jQuery(".crop #y-val").unbind('change');
                jQuery(".crop #y-val").on("change",function()
                {
                    applyCropDimensions();
                });
                jQuery(".crop #width-val").unbind('change');
                jQuery(".crop #width-val").on("change",function()
                {
                    applyCropDimensions();
                });
                jQuery(".crop #height-val").unbind('change');
                jQuery(".crop #height-val").on("change",function()
                {
                    applyCropDimensions();
                });
            }
            var canvas = document.getElementById("captured-screen");
            var dataUri = canvas.toDataURL("image/jpeg",1);
            get_coords_crop(dataUri);
        });
    });
    jQuery(".quix-blur").unbind('click');
    jQuery(".quix-blur").on("click",function()
    {
        jQuery(".annotation-buttons").hide();
        var obj = this;
        isPreviousAnnDone(function(){
            iconMouseClick(obj,".annotate-ul .sideBar-li");
            actionSave = "blur";
            selectedShape = "";
            var canvas = document.getElementById("captured-screen");
            screenPriorToBlur = canvas.toDataURL("image/jpeg",1);
            
            if(jQuery("#annotations-popup-outer") !== undefined)
            { 
                showRightSidebar("blur");
                setTimeout(function(){
                    jQuery(".blur .save-annotation button").unbind('click');
                    jQuery(".blur .save-annotation button").on("click",function()
                    {
                        blurDrawnImage("manual");
                        removeIconActiveState(".annotate-ul .sideBar-li");
                        jQuery(".blur .save-annotation button").unbind('click');
                    });
                },100);
                jQuery(".blur #x-val").unbind('change');
                jQuery(".blur #x-val").on("change",function()
                {
                    applyBlurDimensions();
                });
                jQuery(".blur #y-val").unbind('change');
                jQuery(".blur #y-val").on("change",function()
                {
                    applyBlurDimensions();
                });
                jQuery(".blur #width-val").unbind('change');
                jQuery(".blur #width-val").on("change",function()
                {
                    applyBlurDimensions();
                });
                jQuery(".blur #height-val").unbind('change');
                jQuery(".blur #height-val").on("change",function()
                {
                    applyBlurDimensions();
                });
                jQuery(".blur #blur-strength").unbind('change');
                jQuery(".blur #blur-strength").on("change",function()
                {
                    var blurStrength = jQuery("#blur-strength").val();
                    if(blurStrength < 1)
                    {
                        jQuery("#blur-strength").val(1);
                    }
                    if(blurStrength > 5)
                    {
                        jQuery("#blur-strength").val(5);
                    }
                    applyBlurDimensions();
                });
            }
            canvasMain = document.getElementById("captured-screen");
            ctxB = canvasMain.getContext('2d');
            imageObjB = new Image();
            imageObjB.onload = function () { ctxB.drawImage(imageObjB, 0, 0); };
            imageObjB.src = canvasMain.toDataURL("image/jpeg",1);
            canvasMain.addEventListener('mousedown', mouseDownBlur, false);
            canvasMain.addEventListener('mouseup', mouseUpBlur, false);
            canvasMain.addEventListener('mousemove', mouseMoveBlur, false);
        });
    });

    jQuery(".quix-highlight").unbind('click');
    jQuery(".quix-highlight").on("click",function()
    {
        jQuery(".annotation-buttons").hide();
        var obj = this;
        isPreviousAnnDone(function(){
            iconMouseClick(obj,".annotate-ul .sideBar-li");
            actionSave = "highlight";
            selectedShape = "";
            var canvas = document.getElementById("captured-screen");
            screenPriorToHighlight = canvas.toDataURL("image/jpeg",1);
            
            if(jQuery("#annotations-popup-outer") !== undefined)
            { 
                showRightSidebar("highlight");
                setTimeout(function(){
                    jQuery(".highlight .save-annotation button").unbind('click');
                    jQuery(".highlight .save-annotation button").on("click",function()
                    {
                        highlightDrawnImage("manual");
                        removeIconActiveState(".annotate-ul .sideBar-li");
                        jQuery(".highlight .save-annotation button").unbind('click');
                    });
                },100);
            }
            jQuery(".highlight-pallette span").unbind('click');
            jQuery(".highlight-pallette span").on("click",function()
            {
                var color = jQuery(this).attr("data-color");
                jQuery(this).css("background-color","#"+color);
                jQuery("#highlight-bg-color-picker").css("background-color","#"+color);
                jQuery("#highlight-bg-input").val(color);
            });
            jQuery(".highlight-type select").unbind('change');
            jQuery(".highlight-type select").on("change",function()
            {
                var hType = jQuery(this).val();
                if(hType == "Brush")
                {
                    jQuery(".highlight-size").show();
                }
                else
                {
                    jQuery(".highlight-size").hide();
                }
            });
            canvasMain = document.getElementById("captured-screen");
            ctxH = canvasMain.getContext('2d');
            imageObjH = new Image();
            imageObjH.onload = function () { ctxH.drawImage(imageObjH, 0, 0); };
            imageObjH.src = canvasMain.toDataURL("image/jpeg",1);
            canvasMain.addEventListener('mousedown', mouseDownHighlight, false);
            canvasMain.addEventListener('mouseup', mouseUpHighlight, false);
            canvasMain.addEventListener('mousemove', mouseMoveHighlight, false);
        });
    });

    jQuery(".shapes-popup-inner .shape-row").unbind('click');
    jQuery(".shapes-popup-inner .shape-row").on("click",function()
    {
        jQuery(".annotation-buttons").hide();
        var obj = jQuery(this).parents(".sideBar-li")[0];
        jQuery(".shapes-popup-outer").hide();
        jQuery(".shape-parent-icon").attr("src",jQuery(this).find("img").attr("src"));
        if(jQuery(this).hasClass("shape-reactangle"))
        {
            selectedShape = "reactangle";
        }
        else if(jQuery(this).hasClass("shape-oval"))
        {
            selectedShape = "oval";
        }   
        else if(jQuery(this).hasClass("shape-line"))
        {
            selectedShape = "line";
        }
        else if(jQuery(this).hasClass("shape-arrow"))
        {
            selectedShape = "arrow";
        }
        selectedShapeAnno = selectedShape;
        isPreviousAnnDone(function()
        {   
            iconMouseClick(obj,".annotate-ul .sideBar-li");
            if(jQuery("#annotations-popup-outer") !== undefined)
            { 
                drawShapesEvent(selectedShape);
            }
        });
    });

    jQuery("#imgUpload").unbind('change');
    jQuery("#imgUpload").on("change",function()
    {
        jQuery(".annotation-buttons").show();
        var obj = jQuery(this).parents(".sideBar-li")[0];
        const file = this.files[0];
        if (file)
        {
          let reader = new FileReader();
          reader.onload = function(event)
          {
            var image = new Image();
            image.src = event.target.result;
            image.onload = function() 
            {
                var imageAR = this.width/this.height;
                isPreviousAnnDone(function(){   
                    iconMouseClick(obj,".annotate-ul .sideBar-li"); 
                    actionSave = "upload";
                    selectedShape = "";
                    var canvas = document.getElementById("captured-screen");
                    screenPriorToUpload = canvas.toDataURL("image/jpeg",1);
                    if(jQuery("#annotations-popup-outer") !== undefined)
                    {
                        showRightSidebar("upload");
                        setTimeout(function(){
                            jQuery(".upload .save-annotation button").unbind('click');
                            jQuery(".upload .save-annotation button").on("click",function()
                            {
                                addCoordinatestoLoop('image');
                                saveUploadSettings("manual"); 
                                removeIconActiveState(".annotate-ul .sideBar-li");
                                jQuery(".upload .save-annotation button").unbind('click');
                            });
                        },100);
                    }
                    var canOff = jQuery("#captured-screen").offset();
                    var scLeft = parseInt(jQuery("#screenshot-wrapper-bottom").scrollLeft());
                    var scTop = parseInt(jQuery("#screenshot-wrapper-bottom").scrollTop());
                    var elem_offset = {top:100, left:100};
                    elem_offset.left = (elem_offset.left*zoomValuePercentRatio)+scLeft;
                    elem_offset.top = (elem_offset.top*zoomValuePercentRatio)+scTop;
                    var elem_width = 200;
                    var elem_height = 200/imageAR;
                    elem_offset.left = (Math.round((elem_offset.left + Number.EPSILON) * 100) / 100);
                    elem_offset.top = (Math.round((elem_offset.top + Number.EPSILON) * 100) / 100);
                    if(elem_offset.left >= 0){ jQuery("#x-val").val(parseInt(elem_offset.left)); }
                    if(elem_offset.top >= 0){ jQuery("#y-val").val(parseInt(elem_offset.top)); }
                    if(elem_width >= 0){ jQuery("#width-val").val(parseInt(elem_width)); }
                    if(elem_height >= 0){ jQuery("#height-val").val(parseInt(elem_height)); }
                    jQuery(".editor-outer-image-overlay").remove();
                    var newElement$ = jQuery('<div class="editor-outer-image-overlay"><img src="'+event.target.result+'"/></div>')
                        .width(elem_width)
                        .height(elem_height)
                        .draggable({
                            cancel: "text",
                            containment: "parent",
                            start: function (){
                                applyUploadBlockDimensions();
                             },
                            stop: function (){
                                applyUploadBlockDimensions();
                             } 
                         })
                        .resizable({
                            cancel: "text",
                            aspectRatio: true,
                            start: function (){
                                applyUploadBlockDimensions();
                             },
                            stop: function (){
                                applyUploadBlockDimensions();
                             } 
                         })
                        .css({
                                'position' : 'absolute',
                                'border' : '1px solid #525FB0'
                         })
                         .offset(elem_offset)
                         .appendTo('#screenshot-wrapper-bottom-wrap-inner');
                         jQuery(".editor-outer-image-overlay").css({"transform":"scale("+zoomValuePercentRatio+")","transform-origin":"top left"});
                         jQuery("#imgUpload").val("");
                    });
                }
            }
            reader.readAsDataURL(file);
        }
    });

    jQuery(".quix-text").unbind('click');
    jQuery(".quix-text").on("click",function()
    {
        jQuery(".annotation-buttons").show();
        var obj = this;
        isPreviousAnnDone(function()
        {   
            iconMouseClick(obj,".annotate-ul .sideBar-li"); 
            actionSave = "text";
            selectedShape = "";
            resetTextPanel();
            if(jQuery("#annotations-popup-outer") !== undefined)
            {
                showRightSidebar("text");
                setTimeout(function(){
                    jQuery(".text .save-annotation button").unbind('click');
                    jQuery(".text .save-annotation button").on("click",function()
                    {
                        addCoordinatestoLoop('text');
                        saveTextSettings("manual");
                        removeIconActiveState(".annotate-ul .sideBar-li");
                        jQuery(".text .save-annotation button").unbind('click');
                    });
                },100);
            }
            var canOff = jQuery("#captured-screen").offset();
            var scLeft = parseInt(jQuery("#screenshot-wrapper-bottom").scrollLeft());
            var scTop = parseInt(jQuery("#screenshot-wrapper-bottom").scrollTop());
            var elem_offset = {top:100, left:100};
            elem_offset.left = (elem_offset.left*zoomValuePercentRatio)+scLeft;
            elem_offset.top = (elem_offset.top*zoomValuePercentRatio)+scTop;
            var elem_width = 100;
            var elem_height = 50;
            elem_offset.left = (Math.round((elem_offset.left + Number.EPSILON) * 100) / 100);
            elem_offset.top = (Math.round((elem_offset.top + Number.EPSILON) * 100) / 100);

            if(elem_offset.left >= 0){ jQuery("#x-val").val(parseInt(elem_offset.left)); }
            if(elem_offset.top >= 0){ jQuery("#y-val").val(parseInt(elem_offset.top)); }
            if(elem_width >= 0){ jQuery("#width-val").val(parseInt(elem_width)); }
            if(elem_height >= 0){ jQuery("#height-val").val(parseInt(elem_height)); }

            jQuery(".editor-outer-overlay").remove();
            var newElement$ = $('<div class="editor-outer-overlay"><textarea class="editor-outer-overlay-textarea" placeholder="Write text here..."></textarea></div>')
                                        .width(elem_width)
                                        .height(elem_height)
                                        .draggable({
                                            cancel: "text",
                                            containment: "parent",
                                            start: function (){
                                                applyTextBlockDimensions();
                                                $('.editor-outer-overlay-textarea').focus();
                                             },
                                            stop: function (){
                                                applyTextBlockDimensions();
                                                $('.editor-outer-overlay-textarea').focus();
                                             } 
                                         })
                                        .resizable({
                                            cancel: "text",
                                            start: function (){
                                                applyTextBlockDimensions();
                                             },
                                            stop: function (){
                                                applyTextBlockDimensions();
                                             } 
                                         })
                                        .css({
                                                'position'          : 'absolute',
                                                'background-color'  : 'rgba(233, 233, 168, 0.6)',
                                                'border-color'      : 'black',
                                                'border-width'      : '1px',
                                                'border-style'      : 'solid',
                                                'cursor'            : 'move'
                                         })
                                         .offset(elem_offset)
                                         .appendTo('#screenshot-wrapper-bottom-wrap-inner');
            jQuery(".editor-outer-overlay").css({"transform":"scale("+zoomValuePercentRatio+")","transform-origin":"top left"});
            jQuery(".editor-outer-overlay-textarea").unbind('click');
            jQuery(".editor-outer-overlay-textarea").on("click",function(){
                $('.editor-outer-overlay-textarea').focus();
            });
            jQuery(".editor-outer-overlay-textarea").unbind('dblclick');
            jQuery(".editor-outer-overlay-textarea").on("dblclick",function(){
                $('.editor-outer-overlay-textarea').focus();
                $('.editor-outer-overlay-textarea').select();
            });

            jQuery(".editor-outer-overlay-textarea").unbind('mousedown');
            jQuery(".editor-outer-overlay-textarea").on("mousedown",function(){
                jQuery(this).css("cursor","move");
            });
            jQuery(".editor-outer-overlay-textarea").unbind('mouseup');
            jQuery(".editor-outer-overlay-textarea").on("mouseup",function(){
                jQuery(this).css("cursor","text");
            });
            jQuery(".editor-outer-overlay-textarea").unbind('keyup');
            jQuery(".editor-outer-overlay-textarea").on("keyup",function(event)
            {
                if((event.keyCode == 86 && event.ctrlKey) || event.keyCode == 32)
                {
                    adjustTextAreaAutomatically();
                }
                jQuery("#captured-screen").unbind('click');
            });
            jQuery(".text-editor-box span").unbind('click');
            jQuery(".text-editor-box span").on("click",function()
            {
            });
            jQuery("#captured-screen").unbind('click');
            jQuery("#captured-screen").on("click",function(e)
            {
                var winScrolledX = $("html").scrollLeft();
                var winScrolledY = $("html").scrollTop(); 
                var canv = jQuery("#captured-screen").offset();
                var fieldLeft = ((e.clientX) - parseFloat(canv.left-winScrolledX));
                var fieldTop = ((e.clientY) - parseFloat(canv.top-winScrolledY));
                jQuery(".editor-outer-overlay").css({"left":fieldLeft+'px',"top":fieldTop+'px'});
                applyTextBlockDimensions();
            });

            jQuery(".text #x-val").unbind('change');
            jQuery(".text #x-val").on("change",function()
            {
                applyTextDimensions();
            });
            jQuery(".text #y-val").unbind('change');
            jQuery(".text #y-val").on("change",function()
            {
                applyTextDimensions();
            });
            jQuery(".text #width-val").unbind('change');
            jQuery(".text #width-val").on("change",function()
            {
                applyTextDimensions();
            });
            jQuery(".text #height-val").unbind('change');
            jQuery(".text #height-val").on("change",function()
            {
                applyTextDimensions();
            });
            jQuery(".text #font-size").unbind('change');
            jQuery(".text #font-size").on("change",function()
            {
                applyTextDimensions();
                adjustTextAreaAutomatically();
            });
            jQuery(".text #font-family").unbind('change');
            jQuery(".text #font-family").on("change",function()
            {
                applyTextDimensions();
                adjustTextAreaAutomatically();
            });
            jQuery(".text #font-alignment").unbind('change');
            jQuery(".text #font-alignment").on("change",function()
            {
                applyTextDimensions();
                adjustTextAreaAutomatically();
            });
            jQuery(".text #font-style").unbind('change');
            jQuery(".text #font-style").on("change",function()
            {
                applyTextDimensions();
            });
            jQuery(".text #font-outline-fill").unbind('change');
            jQuery(".text #font-outline-fill").on("change",function()
            {
                applyTextDimensions();
            });
            jQuery(".text #font-ouline-size").unbind('change');
            jQuery(".text #font-ouline-size").on("change",function()
            {
                applyTextDimensions();
                adjustTextAreaAutomatically();
            });
            jQuery("input[name=text_alignment]").unbind('change');
            jQuery("input[name=text_alignment]").on("change",function()
            {
                applyTextDimensions();
                adjustTextAreaAutomatically();
            });
            jQuery(".input-radio-custom-style input").unbind('change');
            jQuery(".input-radio-custom-style input").on("change",function()
            {
                applyTextDimensions();
                adjustTextAreaAutomatically();
            });
            jQuery("#text-color-picker").spectrum({
                move: function(tinycolor) 
                { 
                    var color = tinycolor.toRgbString();
                    jQuery(this).css("background-color","#"+color);
                    jQuery("#font-color").val(color);
                    applyTextDimensions();
                },
                show : function (tinycolor) {
                    isChanged = false;
                    previouscolor = tinycolor;
                },
                hide : function (tinycolor) {
                    if (!isChanged && previouscolor) 
                    {
                        var color = tinycolor.toRgbString();
                        jQuery(this).css("background-color","#"+color);
                        jQuery("#font-color").val(color);
                        applyTextDimensions();
                    }
                },
                change : function (tinycolor) {
                    isChanged = true;
                },
                color: '#000000',
                showAlpha: true,
                showButtons: true,
                showInput: true,
                allowEmpty:true,
                preferredFormat: "rgb",
            });
            jQuery("#fill-color-picker").spectrum({
                move: function(tinycolor) 
                { 
                    var color = tinycolor.toRgbString();
                    jQuery(this).css("background-color","#"+color);
                    jQuery("#font-fill").val(color);
                    applyTextDimensions();
                },
                show : function (tinycolor) {
                    isChanged = false;
                    previouscolor = tinycolor;
                },
                hide : function (tinycolor) {
                    if (!isChanged && previouscolor) 
                    {
                        var color = tinycolor.toRgbString();
                        jQuery(this).css("background-color","#"+color);
                        jQuery("#font-fill").val(color);
                        applyTextDimensions();
                    }
                },
                change : function (tinycolor) {
                    isChanged = true;
                },
                color: 'rgba(233, 233, 168, 0.6)',
                showAlpha: true,
                showButtons: true,
                showInput: true,
                allowEmpty:true,
                preferredFormat: "rgb",
            });
            jQuery("#outline-color-picker").spectrum({
                move: function(tinycolor) 
                {
                    var color = tinycolor.toRgbString();
                    jQuery(this).css("background-color","#"+color);
                    jQuery("#font-outline").val(color);
                    applyTextDimensions();
                },
                show : function (tinycolor) {
                    isChanged = false;
                    previouscolor = tinycolor;
                },
                hide : function (tinycolor) {
                    if (!isChanged && previouscolor) 
                    {
                        var color = tinycolor.toRgbString();
                        jQuery(this).css("background-color","#"+color);
                        jQuery("#font-outline").val(color);
                        applyTextDimensions();
                    }
                },
                change : function (tinycolor) {
                    isChanged = true;
                },
                color: '#525FB0',
                showAlpha: true,
                showButtons: true,
                showInput: true,
                allowEmpty:true,
                preferredFormat: "rgb",
            });
        });
    });
}

// To perform hover effect When mouse is over an icon
function iconMouseOver(obj)
{
    if(!jQuery(obj).hasClass("active"))
    {
        var path1 = jQuery(obj).find(".sideBar-li-inner img").attr("data-src-active");
        var path2 = jQuery(obj).find(".sideBar-li-inner img").attr("data-bg-active");
        //jQuery(obj).find(".sideBar-li-inner").css({"border":"1px solid #FFFFFF","box-shadow": "2px 4px 14px rgb(255 255 255 / 20%)"});
    }
}

// To perform effect When mouse is out of an icon
function iconMouseOut(obj)
{
    if(!jQuery(obj).hasClass("active"))
    {
        var path1 = jQuery(obj).find(".sideBar-li-inner img").attr("data-src-inactive");
        var path2 = jQuery(obj).find(".sideBar-li-inner img").attr("data-bg-inactive");
        //jQuery(obj).find(".sideBar-li-inner img").attr("src",path1);
        //jQuery(obj).find(".sideBar-li-inner").css({"border":"1px solid transparent","box-shadow": "unset"});
    }
}

// To perform action When there is a mouse click on an icon
function iconMouseClick(obj,parent)
{
    var allItems = jQuery(parent);
    for (var i = 0; i < allItems.length; i++) 
    {
        var path1 = jQuery(allItems[i]).find(".sideBar-li-inner img").attr("data-src-inactive");
        var path2 = jQuery(allItems[i]).find(".sideBar-li-inner img").attr("data-bg-inactive");
        //jQuery(allItems[i]).find(".sideBar-li-inner").css({"border":"1px solid transparent","box-shadow": "unset"});
        jQuery(allItems[i]).removeClass("active");
    }
    jQuery(obj).addClass("active");
    var path1 = jQuery(obj).find(".sideBar-li-inner img").attr("data-src-active");
    var path2 = jQuery(obj).find(".sideBar-li-inner img").attr("data-bg-active");
    //jQuery(obj).find(".sideBar-li-inner").css({"border":"1px solid #FFFFFF","box-shadow": "2px 4px 14px rgb(255 255 255 / 20%)"});
    jQuery(obj).addClass("active");
}

// To perform toggle effect When mouse is over/goes out of an icon
function iconMouseToggle(obj,parent)
{
    if(jQuery(obj).hasClass("active"))
    {
        var path1 = jQuery(obj).find(".sideBar-li-inner img").attr("data-src-inactive");
        //jQuery(obj).find(".sideBar-li-inner").css({"border":"1px solid transparent","box-shadow": "unset"});
        jQuery(obj).removeClass("active");
    }
    else
    {
        var path1 = jQuery(obj).find(".sideBar-li-inner img").attr("data-src-active");
        //jQuery(obj).find(".sideBar-li-inner").css({"border":"1px solid #FFFFFF","box-shadow": "2px 4px 14px rgb(255 255 255 / 20%)"});
        jQuery(obj).addClass("active");
    }
}

// Update the screnshot's white space(around screenshot) as per drawn annotations
function updateCanvasByAnno(callback)
{
    var source = jQuery("#screenshot-area-left img").attr("src");
    if(source === undefined || source == "")
    {
        var canvas = document.getElementById("captured-screen");
        source = canvas.toDataURL("image/jpeg",1);
    }
    var image = new Image();
    image.onload = function() 
    {
        checkWhereAnnoDrawn(image,function(res){
            var can = document.createElement("canvas");
            var x = y = w = h = 0;
            if(res.topDraw == 0){ y = (whiteSpaceAround); image.height = image.height-(whiteSpaceAround);}
            if(res.bottomDraw == 0){ image.height = image.height-(whiteSpaceAround); }
            if(res.leftDraw == 0){ x = (whiteSpaceAround); image.width = image.width-(whiteSpaceAround);}
            if(res.rightDraw == 0){ image.width = image.width-(whiteSpaceAround);}
            can.height = image.height;
            can.width = image.width;
            let context = can.getContext("2d");
            context.drawImage(image, x, y, image.width, image.height, 0, 0, image.width, image.height);
            var src = can.toDataURL("image/jpeg",1);
            callback(src);
        });
    };
    image.src = source;
}

// To check where annotations are drawn on captured screenshot
function checkWhereAnnoDrawn(image,callback)
{
    var topDraw = 0;
    var bottomDraw = 0;
    var leftDraw = 0;
    var rightDraw = 0;
    for (var i = 0; i < cooridnatesDrawnAt.length; i++) 
    {
        // console.log("***************************");
        var object = cooridnatesDrawnAt[i];
        var x = parseInt(object.x);
        var y = parseInt(object.y);
        var w = parseInt(object.w);
        var h = parseInt(object.h);
        var SShape = object.selectedShape;
        var rightSide = image.width - (whiteSpaceAround);
        var bottomSide = image.height - (whiteSpaceAround);
        // console.log("SShape - ", SShape);
        // console.log("x - ", x);
        // console.log("y - ", y);
        // console.log("w - ", w);
        // console.log("h - ", h);
        // console.log("rightSide - ", rightSide);
        // console.log("bottomSide - ", bottomSide);
        if(SShape == "arrow" || SShape == "line")
        {
            if(w < 0){ x = x+w; w = Math.abs(w);}
            if(h < 0){ y = y+h; h = Math.abs(h);}
        }

        // console.log("x updated - ", x);
        // console.log("y updated - ", y);
        
        if(x < (whiteSpaceAround)){ leftDraw = 1; }
        if(y < (whiteSpaceAround)){ topDraw = 1; }
        if((x+w) > rightSide){ rightDraw = 1; }
        if((y+h) > bottomSide){ bottomDraw = 1; }

        // console.log(topDraw,rightDraw,bottomDraw,leftDraw," ^ ^");
    }
    callback({"bottomDraw":bottomDraw, "topDraw":topDraw, "leftDraw":leftDraw, "rightDraw":rightDraw});
}

// Add coordinates to queue as user draws annnotations 
function addCoordinatestoLoop(type)
{
    var x = jQuery("#x-val").val();
    var y = jQuery("#y-val").val();
    var w = jQuery("#width-val").val();
    var h = jQuery("#height-val").val();
    if(type !== undefined)
    {
        cooridnatesDrawnAt.push({ "selectedShape": "", "x":parseInt(x/zoomValuePercentRatio), "y":parseInt(y/zoomValuePercentRatio), "w":w, "h":h });
    } 
    else
    {
        cooridnatesDrawnAt.push({ "selectedShape": selectedShape, "x":x, "y":y, "w":w, "h":h });
    }
    chrome.runtime.sendMessage({type:"updateCordinates",cooridnatesDrawnAt:cooridnatesDrawnAt});
}

// To perform download opertation as png/jpeg and pdf
function downloadScreenshot(selectedMethod)
{
    isPreviousAnnDone(function()
    {
        removeIconActiveState(".annotate-ul .sideBar-li");
        jQuery("#annotations-popup-outer").hide();
        updateCanvasByAnno(function(source)
        {
            if(selectedMethod != "DOWNLOAD")
            {
                if(selectedMethod == "JPG" || selectedMethod == "PNG")
                {
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
function applyWatermark(source,callback)
{
    var img = document.createElement('img');
    img.src = source;
    img.onload = function() 
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
function getImageFromUrl(url, callback) {
    var img = new Image();
    img.onError = function() {
        alert('Cannot load image: "'+url+'"');
    };
    img.onload = function() {
        callback(img);
    };
    img.src = url;
}

// To create PDF for download operation
function createPDF(imgData) 
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

// Write x,y,w,h dimensions to crop form fields
function cropDimensionsWrite(x,y,w,h)
{
    if(x >= 0){ jQuery("#x-val").val(parseInt(x)); }
    if(y >= 0){ jQuery("#y-val").val(parseInt(y)); }
    if(w >= 0){ jQuery("#width-val").val(parseInt(w)); }
    if(h >= 0){ jQuery("#height-val").val(parseInt(h)); }
}

// apply crop dimesions to canvas object
function applyCropDimensions()
{
    var x = jQuery("#x-val").val();
    var y = jQuery("#y-val").val();
    var w = jQuery("#width-val").val();
    var h = jQuery("#height-val").val();
    rect.startX = parseInt(x);
    rect.startY = parseInt(y);
    rect.w = parseInt(w);
    rect.h = parseInt(h);
    draw("crop");
}

// apply blur dimesions to canvas object
function applyBlurDimensions()
{
    var x = jQuery("#x-val").val();
    var y = jQuery("#y-val").val();
    var w = jQuery("#width-val").val();
    var h = jQuery("#height-val").val();
    rectB.startX = parseInt(x);
    rectB.startY = parseInt(y);
    rectB.w = parseInt(w);
    rectB.h = parseInt(h);
    drawBlur();
}

// apply shape dimesions to canvas object
function applyShapeDimensions()
{
    var x = jQuery("#x-val").val();
    var y = jQuery("#y-val").val();
    var w = jQuery("#width-val").val();
    var h = jQuery("#height-val").val();
    var fontOutline = jQuery("#font-outline").val();
    var fontOutlineSize = jQuery("#font-ouline-size").val();
    shapeOutline = fontOutlineSize;
    rectS.startX = parseInt(x);
    rectS.startY = parseInt(y);
    rectS.w = parseInt(w);
    rectS.h = parseInt(h);
    //drawShape(selectedShape);
}

// apply text dimesions to canvas object
function applyTextDimensions()
{
    var x = jQuery("#x-val").val();
    var y = jQuery("#y-val").val();
    var w = jQuery("#width-val").val();
    var h = jQuery("#height-val").val();
    var fontSize = jQuery("#font-size").val();
    var lineHeight = fontSize;
    var fontFamily = jQuery("#font-family").val();
    var fontColor = jQuery("#font-color").val();
    var fontFill = jQuery("#font-fill").val();
    fontFill = fontFill;
    var fontOutline = jQuery("#font-outline").val();
    var fontOutlineSize = jQuery("#font-ouline-size").val();
    var i = 0;
    var fontStyle = "";
    jQuery('.input-radio-custom-style input').each(function() 
    {   
        i++;
        if(i == 1)
        { 
            if($(this).is(':checked')){ jQuery(".editor-outer-overlay-textarea").css({'font-style': 'Italic'}); }else{ jQuery(".editor-outer-overlay-textarea").css({'font-style': 'unset'}); }
        }
        else if(i == 2)
        {
            if($(this).is(':checked')){ jQuery(".editor-outer-overlay-textarea").css({'font-weight':'bold'}); }else{ jQuery(".editor-outer-overlay-textarea").css({'font-weight':'normal'}); }
        }
        else if(i == 3)
        { 
            if($(this).is(':checked')){ jQuery(".editor-outer-overlay-textarea").css({'text-decoration':'underline'}); }else{ jQuery(".editor-outer-overlay-textarea").css({'text-decoration':'unset'}); }
        }
    });
    var fontAlignment = jQuery("input[name=text_alignment]:checked").val();
    if(fontAlignment == "start"){ fontAlignment = "left";}
    else if(fontAlignment == "end"){ fontAlignment = "right";}
    var fontFillborder = fontOutlineSize+"px solid "+fontOutline;
    fontFillborder = fontFillborder;
    jQuery(".editor-outer-overlay").css({'width':w+'px','height':h+'px','left':x+'px','top':y+'px','background':fontFill,'border':fontFillborder});
    jQuery(".editor-outer-overlay-textarea").css({'font-size':fontSize+'px','line-height':(parseInt(fontSize)+1)+'px','font-family':fontFamily,'text-align':fontAlignment,'color': fontColor});
}

// Write x,y,w,h dimensions to text form fields
function applyTextBlockDimensions()
{
    var w = parseInt(jQuery(".editor-outer-overlay").outerWidth());
    var h = parseInt(jQuery(".editor-outer-overlay").outerHeight());
    var x = parseInt(jQuery(".editor-outer-overlay").css('left'));
    var y = parseInt(jQuery(".editor-outer-overlay").css('top'));
    //x = x/zoomValuePercentRatio;
    //y = y/zoomValuePercentRatio;
    x = (Math.round((x + Number.EPSILON) * 100) / 100);
    y = (Math.round((y + Number.EPSILON) * 100) / 100);
    w = (w) - 12;
    h = (h) - 12;
    if(x >= 0){ jQuery("#x-val").val(parseInt(x)); }
    if(y >= 0){ jQuery("#y-val").val(parseInt(y)); }
    if(w >= 0){ jQuery("#width-val").val(parseInt(w)); }
    if(h >= 0){ jQuery("#height-val").val(parseInt(h)); }
}

// Write x,y,w,h dimensions to image upload form fields
function applyUploadBlockDimensions()
{
    var w = parseInt(jQuery(".editor-outer-image-overlay").outerWidth());
    var h = parseInt(jQuery(".editor-outer-image-overlay").outerHeight());
    var x = parseInt(jQuery(".editor-outer-image-overlay").css('left'));
    var y = parseInt(jQuery(".editor-outer-image-overlay").css('top'));
    //x = x/zoomValuePercentRatio;
    //y = y/zoomValuePercentRatio;
    w = (w) - 2;
    h = (h) - 2;
    x = (Math.round((x + Number.EPSILON) * 100) / 100);
    y = (Math.round((y + Number.EPSILON) * 100) / 100);
    w = (Math.round((w + Number.EPSILON) * 100) / 100);
    h = (Math.round((h + Number.EPSILON) * 100) / 100);
    if(x >= 0){ jQuery("#x-val").val(parseInt(x)); }
    if(y >= 0){ jQuery("#y-val").val(parseInt(y)); }
    if(w >= 0){ jQuery("#width-val").val(parseInt(w)); }
    if(h >= 0){ jQuery("#height-val").val(parseInt(h)); }
}

// remove active state of icons 
function removeIconActiveState(parent)
{
    var allItems = jQuery(parent);
    for (var i = 0; i < allItems.length; i++) 
    {
        var path1 = jQuery(allItems[i]).find(".sideBar-li-inner img").attr("data-src-inactive");
        var path2 = jQuery(allItems[i]).find(".sideBar-li-inner img").attr("data-bg-inactive");
        //jQuery(allItems[i]).find(".sideBar-li-inner img").attr("src",path1);
        //jQuery(allItems[i]).find(".sideBar-li-inner").css({"border":"1px solid transparent","box-shadow": "unset"});
        jQuery(allItems[i]).removeClass("active");
    }
}

// apply image upload dimesions to canvas object
function saveUploadSettings(type)
{
    actionSave = "";
    var upImage = document.querySelector(".editor-outer-image-overlay img");
    jQuery("#captured-screen").unbind('click');
    if(upImage !== undefined && upImage !== null && upImage !== "") 
    {
        var x = parseInt(jQuery("#x-val").val());
        var y = parseInt(jQuery("#y-val").val());
        var w = jQuery("#width-val").val();
        var h = jQuery("#height-val").val();
        x = (x/zoomValuePercentRatio);
        y = (y/zoomValuePercentRatio);
        var canOff = jQuery("#captured-screen").offset();
        var upCanvas = document.getElementById("captured-screen");
        var upCtx = upCanvas.getContext("2d");
        upCtx.drawImage(upImage, x, y, w, h);
        jQuery(".editor-outer-image-overlay").remove();
        var capturedScreen = document.getElementById("captured-screen");
        var imageURI = capturedScreen.toDataURL("image/jpeg",1);
        screensHistory(imageURI);
        if(jQuery("#download-overlay-inner").hasClass("full-screen-view"))
        {
            chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:imageURI});
        }
        jQuery("#imgUpload").val("");
        jQuery("#annotations-popup-outer").hide();
        uploadResetListeners();
    }
}

// adjust dimesions of text box as user types in text into textarea
function adjustTextAreaAutomatically()
{
    var fontSize = jQuery("#font-size").val();
    var textScrollH = jQuery(".editor-outer-overlay-textarea").prop('scrollHeight');
    var w = jQuery(".text #width-val").val();
    var h = jQuery(".text #height-val").val();
    var diffBet = (textScrollH-h);
    if(textScrollH !== undefined && textScrollH > 0 && diffBet > 0)
    {
        var incW = (parseInt(w) + parseInt(textScrollH/3))+"px";
        jQuery(".editor-outer-overlay").css({"width":incW});
        jQuery(".text #width-val").val(parseInt(incW));
        var tScrollH = jQuery(".editor-outer-overlay-textarea").prop('scrollHeight');
        if(tScrollH !== undefined && tScrollH > 0)
        {
            var incH = parseInt(tScrollH+(parseInt(fontSize)))+"px";
            jQuery(".editor-outer-overlay").css({"height":incH});
            jQuery(".text #height-val").val(parseInt(incH));
        }
    }
}

// Apply text settings to the canvas
function saveTextSettings(type)
{
    actionSave = "";
    var text = jQuery(".editor-outer-overlay-textarea").val();
    jQuery("#captured-screen").unbind('click');
    if(text != "")
    {
        var fontSize = jQuery("#font-size").val()+'px';
        var fontFamily = jQuery("#font-family").val();
        applyTextDimensions();
        adjustTextAreaAutomatically();
        var x = parseInt(jQuery("#x-val").val());
        var y = parseInt(jQuery("#y-val").val());
        var w = jQuery("#width-val").val();
        var h = jQuery("#height-val").val();
        x = (x/zoomValuePercentRatio);
        y = (y/zoomValuePercentRatio);
        var canOff = jQuery("#captured-screen").offset();
        var fontStyleUnderline = "";
        var fontStyleWeight = "";
        var fontStyle = "Normal";
        var i = 0;
        jQuery('.input-radio-custom-style input').each(function() 
        {     
            i++;
            if(i == 1)
            { 
                if($(this).is(':checked')){ fontStyle = "Italic"}
            }
            else if(i == 2)
            { 
                if($(this).is(':checked')){ fontStyleWeight = "Bold";}
            }
            else if(i == 3)
            { 
                if($(this).is(':checked')){ fontStyleUnderline = "Underline"; }
            }
        });
        var fontColor = jQuery("#font-color").val();
        var fontAlign = jQuery("input[name=text_alignment]:checked").val();
        if(fontAlign == undefined){ fontAlign = "end";}
        var fontFill = jQuery("#font-fill").val();
        var fontOutline = jQuery("#font-outline").val();
        var fontOulineSize = jQuery("#font-ouline-size").val();
        var textcanvas = document.getElementById("captured-screen");
        var xx = (x+6);
        var yy = (y+18);
        if(fontAlign == "center"){ xx = (xx + (parseInt(w)/2)) - 6; }
        else if(fontAlign == "end"){  xx = (xx + parseInt(w)) - 6; }
        else{ xx = xx; }
        var textctx = textcanvas.getContext("2d");
        jQuery("#annotations-popup-outer").hide();
        jQuery(".editor-outer-overlay").remove();
        textctx.beginPath();
        textctx.lineWidth = fontOulineSize;
        textctx.fillStyle = fontFill;
        textctx.fillRect(x, y, w, h);
        textctx.strokeStyle = fontOutline;
        textctx.strokeRect(x, y, w, h);
        textctx.font = fontStyle+" "+fontStyleWeight+" "+fontSize+" "+fontFamily;
        textctx.fillStyle = fontColor;
        textctx.textAlign = fontAlign;
        fontSize = parseInt(fontSize);
        wrapText(textctx, text, xx, yy, parseInt(w), parseInt(h), parseInt(fontSize),fontColor,fontSize,fontAlign,fontStyleUnderline);
        setTimeout(function()
        {
            var imageURI = textcanvas.toDataURL("image/jpeg",1); 
            textResetListeners();
            loadScreenshotOnCanvas(imageURI,"anno"); 
            screensHistory(imageURI);  
        },500);
    }
    else
    {
        jQuery("#annotations-popup-outer").hide();
        jQuery(".editor-outer-overlay").remove();
    }
}

// Draw underline for text annotation
function textUnderline(context,text,x,y,color,textSize,align,fontStyle)
{
  var textWidth = context.measureText(text).width;
  var startX = 0;
  var underInc = 3;
  if(textSize < 48 && textSize > 22){ underInc = 2; }else if(textSize <= 22){ underInc = 1; }
  var startY = y+((textSize-14)/1.2)+underInc;
  var endX = 0;
  var endY = startY;
  var underlineHeight = parseInt(textSize)/15;
    
  if(underlineHeight < 1){
    underlineHeight = 1;
  }
  
  context.beginPath();
  if(align == "center"){
    startX = x - (textWidth/2);
    endX = x + (textWidth/2);
  }else if(align == "end"){
    startX = x-textWidth;
    endX = x;
  }else{
    startX = x;
    endX = x + textWidth;
  }
  context.strokeStyle = color;
  context.lineWidth = underlineHeight;
  context.moveTo(startX,(startY+1));
  context.lineTo((endX-4),(endY+1));
  context.stroke();
}

// To calculate text in a line, its height for text annotation
function calculateRowWidth(words,testLine,testWidth,totalVisibleH,maxWidth,maxHeight,lineHeight,context,line, x, y,fontStyle,color,textSize,align,n)
{
    if (testWidth > (maxWidth-5)) 
    {
        var word = words[n];
        var metrics = context.measureText(word);
        var wordWidth = metrics.width;
        var shouldRows = wordWidth/maxWidth;
        if(totalVisibleH < (maxHeight - 5))
        {
            if(Math.ceil(shouldRows) > 1)
            {
                var regex = new RegExp(".{1," + (Math.round(word.length/shouldRows)-2) + "}", "g");
                var wordSplit = word.match(regex);
                for (let index = 0; index < Math.ceil(shouldRows); index++) 
                {
                    context.fillText(line, x, y+((textSize-14)/1.2));
                    if(fontStyle == "Underline")
                    {
                        textUnderline(context,line, x, y,color,textSize,align);
                    }
                    if((index+1) == Math.ceil(shouldRows))
                    {
                        line = wordSplit[index] + ' ';
                    }
                    else
                    {
                        line = wordSplit[index] + '-';
                    }
                    y += lineHeight;
                    totalVisibleH += lineHeight;
                }
            }
            else
            {
                context.fillText(line, x, y+((textSize-14)/1.2));
                if(fontStyle == "Underline")
                {
                    textUnderline(context,line, x, y,color,textSize,align);
                }
                line = words[n] + ' ';
                y += lineHeight;
                totalVisibleH += lineHeight;
            }
        }
    }
    else 
    {
        line = testLine;
    }
    return {
        'line' : line,
        'totalVisibleH' : totalVisibleH,
        'y' : y
    }
}

// To wrap text into different lines as per visible in textarea
function wrapText(context, text, x, y, maxWidth, maxHeight, lineHeight,color,textSize,align,fontStyle) 
{
    var lines = text.split(/\r?\n|\r|\n/g);
    var totalVisibleH = 0;
    totalVisibleH = totalVisibleH + lineHeight + lineHeight;
    for(var m = 0; m < lines.length; m++) 
    {
        var words = lines[m].split(' ');
        var line = '';
        for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            var textHeight = metrics.width;
            var res = calculateRowWidth(words,testLine,testWidth,totalVisibleH,maxWidth,maxHeight,lineHeight,context,line, x, y,fontStyle,color,textSize,align,n);
            line = res.line;
            y = res.y;
            totalVisibleH = res.totalVisibleH;
            // if (testWidth > (maxWidth-5) && n > 0) 
            // {
            //     console.log(totalVisibleH,"-totalVisibleH-");
            //     console.log(maxHeight,"-maxHeight-");
            //     var rows = (testWidth/maxWidth)
            //     if(totalVisibleH < (maxHeight - 5))
            //     {
            //         context.fillText(line, x, y+((textSize-14)/1.2));
            //         if(fontStyle == "Underline")
            //         {
            //             textUnderline(context,line, x, y,color,textSize,align);
            //         }
            //         line = words[n] + ' ';
            //         y += lineHeight;
            //         totalVisibleH += lineHeight;
            //     }
            // }
            // else 
            // {
            //     line = testLine;
            // }
        }
        context.fillText(line, x, y+((textSize-14)/1.2));
        if(fontStyle == "Underline")
        {
            textUnderline(context,line, x, y,color,textSize,align);
        }
        y += lineHeight;
        totalVisibleH += lineHeight;
    }
}

// clear all the selected values for text annotation 
function resetTextPanel()
{
    jQuery("#font-size").val("14");
    jQuery("#font-family").val("Arial");
    jQuery("input[name=text_alignment][value=start]").prop('checked', true);
    jQuery("#font-color").val("rgba(0, 0, 0)");
    jQuery("#text-color-picker").css("background-color","rgba(0, 0, 0)");
    jQuery("input[name=font_style]").prop("checked", false);
    jQuery("#font-fill").val("rgba(233, 233, 168, 0.6)");
    jQuery("#fill-color-picker").css("background-color","rgba(233, 233, 168, 0.6)");
    jQuery("#font-outline").val("rgba(0, 0, 0)");
    jQuery("#outline-color-picker").css("background-color","rgba(0, 0, 0)");
    jQuery("#font-ouline-size").val("1");
    resetAlignStyleIcons();
}

// Reset icon state for alignment icons in text annotation
function resetAlignStyleIcons()
{
    var allItems1 = jQuery(".input-radio-custom-align");
    for (var i = 0; i < allItems1.length; i++) 
    {
        if(i == 0)
        {
            var path1 = jQuery(allItems1[i]).find("img").attr("data-src-active");
            var path2 = jQuery(allItems1[i]).find("img").attr("data-bg-active");
            jQuery(allItems1[i]).find("input").prop( "checked", true );
            //jQuery(allItems1[i]).find("img").attr("src",path1);
            //jQuery(allItems1[i]).find("img").css("background-image","url("+path2+")");
            jQuery(allItems1[i]).addClass("active"); 
        }
        else
        {
            var path1 = jQuery(allItems1[i]).find("img").attr("data-src-inactive");
            var path2 = jQuery(allItems1[i]).find("img").attr("data-bg-inactive");
            jQuery(allItems1[i]).find("input").prop( "checked", false );
            //jQuery(allItems1[i]).find("img").attr("src",path1);
            //jQuery(allItems1[i]).find("img").css("background-image","url("+path2+")");
            jQuery(allItems1[i]).removeClass("active");  
        }
    }
    var allItems2 = jQuery(".input-radio-custom-style");
    for (var i = 0; i < allItems2.length; i++) 
    {
        jQuery(allItems2[i]).find("input").prop( "checked", false );
        var path1 = jQuery(allItems2[i]).find("img").attr("data-src-inactive");
        var path2 = jQuery(allItems2[i]).find("img").attr("data-bg-inactive");
        jQuery(allItems2[i]).find("img").attr("src",path1);
        jQuery(allItems2[i]).find("img").css("background-image","url("+path2+")");
        jQuery(allItems2[i]).removeClass("active")  
    }
}

// To check if previous annotation is completed or not and perform action it complete if it is not done
function isPreviousAnnDone(callback)
{
    if(actionSave !== "")
    {
        switch(actionSave) {
        case "text":
            addCoordinatestoLoop('text');
            saveTextSettings("auto");
            setTimeout(function(){ callback(); },500);
        break;
        case "crop":
            if(cropPoints == 1){ cropDrawnImage("auto"); }{ cancelAnnotation(); }
            setTimeout(function(){ callback(); },500);
        break;
        case "blur":
            blurDrawnImage("auto");
            setTimeout(function(){ callback(); },500);
        break;
        case "highlight":
            highlightDrawnImage("auto");
            setTimeout(function(){ callback(); },500);
        break;
        case "shapes":
            ShapeDrawnImage("auto");
            setTimeout(function(){ callback(); },500);
        break;
        case "upload":
            addCoordinatestoLoop('image');
            saveUploadSettings("auto");
            setTimeout(function(){ callback(); },500);
        break;
        default:
        }
    }
    else
    {
        callback();
    }
}

// Share screenshot via email request
function shareViaEmail()
{
    if(jQuery("#download-overlay-inner").hasClass("full-screen-view"))
    {
        shareViaEmailPopup();
    }
    else
    {
        chrome.runtime.sendMessage({type:"googleAuth"});
    }     
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

// Validate email
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

// Share screenshot via email
function shareViaEmailPopup()
{
    if(loaderIcon === "")
    {
        loaderIcon = "/images/light-loader.gif";
    }
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

                let senderName = result.quixyLoginUserData.name;
                senderName = capitalize(senderName);
                let senderEmail = result.quixyLoginUserData.email;
                chrome.storage.local.get('isScreenshotUploadedToServer', function(res)
                {
                    if(!res.isScreenshotUploadedToServer)
                    {
                        uploadScreenshotServer("auto", function(res)
                        {
                            var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"sid":res.insertedId};
                            makeServerRequest("POST","json", APIServer+"/screenshots/send-email",data,function(res)
                            {
                                shareEmailResponseHandler(res);
                            });
                        });
                    }
                    else
                    {
                        var data = {"toname":toName,"emailId":toEmail,"userMessage":emailMessage,"senderName":senderName,"senderEmail":senderEmail,"sid":res.isScreenshotUploadedToServer};
                        makeServerRequest("POST","json", APIServer+"/screenshots/send-email",data,function(res)
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
        jQuery("#email-share-popup-wrapper").remove();
        jQuery("#email-share-popup-wrapper .loader-icon").hide();
        failureMessagePopup("Email Sharing Failed", "Email couldn't be sent.");
    }
}

// Share screenshot as a link
function shareLinkPopup()
{
    if(loaderIcon === "")
    {
        loaderIcon = "/images/light-loader.gif";
    }
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
    updateCanvasByAnno(function(source)
    {
        chrome.storage.local.get('quixyLoginUserData', function(result)
        {
            if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
            {
                jQuery("body").append(html);
                jQuery("#link-share-popup-wrapper .loader-icon").show();
                chrome.storage.local.get('isScreenshotUploadedToServer', function(res)
                {
                    if(!res.isScreenshotUploadedToServer)
                    {
                        uploadScreenshotServer("auto", function(res)
                        {
                            var path = "";
                            if(res.path){ path = res.path; }
                            shareLinkResponseHandler(path);
                        });
                    }
                    else
                    {
                        makeServerRequest("GET","", APIServer+"/screenshots/details?sid="+res.isScreenshotUploadedToServer,"",function(res)
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

// To display success message as a popup
function successMessagePopup(text,description)
{
    if(successIcon === "")
    {
        successIcon = "/images/quix-success.png";
    }
    var padTop = "40px";
    var html = '<div id="success-popup-wrapper">\n\
    <div class="success-popup">\n\
    <div class="success-heading" style="padding-top: '+padTop+';">\n\
    <img src="'+successIcon+'"/>\n\
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

// To display failure message as a popup
function failureMessagePopup(text,description)
{
    if(failureIcon === "")
    {
        failureIcon = "/images/quix-failure.png";
    }
    var padTop = "40px";
    var html = '<div id="failure-popup-wrapper">\n\
    <div class="failure-popup">\n\
    <div class="failure-heading" style="padding-top: '+padTop+';">\n\
    <img src="'+failureIcon+'"/>\n\
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

// To open and submit popup for share feedback feature
function shareFeedbackPopup()
{
    if(loaderIcon === "")
    {
        loaderIcon = "/images/light-loader.gif";
    }
    if(feedbackIcon === "")
    {
        feedbackIcon = "/images/quix-share-feedback-form.png";
    }
    var html = '<div id="feedback-share-popup-wrapper">\n\
    <div class="feedback-share-popup">\n\
    <div class="feedback-share-heading">\n\
    <img src="'+feedbackIcon+'"/>\n\
    <span>Share your feedback with us</span>\n\
    </div>\n\
    <div id="share-feedback-form" class="email-share-form">\n\
        <input type="text" name="to-email-feedback" placeholder="Enter Your Email">\n\
        <textarea id="email-message-feedback" placeholder="Enter Your Feedback" maxlength="900" name="email-message-feedback"></textarea>\n\
        <p class="message-counter"></p>\n\
    </div>\n\
    <div class="feedback-share-submit">\n\
        <img class="loader-icon" src="'+loaderIcon+'" style="display: none;">\n\
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

// To handle share feedback feature response
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

// To cancel an annotation
function cancelAnnotation(reset)
{
    actionSave = "";
    removeIconActiveState(".annotate-ul .sideBar-li");
    var classList = jQuery("#annotations-popup-outer").attr("class");
    if(classList)
    {
        var classArr = classList.split(/\s+/);
        if(classArr.includes('blur'))
        {
            blurResetListeners();
            if(reset === undefined){ loadScreenshotOnCanvas(screenPriorToBlur,"anno"); }
        }
        else if(classArr.includes('highlight'))
        {
            highlightResetListeners();
            if(reset === undefined){ loadScreenshotOnCanvas(screenPriorToHighlight,"anno"); }
        }
        else if(classArr.includes('shapes'))
        {
            shapeResetListeners();
            if(reset === undefined){ loadScreenshotOnCanvas(screenPriorToShape,"anno"); }
        }
        else if(classArr.includes('upload'))
        {
            uploadResetListeners();
            jQuery(".editor-outer-image-overlay").remove();
            if(reset === undefined){ loadScreenshotOnCanvas(screenPriorToUpload,"anno"); }
        }
        else if(classArr.includes('text'))
        {
            textResetListeners();
            jQuery(".editor-outer-overlay").remove();
            resetTextPanel();
        }
        else if(classArr.includes('crop'))
        {
            cropResetListeners();
            removeOverlay('crop');
        } 
        jQuery("#annotations-popup-outer").hide();
    }
}

// To remove all the events for crop annotation
function cropResetListeners()
{
    jQuery(".crop #x-val").val(0);
    jQuery(".crop #y-val").val(0);
    jQuery(".crop #width-val").val(0);
    jQuery(".crop #height-val").val(0);
    jQuery("#captured-screen").unbind('click');

    var canvasCrop = document.getElementById("canvas_background");
    if(canvasCrop)
    {
        canvasCrop.removeEventListener('mousedown', mouseDownCrop);
        canvasCrop.removeEventListener('mouseup', mouseUp);
        canvasCrop.removeEventListener('mousemove', mouseMoveCrop);
        jQuery("#canvas_background").remove();
        canvas_background = null;
        isCanvasBackground = 0;
        jQuery("#close-captureScreen").unbind('click');
        jQuery("#close-captureScreen").remove();
        enableScrolling();
    }
}

// To remove all the events for text annotation
function textResetListeners()
{
    jQuery(".text #x-val").val(0);
    jQuery(".text #y-val").val(0);
    jQuery(".text #width-val").val(0);
    jQuery(".text #height-val").val(0);
    jQuery(".editor-outer-overlay-textarea").unbind('click');
    jQuery(".editor-outer-overlay-textarea").unbind('mousedown');
    jQuery(".editor-outer-overlay-textarea").unbind('mouseup');
    jQuery(".editor-outer-overlay-textarea").unbind('keyup');
    jQuery(".editor-outer-overlay-textarea").unbind('dblclick');
    jQuery("#captured-screen").unbind('click');
    jQuery(".text-editor-box span").unbind('click');
    jQuery(".text #x-val").unbind('change');
    jQuery(".text #y-val").unbind('change');
    jQuery(".text #width-val").unbind('change');
    jQuery(".text #height-val").unbind('change');
    jQuery(".text #font-size").unbind('change');
    jQuery(".text #font-family").unbind('change');
    jQuery(".text #font-alignment").unbind('change');
    jQuery(".text #font-style").unbind('change');
    jQuery(".text #font-outline-fill").unbind('change');
    jQuery(".text #font-ouline-size").unbind('change');
    jQuery("input[name=text_alignment]").unbind('change');
    jQuery("input[name=font_style]").unbind('change');
    jQuery(".text .save-annotation button").unbind('click');
}

// To remove all the events for shape annotation
function shapeResetListeners()
{
    jQuery("#captured-screen").unbind('click');
    jQuery(".shapes #x-val").val(0);
    jQuery(".shapes #y-val").val(0);
    jQuery(".shapes #width-val").val(0);
    jQuery(".shapes #height-val").val(0);
    jQuery(".shapes #font-outline-fill").unbind('change');
    jQuery(".shapes #font-ouline-size").unbind('change');

    var canvas = document.getElementById("captured-screen");
    canvas.removeEventListener('mousedown', mouseDownShape);
    canvas.removeEventListener('mouseup', mouseUpShape);
    canvas.removeEventListener('mousemove', mouseMoveShape);
}

// To remove all the events for blur annotation
function blurResetListeners()
{
    jQuery("#captured-screen").unbind('click');
    jQuery(".blur #x-val").val(0);
    jQuery(".blur #y-val").val(0);
    jQuery(".blur #width-val").val(0);
    jQuery(".blur #height-val").val(0);

    jQuery(".blur .save-annotation button").unbind('click');
    jQuery(".blur #x-val").unbind('change');
    jQuery(".blur #y-val").unbind('change');
    jQuery(".blur #width-val").unbind('change');
    jQuery(".blur #height-val").unbind('change');
    jQuery(".blur #blur-strength").unbind('change');

    var canvas = document.getElementById("captured-screen");
    canvas.removeEventListener('mousedown', mouseDownBlur);
    canvas.removeEventListener('mouseup', mouseUpBlur);
    canvas.removeEventListener('mousemove', mouseMoveBlur);
}

// To remove all the events for highlight annotation
function highlightResetListeners()
{
    jQuery("#captured-screen").unbind('click');
    jQuery(".highlight #x-val").val(0);
    jQuery(".highlight #y-val").val(0);
    jQuery(".highlight #width-val").val(0);
    jQuery(".highlight #height-val").val(0);

    jQuery(".highlight .save-annotation button").unbind('click');
    jQuery(".highlight #x-val").unbind('change');
    jQuery(".highlight #y-val").unbind('change');
    jQuery(".highlight #width-val").unbind('change');
    jQuery(".highlight #height-val").unbind('change');

    var canvas = document.getElementById("captured-screen");
    canvas.removeEventListener('mousedown', mouseDownHighlight);
    canvas.removeEventListener('mouseup', mouseUpHighlight);
    canvas.removeEventListener('mousemove', mouseMoveHighlight);
    canvas.onmousemove = null;
}

// To remove all the events for image annotation
function uploadResetListeners()
{
    jQuery(".upload #x-val").val(0);
    jQuery(".upload #y-val").val(0);
    jQuery(".upload #width-val").val(0);
    jQuery(".upload #height-val").val(0);

    jQuery(".upload .save-annotation button").unbind('click');
    jQuery(".upload #x-val").unbind('change');
    jQuery(".upload #y-val").unbind('change');
    jQuery(".upload #width-val").unbind('change');
    jQuery(".upload #height-val").unbind('change');
}

// To load screenshot on canvas for editing
function loadScreenshotOnCanvas(screenshot,type)
{
    var canvas = document.getElementById("captured-screen");
    if(canvas !== undefined && canvas !== null) 
    {
        var image = new Image();
        image.onload = function() 
        {
            var wid = (image.width*zoomValuePercentRatio);
            var hei = (image.height*zoomValuePercentRatio);
            //jQuery("#screenshot-wrapper-bottom-wrap").css({"width": parseInt(wid+30)+"px"});
            //jQuery("#captured-screen").css({ "width":wid+"px","height":hei+"px" });
            canvas.height = image.height;
            canvas.width = image.width;
            var context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            jQuery(".screenshot-title input").val(screenshotName);
            if(jQuery("#download-overlay-inner").hasClass("full-screen-view"))
            {
                var capturedScreen = canvas.toDataURL("image/jpeg",1);
                chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:capturedScreen});
            }
            if(type === undefined)
            { 
                autoadjustScreenshot(image.width,image.height); 
            }
        };
        image.src = screenshot;
    }
}

// To load screenshot on download screen
function loadScreenshotOnDownloadScreen()
{
    var canvas = document.getElementById("captured-screen");
    var source = canvas.toDataURL("image/jpeg",1);
    jQuery("#screenshot-area-left img").attr("src", source);
    jQuery(".screenshot-title input").val(screenshotName);
    setUiDimensionsDownloadScreen();
    addEventListenersDownloadsScreen();
}

// To add events for download screen
function addEventListenersDownloadsScreen()
{
    jQuery("#download-as-print").unbind('click');
    jQuery("#download-as-print").on("click",function(){
        var imgSrc = "http://i.stack.imgur.com/hCYTd.jpg";
        win = window.open(imgSrc,"_blank");
        win.onload = function() { win.print(); }
    });

    // jQuery("#share-via-email").unbind('click');
    // jQuery("#share-via-email").on("click",function(){
    //     shareViaEmail();
    // });

    jQuery("#share-via-copy img").unbind('click');
    jQuery("#share-via-copy img").on("click",function(){
        copyClipboard();
    });

    // jQuery("#share-via-link").unbind('click');
    // jQuery("#share-via-link").on("click",function(){
    //     shareLinkPopup();
    // });

    jQuery("#share-feedback").unbind('click');
    jQuery("#share-feedback").on("click",function(){
        shareFeedbackPopup();
    });
    
    jQuery(".quix-upload .user-logIn").unbind('click');
    jQuery(".quix-upload .user-logIn").on("click",function(){
        handleGoogleLogin();
    });

    // action to login to screengenius
    jQuery(".quix-upload .user-logIn-social").unbind("click");
    jQuery(".quix-upload .user-logIn-social").on("click",function()
    {
        window.open(
            'https://screengenius.io/login',
            '_blank' // <- This is what makes it open in a new window.
        );
    });

    jQuery(".quix-upload .user-upload").unbind('click');
    jQuery(".quix-upload .user-upload").on("click",function(){
        uploadScreenshotServer("manual");
    });

    jQuery(".quix-upload .user-logOut").unbind('click');
    jQuery(".quix-upload .user-logOut").on("click",function(){
        handleQuixyLogOut();
    });

    jQuery(".screenshot-title input").unbind('keyup');
    jQuery(".screenshot-title input").on("keyup",function(){
        screenshotName = jQuery(this).val();
        screenshotName = screenshotName.replace(/\s/g, '');
        jQuery(this).val(screenshotName);
        var data = { "screenshotName":screenshotName };
        chrome.storage.local.set(data);
    });

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

    jQuery(".quix-signin-close").unbind("click");
    jQuery(".quix-signin-close").on("click",function()
    {
        closeSignInpopup();
    });

    jQuery(".user-dashboard").unbind("click");
    jQuery(".user-dashboard").on("click",function()
    {
        openDashboard();
    });
}

// Display annotations toolbar 
function showRightSidebar(type)
{
    jQuery("#annotations-popup-outer").attr('class', ''); 
    jQuery("#annotations-popup-outer").addClass(type);  
    jQuery("#annotations-popup-outer").show();
}

// To scroll on X and Y axis while doing selection for cropping
function scrollWhileCropping(event,type)
{
    var canv = jQuery("#canvas_background").offset();
    var winScrolledX = $("html").scrollLeft();
    var winScrolledY = $("html").scrollTop();
    var x = (event.clientX - ((canv.left-winScrolledX) + rect.startX)); 
    var y = (event.clientY - ((canv.top-winScrolledY) + rect.startY)); 
    var prevScrolledX = $("#screenshot-wrapper-bottom").scrollLeft();
    var prevScrolledY = $("#screenshot-wrapper-bottom").scrollTop();
    if((prevScrolledX-200 > x))
    {
        var scrollX = x+200;
        var scrollY = y+200;
    }
    else
    {
        var scrollX = x-200;
        var scrollY = y-200;
    }
    if(type == "screenshot")
    {
        if(scrollX > winScrolledX && scrollY > winScrolledY)
        {
            document.getElementsByTagName("body")[0].scrollTo({
                left: scrollX,
                top: scrollY,
                behavior: 'smooth',
            });
        }
    }
    else
    {
        if(scrollX > prevScrolledX && scrollY > prevScrolledY)
        {
            document.getElementById("screenshot-wrapper-bottom").scrollTo({
                left:scrollX,
                top: scrollY,
                behavior: 'smooth',
            });
        }
    }
}

// User can choose to reset to original image after they performed some annotations
function resetOriginalImage()
{
    cooridnatesDrawnAt = [];
    chrome.runtime.sendMessage({type:"updateCordinates",cooridnatesDrawnAt:cooridnatesDrawnAt});
    cancelAnnotation(1);
    loadScreenshotOnCanvas(originalImage);
    screensHistory(originalImage); 
}

// To perform copy to clipboard
async function copyClipboard()
{
    updateCanvasByAnno(function(source)
    {
        var image = document.createElement("img");
        image.src = source;
        image.onload = function()
        {
            var canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, image.width, image.height);
            canvas.toBlob((blob) => {
                navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
                ]);
                successMessagePopup("Copied Successfully", "Your image has been copied to the clipboard successfully.");
            }, "image/png");
        }
    });
}

// Set dimesions on download page after load
function setUiDimensionsDownloadScreen()
{
    var screenW = jQuery("#download-overlay-inner").innerWidth();
    var screenH = jQuery(window).height();
    var topH = jQuery("#screenshot-wrapper-top").outerHeight();
    var bottomH = jQuery("#screenshot-wrapper-bottom-copyright").outerHeight();
    var remainH = screenH-(topH+bottomH);
    jQuery("#screenshot-area-left").css({"width":(screenW-30)+'px','height':(remainH-30)+'px'});
}

// Set dimesions on screenshot edit page after load
function setUiDimensions(type)
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
        loadScreenshotOnCanvas(imageURI);
    }
}

// Remove the screenshot object from local storage
function clearFinalScreenshot()
{
    var data = { "quixyScreenshotFinal" : ""};
    chrome.storage.local.set(data, function() {});
}

// Maintain screenshot history as oer the annotations performed for undo/redo operations
function screensHistory(screen,load)
{
    if(load === undefined)
    { 
        isScreenshotUpdated = true; 
        var data7 = { "isScreenshotUploadedToServer" : false};
        chrome.storage.local.set(data7, function() {});
    }
    screensHistoryStep = 0;
    if(screensHistoryData.length <= 10)
    {
        screensHistoryData.push(screen);
    }
    else
    {
        screensHistoryData.shift();
        screensHistoryData.push(screen);
    }
    if(screensHistoryData.length > 1)
    {
        jQuery(".icon-undo img").removeClass("disabled");
    }
    else
    {
        jQuery(".icon-undo img").addClass("disabled");
        jQuery(".icon-redo img").addClass("disabled");
    }
    updateScreenshot = screen;
}

// Perform undo/redo operations on screenshot
function performUndoRedo(type)
{
    if(type == "undo")
    {
        if(screensHistoryData.length > 0 && (screensHistoryStep+1) < screensHistoryData.length)
        {
            screensHistoryStep = screensHistoryStep+1;
            if(screensHistoryStep < 0){ screensHistoryStep = 0; }
            var index = (screensHistoryData.length-screensHistoryStep)-1;
            var imageURI = screensHistoryData[index];
            loadScreenshotOnCanvas(imageURI,"anno"); 
            updateScreenshot = imageURI;
            jQuery(".icon-redo img").removeClass("disabled");
        }
    }
    else
    {
        if(screensHistoryData.length > 0 && (screensHistoryStep-1) >= 0)
        {
            screensHistoryStep = screensHistoryStep-1;
            if(screensHistoryStep >= screensHistoryData.length){ screensHistoryStep = (screensHistoryData.length-1); }
            var index = (screensHistoryData.length-screensHistoryStep)-1;
            var imageURI = screensHistoryData[index];
            loadScreenshotOnCanvas(imageURI,"anno");
            updateScreenshot = imageURI;
        }

        if(screensHistoryData.length > 0 && (screensHistoryStep) <= 0)
        {
            jQuery(".icon-redo img").addClass("disabled");
        }
    }
    if(screensHistoryStep == (screensHistoryData.length-1))
    {
        jQuery(".icon-undo img").addClass("disabled");
    }
    else if(screensHistoryData.length > 1)
    {
        jQuery(".icon-undo img").removeClass("disabled");
    }
}

// Perform zoom in operation on captured screenshot
function quixyZoomIn(zoom)
{
    if(zoomValueX == 0)
    {
        zoomValueX = parseInt((jQuery("#captured-screen").width()*10)/100);
    }
    if(zoomValueY == 0)
    {
        zoomValueY = parseInt((jQuery("#captured-screen").height()*10)/100);
    }
    if(zoomValuePercent < 200)
    {
        if(zoom === undefined)
        { 
            zoomValuePercent = zoomValuePercent+10; 
            var nW = jQuery("#captured-screen").width()+zoomValueX;
            var nH = jQuery("#captured-screen").height()+zoomValueY;
        } 
        else
        { 
            zoomValuePercent = 100;
            var nW = parseInt(jQuery("#captured-screen").attr("width"));
            var nH = parseInt(jQuery("#captured-screen").attr("height")); 
        }
        zoomValuePercentRatio = zoomValuePercent/100;       
        jQuery(".zoom-quix-status").text(zoomValuePercent+"%");
        //jQuery("#screenshot-wrapper-bottom-wrap").css({"width":(nW+30)+"px"});
        jQuery("#captured-screen").css({ "width":nW+"px","height":nH+"px" });
        if(jQuery(".editor-outer-image-overlay").length > 0)
        {
            jQuery(".editor-outer-image-overlay").css({"transform":"scale("+zoomValuePercentRatio+")","transform-origin":"top left"});
        }
        if(jQuery(".editor-outer-overlay").length > 0)
        {
            jQuery(".editor-outer-overlay").css({"transform":"scale("+zoomValuePercentRatio+")","transform-origin":"top left"});
        }
    }
}

// Perform zoom out operation on captured screenshot
function quixyZoomOut(static)
{
    if(zoomValueX == 0)
    {
        zoomValueX = ((jQuery("#captured-screen").width()*10)/100);
    }
    if(zoomValueY == 0)
    {
        zoomValueY = ((jQuery("#captured-screen").height()*10)/100);
    }
    if(static === undefined){ static = 10; }
    if(zoomValuePercent >= 20)
    {
        var capturedScreen = document.getElementById("captured-screen"); 
        if(static == 0)
        {
            var zVX = parseInt(jQuery("#captured-screen").width()/100);
            var zVY = parseInt(jQuery("#captured-screen").height()/100);
            zoomValuePercent = 100;
            zoomValuePercentRatio = 1;
            jQuery(".zoom-quix-status").text(zoomValuePercent+"%");
            var nW = jQuery("#captured-screen").width()-zVX;
            var nH = jQuery("#captured-screen").height()-zVY;
        }
        else if(static == 10)
        {
            zoomValuePercent = zoomValuePercent-10;
            zoomValuePercentRatio = zoomValuePercent/100;
            jQuery(".zoom-quix-status").text(zoomValuePercent+"%");
            var nW = jQuery("#captured-screen").width()-zoomValueX;
            var nH = jQuery("#captured-screen").height()-zoomValueY;
        }
        else
        {
            var zVX = ((jQuery("#captured-screen").width()*static)/100);
            var zVY = ((jQuery("#captured-screen").height()*static)/100);
            zoomValuePercent = zoomValuePercent-static;
            zoomValuePercentRatio = zoomValuePercent/100;
            jQuery(".zoom-quix-status").text(zoomValuePercent+"%");
            var nW = jQuery("#captured-screen").width()-zVX;
            var nH = jQuery("#captured-screen").height()-zVY;
        }
        //jQuery("#screenshot-wrapper-bottom-wrap").css({"width":(nW+30)+"px"});
        jQuery("#captured-screen").css({ "width":nW+"px","height":nH+"px" });
        if(jQuery(".editor-outer-image-overlay").length > 0)
        {
            jQuery(".editor-outer-image-overlay").css({"transform":"scale("+zoomValuePercentRatio+")","transform-origin":"top left"});
        }
        if(jQuery(".editor-outer-overlay").length > 0)
        {
            jQuery(".editor-outer-overlay").css({"transform":"scale("+zoomValuePercentRatio+")","transform-origin":"top left"});
        }
    }
}

/* logout a user session*/
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

// Handle user login into screengenius dashboard
function handleQuixyLogIn(data,callback)
{
    var email = data.email;
    var name = data.name;
    var pic = data.picture;
    var data = {"email":email,"name":name,"picture":pic};
    makeServerRequest("POST","json", APIServer+"/user/login",data,function(res)
    {
        jQuery("#quix-popup-loader").hide();
        if(callback && callback !== null && callback !== undefined)
        {
            callback(res);
        }
        else
        {
            handleUserSession(res,"login");
        }
    });
}

// Handle google login for screengenius dashboard
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

// Handle user session after successful user login
function handleUserSession(res,type)
{
    if(res.success)
    {
        var data = { "quixyLoginUserData" : res.data};
        chrome.storage.local.set(data, function() {});
        if(type == "login"){ if(screenshotUploadServer){ uploadScreenshotServer("manual"); } }
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

// To upload screenshot to screengenius dashboard
async function uploadScreenshotServer(type="manual",callback)
{
    chrome.storage.local.get('quixyLoginUserData', function(result)
    {
        if(result.quixyLoginUserData !== "" && result.quixyLoginUserData !== null)
        {
            chrome.storage.local.get('isScreenshotUploadedToServer', async function (obj) 
            {
                if(obj.isScreenshotUploadedToServer !== undefined && obj.screenshotUploadServer !== "")
                {
                    var isScreenshotUploadedToServer = obj.isScreenshotUploadedToServer;
                    if(!isScreenshotUploadedToServer)
                    {
                        if(type == "manual"){ jQuery("#quix-popup-loader").show(); }
                        var sessionData = result.quixyLoginUserData;
                        updateCanvasByAnno(function(source)
                        {
                            var imgS = getImageSize(source);
                            dataURItoBlob(source,function(res)
                            {
                                var fd = new FormData();
                                fd.append('name', screenshotName+".jpg");
                                fd.append('user_id', parseInt(sessionData.id));
                                fd.append('file_size', imgS); //formatBytes(imgS)
                                fd.append('screenshot', res);
                                makeServerRequest("POST","form-data", APIServer+"/screenshots/upload",fd,function(res)
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
                                        chrome.storage.local.set(data, function() {});
                                        if(type == "manual")
                                        {
                                            successMessagePopup("Uploaded Successfully", "Screenshot is uploaded Successfully.");
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
                                                failureMessagePopup("Upload Failed", "You have reached max upload limit."); 
                                            }
                                            else
                                            {
                                                jQuery("#email-share-popup-wrapper").remove();
                                                jQuery("#link-share-popup-wrapper").remove();
                                                failureMessagePopup("Upload Failed", "Something Went Wrong."); 
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
                            failureMessagePopup("Upload Failed", "You have already uploaded this file to server."); 
                        }
                    }
                }
            });
        }
        else
        {
            openSignInpopup(); 
        }
    });
}

// To convert data url to base64
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

// Format byte data into KB, MB or GB
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// Get screenshot size as KB, MB or GB
function getImageSize(base64String)
{
    var stringLength = base64String.length - 'data:image/png;base64,'.length;
    var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
    return sizeInBytes;
}

// To make an API request to screengenius server
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

// request to draw shapes annotations on a canvas
function drawShapesEvent(selectedShape)
{
    actionSave = "shapes";
    var canvas = document.getElementById("captured-screen");
    screenPriorToShape = canvas.toDataURL("image/jpeg",1);
    showRightSidebar("shapes");
    jQuery("#font-outline").val(shapeOutlineColor);
    jQuery("#font-ouline-size").val(shapeOutline);
    jQuery("#outline-color-picker").css("background-color",shapeOutlineColor);
    canvasMain = document.getElementById("captured-screen");
    ctxS = canvasMain.getContext('2d');
    imageObjS = new Image();
    imageObjS.onload = function () { ctxS.drawImage(imageObjS, 0, 0); };
    imageObjS.src = canvasMain.toDataURL("image/jpeg",1);
    canvasMain.addEventListener('mousedown', mouseDownShape, false);
    canvasMain.addEventListener('mouseup', mouseUpShape, false);           
    canvasMain.addEventListener('mousemove', mouseMoveShape, false);
    setTimeout(function(){
        jQuery(".shapes .save-annotation button").unbind('click');
        jQuery(".shapes .save-annotation button").on("click",function()
        {
            ShapeDrawnImage("manual");  
            jQuery(".shapes .save-annotation button").unbind('click');
        });
    },100);
    
    jQuery(".shapes #x-val").unbind('change');
    jQuery(".shapes #x-val").on("change",function()
    {
        applyTextDimensions();
    });
    jQuery(".shapes #y-val").unbind('change');
    jQuery(".shapes #y-val").on("change",function()
    {
        applyShapeDimensions();
    });
    jQuery(".shapes #width-val").unbind('change');
    jQuery(".shapes #width-val").on("change",function()
    {
        applyShapeDimensions();
    });
    jQuery(".shapes #height-val").unbind('change');
    jQuery(".shapes #height-val").on("change",function()
    {
        applyShapeDimensions();
    });
    jQuery(".shapes #font-outline-fill").unbind('change');
    jQuery(".shapes #font-outline-fill").on("change",function()
    {
        applyShapeDimensions();
    });
    jQuery(".shapes #font-ouline-size").unbind('change');
    jQuery(".shapes #font-ouline-size").on("change",function()
    {
        applyShapeDimensions();
    });
    jQuery(".shapes #outline-color-picker").spectrum({
        move: function(tinycolor) 
        { 
            var color = tinycolor.toRgbString();
            jQuery("#outline-color-picker").css("background-color","#"+color);
            jQuery("#font-outline").val(color);
            shapeOutlineColor = color;
            applyShapeDimensions();
        },
        show : function (tinycolor) {
            isChanged = false;
            previouscolor = tinycolor;
        },
        hide : function (tinycolor) {
            if (!isChanged && previouscolor) 
            {
                var color = tinycolor.toRgbString();
                jQuery("#outline-color-picker").css("background-color","#"+color);
                jQuery("#font-outline").val(color);
                shapeOutlineColor = color;
                applyShapeDimensions();
            }
        },
        change : function (tinycolor) {
            isChanged = true;
        },
        color: '#525FB0',
        showAlpha: true,
        showButtons: true,
        showInput: true,
        allowEmpty:true,
        preferredFormat: "rgb",
    });
}

// To open sign in popup
function openSignInpopup()
{
    jQuery("#quix-signin-wrapper").show();
}

// To close sign in popup
function closeSignInpopup()
{
    jQuery("#quix-signin-wrapper").hide();
}

// To open dashboard
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

// To create oauth url for google request
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

// To write screenshot name into field
function setScreenshotName()
{
    screenshotName = "IMG_"+(Math.floor(Math.random() * 10000));
    var data = { "screenshotName":screenshotName };
    chrome.storage.local.set(data);
    jQuery(".screenshot-title input").val(screenshotName);
}