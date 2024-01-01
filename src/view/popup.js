import React, {useEffect, useState} from 'react';
import TabsView from '../components/TabView/TabView';
import Header from '../components/Navigator/Header';
import {handleCloseToolbar, handleWebcam, handleMicrophone, handleToolbarPanel, handleButtonDelete, handleButtonPause, handleButtonStop, handleuserSocialLogin, handleSigninPopup, handleSigninClose, customEffect } from '../helper/helper';

const Popup = () => {
    // const [exactDelayTime,setExactDelayTime] = useState(3)
    // const [videoQualities ,setVideoQuality] = useState("720p")
    const [isActiveCapture, setIsActiveCapture] = useState(false);
    console.log(isActiveCapture, "popup.js isactivecaptre")
useEffect(()=>{
  customEffect()
})
// delayUpdatedTime={setExactDelayTime} videoQuality={setVideoQuality} 
// delay={exactDelayTime} quality={videoQualities}
    return(
        <div className="quix-popup-outer-main">
          <div className="quix-popup-outer quix-capture-area">
            <Header isActiveCapture={isActiveCapture}/>
            <div className="quix-popup-inner-mid">
              {/* Tabs Content */}
              <TabsView isActive={setIsActiveCapture}/>
              {/* ****** */}
            </div>
          </div>
          <div className="quix-popup-outer quix-record-tool-area">
            <div className="quix-popup-inner-top">
              <div className="quix-popup-toolbar-top">
                <div className="quix-popup-toolbar-top-left">
                  <img alt="" className="quix-popup-toolbar-drag-icon" src="images/quix-drag-icon.png"/>
                  <span>Recording...</span>
                </div>
                <div className="quix-popup-toolbar-top-right" onClick={()=>handleCloseToolbar()}>
                  <img alt="" src="images/quix-close-icon2.png"/>
                </div>
                <div className="quix-popup-toolbar-top-mid">
                  <div className="quix-tab-recorder-options quix-three-items">
                    <div className="quix-desktop-only quix-microphone-option quix-tools-block">
                      <img alt="" className="quix-tool-enabled-icon-state" src="images/quix-microphone-icon2.png"/>
                      <img alt="" className="quix-tool-disabled-icon-state" src="images/quix-microphone-disabled-icon.png"/>
                      <label className="quix-recorder-switch"><input type="checkbox"
                      onChange={()=> handleMicrophone()} name="is-tool-microphone"/></label>
                    </div> 
                    <div className="quix-desktop-only quix-camera-option quix-tools-block">
                      <img alt="" className="quix-tool-enabled-icon-state" src="images/quix-webcam-tool.png"/>
                      <img alt="" className="quix-tool-disabled-icon-state" src="images/quix-webcam-disabled-tool.png"/>
                      <label className="quix-recorder-switch"><input type="checkbox" onChange={()=>handleWebcam()} name="is-tool-camera"/></label>
                    </div>
                    <div className="quix-desktop-only quix-toolbar-option quix-tools-block">
                      <img alt="" className="quix-tool-enabled-icon-state" src="images/quix-toolbox.png"/>
                      <img alt="" className="quix-tool-disabled-icon-state" src="images/quix-toolbox-dis.png"/>
                      <label className="quix-recorder-switch"><input type="checkbox" onChange={()=> handleToolbarPanel()} name="is-tool-toobar"/></label>
                    </div>
                    <div className="quix-desktop-only quix-delete-option quix-tools-block">
                      <img alt="" onClick={()=> handleButtonDelete()} className="quix-enabled-icon-state" src="images/quix-delete-icon.png"/>
                    </div>
                    <div className="quix-desktop-only quix-play-option quix-tools-block">
                      <img alt="" className="quix-tool-enabled-icon-state" src="images/quix-tool-pause.png"/>
                      <img alt="" className="quix-tool-disabled-icon-state" src="images/quix-tool-play.png"/>
                      <label className="quix-recorder-switch"><input type="checkbox" onChange={()=> handleButtonPause()} name="is-play-toobar"/></label>
                    </div>
                    <div className="quix-desktop-only quix-stop-option quix-tools-block">
                      <img alt="" onClick={()=> handleButtonStop()} className="quix-enabled-icon-state" src="images/quix-tool-stop.png"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="quix-popup-toolbar-content">
                <div className="quix-popup-toolbar-timer-outer">
                  <div className="quix-popup-toolbar-timer-inner">
                    <span>0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="quix-popup-outer quix-not-available-area">
            <div className="quix-not-available-area-inner">
              <div className="quix-not-available-logo">
                <img src="images/quix-logo-main.png" alt=""/>
                <img src="images/quix-logo3.png" alt=""/>
              </div>
              <div className="quix-not-available-message">
                <h3>Can't use ScreenGenius here.</h3>
                <p>We cannot show ScreenGenius on this page, please try another page.</p>
              </div>
            </div>
          </div>
          <div className="quix-popup-outer quix-fullscreen-loader">
            <div className="quix-fullscreen-loader-inner">
              <div className="quix-not-available-message">
                <h3>Full Page Capturing.</h3>
                <div className="quix-fullscreen-loader-progress">
                  <div className="quix-fullscreen-loader-progress-inner">
                  </div>
                </div>
                <p>Please <b>do not scroll</b> or move your mouse pointer while capturing in order to get the best result.</p>
              </div>
            </div>
          </div>
          <div id="quix-signin-wrapper" className="quix-signin-wrapper">
            <div id="quix-signin-overlay" className="quix-signin-overlay"></div>
            <div id="quix-signin-inner">
              <h3>Sign In to more..</h3>
              <div className="quix-signin-row"><img alt="" src="images/quix-signin-folder.png"/><span>Fast Access to screenshots / videos</span></div>
              <div className="quix-signin-row"><img alt="" src="images/quix-signin-gallery.png"/><span>Easily share Images / videos via link with anyone</span></div>
              <div className="quix-signin-row"><img alt="" src="images/quix-signin-link.png"/><span>Using URL save all the screenshots together</span></div>
              <div className="quix-signin-button" onClick={()=> handleuserSocialLogin()}><span>Sign In</span></div>
              <div className="quix-signin-button" onClick={()=> handleSigninPopup()}><span>Sign In with Gmail</span></div>
              <div className="quix-signin-close" onClick={()=> handleSigninClose()}><img alt="" src="images/quix-signin-close-circle.png"/></div>
            </div>
          </div>
          <div id="quix-popup-loader">
            <div className="quix-popup-loader-inner">
              <div id="quix-popup-overlay" className="quix-popup-overlay"></div>
              <img src="images/light-loader.gif" alt=""/>
            </div>
          </div>
        </div>
      )
};

export default Popup;