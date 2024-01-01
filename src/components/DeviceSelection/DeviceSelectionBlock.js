import React from 'react';
import { handleVideoEvents, openDropdown, selectDropdownValue } from '../../helper/helper';
import disabledMicIcon from '../../assets/images/quix-audio-dis.png'
import enabledMicIcon from '../../assets/images/quix-audio.png'
import disabledCameraIcon from '../../assets/images/quix-camera-dis.png'
import enabledCameraIcon from '../../assets/images/quix-camera.png'
import selectArrowDownBlack from '../../assets/images/select-arrow-down-black.png'
import saveIconWhite from "../../assets/images/quix-save-white.png";
import saveCloudIcon from "../../assets/images/quix-save-cloud.png";
import saveCloudWhiteIcon from "../../assets/images/quix-save-cloud-white.png";
import saveIcon from "../../assets/images/quix-save.png";
const DeviceSelectionBlock = () => {
  return (
    <>
    <div className="quix-desktop-only quix-microphone-option quix-tools-block quix-video-mic-dropdown">
    <img alt="" src={disabledMicIcon}/>
    <input onChange={(event)=>handleVideoEvents('mic', event)} type="checkbox" name="is-microphone"/>
    <label className="quix-recorder-switch"><span>Mic</span></label>
    <img alt="" onClick={()=>openDropdown('video-mic-dropdown')} className="quix-select-arrow-down" src={selectArrowDownBlack}/>
    <select className="quix-recorder-ismic"></select>
    <div className="quix-recorder-video-upload-options">
      <div className="quix-recorder-video-upload-options-inner">
      </div>
    </div>
  </div> 
  <div className="quix-desktop-only quix-camera-option quix-tools-block quix-video-cam-dropdown">
    <img alt="" src={disabledCameraIcon}/>
    <input onChange={(event)=>handleVideoEvents('cam', event)} type="checkbox" name="is-camera"/>
    <label className="quix-recorder-switch"><span>Camera</span></label>
    <img alt="" onClick={()=>openDropdown('video-cam-dropdown')} className="quix-select-arrow-down" src={selectArrowDownBlack}/>
    <select className="quix-recorder-iscamera"></select>
    <div className="quix-recorder-video-upload-options">
      <div className="quix-recorder-video-upload-options-inner">
      </div>
    </div>
  </div> 
  <div className="quix-desktop-only quix-tools-block quix-video-upload-dropdown">
    <img className="quix-upload-type-icon" alt="" src={saveIcon}/>
    <div className="quix-upload-options-selected" onClick={()=>openDropdown('video-upload-dropdown')}>Local</div>
    <img alt="" onClick={()=>openDropdown('video-upload-dropdown')} className="quix-select-arrow-down" src={selectArrowDownBlack}/>
    <select className="quix-recorder-video-upload"><option value="Local">Local</option><option value="Cloud">Cloud</option></select>
    <div className="quix-recorder-video-upload-options">
      <div className="quix-recorder-video-upload-options-inner">
        <div className="quix-upload-options-row" onClick={(event)=>selectDropdownValue('video-upload-dropdown', event)}>
          <img alt="" data-inactive={saveIcon} data-active={saveIconWhite} src={saveIcon}/><span>Local</span>
        </div>
        <div className="quix-upload-options-row" onClick={(event)=>selectDropdownValue('video-upload-dropdown', event)}>
          <img alt="" data-inactive={saveCloudIcon} data-active={saveCloudWhiteIcon} src={saveCloudIcon}/><span>Cloud</span>
        </div>
      </div>
    </div>
  </div>
  </>
  );
};

export default DeviceSelectionBlock;
