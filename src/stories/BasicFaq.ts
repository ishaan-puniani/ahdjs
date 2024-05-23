import AHDjs from "../lib/index";
import { createButton } from "./Button";

export const createBasicFaqPage = () => {
  const article = document.createElement("article");

  const pathname = window.location.pathname;
  const apiUrl = `https://ahd.fabbuilder.com/api/tenant/662f60d8b0066ec52c97f190/faq-group-list?filter[slug]=${pathname}&filter[status]=published&limit=10&orderBy=order_ASC`;

  const countDiv = document.createElement("div");
  countDiv.className = "count-display";
  countDiv.textContent = "Loading...";

  const onStartFaqClick = async () => {
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const faqData = await response.json();
      console.log("API response count:", faqData.count);

      countDiv.textContent = `Count: ${faqData.count}`;

      const _ahdJs = new AHDjs(faqData);
      _ahdJs.start();
    } catch (error) {
      console.error("Failed to start the faq:", error);
      }
  };

  const button = createButton({
    size: "small",
    label: "Fetch Faq",
    onClick: onStartFaqClick,
    className: "btn-start-tour",
  });

  article.appendChild(countDiv);
  article.appendChild(button);

  return article;
};
