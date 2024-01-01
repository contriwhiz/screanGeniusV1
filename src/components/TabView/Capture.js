import React, { useEffect, useState } from "react";
import delayIcon from "../../assets/images/quix-delay.png";
import fullPageIcon from "../../assets/images/quix-full-page.png";
import visiblePartIcon from "../../assets/images/quix-visible-area.png";
import selectAreaIcon from "../../assets/images/quix-selected-screen.png";
import saveIcon from "../../assets/images/quix-save.png";
import saveWhiteIcon from "../../assets/images/quix-save-white.png";
import saveCloudIcon from "../../assets/images/quix-save-cloud.png";
import saveCloudWhiteIcon from "../../assets/images/quix-save-cloud-white.png";
import selectArrowDownBlack from "../../assets/images/select-arrow-down-black.png";
import Select from "../Select/Select";
import { downloadOption } from "../../helper/data";
import Delay from "../Delay/Delay";
import {
  handleCaptureScreen,
  handleOpenEditor,
  openDropdown,
  selectDropdownValue,
} from "../../helper/helper";

const Capture = ({onCapture}) => {

useEffect(()=>{
  onCapture();
}, [])  
 
  return (
    <>
      <div className="quix-tab-toolbox">
        <div className="quix-screenshot-options-outer">
          <div className="quix-timer-elem">
            <img alt="" src={delayIcon} />
            <span className="screeng-bg-img" id="quix-time-delay">
              Delay
            </span>
            <Delay defaultVal={0} minVal={0} maxVal={4} context={"capture"} />
            <div className="quix-timer-help-outer">
              <div className="quix-timer-help-inner">
                <p className="quix-timer-help-text">
                  You can use the timer to delay the screenshot capture. This
                  feature is available for all type of Screenshot capture.
                </p>
              </div>
            </div>
          </div>
          {/* <Select className={'quix-screenshot-video-upload'} optionObj={downloadOption} showIcons={true} /> */}
          <div className="quix-desktop-only quix-tools-block quix-screenshot-upload-dropdown">
            <img className="quix-upload-type-icon" alt="" src={saveIcon} />
            <div
              className="quix-upload-options-selected"
              onClick={() => openDropdown("screenshot-upload-dropdown")}
            >
              Local
            </div>
            <img
              alt=""
              onClick={() => openDropdown("screenshot-upload-dropdown")}
              className="quix-select-arrow-down"
              src={selectArrowDownBlack}
            />
            <select className="quix-screenshot-video-upload">
              <option value="Local">Local</option>
              <option value="Cloud">Cloud</option>
            </select>
            <div className="quix-recorder-video-upload-options">
              <div className="quix-recorder-video-upload-options-inner">
                <div
                  className="quix-upload-options-row"
                  onClick={(event) =>
                    selectDropdownValue("screenshot-upload-dropdown", event)
                  }
                >
                  <img
                    alt=""
                    data-inactive={saveIcon}
                    data-active={saveWhiteIcon}
                    src={saveIcon}
                  />
                  <span>Local</span>
                </div>
                <div
                  className="quix-upload-options-row"
                  onClick={(event) =>
                    selectDropdownValue("screenshot-upload-dropdown", event)
                  }
                >
                  <img
                    alt=""
                    data-inactive={saveCloudIcon}
                    data-active={saveCloudWhiteIcon}
                    src={saveCloudIcon}
                  />
                  <span>Cloud</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="quix-screenshot-items-label">
          <span>Click to start an action</span>
        </div>
        <ul>
          {/* onClick={handleCaptureScreen(1)} */}
          <li
            className="quix-full-page-elem"
            onClick={(e) => handleCaptureScreen(1, e)}
          >
            <div className="quix-image-outer">
              <img alt="" src={fullPageIcon} />
            </div>
            <span>Full Page</span>
          </li>
          <li
            className="quix-visible-part-elem"
            onClick={(e) => handleCaptureScreen(2, e)}
          >
            <div className="quix-image-outer">
              <img alt="" src={visiblePartIcon} />
            </div>
            <span>Visible Part</span>
          </li>
          <li
            className="quix-selected-area-elem"
            onClick={(e) => handleCaptureScreen(3, e)}
          >
            <div className="quix-image-outer">
              <img alt="" src={selectAreaIcon} />
            </div>
            <span>Select Area</span>
          </li>
        </ul>
        <div className="quix-capture-loading">
          <span></span>
        </div>
        <div className="quix-full-inner-bottom">
          <span className="quix-full-inner-loader">
            Screenshot is being captured
            <span className="quix-loader__dot">.</span>
            <span className="quix-loader__dot">.</span>
            <span className="quix-loader__dot">.</span>
          </span>
        </div>
      </div>
      <div className="quix-popup-inner-bottom">
        <div className="quix-footer-row1">
          <div className="quix-footer-block quix-block-local-rec">
            <img alt="" src="images/quix-editor.png" />
            <span edit-type="screenshot" onClick={(event) => handleOpenEditor(event)}>
              Open Image Editor
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Capture;
