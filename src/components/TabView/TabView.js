import React, { useEffect, useState } from "react";
import Capture from "./Capture";
import Recorder from "./Recorder";
import captureIcon from "../../assets/images/quix-screen-recording.png";
import recorderIcon from "../../assets/images/quix-camera-recording.png";
import { handleCaptureMode } from "../../helper/helper";
const TabsView = ({delay, quality,isActive}) => {
  const [tabHandler, setTabHandler] = useState(0);
  const [isCaptureActive, setIsCaptureActive] = useState(false);
  console.log(isCaptureActive, "isCaptureActive");
  useEffect(()=>{
    isActive(isCaptureActive)
  })
  useEffect(() => {
    handleCaptureMode(tabHandler === 0 ? 'screenshot' : 'recorder');
  }, [tabHandler]);
  // : 'recorder'
//==================================
  useEffect(() => {
    const savedTabHandler = localStorage.getItem("activeTabHandler");
    if (savedTabHandler !== null) {
      setTabHandler(parseInt(savedTabHandler, 10));
    }
  }, []);

  // Save the active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTabHandler", tabHandler.toString());
  }, [tabHandler]);

  return (
    <>
      <div className="quix-popup-tabs">
        <div
          className={`quix-capture-mode quix-screenshot-capture ${
            tabHandler === 0 ? "active" : "inactive"
          }`}
          onClick={(event) => {
            setTabHandler(0);
            handleCaptureMode('screenshot', event);
          }}
          title="Screenshot Capture"
        >
          <img alt="" src={captureIcon} />
          <span>Capture</span>
        </div>
        <div
          className={`quix-capture-mode quix-video-capture ${
            tabHandler === 1 ? "active" : "inactive"
          }`}
          title="Video Recording"
          onClick={(event) => {
            setTabHandler(1);
            handleCaptureMode('recorder', event);
          }}
        >
          <img alt="" src={recorderIcon} />
          <span>Recorder</span>
        </div>
      </div>
      {/* delayTime={delay} qualityvid={quality} */}
      {tabHandler === 0 ? <Capture onCapture={()=>setIsCaptureActive(true)}/> : <Recorder  onCapture={()=>setIsCaptureActive(false)}/>}
    </>
  );
};

export default TabsView;
