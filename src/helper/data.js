import selectArrowDownIcon from "../assets/images/select-arrow-down-black.png";
import saveIcon from "../assets/images/quix-save.png";
import saveIconWhite from "../assets/images/quix-save-white.png";
import saveCloudIcon from "../assets/images/quix-save-cloud.png";
import saveCloudWhiteIcon from "../assets/images/quix-save-cloud-white.png";
import qualityIcon from "../assets/images/quix-quality.png";

// micOption
export const micOption = [
  { img: saveIcon, activeImg: "saveIconWhite", title: "Mic" },
  { img: "saveCloudIcon", activeImg: { saveCloudWhiteIcon }, title: "Mic1" },
  { img: "saveCloudIcon", activeImg: "saveCloudWhiteIcon", title: "Mic2" },
];

// cameraOption
export const cameraOption = [
  { img: "saveIcon", activeImg: "saveIconWhite", title: "Camera" },
  { img: "saveCloudIcon", activeImg: "saveCloudWhiteIcon", title: "Camera1" },
  { img: "saveCloudIcon", activeImg: "saveCloudWhiteIcon", title: "Camera2" },
];
// downloadOption
export const downloadOption = [
  { img: saveIcon, activeImg: saveIconWhite, title: "Local" },
  { img: saveCloudIcon, activeImg: saveCloudWhiteIcon, title: "Cloud" },
];
// videoQualityOption
export const videoQualityOption = [
  { img: qualityIcon, title: "360p" },
  { img: qualityIcon, title: "480p" },
  { img: qualityIcon, title: "720p" },
  { img: qualityIcon, title: "1080p" },
  { img: qualityIcon, title: "4K" },
];
