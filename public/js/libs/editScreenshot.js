class editScreenshotSG 
{
    constructor() 
    {
        this.clientIDOauth = "83540021534-j3c68n39ht71ojcep42o1qqhvfoh20cs.apps.googleusercontent.com";
        this.actionSave = "";
        // this.GoogleAuth; // Google Auth object.
        // this.XAxis = 15;
        // this.YAxis = 15;
        this.cropPoints = 0;
        this.highlightStartPos = "";
        this.prevHighlightStartPos = "";
        this.highlightLastPoint = "";
        this.selectedShapeAnno = "";
        this.selectedShape = "";
        //this.APIServer = "http://localhost:3000";
        //this.APIServer = "http://82.208.20.76";
        this.APIServer = "https://screengenius.io";
        this.shapeOutline = "3";
        this.shapeOutlineColor = "#525FB0";

        this.isDevicesAvailable = true;
        this.start = {};
        this.end = {};
        this.isSelecting = false;
        this.winH = 0; 
        this.wScrolled = 0;
        this.docHeight = 0;
        // this.baseImgArr = [];
        this.imagesposY = 0;
        this.lastScreenshotH = 0;
        this.fullScreenShotCan = "";
        this.fullScreenShotContext = "";
        this.rect = {};
        this.rectB = {};
        this.rectH = {};
        this.rectS = {};
        this.rectR = {};
        this.ctx = "";
        this.ctxB = "";
        this.ctxH = "";
        this.ctxS = "";
        this.imageObjB = null;
        this.imageObjS = null;
        this.imageObjH = null;
        this.canBGMain = null;
        this.canvasMain = null;
        this.drag = "";
        this.dragRecord = "";
        this.delta = "";
        this.screenPriorToBlur= "";
        this.screenPriorToHighlight = "";
        this.screenPriorToShape = "";
        this.screenPriorToUpload = "";
        this.screensHistoryData = [];
        this.screensHistoryStep = 0;
        var screenShotType = "Visible Part";
        this.originalImage = "";
        this.isChanged = false;
        this.previouscolor = "";
    }
    get_image = async (coords,callback) =>
    {
        let data = coords;
        let proceed = true;
        if(proceed) 
        {
            chrome.runtime.sendMessage({ "message": "wait" }, (response) => { });
            let dataUrl = data[6];
            let img = new Image();
            img.src = dataUrl;
            img.onload = (index,elem) => 
            {
                let resize_canvas = document.createElement("canvas");
                let resize_canvas_width = data[4];
                let resize_canvas_height = data[5];
                resize_canvas.width = resize_canvas_width;
                resize_canvas.height = resize_canvas_height;
                resize_canvas.style.width = resize_canvas_width;
                resize_canvas.style.height = resize_canvas_height;
                let resize_context = resize_canvas.getContext("2d");
                resize_context.drawImage(img, 0, 0, img.width, img.height, 0, 0, resize_canvas_width, resize_canvas_height);
                let resized_img = new Image();
                resized_img.src = resize_canvas.toDataURL("image/jpeg",1);
                resized_img.onload = () => 
                {
                    let canvas = document.createElement('canvas');
                    canvas.setAttribute("id", "visible_screen");
                    canvas.height = data[3];
                    canvas.width = data[2];
                    canvas.style.height = data[3];
                    canvas.style.width = data[2];
                    let context = canvas.getContext("2d");
                    context.drawImage(resized_img, data[0], data[1], data[2], data[3], 0, 0, data[2], data[3]);
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
    get_coords_screenshot = async (dataUri, callback) => 
    {
        this.disableScrolling();
        if(document.getElementById("canvas_background"))
        {
            document.getElementById("canvas_background").remove();
            jQuery("#close-captureScreen").unbind('click');
            jQuery("#close-captureScreen").remove();
        }
        setTimeout(() => 
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
            jQuery("#close-captureScreen").on("click",() => 
            {
                jQuery("#canvas_background").remove();
                canvas_background = null;
                isCanvasBackground = 0;
                jQuery("#close-captureScreen").unbind('click');
                jQuery("#close-captureScreen").remove();
                this.enableScrolling();
            });
            this.ctx = canvas_background.getContext('2d');
            this.ctx.fillStyle = "rgba(0, 0, 0, .7)";
            this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight); //jQuery("body").prop('scrollHeight')
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Select Your Area to Capture Screenshot", canvas_background.width/2, window.innerHeight/2);
            this.drag = false;

            this.init('screenshot');

            this.rect.startX = (parseFloat(this.rect.startX));
            this.rect.startY = (parseFloat(this.rect.startY));
            this.rect.w = (parseFloat(this.rect.w));
            this.rect.h = (parseFloat(this.rect.h));
            document.getElementById("canvas_background").addEventListener("click", () => {
                // this.removeOverlay('screenshot').then(() => {
                //   	get_image([this.rect.startX, this.rect.startY, this.rect.w, this.rect.h, window.innerWidth, window.innerHeight, dataUri],function(imageURI){ callback(imageURI); });
                //     jQuery("#close-captureScreen").unbind('click');
                //     jQuery("#close-captureScreen").remove();
                //     canvas_background = null;
                //     isCanvasBackground = 0;
                // });
                var xxCord = (this.rect.startX+this.rect.w) - 85;
                var yyCord = (this.rect.startY+this.rect.h+window.scrollY) - 40;
                var screenCaptureControls = '<div id="quix-screen-capture-outer" style="left:'+xxCord+'px;top:'+yyCord+'px;"><img id="quix-screen-capture-close" src="'+closeIcon+'"><img id="quix-screen-capture-crop" src="'+cropIcon+'"></div>';
                jQuery("body").append(screenCaptureControls);
                jQuery("#quix-screen-capture-close").unbind('click');
                jQuery("#quix-screen-capture-close").on("click",() => 
                {
                    jQuery("#canvas_background").remove();
                    canvas_background = null;
                    isCanvasBackground = 0;
                    jQuery("#quix-screen-capture-close").unbind('click');
                    jQuery("#quix-screen-capture-outer").remove();
                    jQuery("#close-captureScreen").unbind('click');
                    jQuery("#close-captureScreen").remove();
                    this.enableScrolling();
                });
                jQuery("#quix-screen-capture-crop").unbind('click');
                jQuery("#quix-screen-capture-crop").on("click",() => 
                {
                    this.screenshotCropDrawnImage("screenshot",dataUri,callback);
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
    screenshotCropDrawnImage = (type,dataUri,callback) =>
    {
        // this.actionSave = "";
        // applyCropDimensions();
        // var canvas = document.getElementById("captured-screen");
        // var dataUri = canvas.toDataURL("image/jpeg",1);
        this.removeOverlay('screenshot').then(() => {
            this.get_image([this.rect.startX, this.rect.startY, this.rect.w, this.rect.h, window.innerWidth, window.innerHeight, dataUri],(imageURI) =>
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
    get_coords_crop = async (dataUri) => 
    {
        if(document.getElementById("canvas_background"))
        {
            document.getElementById("canvas_background").remove();
            jQuery("#close-captureScreen").unbind('click');
            jQuery("#close-captureScreen").remove(); 
        }
        setTimeout(() => 
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
            
            this.ctx = canvas_background.getContext('2d');
            this.ctx.fillStyle = "rgba(0, 0, 0, .7)";
            this.ctx.fillRect(0, 0, jQuery("#captured-screen").width(), jQuery("#captured-screen").height());

            this.init('crop');

            this.rect.startX = (parseFloat(this.rect.startX));
            this.rect.startY = (parseFloat(this.rect.startY));
            this.rect.w = (parseFloat(this.rect.w));
            this.rect.h = (parseFloat(this.rect.h));
        },500);
    }
    // To request to draw blur while mouse is moving 
    mouseMoveBlur = async(e) =>
    {
        if (this.drag) 
        {
            this.rectB.w = (((e.pageX) - (this.canBGMain.left + (this.rectB.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
            this.rectB.h = (((e.pageY) - (this.canBGMain.top + (this.rectB.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
            if(this.rectB.w > 0 && this.rectB.h > 0)
            {
                this.drawBlur();
            }
        }
    }

    // To draw blur on the captured screenshot
    drawBlur = () =>
    {
        if(this.rectB.w > 0 && this.rectB.h > 0)
        {
            var blurStrength = jQuery("#blur-strength").val();
            blurStrength = (blurStrength*2)+"px";
            this.ctxB.clearRect(0, 0, 500, 500);
            this.ctxB.filter = 'blur('+blurStrength+')';
            this.ctxB.drawImage(this.imageObjB, 0, 0);
            
            this.ctxB.strokeStyle = 'transparent';
            let imgData = this.ctxB.getImageData(this.rectB.startX, this.rectB.startY, this.rectB.w, this.rectB.h);
            this.ctxB.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
            this.ctxB.filter = 'none';
            this.ctxB.drawImage(this.imageObjB, 0, 0);
            let rw;
            let rh;
            if(this.rectB.w<0){
                rw=this.rectB.startX+this.rectB.w;
            }else{
                rw=this.rectB.startX;
            }
            if(this.rectB.h<0){
                rh=this.rectB.startY+this.rectB.h;
            }else{
                rh=this.rectB.startY;
            }
            this.ctxB.lineWidth = 3;
            this.ctxB.putImageData(imgData,rw, rh); 
            this.ctxB.strokeRect(this.rectB.startX, this.rectB.startY, this.rectB.w, this.rectB.h);
            if(parseInt(this.rectB.startX) >= 0){ jQuery("#x-val").val(parseInt(this.rectB.startX)); }
            if(parseInt(this.rectB.startY) >= 0){ jQuery("#y-val").val(parseInt(this.rectB.startY)); }
            if(parseInt(this.rectB.w) >= 0){ jQuery("#width-val").val(parseInt(this.rectB.w)); }
            if(parseInt(this.rectB.h) >= 0){ jQuery("#height-val").val(parseInt(this.rectB.h)); }
        }
    }

    // To remove overlay and request to crop image for crop capture
    cropDrawnImage = (type) =>
    {
        this.actionSave = "";
        this.applyCropDimensions();
        var canvas = document.getElementById("captured-screen");
        var dataUri = canvas.toDataURL("image/jpeg",1);
        this.removeOverlay('crop').then(() => {
            this.get_image([this.rect.startX, this.rect.startY, this.rect.w, this.rect.h, jQuery("#captured-screen").width(), jQuery("#captured-screen").height(), dataUri],(imageURI) =>
            { 
                jQuery("#annotations-popup-outer").hide(); 
                this.screensHistory(imageURI); 
                this.cropResetListeners();
                this.loadScreenshotOnCanvas(imageURI);
            });
        });
    }

    // To adjust positioning and scale of screenshot on download screen
    autoadjustScreenshot = (wid,hei) => 
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
        this.quixyZoomOut(stati);
    }

    // To draw shpae on captured screenshot
    ShapeDrawnImage = (type) =>
    {
        var capturedScreen = document.getElementById("captured-screen");
        if(type !== "immidiate")
        {
            this.actionSave = "";
            jQuery("#annotations-popup-outer").hide(); 
            capturedScreen.removeEventListener('mousedown', this.mouseDownShape);
            capturedScreen.removeEventListener('mouseup', this.mouseUpShape);
            capturedScreen.removeEventListener('mousemove', this.mouseMoveShape);
            this.shapeResetListeners(); 
        }
        else
        {
            var imageURI = capturedScreen.toDataURL("image/jpeg",1); 
            this.loadScreenshotOnCanvas(imageURI,"anno");
            this.screensHistory(imageURI);
            this.imageObjS.onload = () => { this.ctxS.drawImage(this.imageObjS, 0, 0); };
            this.imageObjS.src = imageURI;
        }
    }

    // To draw blur on captured screenshot
    blurDrawnImage(type)
    {
        var capturedScreen = document.getElementById("captured-screen");
        if(type !== "immidiate")
        {
            this.actionSave = "";
            jQuery("#annotations-popup-outer").hide();
            this.blurResetListeners();
        }
        else
        {
            var imageURI = capturedScreen.toDataURL("image/jpeg",1);
            this.loadScreenshotOnCanvas(imageURI,"anno");
            this.screensHistory(imageURI);
            this.imageObjB.onload = () => { this.ctxB.drawImage(this.imageObjB, 0, 0); };
            this.imageObjB.src = imageURI;
        }
    }

    // To draw highlights on captured screenshot
    highlightDrawnImage = (type) =>
    {
        var capturedScreen = document.getElementById("captured-screen");
        if(type !== "immidiate")
        {
            this.actionSave = "";
            jQuery("#annotations-popup-outer").hide(); 
            this.highlightStartPos = "";
            this.prevHighlightStartPos = "";
            this.highlightResetListeners();
        }
        else
        {
            var imageURI = capturedScreen.toDataURL("image/jpeg",1); 
            this.loadScreenshotOnCanvas(imageURI,"anno");
            this.screensHistory(imageURI);
            this.imageObjH.onload = () => { this.ctxH.drawImage(this.imageObjH, 0, 0); };
            this.imageObjH.src = imageURI;
        }
    }

    // To disable scrolling of webpage prior to capturing the full page screenshot
    disableScrolling = () => {
        var x = window.scrollX;
        var y = window.scrollY;
        window.onscroll = () => { window.scrollTo(x, y); };
    }

    // To enable scrolling of webpage after full page screenshot is captured
    enableScrolling = () => {
        window.onscroll = () => { };
    }

    // To add mouse events on canvas while cropping or capturing selected screen screenshot
    init = (type) =>
    {
        canvas_background = document.getElementById("canvas_background");
        if(type == "screenshot" && canvas_background !== null) 
        {
            canvas_background.addEventListener('mousedown', this.mouseDownScreenshot, false);
            canvas_background.addEventListener('mouseup', this.mouseUp, false);
            canvas_background.addEventListener('mousemove', this.mouseMoveScreenshot, false);
            jQuery("#canvas_background").unbind('mouseout');
            jQuery("#canvas_background").on("mouseout",() => 
            {
                if(this.drag)
                {
                    mouseUp();
                    jQuery("#canvas_background").trigger("click");
                }
            });
        }
        else if(type == "crop" && canvas_background !== null)
        {
            canvas_background.addEventListener('mousedown', this.mouseDownCrop, false);
            canvas_background.addEventListener('mouseup', this.mouseUp, false);
            canvas_background.addEventListener('mousemove', this.mouseMoveCrop, false);
        }
    }

    // Mouse down event on captured selected screen screenshot feature
    mouseDownScreenshot = (e) =>
    {
        canvas_background = document.getElementById("canvas_background");
        this.rect.startX = (((e.clientX)));
        this.rect.startY = (((e.clientY)));
        this.drag = true;
        jQuery("#quix-screen-capture-outer").remove();
    }

    // Mouse down event on crop feature
    mouseDownCrop = (e) =>
    {
        var canBG = jQuery("#canvas_background").offset();
        this.rect.startX = (((e.pageX) - parseFloat(canBG.left)));
        this.rect.startY = (((e.pageY) - parseFloat(canBG.top)));
        this.drag = true;
    }

    // Mouse down event on Blur feature
    mouseDownBlur = (e) =>
    {
        this.canBGMain = jQuery("#captured-screen").offset();
        this.rectB.startX = (((e.pageX) - parseFloat(this.canBGMain.left))/zoomValuePercentRatio);
        this.rectB.startY = (((e.pageY) - parseFloat(this.canBGMain.top))/zoomValuePercentRatio);
        this.drag = true;
    }

    // Mouse down event on Shape feature
    mouseDownShape = (e) =>
    {
        this.canBGMain = jQuery("#captured-screen").offset();
        this.rectS.startX = (((e.pageX) - parseFloat(this.canBGMain.left))/zoomValuePercentRatio);
        this.rectS.startY = (((e.pageY) - parseFloat(this.canBGMain.top))/zoomValuePercentRatio);
        this.drag = true;
    }

    // Mouse down event on Highlight feature
    mouseDownHighlight = (e) =>
    {
        var highlightColor = jQuery("#highlight-bg-input").val();
        this.canBGMain = jQuery("#captured-screen").offset();
        this.rectH.startX = (((e.pageX) - parseFloat(this.canBGMain.left))/zoomValuePercentRatio);
        this.rectH.startY = (((e.pageY) - parseFloat(this.canBGMain.top))/zoomValuePercentRatio);
        var c = document.getElementById("captured-screen");
        this.ctxH = c.getContext("2d");
        this.ctxH.globalCompositeOperation = "multiply";
        this.ctxH.fillStyle = highlightColor;
        this.ctxH.strokeStyle = highlightColor;
        this.ctxH.globalAlpha = "0.01";
        this.ctxH.lineWidth = 0;
        this.highlightLastPoint = { x: e.pageX, y: e.pageY };
        c.onmousemove = this.mouseMoveHighlight;
        this.drag = true;
    }
    // Mouse up event on blur and selected screen capture feature
    mouseUp = () => {
        this.addCoordinatestoLoop();
        this.drag = false;
    }

    // Mouse up event on Blur feature
    mouseUpBlur = () => 
    {
        this.addCoordinatestoLoop();
        this.blurDrawnImage("immidiate")
        this.drag = false;
    }
    // Mouse up event on highlight feature
    mouseUpHighlight = () =>
    {
        this.addCoordinatestoLoop();
        this.highlightDrawnImage("immidiate");
        this.drag = false;
    }
    // Mouse up event on shape feature
    mouseUpShape = () =>
    {
        this.selectedShape = this.selectedShapeAnno;
        this.drawShapesEvent(this.selectedShapeAnno);
        this.addCoordinatestoLoop();
        this.ShapeDrawnImage("immidiate");
        this.drag = false;
    }
    // Mouse move event on highlight feature
    mouseMoveHighlight = (e) =>
    {
        if(this.drag)
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
                this.rectH.w = (((e.pageX) - (this.canBGMain.left + (this.rectH.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
                this.rectH.h = (((e.pageY) - (this.canBGMain.top + (this.rectH.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
                var currentPoint = { x: (e.pageX), y: (e.pageY) };
                var dist = this.distanceBetween(this.highlightLastPoint, currentPoint);
                var angle = this.angleBetween(this.highlightLastPoint, currentPoint);

                for (var i = 0; i < dist; i+=3) 
                {
                    let x = ((this.highlightLastPoint.x + (Math.sin(angle) * i) - highlightH+5) - (this.canBGMain.left))/zoomValuePercentRatio;
                    let y = ((this.highlightLastPoint.y + (Math.cos(angle) * i) - highlightH+5) - (this.canBGMain.top))/zoomValuePercentRatio;
                    this.ctxH.beginPath();
                    this.ctxH.arc(x+(highlightH/2), y+(highlightH/2), highlightH, false, Math.PI * 2, false);
                    this.ctxH.closePath();
                    this.ctxH.fill();
                    this.ctxH.stroke();
                }
                this.highlightLastPoint = currentPoint;
            }
            else
            {
                this.rectH.w = (((e.pageX) - (this.canBGMain.left + (this.rectH.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
                this.rectH.h = (((e.pageY) - (this.canBGMain.top + (this.rectH.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
                var highlightColor = jQuery("#highlight-bg-input").val();
                this.ctxH.strokeStyle = highlightColor;
                this.ctxH.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
                this.ctxH.filter = 'none';
                this.ctxH.drawImage(this.imageObjH, 0, 0);
                this.ctxH.fillRect(this.rectH.startX, this.rectH.startY, this.rectH.w, this.rectH.h);
            }

            if(parseInt(this.rectH.startX) >= 0){ jQuery("#x-val").val(parseInt(this.rectH.startX)); }
            if(parseInt(this.rectH.startY) >= 0){ jQuery("#y-val").val(parseInt(this.rectH.startY)); }
            if(parseInt(this.rectH.w) >= 0){ jQuery("#width-val").val(parseInt(this.rectH.w)); }
            if(parseInt(this.rectH.h) >= 0){ jQuery("#height-val").val(parseInt(this.rectH.h)); }
        }
    }
    // To get distance between two coordinates
    distanceBetween = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    // To get angle between two coordinates
    angleBetween = (point1, point2) => {
    return Math.atan2( point2.x - point1.x, point2.y - point1.y );
    }

    // Mouse move event on selected screen screenshot feature
    mouseMoveScreenshot = (e) =>
    {
        if (this.drag) 
        {
            canvas_background = jQuery("#canvas_background").offset();
            //this.rect.w = (((e.clientX) - canvas_background.left - this.rect.startX));
            //this.rect.h = (((e.clientY) - canvas_background.top - this.rect.startY));
            this.rect.w = (((e.pageX) - canvas_background.left - (this.rect.startX)));
            this.rect.h = (((e.pageY) - canvas_background.top - (this.rect.startY)));
            this.draw("screenshot");
            //this.scrollWhileCropping(e, "screenshot");
        }
    }
    // Mouse move event on crop screenshot feature
    mouseMoveCrop = (e) => {
        if (this.drag) 
        {
            this.cropPoints = 1;
            var canBG = jQuery("#canvas_background").offset();
            this.rect.w = (((e.pageX) - canBG.left - (this.rect.startX)));
            this.rect.h = (((e.pageY) - canBG.top - (this.rect.startY)));
            this.draw("crop");
            this.scrollWhileCropping(e, "crop");
        }
    }

    // To draw selection for crop and selected screen screenshot capture
    draw = (type) =>
    {
        var winWid = window.innerWidth;
        var winHei = window.innerHeight;
        if(type == "crop")
        {
            winWid = jQuery("#captured-screen").width();
            winHei = jQuery("#captured-screen").height();
            this.cropDimensionsWrite(parseInt(this.rect.startX),parseInt(this.rect.startY),this.rect.w,this.rect.h);
        } 
        if ((this.rect.startX < this.rect.startX + this.rect.w) && (this.rect.startY < this.rect.startY + this.rect.h)) 
        {
            this.ctx.fillStyle = "rgba(0, 0, 0, .7)";
            this.ctx.clearRect(0, 0, winWid, winHei);
            this.ctx.strokeStyle = "#525FB0";
            this.ctx.lineWidth = 3;
            this.ctx.fillRect(0, 0, winWid, this.rect.startY);
            this.ctx.fillRect(0, this.rect.startY, this.rect.startX, winHei - this.rect.startY);
            this.ctx.fillRect(this.rect.startX, this.rect.startY + this.rect.h, winWid - this.rect.startX, winHei - this.rect.startY - this.rect.h);
            this.ctx.fillRect(this.rect.startX + this.rect.w, this.rect.startY, winWid - this.rect.startX - this.rect.w, this.rect.h);
            this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
            this.ctx.stroke();
        }
    }

    // To removed overlay after crop or selected screen screenshot is captured
    removeOverlay = async (type) =>
    {
        canvas_background = document.getElementById("canvas_background");
        if(canvas_background !== null)
        {
            this.ctx.clearRect(0, 0, canvas_background.width, canvas_background.height);
            if(type == "screenshot")
            {
                document.body.removeChild(canvas_background);
            }
            else if(type == "crop")
            {
                document.getElementById("screenshot-wrapper-bottom-wrap-inner").removeChild(canvas_background);
            }
        }
        this.enableScrolling();
    }

    // Mouse move event on shape feature
    mouseMoveShape = async(e) =>
    {
        if (this.drag) 
        {
            if(this.selectedShape == "reactangle" || this.selectedShape == "oval")
            {
                this.rectS.w = (((e.pageX) - (this.canBGMain.left + (this.rectS.startX*zoomValuePercentRatio)))/zoomValuePercentRatio); 
                this.rectS.h = (((e.pageY) - (this.canBGMain.top + (this.rectS.startY*zoomValuePercentRatio)))/zoomValuePercentRatio);
            }
            else if(this.selectedShape == "line" || this.selectedShape == "arrow")
            {
                this.rectS.w = (((e.pageX) - this.canBGMain.left)/zoomValuePercentRatio);
                this.rectS.h = (((e.pageY) - this.canBGMain.top)/zoomValuePercentRatio);
            }
            if(this.rectS.w > 0 && this.rectS.h > 0)
            {
                this.drawShape(this.selectedShape);
            }
        }
    }

    // Draw shape on captured screenshot
    drawShape = (type) =>
    {
        var fontOutline = jQuery("#font-outline").val();
        var fontOulineSize = jQuery("#font-ouline-size").val();
        if(this.rectS.w > 0 && this.rectS.h > 0)
        {
            var shapeW = 0;
            var shapeH = 0;
            switch(type) {
                case "reactangle":
                        this.ctxS.beginPath();
                        this.ctxS.fillStyle = "transparent";
                        this.ctxS.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
                        this.ctxS.filter = 'none';
                        this.ctxS.drawImage(this.imageObjS, 0, 0);
                        this.ctxS.strokeStyle = fontOutline;
                        this.ctxS.lineWidth = fontOulineSize;
                        this.ctxS.strokeRect(this.rectS.startX, this.rectS.startY, this.rectS.w, this.rectS.h);
                        this.ctxS.stroke();
                        this.ctxS.beginPath();
                        shapeW = parseInt(this.rectS.w);
                        shapeH = parseInt(this.rectS.h);
                break;
                case "oval":
                        this.ctxS.beginPath();
                        this.ctxS.fillStyle = "transparent";
                        this.ctxS.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
                        this.ctxS.filter = 'none';
                        this.ctxS.drawImage(this.imageObjS, 0, 0);
                        this.ctxS.strokeStyle = fontOutline;
                        this.ctxS.lineWidth = fontOulineSize;
                        this.drawEllipse(ctxS, this.rectS.startX, this.rectS.startY, this.rectS.w, this.rectS.h); 
                        shapeW = parseInt(this.rectS.w);
                        shapeH = parseInt(this.rectS.h);
                break;
                case "line":
                    var headlen = 10;
                    this.ctxS.beginPath();
                    this.ctxS.fillStyle = "transparent";
                    this.ctxS.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
                    this.ctxS.filter = 'none';
                    this.ctxS.drawImage(this.imageObjS, 0, 0);
                    this.ctxS.strokeStyle = fontOutline;
                    this.ctxS.lineWidth = fontOulineSize;
                    this.ctxS.moveTo(this.rectS.startX, this.rectS.startY);
                    this.ctxS.lineTo(this.rectS.w, this.rectS.h);
                    this.ctxS.stroke();  
                    shapeW = parseInt(this.rectS.w-this.rectS.startX);
                    shapeH = parseInt(this.rectS.h-this.rectS.startY);
                break;
                case "arrow":
                    var headlen = 12;
                    var dx = this.rectS.startX - this.rectS.w;
                    var dy = this.rectS.startY - this.rectS.h;
                    var angle = Math.atan2(dy, dx);
                    this.ctxS.beginPath();
                    this.ctxS.fillStyle = "transparent";
                    this.ctxS.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);
                    this.ctxS.filter = 'none';
                    this.ctxS.lineCap = "round";
                    this.ctxS.drawImage(this.imageObjS, 0, 0);
                    this.ctxS.strokeStyle = fontOutline;
                    this.ctxS.lineWidth = fontOulineSize;
                    this.ctxS.moveTo(this.rectS.startX, this.rectS.startY);
                    this.ctxS.lineTo(this.rectS.w, this.rectS.h);
                    this.delta = Math.PI/6  
                    for (var i=0; i<2; i++) 
                    {
                        this.ctxS.moveTo(this.rectS.w, this.rectS.h);
                        let x = this.rectS.w + headlen * Math.cos(angle + this.delta)
                        let y = this.rectS.h + headlen * Math.sin(angle + this.delta)
                        this.ctxS.lineTo(x, y);
                        this.delta *= -1
                    }
                    this.ctxS.stroke();
                    shapeW = parseInt(this.rectS.w-this.rectS.startX);
                    shapeH = parseInt(this.rectS.h-this.rectS.startY);
                break;
            }
            if(parseInt(this.rectS.startX) >= 0){ jQuery("#x-val").val(parseInt(this.rectS.startX)); }
            if(parseInt(this.rectS.startY) >= 0){ jQuery("#y-val").val(parseInt(this.rectS.startY)); }
            if(parseInt(this.rectS.w) >= 0){ jQuery("#width-val").val(parseInt(this.rectS.w-this.rectS.startX)); }
            if(parseInt(this.rectS.h) >= 0){ jQuery("#height-val").val(parseInt(this.rectS.h-this.rectS.startY)); }
        }
    }

    // Draw Ellipse shape on captured screenshot
    drawEllipse = (ctx, x, y, w, h) => 
    {
        var kappa = .5522848,
            ox = (w / 2) * kappa, // control point offset horizontal
            oy = (h / 2) * kappa, // control point offset vertical
            xe = x + w,           // x-end
            ye = y + h,           // y-end
            xm = x + w / 2,       // x-middle
            ym = y + h / 2;       // y-middle

        this.ctxS.beginPath();
        this.ctxS.moveTo(x, ym);
        this.ctxS.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        this.ctxS.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        this.ctxS.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        this.ctxS.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        this.ctxS.stroke();
    }

    // To add events on page load for different elements
    addEventListeners = (type) =>
    {
        

        jQuery("#font-ouline-size").unbind('keyup');
        jQuery("#font-ouline-size").on("keyup",(e) =>
        {
            var outSize = jQuery("#font-ouline-size").val();
            if(outSize > 5)
            {
                jQuery("#font-ouline-size").val(5);
            }
            else if(outSize < 1)
            {
                jQuery("#font-ouline-size").val(1);
            }
        });

        jQuery(document).unbind('keyup');
        jQuery(document).on("keyup",(e) =>
        {

            var evt = window.event || e;   
            if (evt.keyCode == 90 && evt.ctrlKey) 
            {
                this.isPreviousAnnDone(() => 
                {
                    this.removeIconActiveState(".annotate-ul .sideBar-li");
                    jQuery("#annotations-popup-outer").hide();
                    this.performUndoRedo('undo');
                });  
            }
            else if (evt.keyCode == 89 && evt.ctrlKey) 
            { 
                this.isPreviousAnnDone(() => 
                {
                    this.removeIconActiveState(".annotate-ul .sideBar-li");
                    jQuery("#annotations-popup-outer").hide();
                    this.performUndoRedo('redo');
                }); 
            }
            else if (evt.keyCode == 27) 
            {
                jQuery("#canvas_background").remove();
                canvas_background = null;
                isCanvasBackground = 0;
                jQuery("#close-captureScreen").unbind('click');
                jQuery("#close-captureScreen").remove();
                this.enableScrolling();
                jQuery("#annotations-popup-outer").hide();
            } 
            else if(evt.keyCode == 189 && evt.shiftKey) 
            {
                this.quixyZoomOut()
            }
            else if(evt.keyCode == 187 && evt.shiftKey) 
            {
                this.quixyZoomIn()
            }
            else if(evt.keyCode == 48 && evt.shiftKey) 
            {
                this.quixyZoomIn(1);
            }
        });

        // jQuery(".icon-email").unbind('click');
        // jQuery(".icon-email").on("click",() => 
        // {
        //     this.shareViaEmail();
        // });

        

        

        jQuery(".cancel-annotation button").unbind('click');
        jQuery(".cancel-annotation button").on("click",() => 
        {
            this.cancelAnnotation();
        });

        // jQuery(".quix-email").unbind('click');
        // jQuery(".quix-email").on("click",() => 
        // {
        //     this.shareViaEmail();
        // });
        
        // jQuery(".quix-share").unbind('click');
        // jQuery(".quix-share").on("click",() => 
        // {
        //     this.shareLinkPopup();
        // });

        

        jQuery(".quix-crop").unbind('click');
        jQuery(".quix-crop").on("click",() => 
        {
            jQuery(".annotation-buttons").show();
            this.cropPoints = 0;
            var obj = this;
            this.isPreviousAnnDone(() => 
            {
                this.iconMouseClick(obj,".annotate-ul .sideBar-li");
                this.actionSave = "crop";
                this.selectedShape = "";
                if(jQuery("#annotations-popup-outer") !== undefined)
                { 
                    this.showRightSidebar("crop");
                    setTimeout(() => {
                        jQuery(".crop .save-annotation button").unbind('click');
                        jQuery(".crop .save-annotation button").on("click",() => 
                        {
                            this.cropDrawnImage("manual"); 
                            this.removeIconActiveState(".annotate-ul .sideBar-li");
                            jQuery(".crop .save-annotation button").unbind('click');
                        });
                    },100);
                    jQuery(".crop #x-val").unbind('change');
                    jQuery(".crop #x-val").on("change",() => 
                    {
                        this.applyCropDimensions();
                    });
                    jQuery(".crop #y-val").unbind('change');
                    jQuery(".crop #y-val").on("change",() => 
                    {
                        this.applyCropDimensions();
                    });
                    jQuery(".crop #width-val").unbind('change');
                    jQuery(".crop #width-val").on("change",() => 
                    {
                        this.applyCropDimensions();
                    });
                    jQuery(".crop #height-val").unbind('change');
                    jQuery(".crop #height-val").on("change",() => 
                    {
                        this.applyCropDimensions();
                    });
                }
                var canvas = document.getElementById("captured-screen");
                var dataUri = canvas.toDataURL("image/jpeg",1);
                this.get_coords_crop(dataUri);
            });
        });
        jQuery(".quix-blur").unbind('click');
        jQuery(".quix-blur").on("click",() => 
        {
            jQuery(".annotation-buttons").hide();
            var obj = this;
            this.isPreviousAnnDone(() => {
                this.iconMouseClick(obj,".annotate-ul .sideBar-li");
                this.actionSave = "blur";
                this.selectedShape = "";
                var canvas = document.getElementById("captured-screen");
                this.screenPriorToBlur = canvas.toDataURL("image/jpeg",1);
                
                if(jQuery("#annotations-popup-outer") !== undefined)
                { 
                    this.showRightSidebar("blur");
                    setTimeout(() => {
                        jQuery(".blur .save-annotation button").unbind('click');
                        jQuery(".blur .save-annotation button").on("click",() => 
                        {
                            this.blurDrawnImage("manual");
                            this.removeIconActiveState(".annotate-ul .sideBar-li");
                            jQuery(".blur .save-annotation button").unbind('click');
                        });
                    },100);
                    jQuery(".blur #x-val").unbind('change');
                    jQuery(".blur #x-val").on("change",() => 
                    {
                        this.applyBlurDimensions();
                    });
                    jQuery(".blur #y-val").unbind('change');
                    jQuery(".blur #y-val").on("change",() => 
                    {
                        this.applyBlurDimensions();
                    });
                    jQuery(".blur #width-val").unbind('change');
                    jQuery(".blur #width-val").on("change",() => 
                    {
                        this.applyBlurDimensions();
                    });
                    jQuery(".blur #height-val").unbind('change');
                    jQuery(".blur #height-val").on("change",() => 
                    {
                        this.applyBlurDimensions();
                    });
                    jQuery(".blur #blur-strength").unbind('change');
                    jQuery(".blur #blur-strength").on("change",() => 
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
                        this.applyBlurDimensions();
                    });
                }
                this.canvasMain = document.getElementById("captured-screen");
                this.ctxB = this.canvasMain.getContext('2d');
                this.imageObjB = new Image();
                this.imageObjB.onload = () => { this.ctxB.drawImage(this.imageObjB, 0, 0); };
                this.imageObjB.src = this.canvasMain.toDataURL("image/jpeg",1);
                this.canvasMain.addEventListener('mousedown', this.mouseDownBlur, false);
                this.canvasMain.addEventListener('mouseup', this.mouseUpBlur, false);
                this.canvasMain.addEventListener('mousemove', this.mouseMoveBlur, false);
            });
        });

        jQuery(".quix-highlight").unbind('click');
        jQuery(".quix-highlight").on("click",() => 
        {
            jQuery(".annotation-buttons").hide();
            var obj = this;
            this.isPreviousAnnDone(() => {
                this.iconMouseClick(obj,".annotate-ul .sideBar-li");
                this.actionSave = "highlight";
                this.selectedShape = "";
                var canvas = document.getElementById("captured-screen");
                this.screenPriorToHighlight = canvas.toDataURL("image/jpeg",1);
                
                if(jQuery("#annotations-popup-outer") !== undefined)
                { 
                    this.showRightSidebar("highlight");
                    setTimeout(() => {
                        jQuery(".highlight .save-annotation button").unbind('click');
                        jQuery(".highlight .save-annotation button").on("click",() => 
                        {
                            this.highlightDrawnImage("manual");
                            this.removeIconActiveState(".annotate-ul .sideBar-li");
                            jQuery(".highlight .save-annotation button").unbind('click');
                        });
                    },100);
                }
                jQuery(".highlight-pallette span").unbind('click');
                jQuery(".highlight-pallette span").on("click",() => 
                {
                    var color = jQuery(".highlight-pallette span").attr("data-color");
                    jQuery(".highlight-pallette span").css("background-color","#"+color);
                    jQuery("#highlight-bg-color-picker").css("background-color","#"+color);
                    jQuery("#highlight-bg-input").val(color);
                });
                jQuery(".highlight-type select").unbind('change');
                jQuery(".highlight-type select").on("change",() => 
                {
                    var hType = jQuery(".highlight-type select").val();
                    if(hType == "Brush")
                    {
                        jQuery(".highlight-size").show();
                    }
                    else
                    {
                        jQuery(".highlight-size").hide();
                    }
                });
                this.canvasMain = document.getElementById("captured-screen");
                this.ctxH = this.canvasMain.getContext('2d');
                this.imageObjH = new Image();
                this.imageObjH.onload = () => { this.ctxH.drawImage(this.imageObjH, 0, 0); };
                this.imageObjH.src = this.canvasMain.toDataURL("image/jpeg",1);
                this.canvasMain.addEventListener('mousedown', this.mouseDownHighlight, false);
                this.canvasMain.addEventListener('mouseup', this.mouseUpHighlight, false);
                this.canvasMain.addEventListener('mousemove', this.mouseMoveHighlight, false);
            });
        });

        jQuery(".shapes-popup-inner .shape-row").unbind('click');
        jQuery(".shapes-popup-inner .shape-row").on("click",(elem) => 
        {
            jQuery(".annotation-buttons").hide();
            var obj = jQuery(elem.currentTarget).parents(".sideBar-li")[0];
            jQuery(".shapes-popup-outer").hide();
            jQuery(".shape-parent-icon").attr("src",jQuery(elem.currentTarget).find("img").attr("src"));
            if(jQuery(elem.currentTarget).hasClass("shape-reactangle"))
            {
                this.selectedShape = "reactangle";
            }
            else if(jQuery(elem.currentTarget).hasClass("shape-oval"))
            {
                this.selectedShape = "oval";
            }   
            else if(jQuery(elem.currentTarget).hasClass("shape-line"))
            {
                this.selectedShape = "line";
            }
            else if(jQuery(elem.currentTarget).hasClass("shape-arrow"))
            {
                console.log("inn");
                this.selectedShape = "arrow";
            }
            this.selectedShapeAnno = this.selectedShape;
            this.isPreviousAnnDone(() => 
            {   
                this.iconMouseClick(obj,".annotate-ul .sideBar-li");
                if(jQuery("#annotations-popup-outer") !== undefined)
                { 
                    this.drawShapesEvent(this.selectedShape);
                }
            });
        });

        jQuery("#imgUpload").unbind('change');
        jQuery("#imgUpload").on("change",(event) => 
        {
            jQuery(".annotation-buttons").show();
            var obj = jQuery("#imgUpload").parents(".sideBar-li")[0];
            const file = event.target.files[0];
            if (file)
            {
            let reader = new FileReader();
            reader.onload = (event) =>
            {
                var image = new Image();
                image.src = event.target.result;
                image.onload = () =>  
                {
                    var imageAR = this.width/this.height;
                    this.isPreviousAnnDone(() => {   
                        this.iconMouseClick(obj,".annotate-ul .sideBar-li"); 
                        this.actionSave = "upload";
                        this.selectedShape = "";
                        var canvas = document.getElementById("captured-screen");
                        this.screenPriorToUpload = canvas.toDataURL("image/jpeg",1);
                        if(jQuery("#annotations-popup-outer") !== undefined)
                        {
                            this.showRightSidebar("upload");
                            setTimeout(() => {
                                jQuery(".upload .save-annotation button").unbind('click');
                                jQuery(".upload .save-annotation button").on("click",() => 
                                {
                                    this.addCoordinatestoLoop('image');
                                    this.saveUploadSettings("manual"); 
                                    this.removeIconActiveState(".annotate-ul .sideBar-li");
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
                                start: () =>{
                                    this.applyUploadBlockDimensions();
                                },
                                stop: () =>{
                                    this.applyUploadBlockDimensions();
                                } 
                            })
                            .resizable({
                                cancel: "text",
                                aspectRatio: true,
                                start: () =>{
                                    this.applyUploadBlockDimensions();
                                },
                                stop: () =>{
                                    this.applyUploadBlockDimensions();
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
        jQuery(".quix-text").on("click",() => 
        {
            jQuery(".annotation-buttons").show();
            var obj = this;
            this.isPreviousAnnDone(() => 
            {   
                this.iconMouseClick(obj,".annotate-ul .sideBar-li"); 
                this.actionSave = "text";
                this.selectedShape = "";
                this.resetTextPanel();
                if(jQuery("#annotations-popup-outer") !== undefined)
                {
                    this.showRightSidebar("text");
                    setTimeout(() => {
                        jQuery(".text .save-annotation button").unbind('click');
                        jQuery(".text .save-annotation button").on("click",() => 
                        {
                            this.addCoordinatestoLoop('text');
                            this.saveTextSettings("manual");
                            this.removeIconActiveState(".annotate-ul .sideBar-li");
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
                                                start: () => {
                                                    this.applyTextBlockDimensions();
                                                    $('.editor-outer-overlay-textarea').focus();
                                                },
                                                stop: () => {
                                                    this.applyTextBlockDimensions();
                                                    $('.editor-outer-overlay-textarea').focus();
                                                } 
                                            })
                                            .resizable({
                                                cancel: "text",
                                                start: () => {
                                                    this.applyTextBlockDimensions();
                                                },
                                                stop: () => {
                                                    this.applyTextBlockDimensions();
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
                jQuery(".editor-outer-overlay-textarea").on("click",() => {
                    $('.editor-outer-overlay-textarea').focus();
                });
                jQuery(".editor-outer-overlay-textarea").unbind('dblclick');
                jQuery(".editor-outer-overlay-textarea").on("dblclick",() => {
                    $('.editor-outer-overlay-textarea').focus();
                    $('.editor-outer-overlay-textarea').select();
                });

                jQuery(".editor-outer-overlay-textarea").unbind('mousedown');
                jQuery(".editor-outer-overlay-textarea").on("mousedown",() => {
                    jQuery(".editor-outer-overlay-textarea").css("cursor","move");
                });
                jQuery(".editor-outer-overlay-textarea").unbind('mouseup');
                jQuery(".editor-outer-overlay-textarea").on("mouseup",() => {
                    jQuery(".editor-outer-overlay-textarea").css("cursor","text");
                });
                jQuery(".editor-outer-overlay-textarea").unbind('keyup');
                jQuery(".editor-outer-overlay-textarea").on("keyup",(event) =>
                {
                    if((event.keyCode == 86 && event.ctrlKey) || event.keyCode == 32)
                    {
                        this.adjustTextAreaAutomatically();
                    }
                    jQuery("#captured-screen").unbind('click');
                });
                jQuery(".text-editor-box span").unbind('click');
                jQuery(".text-editor-box span").on("click",() => 
                {
                });
                jQuery("#captured-screen").unbind('click');
                jQuery("#captured-screen").on("click",(e) =>
                {
                    var winScrolledX = $("html").scrollLeft();
                    var winScrolledY = $("html").scrollTop(); 
                    var canv = jQuery("#captured-screen").offset();
                    var fieldLeft = ((e.clientX) - parseFloat(canv.left-winScrolledX));
                    var fieldTop = ((e.clientY) - parseFloat(canv.top-winScrolledY));
                    jQuery(".editor-outer-overlay").css({"left":fieldLeft+'px',"top":fieldTop+'px'});
                    this.applyTextBlockDimensions();
                });

                jQuery(".text #x-val").unbind('change');
                jQuery(".text #x-val").on("change",() => 
                {
                    this.applyTextDimensions();
                });
                jQuery(".text #y-val").unbind('change');
                jQuery(".text #y-val").on("change",() => 
                {
                    this.applyTextDimensions();
                });
                jQuery(".text #width-val").unbind('change');
                jQuery(".text #width-val").on("change",() => 
                {
                    this.applyTextDimensions();
                });
                jQuery(".text #height-val").unbind('change');
                jQuery(".text #height-val").on("change",() => 
                {
                    this.applyTextDimensions();
                });
                jQuery(".text #font-size").unbind('change');
                jQuery(".text #font-size").on("change",() => 
                {
                    this.applyTextDimensions();
                    this.adjustTextAreaAutomatically();
                });
                jQuery(".text #font-family").unbind('change');
                jQuery(".text #font-family").on("change",() => 
                {
                    this.applyTextDimensions();
                    this.adjustTextAreaAutomatically();
                });
                jQuery(".text #font-alignment").unbind('change');
                jQuery(".text #font-alignment").on("change",() => 
                {
                    this.applyTextDimensions();
                    this.adjustTextAreaAutomatically();
                });
                jQuery(".text #font-style").unbind('change');
                jQuery(".text #font-style").on("change",() => 
                {
                    this.applyTextDimensions();
                });
                jQuery(".text #font-outline-fill").unbind('change');
                jQuery(".text #font-outline-fill").on("change",() => 
                {
                    this.applyTextDimensions();
                });
                jQuery(".text #font-ouline-size").unbind('change');
                jQuery(".text #font-ouline-size").on("change",() => 
                {
                    this.applyTextDimensions();
                    this.adjustTextAreaAutomatically();
                });
                jQuery("input[name=text_alignment]").unbind('change');
                jQuery("input[name=text_alignment]").on("change",() => 
                {
                    this.applyTextDimensions();
                    this.adjustTextAreaAutomatically();
                });
                jQuery(".input-radio-custom-style input").unbind('change');
                jQuery(".input-radio-custom-style input").on("change",() => 
                {
                    this.applyTextDimensions();
                    this.adjustTextAreaAutomatically();
                });
                jQuery("#text-color-picker").spectrum({
                    move: (tinycolor) => 
                    { 
                        var color = tinycolor.toRgbString();
                        jQuery("#text-color-picker").css("background-color","#"+color);
                        jQuery("#font-color").val(color);
                        this.applyTextDimensions();
                    },
                    show : (tinycolor) => {
                        this.isChanged = false;
                        this.previouscolor = tinycolor;
                    },
                    hide : (tinycolor) => {
                        if (!this.isChanged && this.previouscolor) 
                        {
                            var color = tinycolor.toRgbString();
                            jQuery("#text-color-picker").css("background-color","#"+color);
                            jQuery("#font-color").val(color);
                            this.applyTextDimensions();
                        }
                    },
                    change : (tinycolor) => {
                        this.isChanged= true;
                    },
                    color: '#000000',
                    showAlpha: true,
                    showButtons: true,
                    showInput: true,
                    allowEmpty:true,
                    preferredFormat: "rgb",
                });
                jQuery("#fill-color-picker").spectrum({
                    move: (tinycolor) => 
                    { 
                        var color = tinycolor.toRgbString();
                        jQuery("#fill-color-picker").css("background-color","#"+color);
                        jQuery("#font-fill").val(color);
                        this.applyTextDimensions();
                    },
                    show : (tinycolor) => {
                        this.isChanged = false;
                        this.previouscolor = tinycolor;
                    },
                    hide : (tinycolor) => {
                        if (!this.isChanged && this.previouscolor) 
                        {
                            var color = tinycolor.toRgbString();
                            jQuery("#fill-color-picker").css("background-color","#"+color);
                            jQuery("#font-fill").val(color);
                            this.applyTextDimensions();
                        }
                    },
                    change : (tinycolor) => {
                        this.isChanged= true;
                    },
                    color: 'rgba(233, 233, 168, 0.6)',
                    showAlpha: true,
                    showButtons: true,
                    showInput: true,
                    allowEmpty:true,
                    preferredFormat: "rgb",
                });
                jQuery("#outline-color-picker").spectrum({
                    move: (tinycolor) => 
                    {
                        var color = tinycolor.toRgbString();
                        jQuery("#outline-color-picker").css("background-color","#"+color);
                        jQuery("#font-outline").val(color);
                        this.applyTextDimensions();
                    },
                    show : (tinycolor) => {
                        this.isChanged = false;
                        this.previouscolor = tinycolor;
                    },
                    hide : (tinycolor) => {
                        if (!this.isChanged && this.previouscolor) 
                        {
                            var color = tinycolor.toRgbString();
                            jQuery("#outline-color-picker").css("background-color","#"+color);
                            jQuery("#font-outline").val(color);
                            this.applyTextDimensions();
                        }
                    },
                    change : (tinycolor) => {
                        this.isChanged= true;
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
    iconMouseOver = (obj) =>
    {
        if(!jQuery(obj).hasClass("active"))
        {
            var path1 = jQuery(obj).find(".sideBar-li-inner img").attr("data-src-active");
            var path2 = jQuery(obj).find(".sideBar-li-inner img").attr("data-bg-active");
            //jQuery(obj).find(".sideBar-li-inner").css({"border":"1px solid #FFFFFF","box-shadow": "2px 4px 14px rgb(255 255 255 / 20%)"});
        }
    }

    // To perform effect When mouse is out of an icon
    iconMouseOut = (obj) =>
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
    iconMouseClick = (obj,parent) =>
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
    iconMouseToggle = (obj,parent) =>
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
    updateCanvasByAnno = (callback) =>
    {
        var source = jQuery("#screenshot-area-left img").attr("src");
        if(source === undefined || source == "")
        {
            var canvas = document.getElementById("captured-screen");
            source = canvas.toDataURL("image/jpeg",1);
        }
        var image = new Image();
        image.onload = () =>  
        {
            this.checkWhereAnnoDrawn(image,(res) => {
                var can = document.createElement("canvas");
                var x = 0;
                var y = 0;
                var w = 0;
                var h = 0;
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
    checkWhereAnnoDrawn = (image,callback) =>
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
    addCoordinatestoLoop = (type) =>
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
            cooridnatesDrawnAt.push({ "selectedShape": this.selectedShape, "x":x, "y":y, "w":w, "h":h });
        }
        chrome.runtime.sendMessage({type:"updateCordinates",cooridnatesDrawnAt:cooridnatesDrawnAt});
    }

    // Write x,y,w,h dimensions to crop form fields
    cropDimensionsWrite = (x,y,w,h) =>
    {
        if(x >= 0){ jQuery("#x-val").val(parseInt(x)); }
        if(y >= 0){ jQuery("#y-val").val(parseInt(y)); }
        if(w >= 0){ jQuery("#width-val").val(parseInt(w)); }
        if(h >= 0){ jQuery("#height-val").val(parseInt(h)); }
    }

    // apply crop dimesions to canvas object
    applyCropDimensions = () =>
    {
        var x = jQuery("#x-val").val();
        var y = jQuery("#y-val").val();
        var w = jQuery("#width-val").val();
        var h = jQuery("#height-val").val();
        this.rect.startX = parseInt(x);
        this.rect.startY = parseInt(y);
        this.rect.w = parseInt(w);
        this.rect.h = parseInt(h);
        this.draw("crop");
    }

    // apply blur dimesions to canvas object
    applyBlurDimensions = () =>
    {
        var x = jQuery("#x-val").val();
        var y = jQuery("#y-val").val();
        var w = jQuery("#width-val").val();
        var h = jQuery("#height-val").val();
        this.rectB.startX = parseInt(x);
        this.rectB.startY = parseInt(y);
        this.rectB.w = parseInt(w);
        this.rectB.h = parseInt(h);
        this.drawBlur();
    }

    // apply shape dimesions to canvas object
    applyShapeDimensions = () =>
    {
        var x = jQuery("#x-val").val();
        var y = jQuery("#y-val").val();
        var w = jQuery("#width-val").val();
        var h = jQuery("#height-val").val();
        var fontOutline = jQuery("#font-outline").val();
        var fontOutlineSize = jQuery("#font-ouline-size").val();
        this.shapeOutline = fontOutlineSize;
        this.rectS.startX = parseInt(x);
        this.rectS.startY = parseInt(y);
        this.rectS.w = parseInt(w);
        this.rectS.h = parseInt(h);
        //this.drawShape(this.selectedShape);
    }

    // apply text dimesions to canvas object
    applyTextDimensions = () =>
    {
        console.log("--applyTextDimensions--")
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
        jQuery('.input-radio-custom-style input').each((index,elem) =>  
        {   
            i++;
            if(i == 1)
            { 
                if($(elem).is(':checked')){ jQuery(".editor-outer-overlay-textarea").css({'font-style': 'Italic'}); }else{ jQuery(".editor-outer-overlay-textarea").css({'font-style': 'unset'}); }
            }
            else if(i == 2)
            {
                if($(elem).is(':checked')){ jQuery(".editor-outer-overlay-textarea").css({'font-weight':'bold'}); }else{ jQuery(".editor-outer-overlay-textarea").css({'font-weight':'normal'}); }
            }
            else if(i == 3)
            { 
                if($(elem).is(':checked')){ jQuery(".editor-outer-overlay-textarea").css({'text-decoration':'underline'}); }else{ jQuery(".editor-outer-overlay-textarea").css({'text-decoration':'unset'}); }
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
    applyTextBlockDimensions = () =>
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
    applyUploadBlockDimensions = () =>
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
    removeIconActiveState = (parent) =>
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
    saveUploadSettings = (type) =>
    {
        this.actionSave = "";
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
            this.screensHistory(imageURI);
            if(jQuery("#download-overlay-inner").hasClass("full-screen-view"))
            {
                chrome.runtime.sendMessage({type:"quixyFinalScreenshot",screen:imageURI});
            }
            jQuery("#imgUpload").val("");
            jQuery("#annotations-popup-outer").hide();
            this.uploadResetListeners();
        }
    }

    // adjust dimesions of text box as user types in text into textarea
    adjustTextAreaAutomatically = () =>
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
    saveTextSettings = (type) =>
    {
        this.actionSave = "";
        var text = jQuery(".editor-outer-overlay-textarea").val();
        jQuery("#captured-screen").unbind('click');
        if(text != "")
        {
            var fontSize = jQuery("#font-size").val()+'px';
            var fontFamily = jQuery("#font-family").val();
            this.applyTextDimensions();
            this.adjustTextAreaAutomatically();
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
            jQuery('.input-radio-custom-style input').each((index,elem) =>  
            {     
                i++;
                if(i == 1)
                { 
                    if($(elem).is(':checked')){ fontStyle = "Italic"}
                }
                else if(i == 2)
                { 
                    if($(elem).is(':checked')){ fontStyleWeight = "Bold";}
                }
                else if(i == 3)
                { 
                    if($(elem).is(':checked')){ fontStyleUnderline = "Underline"; }
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
            let textctx = textcanvas.getContext("2d");
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
            this.wrapText(textctx, text, xx, yy, parseInt(w), parseInt(h), parseInt(fontSize),fontColor,fontSize,fontAlign,fontStyleUnderline);
            setTimeout(() => 
            {
                var imageURI = textcanvas.toDataURL("image/jpeg",1); 
                this.textResetListeners();
                this.loadScreenshotOnCanvas(imageURI,"anno"); 
                this.screensHistory(imageURI);  
            },500);
        }
        else
        {
            jQuery("#annotations-popup-outer").hide();
            jQuery(".editor-outer-overlay").remove();
        }
    }

    // Draw underline for text annotation
    textUnderline = (context,text,x,y,color,textSize,align,fontStyle) =>
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
    calculateRowWidth = (words,testLine,testWidth,totalVisibleH,maxWidth,maxHeight,lineHeight,context,line, x, y,fontStyle,color,textSize,align,n) =>
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
                            this.textUnderline(context,line, x, y,color,textSize,align);
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
                        this.textUnderline(context,line, x, y,color,textSize,align);
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
    wrapText = (context, text, x, y, maxWidth, maxHeight, lineHeight,color,textSize,align,fontStyle) => 
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
                var res = this.calculateRowWidth(words,testLine,testWidth,totalVisibleH,maxWidth,maxHeight,lineHeight,context,line, x, y,fontStyle,color,textSize,align,n);
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
                //             this.textUnderline(context,line, x, y,color,textSize,align);
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
                this.textUnderline(context,line, x, y,color,textSize,align);
            }
            y += lineHeight;
            totalVisibleH += lineHeight;
        }
    }

    // clear all the selected values for text annotation 
    resetTextPanel = () =>
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
        this.resetAlignStyleIcons();
    }

    // Reset icon state for alignment icons in text annotation
    resetAlignStyleIcons = () =>
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
    isPreviousAnnDone = (callback) =>
    {
        if(this.actionSave !== "")
        {
            switch(this.actionSave) {
            case "text":
                this.addCoordinatestoLoop('text');
                this.saveTextSettings("auto");
                setTimeout(() => { callback(); },500);
            break;
            case "crop":
                if(this.cropPoints == 1){ this.cropDrawnImage("auto"); }{ this.cancelAnnotation(); }
                setTimeout(() => { callback(); },500);
            break;
            case "blur":
                this.blurDrawnImage("auto");
                setTimeout(() => { callback(); },500);
            break;
            case "highlight":
                this.highlightDrawnImage("auto");
                setTimeout(() => { callback(); },500);
            break;
            case "shapes":
                this.ShapeDrawnImage("auto");
                setTimeout(() => { callback(); },500);
            break;
            case "upload":
                this.addCoordinatestoLoop('image');
                this.saveUploadSettings("auto");
                setTimeout(() => { callback(); },500);
            break;
            default:
            }
        }
        else
        {
            callback();
        }
    }

    // To cancel an annotation
    cancelAnnotation = (reset) =>
    {
        this.actionSave = "";
        this.removeIconActiveState(".annotate-ul .sideBar-li");
        var classList = jQuery("#annotations-popup-outer").attr("class");
        if(classList)
        {
            var classArr = classList.split(/\s+/);
            if(classArr.includes('blur'))
            {
                this.blurResetListeners();
                if(reset === undefined){ this.loadScreenshotOnCanvas(this.screenPriorToBlur,"anno"); }
            }
            else if(classArr.includes('highlight'))
            {
                this.highlightResetListeners();
                if(reset === undefined){ this.loadScreenshotOnCanvas(this.screenPriorToHighlight,"anno"); }
            }
            else if(classArr.includes('shapes'))
            {
                this.shapeResetListeners();
                if(reset === undefined){ this.loadScreenshotOnCanvas(this.screenPriorToShape,"anno"); }
            }
            else if(classArr.includes('upload'))
            {
                this.uploadResetListeners();
                jQuery(".editor-outer-image-overlay").remove();
                if(reset === undefined){ this.loadScreenshotOnCanvas(this.screenPriorToUpload,"anno"); }
            }
            else if(classArr.includes('text'))
            {
                this.textResetListeners();
                jQuery(".editor-outer-overlay").remove();
                this.resetTextPanel();
            }
            else if(classArr.includes('crop'))
            {
                this.cropResetListeners();
                this.removeOverlay('crop');
            } 
            jQuery("#annotations-popup-outer").hide();
        }
    }

    // To remove all the events for crop annotation
    cropResetListeners = () =>
    {
        jQuery(".crop #x-val").val(0);
        jQuery(".crop #y-val").val(0);
        jQuery(".crop #width-val").val(0);
        jQuery(".crop #height-val").val(0);
        jQuery("#captured-screen").unbind('click');

        var canvasCrop = document.getElementById("canvas_background");
        if(canvasCrop)
        {
            canvasCrop.removeEventListener('mousedown', this.mouseDownCrop);
            canvasCrop.removeEventListener('mouseup', this.mouseUp);
            canvasCrop.removeEventListener('mousemove', this.mouseMoveCrop);
            jQuery("#canvas_background").remove();
            canvas_background = null;
            isCanvasBackground = 0;
            jQuery("#close-captureScreen").unbind('click');
            jQuery("#close-captureScreen").remove();
            this.enableScrolling();
        }
    }

    // To remove all the events for text annotation
    textResetListeners = () =>
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
    shapeResetListeners = () =>
    {
        jQuery("#captured-screen").unbind('click');
        jQuery(".shapes #x-val").val(0);
        jQuery(".shapes #y-val").val(0);
        jQuery(".shapes #width-val").val(0);
        jQuery(".shapes #height-val").val(0);
        jQuery(".shapes #font-outline-fill").unbind('change');
        jQuery(".shapes #font-ouline-size").unbind('change');

        var canvas = document.getElementById("captured-screen");
        canvas.removeEventListener('mousedown', this.mouseDownShape);
        canvas.removeEventListener('mouseup', this.mouseUpShape);
        canvas.removeEventListener('mousemove', this.mouseMoveShape);
    }

    // To remove all the events for blur annotation
    blurResetListeners = () =>
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
        canvas.removeEventListener('mousedown', this.mouseDownBlur);
        canvas.removeEventListener('mouseup', this.mouseUpBlur);
        canvas.removeEventListener('mousemove', this.mouseMoveBlur);
    }

    // To remove all the events for highlight annotation
    highlightResetListeners = () =>
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
        canvas.removeEventListener('mousedown', this.mouseDownHighlight);
        canvas.removeEventListener('mouseup', this.mouseUpHighlight);
        canvas.removeEventListener('mousemove', this.mouseMoveHighlight);
        canvas.onmousemove = null;
    }

    // To remove all the events for image annotation
    uploadResetListeners = () =>
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
    loadScreenshotOnCanvas = (screenshot,type) =>
    {
        var canvas = document.getElementById("captured-screen");
        if(canvas !== undefined && canvas !== null) 
        {
            var image = new Image();
            image.onload = () =>  
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
                    this.autoadjustScreenshot(image.width,image.height); 
                }
            };
            image.src = screenshot;
        }
    }

    // Perform undo/redo operations on screenshot
    performUndoRedo = (type) =>
    {
        if(type == "undo")
        {
            if(this.screensHistoryData.length > 0 && (this.screensHistoryStep+1) < this.screensHistoryData.length)
            {
                this.screensHistoryStep = this.screensHistoryStep+1;
                if(this.screensHistoryStep < 0){ this.screensHistoryStep = 0; }
                var index = (this.screensHistoryData.length-this.screensHistoryStep)-1;
                var imageURI = this.screensHistoryData[index];
                this.loadScreenshotOnCanvas(imageURI,"anno"); 
                updateScreenshot = imageURI;
                jQuery(".icon-redo img").removeClass("disabled");
            }
        }
        else
        {
            if(this.screensHistoryData.length > 0 && (this.screensHistoryStep-1) >= 0)
            {
                this.screensHistoryStep = this.screensHistoryStep-1;
                if(this.screensHistoryStep >= this.screensHistoryData.length){ this.screensHistoryStep = (this.screensHistoryData.length-1); }
                var index = (this.screensHistoryData.length-this.screensHistoryStep)-1;
                var imageURI = this.screensHistoryData[index];
                this.loadScreenshotOnCanvas(imageURI,"anno");
                updateScreenshot = imageURI;
            }

            if(this.screensHistoryData.length > 0 && (this.screensHistoryStep) <= 0)
            {
                jQuery(".icon-redo img").addClass("disabled");
            }
        }
        if(this.screensHistoryStep == (this.screensHistoryData.length-1))
        {
            jQuery(".icon-undo img").addClass("disabled");
        }
        else if(this.screensHistoryData.length > 1)
        {
            jQuery(".icon-undo img").removeClass("disabled");
        }
    }

    // Perform zoom in operation on captured screenshot
    quixyZoomIn = (zoom) =>
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
    quixyZoomOut = (xx) =>
    {
        if(zoomValueX == 0)
        {
            zoomValueX = ((jQuery("#captured-screen").width()*10)/100);
        }
        if(zoomValueY == 0)
        {
            zoomValueY = ((jQuery("#captured-screen").height()*10)/100);
        }
        if(xx === undefined){ xx = 10; }
        if(zoomValuePercent >= 20)
        {
            var capturedScreen = document.getElementById("captured-screen"); 
            if(xx == 0)
            {
                var zVX = parseInt(jQuery("#captured-screen").width()/100);
                var zVY = parseInt(jQuery("#captured-screen").height()/100);
                zoomValuePercent = 100;
                zoomValuePercentRatio = 1;
                jQuery(".zoom-quix-status").text(zoomValuePercent+"%");
                var nW = jQuery("#captured-screen").width()-zVX;
                var nH = jQuery("#captured-screen").height()-zVY;
            }
            else if(xx == 10)
            {
                zoomValuePercent = zoomValuePercent-10;
                zoomValuePercentRatio = zoomValuePercent/100;
                jQuery(".zoom-quix-status").text(zoomValuePercent+"%");
                var nW = jQuery("#captured-screen").width()-zoomValueX;
                var nH = jQuery("#captured-screen").height()-zoomValueY;
            }
            else
            {
                var zVX = ((jQuery("#captured-screen").width()*xx)/100);
                var zVY = ((jQuery("#captured-screen").height()*xx)/100);
                zoomValuePercent = zoomValuePercent-xx;
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

    // Maintain screenshot history as oer the annotations performed for undo/redo operations
    screensHistory = (screen,load) =>
    {
        if(load === undefined)
        { 
            isScreenshotUpdated = true; 
            var data7 = { "isScreenshotUploadedToServer" : false};
            chrome.storage.local.set(data7, () =>  {});
        }
        this.screensHistoryStep = 0;
        if(this.screensHistoryData.length <= 10)
        {
            this.screensHistoryData.push(screen);
        }
        else
        {
            this.screensHistoryData.shift();
            this.screensHistoryData.push(screen);
        }
        if(this.screensHistoryData.length > 1)
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

    // request to draw shapes annotations on a canvas
    drawShapesEvent = (selectedShape) =>
    {
        this.actionSave = "shapes";
        var canvas = document.getElementById("captured-screen");
        this.screenPriorToShape = canvas.toDataURL("image/jpeg",1);
        this.showRightSidebar("shapes");
        jQuery("#font-outline").val(this.shapeOutlineColor);
        jQuery("#font-ouline-size").val(this.shapeOutline);
        jQuery("#outline-color-picker").css("background-color",this.shapeOutlineColor);
        this.canvasMain = document.getElementById("captured-screen");
        this.ctxS = this.canvasMain.getContext('2d');
        this.imageObjS = new Image();
        this.imageObjS.onload = () => { this.ctxS.drawImage(this.imageObjS, 0, 0); };
        this.imageObjS.src = this.canvasMain.toDataURL("image/jpeg",1);
        this.canvasMain.addEventListener('mousedown', this.mouseDownShape, false);
        this.canvasMain.addEventListener('mouseup', this.mouseUpShape, false);           
        this.canvasMain.addEventListener('mousemove', this.mouseMoveShape, false);
        setTimeout(() => {
            jQuery(".shapes .save-annotation button").unbind('click');
            jQuery(".shapes .save-annotation button").on("click",() => 
            {
                this.ShapeDrawnImage("manual");  
                jQuery(".shapes .save-annotation button").unbind('click');
            });
        },100);
        
        jQuery(".shapes #x-val").unbind('change');
        jQuery(".shapes #x-val").on("change",() => 
        {
            this.applyTextDimensions();
        });
        jQuery(".shapes #y-val").unbind('change');
        jQuery(".shapes #y-val").on("change",() => 
        {
            this.applyShapeDimensions();
        });
        jQuery(".shapes #width-val").unbind('change');
        jQuery(".shapes #width-val").on("change",() => 
        {
            this.applyShapeDimensions();
        });
        jQuery(".shapes #height-val").unbind('change');
        jQuery(".shapes #height-val").on("change",() => 
        {
            this.applyShapeDimensions();
        });
        jQuery(".shapes #font-outline-fill").unbind('change');
        jQuery(".shapes #font-outline-fill").on("change",() => 
        {
            this.applyShapeDimensions();
        });
        jQuery(".shapes #font-ouline-size").unbind('change');
        jQuery(".shapes #font-ouline-size").on("change",() => 
        {
            this.applyShapeDimensions();
        });
        jQuery(".shapes #outline-color-picker").spectrum({
            move: (tinycolor) => 
            { 
                var color = tinycolor.toRgbString();
                jQuery("#outline-color-picker").css("background-color","#"+color);
                jQuery("#font-outline").val(color);
                this.shapeOutlineColor = color;
                this.applyShapeDimensions();
            },
            show : (tinycolor) => {
                this.isChanged = false;
                this.previouscolor = tinycolor;
            },
            hide : (tinycolor) => {
                if (!this.isChanged && this.previouscolor) 
                {
                    var color = tinycolor.toRgbString();
                    jQuery("#outline-color-picker").css("background-color","#"+color);
                    jQuery("#font-outline").val(color);
                    this.shapeOutlineColor = color;
                    this.applyShapeDimensions();
                }
            },
            change : (tinycolor) => {
                this.isChanged= true;
            },
            color: '#525FB0',
            showAlpha: true,
            showButtons: true,
            showInput: true,
            allowEmpty:true,
            preferredFormat: "rgb",
        });
    }
    // Display annotations toolbar 
    showRightSidebar = (type) =>
    {
        jQuery("#annotations-popup-outer").attr('class', ''); 
        jQuery("#annotations-popup-outer").addClass(type);  
        jQuery("#annotations-popup-outer").show();
    }

    // User can choose to reset to original image after they performed some annotations
    resetOriginalImage = () =>
    {
        cooridnatesDrawnAt = [];
        chrome.runtime.sendMessage({type:"updateCordinates",cooridnatesDrawnAt:cooridnatesDrawnAt});
        editScreenshot.cancelAnnotation(1);
        editScreenshot.loadScreenshotOnCanvas(originalImage);
        editScreenshot.screensHistory(originalImage); 
    }

    // To scroll on X and Y axis while doing selection for cropping
    scrollWhileCropping = (event,type) =>
    {
        var canv = jQuery("#canvas_background").offset();
        var winScrolledX = $("html").scrollLeft();
        var winScrolledY = $("html").scrollTop();
        var x = (event.clientX - ((canv.left-winScrolledX) + editScreenshot.rect.startX)); 
        var y = (event.clientY - ((canv.top-winScrolledY) + editScreenshot.rect.startY)); 
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

    // To perform copy to clipboard
    copyClipboard = async () =>
    {
        this.updateCanvasByAnno((source) =>
        {
            var image = document.createElement("img");
            image.src = source;
            image.onload = () => 
            {
                var canvas = document.createElement("canvas");
                canvas.width = image.width;
                canvas.height = image.height;
                this.ctx = canvas.getContext("2d");
                this.ctx.drawImage(image, 0, 0, image.width, image.height);
                canvas.toBlob((blob) => {
                    navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob })
                    ]);
                    helpers.successMessagePopup("Copied Successfully", "Your image has been copied to the clipboard successfully.");
                }, "image/png");
            }
        });
    }

}