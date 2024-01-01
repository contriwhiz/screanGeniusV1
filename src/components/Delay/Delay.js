
import React, { useState, useRef, useEffect } from "react";
import lessIcon from "../../assets/images/quix-less.png";
import greaterIcon from "../../assets/images/quix-greater.png";

const Delay = ({ defaultVal, minVal, maxVal, context}) => {
  const [delayValue, setDelayValue] = useState(defaultVal);
  const handleManageDelayTime = (type) => {
    console.log(type, ">>>>", delayValue)
    if (type === 'minus' && delayValue > minVal) {
      setDelayValue(delayValue - 1);
    }
    if (type === 'plus' && delayValue < maxVal) {
      setDelayValue(delayValue + 1);
    }
  };

  return (
    <div id="quix-plusMinus-outer">
      <div id="quix-plus-minus-outer">
        <span id="quix-minus-elem" onClick={() => handleManageDelayTime('minus')}>
          <img alt="" src={lessIcon} />
        </span>
      </div>
      <input
        type="text"
        value={delayValue + "s" }
        className={`quix-${context}-delay`}
        readOnly
      />
      <div id="quix-plus-minus-outer">
        <span id="quix-plus-elem" onClick={() => handleManageDelayTime('plus')}>
          <img alt="" src={greaterIcon} />
        </span>
      </div>
    </div>
  );
};

export default Delay;
