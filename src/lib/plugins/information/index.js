import Information from "./Information";
import "./assets/style.scss";

export default (Class, factory) => {
  // eslint-disable-next-line no-param-reassign
  factory.information = (informations, options = {}) =>
    new (class extends Information {
      getDataInformation(ids) {
        const data = super.getDataInformation(ids);

        data.forEach((information) => {
          const { id, element: el } = information;

          let tour = "";

          const dataGlobalTourAttrName = `${this.constructor.getInformationDataPrefix()}-tour`;
          const dataInformationTourAttrName = `${this.constructor.getInformationDataPrefix()}-${id}-tour`;

          if (el.attributes[dataGlobalTourAttrName]) {
            const { value } = el.attributes[dataGlobalTourAttrName];
            tour = value;
          }

          if (el.attributes[dataInformationTourAttrName]) {
            const { value } = el.attributes[dataInformationTourAttrName];
            tour = value;
          }

          if (tour) {
            // eslint-disable-next-line no-param-reassign
            information.tour = tour;
            information
          }
        });

        return data;
      }

      createInformationEl(information) {
        const el = super.createInformationEl(information);

        if (information.tour) {
          el.addEventListener("click", () => {
            let guide = null;

            if (typeof information.tour === "string" || Array.isArray(information.tour)) {
              guide = new Class(information.tour);
            } else if (information.tour instanceof Class) {
              guide = information.tour;
            } else if (typeof information.tour === "object") {
              const { steps, options: tourOptions } = information.tour;
              guide = new Class(steps, tourOptions);
            }

            if (guide) {
              guide.start();
            }
          });
        }

        return el;
      }
    })(informations, options);
};
