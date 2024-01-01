import React, { useState, useEffect, useRef, forwardRef } from "react";
import closeIcon from "../../assets/images/quix-close-icon1.png";
import userIcon from "../../assets/images/quix-user-icon.png";
import delayIcon from "../../assets/images/quix-delay.png";
import dashboardIcon from "../../assets/images/quix-dashboard.png";
import settignRightArrowIcon from "../../assets/images/quix-settings-arrow-right.png";
import feedbackIcon from "../../assets/images/quix-feedback.png";
import logoutIcon from "../../assets/images/quix-logout.png";
import googleIcon from "../../assets/images/google-icon.png";
import logoFooterIcon from "../../assets/images/quixy-logo-footer.png";
import FeedbackModal from "../FeedbackModal/FeedbackModal";
import Select from "../Select/Select";
import Delay from "../Delay/Delay";
import { videoQualityOption } from "../../helper/data";
import { openDropdown, selectDropdownValue } from "../../helper/helper";
import {
  handlegotoDashboard,
  handlegotoQuixy,
  handleuserLogin,
  handleuserLogout,
  handleuserSocialLogin,
  handleuserFeedback,
} from "../../helper/helper";

const SettingTools = ({
  handleCloseSettTools,
  // DelayTime,
  // handleQualityChange,
  isActiveCapture,
  closeModal
}) => {
  const [handleFeedbackModal, setHandleFeedbackModal] = useState(false);
  // const [getDelayValue, setDelayValue] = useState(3);
  // const divRef = useRef(null);
  // const [videoQuality, setVideoQuality] = useState("720p");
  // const handleDelayChange = (delay) => {
  //   setDelayValue(delay);
  // };
  // useEffect(() => {
  //   DelayTime(getDelayValue);
  //   handleQualityChange(videoQuality);
  // }, [getDelayValue, videoQuality, handleQualityChange]);
  console.log(isActiveCapture, "settingtools.js isactivecaptre");
  // useEffect(() => {
  //   const observer = new MutationObserver(() => {
  //     const newQuality = divRef.current.innerText;
  //     setVideoQuality(newQuality);
  //     handleQualityChange(newQuality);
  //   });
  //   observer.observe(divRef.current, { childList: true, subtree: true });
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [handleQualityChange]);
  const videoSetting = (<><label>VIDEO SETTINGS</label>
  {/*<div className="quix-desktop-only quix-tools-block quix-video-quality-dropdown">
  <Select optionObj={videoQualityOption} showIcons={false} />
  </div>*/}
  <div className="quix-desktop-only quix-tools-block quix-video-quality-dropdown">
    <img
      alt=""
      src="images/quix-quality.png"
      onClick={(event) =>
        openDropdown("video-quality-dropdown", event)
      }
    />
    <div
      className="quix-upload-options-selected"
      onClick={(event) => {
        openDropdown("video-quality-dropdown", event);
      }}
    >
      720p
    </div>
    <img
      alt=""
      className="quix-select-arrow-down"
      src="images/select-arrow-down-black.png"
      onClick={(event) =>
        openDropdown("video-quality-dropdown", event)
      }
    />
    <select className="quix-recorder-video-quality" defaultValue="720p">
      <option value="360p">360p</option>
      <option value="480p">480p</option>
      <option value="720p">720p</option>
      <option value="1080p">1080p</option>
      <option value="4K">4K</option>
    </select>
    <div className="quix-recorder-video-upload-options">
      <div className="quix-recorder-video-upload-options-inner">
        <div
          className="quix-upload-options-row"
          onClick={(event) =>
            selectDropdownValue("video-quality-dropdown", event)
          }
        >
          <span>360p</span>
        </div>
        <div
          className="quix-upload-options-row"
          onClick={(event) =>
            selectDropdownValue("video-quality-dropdown", event)
          }
        >
          <span>480p</span>
        </div>
        <div
          className="quix-upload-options-row"
          onClick={(event) =>
            selectDropdownValue("video-quality-dropdown", event)
          }
        >
          <span>720p</span>
        </div>
        <div
          className="quix-upload-options-row"
          onClick={(event) =>
            selectDropdownValue("video-quality-dropdown", event)
          }
        >
          <span>1080p</span>
        </div>
        <div
          className="quix-upload-options-row"
          onClick={(event) =>
            selectDropdownValue("video-quality-dropdown", event)
          }
        >
          <span>4K</span>
        </div>
      </div>
    </div>
  </div>
  <div className="quix-autostop-record quix-tools-block quix-video-delay">
    <img alt="" src={delayIcon} />
    <span>Video Delay</span>
    <Delay
      defaultVal={3}
      minVal={3}
      maxVal={59}
      context={"record"}
    />
  </div></>)
  return (
    <>
      <div id="quix-settings-wrapper" className="quix-settings-wrapper">
        {handleFeedbackModal && (
          <FeedbackModal handleCloseModal={setHandleFeedbackModal} />
        )}
        <div id="quix-settings-inner">
          <div className="quix-settings-top">
            <div className="quix-settings-top-inner">
              <div className="quix-settings-userinfo">
                <img src={userIcon} alt="" />
                <span
                  className="quix-user-name"
                  title="You can login at download page."
                >
                  Hi Guest!
                </span>
              </div>
              <div
                className="quix-settings-close"
                onClick={() => handleCloseSettTools(false)}
              >
                <img src={closeIcon} alt="" />
              </div>
            </div>
          </div>
          <div className="quix-settings-mid">
            <div className="quix-settings-mid-inner">
              {/* <div style={{ display: isActiveCapture ? "none" : "block" }}>
                
              </div> */}
              {isActiveCapture ? null : videoSetting}
              <label>GENERAL SETTINGS</label>
              <div
                className="quix-autostop-record quix-tools-block user-loggedIn"
                onClick={(event) => handlegotoDashboard(event)}
              >
                <img alt="" src={dashboardIcon} />
                <span>Go to Dashboard</span>
                <img
                  className="quix-right-icon-setting"
                  alt=""
                  src={settignRightArrowIcon}
                />
              </div>
              <div
                className="quix-autostop-record quix-tools-block"
                id="add-feedback"
                onClick={(event) => handleuserFeedback(event)}
              >
                <img alt="" src={feedbackIcon} />
                <span>Add a Feedback</span>
                <img
                  className="quix-right-icon-setting"
                  alt=""
                  src={settignRightArrowIcon}
                />
              </div>
              <div
                className="quix-autostop-record quix-tools-block user-loggedOut"
                onClick={(event) => handleuserSocialLogin(event)}
              >
                <img alt="" src={logoutIcon} />
                <span>Log In</span>
              </div>
              <div
                className="quix-autostop-record quix-tools-block user-loggedOut"
                onClick={(event) => {handleuserLogin(event)
                  closeModal(false)
                }}
              >
                <img alt="" src={googleIcon} />
                <span>Log In with Gmail</span>
              </div>
              <div
                className="quix-autostop-record quix-tools-block user-loggedIn"
                onClick={(event) => handleuserLogout(event)}
              >
                <img alt="" src={logoutIcon} />
                <span>Log Out</span>
              </div>
            </div>
          </div>
          <div className="quix-settings-footer">
            <div className="quix-settings-footer-inner">
              <span>powered by</span>
              <img
                onClick={(event) => handlegotoQuixy(event)}
                src={logoFooterIcon}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingTools;
