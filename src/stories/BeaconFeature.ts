import "./page.css";
import AHDjs from "../lib/index";
import { createButton } from "./Button";
import { createPage } from "./Page";
import { TRIGGER_EVENTS, ANIMATION_TYPES, TRIGGER_MODE, ICON_TYPE } from "../lib/utils/constants";


const response = {
  "status": "live",
  "steps": [
    {
      "triggerIcon": {
        "color": "#4F46E5",
        "opacity": 100,
        "isAnimated": false,
        "type": "beacon"
      },
      "triggerLabel": {
        "color": "#ffffff",
        "text": "200"
      },
      "imageUrls": [],
      "includeExpressions": false,
      "isActive": false,
      "_id": "68ba793c65f8872e7a7aa491",
      "title": "add your title",
      "selector": "#tooltips",
      "language": null,
      "tenant": "633bd6d693b46a69ab83ddff",
      "createdBy": "633bd70493b46a070183de04",
      "updatedBy": "633bd70493b46a070183de04",
      "audio": [],
      "animation": [],
      "image": [],
      "video": [],
      "createdAt": "2025-09-05T05:46:36.008Z",
      "updatedAt": "2025-09-05T10:47:13.248Z",
      "__v": 0,
      "animationType": "fadeIn",
      "content": "<!DOCTYPE html><html><body><div style=\"padding:32px 0;background-color:#F5F5F5;min-height:100%\"><div style=\"background-color:#F5F5F5;color:#262626;font-family:&quot;Helvetica Neue&quot;, &quot;Arial Nova&quot;, &quot;Nimbus Sans&quot;, Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;min-height:100%;width:100%\"><table align=\"center\" width=\"100%\" style=\"margin:0 auto;max-width:350px;background-color:#de3131;border:1px solid #6c0596\" role=\"presentation\" cellSpacing=\"0\" cellPadding=\"0\" border=\"0\"><tbody><tr style=\"width:100%\"><td><div style=\"color:#f7f7f7;font-weight:normal;padding:16px 24px 16px 24px\"><strong style=\"margin: 0px; padding: 0px; font-family: &quot;Open Sans&quot;, Arial, sans-serif; text-align: justify;\">Lorem Ipsum</strong><span style=\"font-family: &quot;Open Sans&quot;, Arial, sans-serif; text-align: justify;\">&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span></div></td></tr></tbody></table></div></div></body></html>",
      "contentMetadata": {
        "document": {
          "root": {
            "type": "EmailLayout",
            "data": {
              "maxWidth": "350px",
              "backdropColor": "#F5F5F5",
              "borderColor": "#6c0596",
              "padding": 10,
              "canvasColor": "#de3131",
              "textColor": "#262626",
              "fontFamily": "MODERN_SANS",
              "childrenIds": ["block-1757051285139"],
              "behaviour": {
                "triggerBehaviour": "onClick",
                "triggerIcon": {
                  "color": "#4F46E5",
                  "opacity": 100,
                  "isAnimated": false,
                  "type": "beacon"
                },
                "triggerLabel": {
                  "text": "200",
                  "backgroundColor": "#000000",
                  "color": "#ffffff"
                },
                "triggerMode": "icon",
                "animatedBeacon": false,
                "animationType": "fadeIn",
                "delay": 300,
                "dismissSettings": "onOutSideClick",
                "isCaret": true,
                "isBackdrop": true,
                "position": "right",
                "selector": "#tooltips"
              }
            }
          },
          "block-1757051285139": {
            "type": "Text",
            "data": {
              "style": {
                "color": "#f7f7f7",
                "fontWeight": "normal",
                "padding": {
                  "top": 16,
                  "bottom": 16,
                  "right": 24,
                  "left": 24
                }
              },
              "props": {
                "text": "<strong style=\"margin: 0px; padding: 0px; font-family: &quot;Open Sans&quot;, Arial, sans-serif; text-align: justify;\">Lorem Ipsum</strong><span style=\"font-family: &quot;Open Sans&quot;, Arial, sans-serif; text-align: justify;\">&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</span>"
              }
            }
          }
        }
      },
      "delay": 300,
      "isBackdrop": true,
      "isCaret": true,
      "position": "right",
      "triggerMode": "icon",
      "id": "68ba793c65f8872e7a7aa491"
    }
  ],
  "_id": "68ba793d65f8878a5d7aa493",
  "type": "tooltip",
  "name": "Test",
  "selector": "#user-input",
  "device": "desktop",
  "language": "hindi",
  "slug": "app-banner",
  "tenant": "633bd6d693b46a69ab83ddff",
  "createdBy": "633bd70493b46a070183de04",
  "updatedBy": "633bd70493b46a070183de04",
  "createdAt": "2025-09-05T05:46:37.502Z",
  "updatedAt": "2025-09-05T10:47:15.149Z",
  "__v": 0,
  "id": "68ba793d65f8878a5d7aa493"
}

const tour = [
  {
    element: "#user-input",
    title: "Try & Buy",
    description:
      "Move to the next step is only possible if user input provided.",
    // condition() {
    //   const input = document.querySelector("#user-input");

    //   return true;
    // },
    animationType: ANIMATION_TYPES.fadeIn,
    delay: 200,
    isBackdrop: true,
    isCaret: true,
    // triggers: {
    //   next: {
    //     element: "#user-input",
    //     event: "change",
    //     listener(e) {
    //       if (e.target.value) {
    //         alert('User input: "' + e.target.value + '"');
    //         this.next();
    //       }
    //     },
    //   },
    // },
  },
  // {
  //   element: "#subscription",
  //   title: "Subscription",
  //   description:
  //     "Subscription licensing model allows user to enable product for a specific period of time, with the possibility of the subscription renewal.",
  //   buttons: [
  //     {
  //       title: "See more",
  //       class: "tour-button",
  //       onClick: function () {
  //         alert("Step button click");
  //       },
  //     },
  //   ],
  // },
  // {
  //   element: "#pricing-table",
  //   title: "Pricing Table",
  //   description:
  //     "Price and package in minutes without having to re-code or re-engineer back-office systems.",
  //   buttons: [
  //     {
  //       title: "See more",
  //       class: "tour-button",
  //       onClick: function () {
  //         alert("Step button click");
  //       },
  //     },
  //   ],
  // },
  // {
  //   element: "#multi-feature",
  //   title: "Multi Feature",
  //   description:
  //     "This licensing model allows enabling or disabling product features on the users needs and budget. It may be used to create an upgrade path from a “lite” version to “standard,” “pro,” “enterprise” etc. versions without modifying the software or uninstalling the existing version.",
  //   buttons: [
  //     {
  //       title: "See more",
  //       class: "tour-button",
  //       onClick: function () {
  //         alert("Step button click");
  //       },
  //     },
  //   ],
  // },
  // {
  //   element: "#node-locked",
  //   title: "Node-Locked",
  //   description:
  //     "Software is licensed for use only on one or more named computer systems. Usually, CPU serial number verification is used to enforce this type of license.",
  //   buttons: [
  //     {
  //       title: "See more",
  //       class: "tour-button",
  //       onClick: function () {
  //         alert("Step button click");
  //       },
  //     },
  //   ],
  // },
  // {
  //   element: "#pay-per-use",
  //   title: "Pay-per-Use",
  //   description:
  //     "Limits the quantity of the license uses, in addition to the license validity. License fees are based on the actual usage.",
  //   buttons: [
  //     {
  //       title: "See more",
  //       class: "tour-button",
  //       onClick: function () {
  //         alert("Step button click");
  //       },
  //     },
  //   ],
  // },
];

const beacons = [
  {
    element: "#user-input",
    position: "top",
    boundary: "outer",
    class: "beacon-labs64",
    tour: tour,
    triggerIcon: {
      type: ICON_TYPE.info,
      color: "white",
      opacity: "0.8",
      isAnimated: true //isAnimatedBeacon
    },
    trigger: TRIGGER_EVENTS.onHover,
    triggerMode: TRIGGER_MODE.icon
  },
  {
    element: ".widget-video",
    position: "top-left",
    class: "beacon-green",
    onClick() {
      alert("Beacon clicked");
    },
    // tour: tour,
    triggerLabel: {
      text: 'my content',
      color: "#000", //icon color
      // opacity: "0.8",
      background: "red",
    },
    triggerMode: TRIGGER_MODE.label
  },
  // {
  //   element: "#pricing-table",
  //   position: "top-right",
  //   class: "beacon-yellow",
  //   tour: [
  //     {
  //       title: "Pricing Table",
  //       description: "Pricing Table beacon clicked.",
  //     },
  //   ],
  // },
  // {
  //   element: "#multi-feature",
  //   position: "bottom-left",
  //   boundary: "inner",
  //   class: "beacon-white",
  //   tour: [
  //     {
  //       title: "Multi Feature",
  //       description: "Multi Feature beacon clicked.",
  //     },
  //   ],
  // },
  // {
  //   element: "#pay-per-use",
  //   position: "center",
  //   class: "beacon-black",
  //   tour: {
  //     steps: [
  //       {
  //         element: "#pay-per-use",
  //         title: "Pay-per-Use",
  //         description: "Pay-per-Use beacon clicked.",
  //       },
  //     ],
  //     options: {
  //       position: "top",
  //     },
  //   },
  //   canShow() {
  //     return true;
  //   },
  // },
];

const bea = Array.isArray(response.steps)
  ? response.steps
    .filter((step: any) => !!step.content)
    .map((step: any) => {
      const behavior = step.contentMetadata?.document?.root?.data?.behaviour || {};

      const tourSteps = [{
        element: step.selector || "#default-element",
        title: step.title || "Default Title",
        description:step.content,
        animationType: ANIMATION_TYPES[step.animationType as keyof typeof ANIMATION_TYPES] || ANIMATION_TYPES.fadeIn,
        delay: step.delay || behavior.delay || 300,
        isBackdrop: step.isBackdrop !== undefined ? step.isBackdrop : (behavior.isBackdrop !== undefined ? behavior.isBackdrop : true),
        isCaret: step.isCaret !== undefined ? step.isCaret : (behavior.isCaret !== undefined ? behavior.isCaret : true),
        position: step.position || behavior.position || "right"
      }];

      const beacon: any = {
        element: step.selector || behavior.selector || "#default-element",
        position: step.position || behavior.position || "right",
        boundary: "outer",
        class: "beacon-green",
        triggerMode: (step.triggerMode || behavior.triggerMode) === "icon" ? TRIGGER_MODE.icon : TRIGGER_MODE.label,
        trigger: (step.triggerBehaviour || behavior.triggerBehaviour) === "onClick" ? TRIGGER_EVENTS.onClick : TRIGGER_EVENTS.onHover,
        tour: tourSteps
      };

      const triggerIconData = step.triggerIcon || behavior.triggerIcon;
      const triggerLabelData = step.triggerLabel || behavior.triggerLabel;

      if (beacon.triggerMode === TRIGGER_MODE.icon && triggerIconData) {
        // Map the icon type to your constants
        let iconType = ICON_TYPE.beacon; // default
        if (triggerIconData.type === "info") iconType = ICON_TYPE.info;
        if (triggerIconData.type === "warning") iconType = ICON_TYPE.warning;
        if (triggerIconData.type === "helpIcon") iconType = ICON_TYPE.helpIcon;

        beacon.triggerIcon = {
          type: iconType,
          color: triggerIconData.color || "#000000",
          opacity: triggerIconData.opacity ? (triggerIconData.opacity / 100) : 1,
          isAnimated: triggerIconData.isAnimated || false
        };
      } else if (beacon.triggerMode === TRIGGER_MODE.label && triggerLabelData) {
        beacon.triggerLabel = {
          text: triggerLabelData.text || step.title || "Click me",
          color: triggerLabelData.color || "#000000",
          background: triggerLabelData.backgroundColor || "#ffffff"
        };
      }

      return beacon;
    })
  : [];



export const createBeaconFeaturePage = () => {
  const article = createPage();
  const onStartTourClick = () => {
    const _ahdJs = AHDjs();

    _ahdJs.setBeacons(bea);

    // _ahdJs.beacons(beacons);
    _ahdJs.start();
  };
  article.appendChild(
    createButton({
      size: "small",
      label: "Start Beacons",
      onClick: onStartTourClick,
      className: "btn-start-tour",
    })
  );

  return article;
};
