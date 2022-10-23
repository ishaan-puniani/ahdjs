import "./page.css";
import ahdjs from "../lib/index";
import { createButton } from "./Button";
import { createPage } from "./Page";

const tour = [
  {
    element: "#user-input",
    title: "Try & Buy",
    description:
      "Move to the next step is only possible if user input provided.",
    condition() {
      const input = document.querySelector("#user-input");

      return true;
    },
    triggers: {
      next: {
        element: "#user-input",
        event: "change",
        listener(e) {
          if (e.target.value) {
            alert('User input: "' + e.target.value + '"');
            this.next();
          }
        },
      },
    },
  },
  {
    element: "#subscription",
    title: "Subscription",
    description:
      "Subscription licensing model allows user to enable product for a specific period of time, with the possibility of the subscription renewal.",
    buttons: [
      {
        title: "See more",
        class: "tour-button",
        onClick: function () {
          alert("Step button click");
        },
      },
    ],
  },
  {
    element: "#pricing-table",
    title: "Pricing Table",
    description:
      "Price and package in minutes without having to re-code or re-engineer back-office systems.",
    buttons: [
      {
        title: "See more",
        class: "tour-button",
        onClick: function () {
          alert("Step button click");
        },
      },
    ],
  },
  {
    element: "#multi-feature",
    title: "Multi Feature",
    description:
      "This licensing model allows enabling or disabling product features on the users needs and budget. It may be used to create an upgrade path from a “lite” version to “standard,” “pro,” “enterprise” etc. versions without modifying the software or uninstalling the existing version.",
    buttons: [
      {
        title: "See more",
        class: "tour-button",
        onClick: function () {
          alert("Step button click");
        },
      },
    ],
  },
  {
    element: "#node-locked",
    title: "Node-Locked",
    description:
      "Software is licensed for use only on one or more named computer systems. Usually, CPU serial number verification is used to enforce this type of license.",
    buttons: [
      {
        title: "See more",
        class: "tour-button",
        onClick: function () {
          alert("Step button click");
        },
      },
    ],
  },
  {
    element: "#pay-per-use",
    title: "Pay-per-Use",
    description:
      "Limits the quantity of the license uses, in addition to the license validity. License fees are based on the actual usage.",
    buttons: [
      {
        title: "See more",
        class: "tour-button",
        onClick: function () {
          alert("Step button click");
        },
      },
    ],
  },
];

const beacons = [
  {
    element: "#user-input",
    position: "top",
    boundary: "outer",
    class: "beacon-labs64",
    tour: tour,
  },
  {
    element: "#try-and-buy",
    position: "top-left",
    class: "beacon-green",
    onClick() {
      alert("Beacon clicked");
    },
  },
  {
    element: "#pricing-table",
    position: "top-right",
    class: "beacon-yellow",
    tour: [
      {
        title: "Pricing Table",
        description: "Pricing Table beacon clicked.",
      },
    ],
  },
  {
    element: "#multi-feature",
    position: "bottom-left",
    boundary: "inner",
    class: "beacon-white",
    tour: [
      {
        title: "Multi Feature",
        description: "Multi Feature beacon clicked.",
      },
    ],
  },
  {
    element: "#pay-per-use",
    position: "center",
    class: "beacon-black",
    tour: {
      steps: [
        {
          element: "#pay-per-use",
          title: "Pay-per-Use",
          description: "Pay-per-Use beacon clicked.",
        },
      ],
      options: {
        position: "top",
      },
    },
    canShow() {
      return true;
    },
  },
];

export const createBeaconFeaturePage = () => {
  const article = createPage();
  const onStartTourClick = () => {
    const _ahdJs = new ahdjs();
    _ahdJs.beacons(beacons);
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
