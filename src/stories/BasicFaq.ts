import AHDjs from "../lib/index";
import { createButton } from "./Button";

export const createBasicFaqPage = () => {
  const article = document.createElement("article");

  const slug = "/help-support";  
  const apiUrl = `https://ahd.fabbuilder.com/api/tenant/6639f54c38c61b20b19dd905/faq-group-list?filter[slug]=${slug}&filter[status]=published&limit=10&orderBy=order_ASC`;

  const countDiv = document.createElement("div");
  countDiv.className = "count-display";
 
  const faqDiv = document.createElement("div");  
  faqDiv.className = "faq-list";  

  const onStartFaqClick = async () => {
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const faqData = await response.json();
      console.log("API response count:", faqData.count);

      countDiv.textContent = `Count: ${faqData.count}`;

       faqData.rows.forEach((faqItem) => {
        const questionDiv = document.createElement("div");
        questionDiv.textContent = faqItem.faqs.question;  
        faqDiv.appendChild(questionDiv);
      });

      const _ahdJs = new AHDjs(faqData);
      _ahdJs.start();
    } catch (error) {
      console.error("Failed to start the faq:", error);
      countDiv.textContent = "Failed to load count";
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
  article.appendChild(faqDiv); 

  return article;
};
