import React, { useState, useEffect, useRef } from "react";
import selectArrowIcon from "../../assets/images/select-arrow-down-black.png";

const Select = ({ optionObj, showIcons ,className }) => {
  const initialOpt = optionObj?.[0];
  const [activeSelect, setActiveSelect] = useState(initialOpt);
  const [showOptions, setShowOption] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setShowOption(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  return (
    <div className={`screen-genius-select-area ${className}`} ref={selectRef}>
      <div
        className="screen-genius-title"
        onClick={() => setShowOption(!showOptions)}
      >
        <img src={activeSelect?.img} alt="" />
        <div id="title" defaultValue={activeSelect?.title}>{activeSelect?.title}</div>
        <img className="arrow-img" src={selectArrowIcon} alt=""></img>
      </div>
      {showOptions && (
        <div className="screen-genius-options">
          {optionObj &&
            optionObj?.map((opt, index) => {
              return (
                <div
                  key={index}
                  className={`screen-genius-options-row ${
                    activeSelect?.title === opt?.title ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveSelect(opt);
                    setShowOption(!showOptions);
                  }}
                >
                  <div className="screen-genius-option-row-innr">
                    {showIcons &&
                      (activeSelect?.title === opt?.title ? (
                        <img src={opt?.activeImg} alt="" />
                      ) : (
                        <img src={opt?.img} alt="" />
                      ))}
                    <div>{opt?.title}</div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Select;
