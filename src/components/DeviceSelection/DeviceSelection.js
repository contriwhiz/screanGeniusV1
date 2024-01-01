import React, { useState, useEffect, useRef } from "react";
import selectArrowIcon from '../../assets/images/select-arrow-down-black.png'

const DeviceSelection = ({title,disabledIcon,enabledIcon}) => {
    const [showOptions, setShowOption] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const selectRef = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => {
        //console.log("outside", selectRef.current.contains(event.target))
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          // console.log(selectRef.current, "dgdgdgdgdg", !selectRef.current.contains(event.target),"gdhdhhhh", selectRef)
          setShowOption(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [selectRef]);

  return (
    <div className="screen-genius-device-selections screen-genius-select-area">
      <div className="screen-genius-device-selections-inner"  ref={selectRef}>
        <div className="screen-genius-device-switch">
            <input className="screen-genius-checkbox" onChange={(event)=>setIsChecked(event?.target?.checked)} type="checkbox" />
            <img className="screen-genius-device-switch-icon" src={!isChecked ? disabledIcon : enabledIcon } alt='' />
        </div>
        <span onClick={() => setShowOption(!showOptions)}>{title}</span>
        <div className="screen-genius-select-avalible-device" onClick={() => setShowOption(!showOptions)}>
            <img className="screen-genius-device-selection-icon"
             src={selectArrowIcon} alt=""/>
            {showOptions && (
                <div className="screen-genius-options">
                    <div
                    className={`screen-genius-options-row ${
                        1 === 1 ? "active" : ""
                    }`}
                    >
                    <div className="screen-genius-option-row-innr">
                        <div>sdsdfsdfsdf</div>
                    </div>
                    </div>
                    <div
                    className={`screen-genius-options-row ${
                        1 === 2 ? "active" : ""
                    }`}
                    >
                    <div className="screen-genius-option-row-innr">
                        <div>sdsdfsdfsdf</div>
                    </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// export default DeviceSelection;
