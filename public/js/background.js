  // Add a `manifest` property to the `chrome` object.
  var clientIDOauth = "83540021534-j3c68n39ht71ojcep42o1qqhvfoh20cs.apps.googleusercontent.com";
  chrome.manifest = chrome.runtime.getManifest();
  //var screengeniusServer = "http://localhost:3000";
  //var screengeniusServer = "http://82.208.20.76";
  var screengeniusServer = "https://screengenius.io";
  var logoIcon2 = chrome.runtime.getURL("/images/quixy-logo-footer.png");
  var camStream = null;
  
  // method to inject JS and CSS scripts into content windows
  var injectIntoTab = function (tab) 
  {
    // You could iterate through the content scripts here
    if(chrome.manifest.content_scripts[0] !== undefined)
    {
      var scripts = chrome.manifest.content_scripts[0].js;
      var styles = chrome.manifest.content_scripts[0].css;
      if(tab.url !== undefined && !tab.url.match(/(chrome):\/\//gi))
      {
        chrome.tabs.get(tab.id, function()
        {
          if (chrome.runtime.lastError) 
          {
            console.log(chrome.runtime.lastError.message);
          } 
          else 
          {
            chrome.scripting.executeScript({
                target: {tabId: tab.id, allFrames: false},
                files: scripts,
            });
            chrome.scripting.insertCSS({
              target: {tabId: tab.id, allFrames: false},
              files: styles,
            });
          }
        });
      }
    }
  } 
  
   
  // Get all windows/ tabs to inject javascript and CSS
  chrome.windows.getAll({
      populate: true
  }, function (windows) {
      var i = 0, w = windows.length, currentWindow;
      for( ; i < w; i++ ) {
        if(windows[i] !== undefined)
        {
          currentWindow = windows[i];
          
          var j = 0, t = currentWindow.tabs.length, currentTab;
          for( ; j < t; j++ ) 
          {
            currentTab = currentWindow.tabs[j];
            if(currentTab !== undefined)
            {
              injectIntoTab(currentTab);
            }
          }
        }
      }
  });
  
  /* global chrome */
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL || details.reason === chrome.runtime.OnInstalledReason.UPDATE) 
    {
      // chrome.tabs.create({ url: screengeniusServer+"/thank-you" }, function (newWindow) {  });
      chrome.runtime.setUninstallURL(screengeniusServer+"/uninstall");
    }
  });
  
  // Event to detect when extension popup is cloased
  chrome.runtime.onConnect.addListener(function (externalPort) 
  {
    externalPort.onDisconnect.addListener(function () 
    {
      chrome.storage.local.get('isRecorderStarted', function(resultR)
      {
        let isRecorder = resultR.isRecorderStarted;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
        {
          chrome.tabs.sendMessage(tabs[0].id,
          { 
            type: "extensionPopupClosed", 
            isRecording: isRecorder 
          });
        });
      });
    })
  });
  
  // 
  chrome.runtime.onMessage.addListener(
  async function (request, sender, sendResponse) 
  {
    if (request.type == "openNewTab") // To open download window for screenshot
    {
      var data1 = { "quixyScreenshot" : request.screen};
      var data2 = { "originalImage":request.originalImage };
      var data3 = { "screenshotName":request.screenshotName };
      var data4 = { "isScreenshotUploadedToServer" : false};
      var data5 = { "screenshotUploadServer" : request.screenshotUploadServer};
      var data6 = { "cooridnatesDrawnAt":[] };
      
      chrome.storage.local.set(data1, function() {});
      chrome.storage.local.set(data2, function() {});
      chrome.storage.local.set(data3, function() {});
      chrome.storage.local.set(data4, function() {});
      chrome.storage.local.set(data5, function() {});
      chrome.storage.local.set(data6, function() {});
      chrome.tabs.create({ url: chrome.runtime.getURL("downloadScreenshot.html") }, function (newWindow) {  });
    }
    else if (request.type == "openDownloadVideoTab") // To open download window for screen recording
    {
      var data1 = { "recordedVideoData" : request.videodata};
      var data2 = { "recordedvideoSize" : request.videoSize};
      var data3 = { "recordedVideoDuration" : request.VideoDuration};
      var data4 = { "isVideoUploadedToServer" : false};
      var data5 = { "recordedVideoUpload" : request.VideoUpload};
      chrome.storage.local.set(data1, function() {});
      chrome.storage.local.set(data2, function() {});
      chrome.storage.local.set(data3, function() {});
      chrome.storage.local.set(data4, function() {});
      chrome.storage.local.set(data5, function() {});
      chrome.tabs.create({ url: chrome.runtime.getURL("downloadVideo.html") }, function (newWindow) {  });
    }
    else if(request.type == "updateCordinates") // To updates coordinates where annotations are drawn
    {
      var data = { "cooridnatesDrawnAt":request.cooridnatesDrawnAt };
      chrome.storage.local.set(data, function(){ });
    }
    else if (request.type == "quixyFinalScreenshot") // To set final screenshot to localstorage
    {
      var data = { "quixyScreenshotFinal" : request.screen};
      chrome.storage.local.set(data, function(){ });
    }
    else if (request.type == "googleAuth") // To send request to google oauth
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
        chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
          if(tabs[0] !== undefined)
          {
            chrome.tabs.sendMessage(tabs[0].id, 
            {
              type: "getGoogleAuth",
              authToken: token
            });
          }
        });
      }); 
    }
    else if (request.type == "nextFrame") // To request next screenshot after scrolled window 
    {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
      {
        chrome.tabs.captureVisibleTab(null, {'quality': 100}, function(dataUri) 
        {
          if(tabs[0] !== undefined)
          {
            chrome.tabs.sendMessage(tabs[0].id, 
            {
              type: "sendScroll",
              dataUri: dataUri
            });
          }
        });
      });
    }
    else if (request.type == "closeExtensionPages") // close if any extension tab is open
    {
      const extensionId = chrome.runtime.id;
      chrome.tabs.query({}, function (tabs) {
          for (let i = 0; i < tabs.length; i++) 
          {
              const tab = tabs[i];
              if (tab.url && tab.url !== 'chrome-extension://'+extensionId+'/entire_screen.html' && tab.url.startsWith('chrome-extension://'+extensionId+'/')) {
                  chrome.tabs.remove(tab.id);
              }
          }
      });
    }
    else if (request.type == "closeExtensionRecordingPage") // close recording tab used for entire screen
    {
      const extensionId = chrome.runtime.id;
      chrome.tabs.query({}, function (tabs) {
          for (let i = 0; i < tabs.length; i++) 
          {
            const tab = tabs[i];
            if (tab.url && tab.url == 'chrome-extension://'+extensionId+'/entire_screen.html') 
            {
              console.log(tab,"-closeExtensionRecordingPage-");
              chrome.tabs.remove(tab.id);
            }
          }
      });
    }
    else if (request.type == "videocaptureScreen") // To request screen recording for all modes
    {
      chrome.tabs.query({active: true, lastFocusedWindow: true, currentWindow: true}, async function(tabs) 
      {
        const currentTab = tabs[0];
        if(request.event.event == "1")
        {
          checkTabExistence(chrome.runtime.getURL('entire_screen.html'),async function(tabs)
          {
            if(tabs && tabs !== undefined && tabs.length > 0)
            {
              var tab = tabs[0];
              var tabId = tab.id;
              chrome.tabs.remove(tab.id);
            }
            setTimeout( async function(){
              const tab = await chrome.tabs.create({
                url: chrome.runtime.getURL('entire_screen.html'),
                pinned: true,
                active: true,
              });
              chrome.tabs.onUpdated.addListener(async function listener(tabId, info) 
              {
                if (tabId === tab.id && info.status === 'complete') 
                {
                  chrome.tabs.onUpdated.removeListener(listener);
                  await chrome.tabs.sendMessage(tabId, 
                  {
                    type: "videocaptureScreenResponseEntire",
                    event: request.event,
                    currentTab: currentTab
                  });
                }
              });
            },200);
          });
        }
        else if(request.event.event == "2")
        {
          await chrome.tabs.sendMessage(currentTab.id, 
          {
            type: "videocaptureScreenResponse",
            event: request.event
          }); 
        }
        else
        {
          await chrome.tabs.sendMessage(currentTab.id, 
          {
            type: "videocaptureScreenResponse",
            event: request.event
          }); 
        }
      });
    }
    else if (request.type == "setBadge") // Set badge on browser window/tabs to display timer 
    {
      chrome.action.setBadgeBackgroundColor({ color: "red" });
      chrome.action.setBadgeText({text: request.badgeText});
    }
    else if (request.type == "unsetBadge") // Unset badge on browser window/tabs
    {
      chrome.action.setBadgeBackgroundColor({ color: "transparent" });
      chrome.action.setBadgeText({text: ""});
      chrome.storage.local.set({'isRecorderStarted': false}, function(){});
    }
    else if (request.type == "sendRecorderToolData") // set string for toolbar data to localstorage
    {
      var str = request.badgeText+"-"+request.isCamera+"-"+request.isMicrophone+"-"+request.isPanel+"-"+request.isPlay+"-"+request.recordingType+"-"+request.isDevicesAvailable;
      chrome.storage.local.set({'setRecorderToolData': str}, function(){});
    }
    else if(request.type == "setIsRecorderStarted") // set if recording is started?
    {
      chrome.storage.local.set({'isRecorderStarted': true}, function(){});
    }
    else if(request.type == "quixyGotoDashboardCallback") // Request to go to dashboard
    {
      chrome.tabs.create({ url: screengeniusServer+"/dashboard" }, function (newWindow) {  });
    }
    else if(request.type == "quixyGotoQuixyCallback") // Request to go to quixy
    {
      chrome.tabs.create({ url: "https://quixy.com" }, function (newWindow) {  });
    }  
    else if(request.type == "quixyGotoQuixyLoginCallback") // Request to go to screenGenius Login Page
    {
      chrome.tabs.create({ url: "https://screengenius.io/login" }, function (newWindow) {  });
    }
    else if(request.type == "executeScriptInallTabs") // To execute script in all tabs/windows for entire screen recording
    {
      chrome.windows.getAll({
          populate: true
      }, function (windows) {
          var i = 0, w = windows.length, currentWindow;
          for( ; i < w; i++ ) 
          {
            if(windows[i] !== undefined)
            {
              currentWindow = windows[i];  
              var j = 0, t = currentWindow.tabs.length, currentTab;
              for( ; j < t; j++ ) 
              {
                var tab = currentWindow.tabs[j];
                var tabId = tab.id;
                if(tab !== undefined)
                {
                  //injectIntoTab(currentTab);
                  if(chrome.manifest.content_scripts[0] !== undefined)
                  {
                    if(tab.url !== undefined && !tab.url.match(/(chrome):\/\//gi))
                    {
                      chrome.tabs.get(tabId, function(tab)
                      {
                        if (chrome.runtime.lastError) 
                        {
                          console.log(chrome.runtime.lastError.message);
                        } 
                        else 
                        {
                          chrome.tabs.sendMessage(tab.id, { type: "executeScriptInallTabsCallback",event: request });
                        }
                      });
                    }
                  }
                }
              }
            }
          }
      });
    }
    else if(request.type == "quixyUserLoginCallback") // callback for user login via google
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
        
        chrome.identity.launchWebAuthFlow({url: auth_url,'interactive': true}, function(token)
        {
          var tokenStr = token.split("access_token=");
          var tokenStr1 = tokenStr[1].split("token_type=");
          var fToken = tokenStr1[0];
          chrome.tabs.sendMessage(request.event.tabId, 
          {
            type: "quixyUserLoginResponse",
            token: fToken
          });
        });
    }
    else if(request.type == "quixyUserLoginXMLCall")
    {
      var email = request.res.email;
      var name = request.res.name;
      var pic = request.res.picture;
      var data = {"email":email,"name":name,"picture":pic};
  
      const response = await fetch("https://screengenius.io/user/login", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
      })
      .then(response => response.json())
      .then(res => {
        chrome.runtime.sendMessage({type:"quixyuserData",user: res.data});
        var data = { "quixyLoginUserData" : res.data};
        chrome.storage.local.set(data, function() {});
      })
      .catch(error => {
        console.error('Error making API request:', error);
      });
    }
    else if(request.type == "getActiveSessionCall")
    {
      fetch("https://screengenius.io/user/get")
      .then(response => response.json())
      .then(res => {
        chrome.runtime.sendMessage({type:"quixyuserData",user:res.data});
        var data = { "quixyLoginUserData" : res.data};
        chrome.storage.local.set(data, function() {});
      })
      .catch(error => {
        console.error('Error making API request:', error);
      });
      // makeServerRequest("GET","", "https://screengenius.io/user/get","",function(res)
      // {
      //     chrome.runtime.sendMessage({type:"quixyuserData",user:res.data});
      // });
    }
    else if(request.type == "quixyUserLogoutCall")
    {
      fetch("https://screengenius.io/user/logout")
      .then(response => response.json())
      .then(res => {
        var data = { "quixyLoginUserData" : null };
        chrome.storage.local.set(data, function() {});
      })
      .catch(error => {
        console.error('Error making API request:', error);
      });
      // makeServerRequest("GET","", "https://screengenius.io/user/get","",function(res)
      // {
      //     chrome.runtime.sendMessage({type:"quixyuserData",user:res.data});
      // });
    }
    else if(request.type == "quixyOpenEditorCallback") // callback to open custom screenshot editor 
    {
      var data = { "quixyScreenshot" : ""};
      chrome.storage.local.set(data, function() {});
      if(request.event.action == "screenshot")
      {
          chrome.tabs.create({ url: chrome.runtime.getURL("fullScreen.html") }, function (newWindow) {  });
      }
      else
      {
          chrome.tabs.create({ url: screengeniusServer+"/video-upload" }, function (newWindow) {  });
      }
    }
  });
  
  // check if tab exists or not
  function checkTabExistence(url,callback) 
  {
    chrome.tabs.query({ url: url }, function (tabs) {
      if (tabs.length > 0) 
      {
        callback(tabs);
      } 
      else 
      {
        callback();
      }
    });
  }