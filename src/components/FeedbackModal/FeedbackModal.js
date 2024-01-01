import React, {useEffect} from "react";
import feedbackImg from "../../assets/images/quix-share-feedback-form.png";
// import lightLoaderImg from "../../assets/images/light-loader.gif";

const FeedbackModal = ({ handleCloseModal }) => {
  
  return (
    <div id="feedback-share-popup-wrapper">
      <div className="feedback-share-popup">
        <div className="feedback-share-heading">
          <img src={feedbackImg} alt="" />
          <span>Share your feedback with us</span>
        </div>
        <div id="share-feedback-form" className="email-share-form">
          <input
            type="text"
            name="to-email-feedback"
            placeholder="Enter Your Email"
          />
          <textarea
            id="email-message-feedback"
            placeholder="Enter Your Feedback"
            maxLength="900"
            name="email-message-feedback"
          ></textarea>
          <p className="message-counter"></p>
        </div>
        <div className="feedback-share-submit">
          {/* <img className="loader-icon" src={lightLoaderImg}  /> */}
          <button className="send-feedback-share">Send</button>
          <button
            className="close-feedback-share"
            onClick={() => handleCloseModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
