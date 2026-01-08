export const TRIGGER_EVENTS = {
  onClick: "onClick",
  onHover: "onHover",
  onPageLoad: "onPageLoad",
  onLongPress: "onLongPress",
};

export const ANIMATION_TYPES = {
  instant: "instant",
  fadeIn: "fadeIn",
  slide: "slide",
};


export const DISMISSAL_SETTINGS = {
  onOutsideClick: "onOutsideClick",
  dismissButtonClickOnly: "dismissButtonClickOnly",
  buttonClickOnly: "buttonClickOnly",
};


export const POSITION = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};


export const ICON_TYPE = {
  help: "help",
  info: "info",
  warning: "warning",
  beacon: "beacon",
};


export const animationMode = (type) => {

  const pickSlide = () => {
    if (type === "slideDown") return "slideDown 1s forwards";
    if (type === "slideLeft") return "slideLeft 1s forwards";
    if (type === "slideRight") return "slideRight 1s forwards";
    return "slideUp 1s forwards";
  };

  switch (type) {
    case ANIMATION_TYPES.instant:
      return "none";
    case ANIMATION_TYPES.fadeIn:
      return "fadeIn 1s ease-in";
    case ANIMATION_TYPES.slide:
      return pickSlide();
    default:
      return "none";
  }
};

export const TRIGGER_MODE = {
  icon: "icon",
  noIcon: "noIcon",
  label: "label",
};

