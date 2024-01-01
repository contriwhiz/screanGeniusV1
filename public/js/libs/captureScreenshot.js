class captureScreenshotSG 
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
        this.ctxH = "";
        this.highlightLastPoint = "";
        this.selectedShapeAnno = "";
        //this.APIServer = "http://localhost:3000";
        //this.APIServer = "http://82.208.20.76";
        this.APIServer = "https://screengenius.io";
        this.shapeOutline = "3";
        this.shapeOutlineColor = "#525FB0";
        

        this.canvas_background = null;
        this.isCanvasBackground = 0;

        this.screenshotName = "";
        this.uploadTypeSettings = false;
        this.start = {};
        this.end = {};
        this.isSelecting = false;
        this.winH = 0; 
        this.wScrolled = 0;
        this.docHeight = 0;
        this.baseImgArr = [];
        this.imagesposY = 0;
        this.lastScreenshotH = 0;
        this.fullScreenShotCan = "";
        this.fullScreenShotContext = "";
        this.capturedFirstItem = 0;
        this.requestSentToCaptureScreen = 0;
        this.requestReceivedOnceScreenCaptured = 0;
        this.isReachedScreenshotlimit = 0;
        this.cropIcon = chrome.runtime.getURL("/images/quix-croptool-icon.png");
        this.closeIcon = chrome.runtime.getURL("/images/quix-close-icon.png");
        this.rect = {};
        this.ctx = "";
        this.drag = "";
        this.fullSLoaderINT = '';
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
            img.onload = () => 
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
            this.canvas_background = null;
            this.isCanvasBackground = 0;
            return;
        }
    }
    // To get selected coordinates by user for selected screen screenshot feature
    get_coords_screenshot = async (dataUri, callback) => 
    {
        console.log("--get_coords_screenshot--");
        this.disableScrolling();
        if(document.getElementById("canvas_background"))
        {
            document.getElementById("canvas_background").remove();
            jQuery("#close-captureScreen").unbind('click');
            jQuery("#close-captureScreen").remove();
        }
        setTimeout(() => 
        {
            this.canvas_background = document.createElement('canvas');
            this.canvas_background.id = "canvas_background";
            this.canvas_background.style.width = window.innerWidth;
            this.canvas_background.style.height = window.innerHeight;
            this.canvas_background.width = window.innerWidth;
            this.canvas_background.height = window.innerHeight;
            this.canvas_background.style.position = "absolute";
            this.canvas_background.style.left = 0;
            this.canvas_background.style.top = window.scrollY+"px";
            this.canvas_background.style.zIndex = "9999999999";
            this.canvas_background.style.cursor = "crosshair";

            document.body.appendChild(this.canvas_background);
            var closeCapture = '<span id="close-captureScreen" style="top:'+(window.scrollY+10)+'px;"><img src="'+this.closeIcon+'"></span>';
            jQuery("body").append(closeCapture);

            jQuery("#close-captureScreen").unbind('click');
            jQuery("#close-captureScreen").on("click",() => 
            {
                jQuery("#canvas_background").remove();
                this.canvas_background = null;
                this.isCanvasBackground = 0;
                jQuery("#close-captureScreen").unbind('click');
                jQuery("#close-captureScreen").remove();
                this.enableScrolling();
            });
            this.ctx = this.canvas_background.getContext('2d');
            this.ctx.fillStyle = "rgba(0, 0, 0, .7)";
            this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight); //jQuery("body").prop('scrollHeight')
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Select Your Area to Capture Screenshot", this.canvas_background.width/2, window.innerHeight/2);
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
                //     this.isCanvasBackground = 0;
                // });
                var xxCord = (this.rect.startX+this.rect.w) - 85;
                var yyCord = (this.rect.startY+this.rect.h+window.scrollY) - 40;
                var screenCaptureControls = '<div id="quix-screen-capture-outer" style="left:'+xxCord+'px;top:'+yyCord+'px;"><img id="quix-screen-capture-close" src="'+this.closeIcon+'"><img id="quix-screen-capture-crop" src="'+this.cropIcon+'"></div>';
                jQuery("body").append(screenCaptureControls);
                jQuery("#quix-screen-capture-close").unbind('click');
                jQuery("#quix-screen-capture-close").on("click",() => 
                {
                    jQuery("#canvas_background").remove();
                    this.canvas_background = null;
                    this.isCanvasBackground = 0;
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
                    this.canvas_background = null;
                    this.isCanvasBackground = 0;
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
            this.canvas_background = null;
            this.isCanvasBackground = 0;
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
            this.canvas_background = document.createElement('canvas');
            this.canvas_background.id = "canvas_background";
            this.canvas_background.style.width = jQuery("#captured-screen").width();
            this.canvas_background.style.height = jQuery("#captured-screen").height();
            this.canvas_background.width = jQuery("#captured-screen").width();
            this.canvas_background.height = jQuery("#captured-screen").height(); 
            var canOff = jQuery("#captured-screen").offset();
            this.canvas_background.style.position = "absolute";   
            //this.canvas_background.style.left = XAxis+"px";
            //this.canvas_background.style.top = YAxis+"px";
            this.canvas_background.style.zIndex = "9999999999";
            this.canvas_background.style.cursor = "crosshair";
            document.getElementById("screenshot-wrapper-bottom-wrap-inner").appendChild(this.canvas_background);
            
            this.ctx = this.canvas_background.getContext('2d');
            this.ctx.fillStyle = "rgba(0, 0, 0, .7)";
            this.ctx.fillRect(0, 0, jQuery("#captured-screen").width(), jQuery("#captured-screen").height());

            this.init('crop');

            this.rect.startX = (parseFloat(this.rect.startX));
            this.rect.startY = (parseFloat(this.rect.startY));
            this.rect.w = (parseFloat(this.rect.w));
            this.rect.h = (parseFloat(this.rect.h));
        },500);
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
        this.canvas_background = document.getElementById("canvas_background");
        if(type == "screenshot" && this.canvas_background !== null) 
        {
            this.canvas_background.addEventListener('mousedown', this.mouseDownScreenshot, false);
            this.canvas_background.addEventListener('mouseup', this.mouseUp, false);
            this.canvas_background.addEventListener('mousemove', this.mouseMoveScreenshot, false);
            jQuery("#canvas_background").unbind('mouseout');
            jQuery("#canvas_background").on("mouseout",() => 
            {
                if(this.drag)
                {
                    this.mouseUp();
                    jQuery("#canvas_background").trigger("click");
                }
            });
        }
        // else if(type == "crop" && canvas_background !== null)
        // {
        //     canvas_background.addEventListener('mousedown', this.mouseDownCrop, false);
        //     canvas_background.addEventListener('mouseup', this.mouseUp, false);
        //     canvas_background.addEventListener('mousemove', this.mouseMoveCrop, false);
        // }
    }

    // Mouse down event on captured selected screen screenshot feature
    mouseDownScreenshot = (e) =>
    {
        this.canvas_background = document.getElementById("canvas_background");
        this.rect.startX = (((e.clientX)));
        this.rect.startY = (((e.clientY)));
        this.drag = true;
        jQuery("#quix-screen-capture-outer").remove();
    }

    // Mouse up event on blur and selected screen capture feature
    mouseUp = () => {
        // this.addCoordinatestoLoop();
        this.drag = false;
    }

    // Mouse move event on selected screen screenshot feature
    mouseMoveScreenshot = (e) =>
    {
        if (this.drag) 
        {
            this.canvas_background = jQuery("#canvas_background").offset();
            //this.rect.w = (((e.clientX) - canvas_background.left - this.rect.startX));
            //this.rect.h = (((e.clientY) - canvas_background.top - this.rect.startY));
            this.rect.w = (((e.pageX) - this.canvas_background.left - (this.rect.startX)));
            this.rect.h = (((e.pageY) - this.canvas_background.top - (this.rect.startY)));
            this.draw("screenshot");
            //this.scrollWhileCropping(e, "screenshot");
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
        this.canvas_background = document.getElementById("canvas_background");
        if(this.canvas_background !== null)
        {
            this.ctx.clearRect(0, 0, this.canvas_background.width, this.canvas_background.height);
            if(type == "screenshot")
            {
                document.body.removeChild(this.canvas_background);
            }
            else if(type == "crop")
            {
                document.getElementById("screenshot-wrapper-bottom-wrap-inner").removeChild(this.canvas_background);
            }
        }
        this.enableScrolling();
    }

    captureFullScreenshotsRequest = (request) =>
    {
        console.log(this.capturedFirstItem,"-captureFullScreenshotsRequest-");
        screenShotType = "Full Page";
        if(this.capturedFirstItem == 0)
        {
            this.resetScreenFeatures();
            this.capturedFirstItem = 1;
            this.captureFirstTime();
            this.fullSLoaderINT = setInterval(() => 
            {
                console.log("*********");
                let winScrolledY = jQuery("html").scrollTop();
                let totDocHeight = document.body.clientHeight;
                let width = parseInt((winScrolledY/totDocHeight)*100);
                if(width < 5){ width = 5; }
                chrome.runtime.sendMessage({type: "progressLoader", width: width});
            },500);
        }
    }
    captureScreenshotsRequest = (request) =>
    {
        console.log(request,this.clientIDOauth,"-captureScreenshotsRequest-");
        if(request.event == 2)
        {
            screenShotType = "Visible Part";
            if(request.uploadType != "Local"){ this.uploadTypeSettings = true; }
            this.resetScreenFeatures();
            this.handleCaptureVisibleScreen(request.dataUri);
        }
        if(request.event == 4)
        {
            screenShotType = "Uploaded";
            if(request.uploadType != "Local"){ this.uploadTypeSettings = true; }
            this.resetScreenFeatures();
            this.handleCaptureVisibleScreen(request.dataUri);
        }
        else if(request.event == 3)
        {
            console.log(this,this.isCanvasBackground,"--this.isCanvasBackground--");
            this.isCanvasBackground += 1;
            screenShotType = "Selected Area";
            if(request.uploadType != "Local"){ this.uploadTypeSettings = true; }
            console.log(this.isCanvasBackground,"-this.isCanvasBackground");
            if(this.isCanvasBackground > 0 && this.isCanvasBackground < 2)
            {
                this.resetScreenFeatures();
                this.handleCaptureSelectedScreen(request.dataUri);
            }
        }
    }

    // To capture first screen for full Page screenshot
    captureFirstTime = ()  =>
    {  
        jQuery("body").css({"overflow":"hidden", "pointer-events":"none", "height" : "auto"}); 
        window.scrollTo(0, 0);
        this.requestSentToCaptureScreen = this.requestSentToCaptureScreen+1; 
        setTimeout(() => 
        {
            this.winH = window.innerHeight;
            this.docHeight = document.body.clientHeight;
            chrome.runtime.sendMessage({type:"nextFrame"});
        },500);
    }

    // To capture scrolled window for full Page screenshot
    scrollWindowManual = () =>
    { 
        console.log(this.winH,this.wScrolled,"-scrollWindowManual-");
        let winScrolledX = jQuery("html").scrollLeft();
        let winScrolledY = jQuery("html").scrollTop();
        if(this.winH > 0)
        {
            setTimeout(() => 
            {
                this.wScrolled = this.wScrolled + this.winH;
                if((this.wScrolled) < this.docHeight && this.baseImgArr.length <= 30)
                {
                    if(this.wScrolled+this.winH > this.docHeight){ this.lastScreenshotH = this.docHeight-this.wScrolled; }
                    window.scrollTo(0, this.wScrolled);

                    jQuery('*').filter((index, element) =>  {
                            return $(element).css("position") === 'fixed' || $(element).css("position") === 'sticky';
                    }).css({"visibility":"hidden"});
                    setTimeout(() => 
                    {
                        this.requestSentToCaptureScreen = this.requestSentToCaptureScreen+1;
                        chrome.runtime.sendMessage({type:"nextFrame"});
                    },500);
                }
                else
                {
                    if(this.wScrolled < this.docHeight){ this.isReachedScreenshotlimit = 1; }
                    let fullScreenInt = setInterval(() => {
                        if(this.requestSentToCaptureScreen == this.requestReceivedOnceScreenCaptured)
                        {
                            clearInterval(fullScreenInt);
                            $('*').filter((index, element) =>  {
                                return jQuery(element).css("position") === 'fixed' || $(element).css("position") === 'sticky';
                            }).css({"visibility":"visible"});
                            jQuery("body").css({"pointer-events": "auto","overflow":"auto"});
                            this.fullScreenCaptured(); 
                        }
                    },500);
                    
                }
            },500);
        }
        else
        {
            let checkForWInH = setInterval(() => {
                this.winH = window.innerHeight;
                this.docHeight = document.body.clientHeight;
                if(this.winH > 0)
                {
                    clearInterval(checkForWInH);
                    this.scrollWindowManual();
                }
            },500);
        }
    }

    // Capture last screenshot for full Page screenshot
    lastScreenCaptured = () =>
    {
        this.fullScreenShotCan = document.createElement("canvas");
        let image = new Image();
        image.onload = () =>  
        {
            if(this.isReachedScreenshotlimit <= 0)
            {
                this.lastScreenshotH = this.lastScreenshotH - parseInt(((this.winH - image.height)/this.winH)*this.lastScreenshotH);
                let canvas = document.createElement("canvas");
                canvas.height = this.lastScreenshotH;
                canvas.width = image.width;
                let context = canvas.getContext("2d");
                context.drawImage(image, 0, (image.height-this.lastScreenshotH), image.width, this.lastScreenshotH, 0, 0, image.width, this.lastScreenshotH);
                let screenCap = canvas.toDataURL("image/jpeg",1);
                let lastItemKey = (this.baseImgArr.length-1);
                if(screenCap !== undefined && screenCap != "data:," && lastItemKey >= 0)
                { 
                    this.baseImgArr[lastItemKey] = screenCap;
                    this.fullScreenShotCan.height = ((image.height*(this.baseImgArr.length-1)) + this.lastScreenshotH);
                }
            }
            else
            {
                this.fullScreenShotCan.height = (image.height*(this.baseImgArr.length));
            }
            this.fullScreenShotCan.width = image.width;
            this.fullScreenShotContext = this.fullScreenShotCan.getContext("2d");
            this.concatinateImagesCallback(image.height,this.winH,true);
        };
        image.src = this.baseImgArr[(this.baseImgArr.length-1)];
    }

    // Call when full Page screenshot is entirely captured
    fullScreenCaptured = () =>
    {
        console.log(this.baseImgArr.length,"-fullScreenCaptured-");
        if(this.baseImgArr.length > 1)
        {
            this.lastScreenCaptured();
        }
        else if(this.baseImgArr.length == 1)
        {
            if(this.baseImgArr[0] !== undefined && this.baseImgArr[0] !== "")
            {
                clearInterval(this.fullSLoaderINT);
                this.capturedFirstItem = 0;
                //openDownloadArea(this.baseImgArr[0]);
                chrome.runtime.sendMessage({type:"openNewTab",screen:this.baseImgArr[0],originalImage:this.baseImgArr[0],screenshotName:this.screenshotName,screenshotUploadServer:this.uploadTypeSettings});
                chrome.runtime.sendMessage({type:"closePopupWindow"});
            }
            else
            {
                alert("Screenshot capture failed for this screen.");
            }
        }
    }

    // Merge different screenshots callback
    concatinateImagesCallback = (imgHeight,winHeight,isFirstTime) =>
    {
        if(this.baseImgArr.length > 0)
        {
            if(!isFirstTime){ this.imagesposY = this.imagesposY + imgHeight; }
            this.concatinateImagesIntoOne(this.baseImgArr[0], this.imagesposY, imgHeight, winHeight, this.concatinateImagesCallback);
        }
        else
        {
            let fullscreen = this.fullScreenShotCan.toDataURL("image/jpeg",1);
            if(fullscreen !== undefined && fullscreen !== "")
            {
                clearInterval(this.fullSLoaderINT);
                this.capturedFirstItem = 0;
                //openDownloadArea(fullscreen);
                chrome.runtime.sendMessage({type:"openNewTab",screen:fullscreen,originalImage:fullscreen,screenshotName:this.screenshotName});
                chrome.runtime.sendMessage({type:"closePopupWindow"});
            }
            else
            {
                alert("Screenshot capture failed for this screen.");
            }
        }
    }

    // Merge different screenshots into one for full Page screenshot
    concatinateImagesIntoOne = (base64img, yPos, imgHeight, winHeight, callback) =>
    {
        let image = new Image();
        image.onload = () =>  
        {
            this.fullScreenShotContext.drawImage(image, 0, yPos);
            this.baseImgArr.shift();
            callback(imgHeight, winHeight, false);
        };
        image.src = base64img;
    }

    // Remove all the events added to page for screenshot capture
    resetScreenFeatures = () =>
    {
        // start = {};
        // end = {};
        // isSelecting = false;
        this.winH = 0; 
        this.wScrolled = 0;
        this.docHeight = 0;
        this.baseImgArr = [];
        this.imagesposY = 0;
        this.lastScreenshotH = 0;
        this.fullScreenShotCan = "";
        this.fullScreenShotContext = "";
        this.capturedFirstItem = 0;
        this.requestSentToCaptureScreen = 0;
        this.requestReceivedOnceScreenCaptured = 0;
        this.isReachedScreenshotlimit = 0;
        jQuery("#download-overlay").remove();
        jQuery(".download-screenshot").unbind("click");
        jQuery(".download-screenshot-full").unbind("click");
        jQuery(".close-download").unbind("click");
    }
    // To capture visible screen
    handleCaptureVisibleScreen = (dataUri) =>
    {
        if(dataUri !== undefined && dataUri !== "")
        {
            //jQuery("body").css({"overflow":"hidden", "height" : "auto"});
            chrome.runtime.sendMessage({type:"openNewTab",screen:dataUri,originalImage:dataUri,screenshotName:this.screenshotName,screenshotUploadServer:this.uploadTypeSettings});
            //openDownloadArea(dataUri);
        }
        else
        {
            alert("Screenshot capture failed for this screen.");
        }
    }

    // To capture selected screen
    handleCaptureSelectedScreen = (dataUri) =>
    {
        console.log(this,"--handleCaptureSelectedScreen--");
        let _this = this;
        this.get_coords_screenshot(dataUri, function(imageURI)
        {
            console.log(imageURI,"-imageURI-");
            if(imageURI !== undefined && imageURI !== "")
            {
                //jQuery("body").css({"overflow":"hidden", "height" : "auto"});
                console.log(_this,"--this.screenshotName--");
                chrome.runtime.sendMessage({type:"openNewTab",screen:imageURI,originalImage:imageURI,screenshotName:_this.screenshotName,screenshotUploadServer:_this.uploadTypeSettings});
                //openDownloadArea(imageURI);
            }
            else
            {
                alert("Screenshot capture failed for this screen.");
            }
        });
    } 

    // Remove the screenshot object from local storage
    clearFinalScreenshot = () =>
    {
        var data = { "quixyScreenshotFinal" : ""};
        chrome.storage.local.set(data, () =>  {});
    }

}