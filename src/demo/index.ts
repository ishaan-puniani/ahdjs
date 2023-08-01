import ahdjs from "../lib/index";
const tour = [
  {
    element: "h1",
    title: "Try & Buy",
    description:
      "Move to the next step is only possible if user input provided.",

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
    element: "h2",
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
    element: "h3",
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
    element: "h4",
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
    element: "h5",
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
    element: "h6",
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
  //   {
  //     element: "#licensing-models",
  //     position: "top",
  //     boundary: "outer",
  //     class: "beacon-labs64",
  //     tour: tour,
  //   },
  //   {
  //     element: "#try-and-buy",
  //     position: "top-left",
  //     class: "beacon-green",
  //     onClick() {
  //       alert("Beacon clicked");
  //     },
  //   },
  //   {
  //     element: "#pricing-table",
  //     position: "top-right",
  //     class: "beacon-yellow",
  //     tour: [
  //       {
  //         title: "Pricing Table",
  //         description: "Pricing Table beacon clicked.",
  //       },
  //     ],
  //   },
  //   {
  //     element: "#multi-feature",
  //     position: "bottom-left",
  //     boundary: "inner",
  //     class: "beacon-white",
  //     tour: [
  //       {
  //         title: "Multi Feature",
  //         description: "Multi Feature beacon clicked.",
  //       },
  //     ],
  //   },
  {
    element: "h1",
    position: "center",
    class: "beacon-black",
    tour: {
      steps: [
        {
          element: "h1",
          title: "Pay-per-Use",
          description:
            "Pay-per-Use beacon clicked. <br><br><iframe width='100%'  src='https://www.youtube.com/embed/LEEbe9Kp3xs' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",
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

// guideChimp.on("onBeforeChange", (to, from) => {
//   if (from && from.condition && !from.condition()) {
//     return false
//   }
// });

document.querySelector("body").innerHTML = `<h1>Hello World!</h1>
<h2>Hello World!</h2>
<h3>Hello World!</h3>
<h4>Hello World!</h4>
<h5>Hello World!</h5>
<h6>Hello World!</h6>
<div data-beacon="first_beacon"
     data-beacon-position="top"
     data-beacon-boundary="outer"
     data-beacon-tour="mytour"
     
      data-guidechimp-tour="mytour" 
      data-guidechimp-step="1" 
      data-guidechimp-title="Try & Buy" 
      data-guidechimp-description="This licensing model is useful in case you want to distribute secure trial or demo version of your product. Trial licenses are granted for a short time and allow customers to try the product before buying it."
     
     
     >
       First beacon
</div>

`;

const _ahdJs = new ahdjs();
setTimeout(() => {
  _ahdJs.beacons([...beacons, "first_beacon"]);
}, 1000);
console.log("ahdJs", _ahdJs);
