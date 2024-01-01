import React, { useEffect, useState} from "react";
import SettingTools from "./SettingTools";
import settingIcon from "../../assets/images/quix-settings-icon.png";
import logoIcon from "../../assets/images/quix-logo-main.png";
import userIcon from "../../assets/images/quix-user-icon.png";

const Header = ({ delayUpdatedTime, videoQuality, isActiveCapture }) => {
  const [handleSettingTools, setHandleSettingTools] = useState(false);
  // const [delay, setDelay] = useState(3);
  // const [qualityChange, setHandleQualityChange] = useState("720p");


  // useEffect(() => {
  //   delayUpdatedTime(delay);
  //   videoQuality(qualityChange);
  // }, [delay, qualityChange]);
  return (
    <>
      <div>
        <div className="quix-popup-inner-top">
          <div className="quix-popup-logo">
            <img className="quix-logo-main" alt="" src={logoIcon} />
            <span className="quix-logo-main-title">ScreenGenius</span>
          </div>
          <div
            className="quix-popup-close"
            onClick={() => setHandleSettingTools(!handleSettingTools)}
          >
            <img className="quix-user-pic" alt="" src={settingIcon} />
          </div>
          <div
            className="quix-popup-user"
            onClick={() => setHandleSettingTools(!handleSettingTools)}
          >
            <img className="quix-user-pic" alt="" src={userIcon} />
            <span
              className="quix-user-name"
              title="You can login at the download page."
            >
              Hi Guest!
            </span>
          </div>
          <div style={{display:handleSettingTools ? 'block': "none"}}>
          <SettingTools
              handleCloseSettTools={setHandleSettingTools}
              // DelayTime={setDelay}
              closeModal={setHandleSettingTools}
              // handleQualityChange={setHandleQualityChange}
              isActiveCapture = {isActiveCapture}
            >
            </SettingTools>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
