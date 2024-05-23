
import AHDjs from "../lib/index";
import { createButton } from "./Button";

export const BasicPageView = () => {
  const article = document.createElement("article");

  const apiUrl = `https://ahd.fabbuilder.com/api/tenant/6639f54c38c61b20b19dd905/page`;

  const countDiv = document.createElement("div");
  countDiv.className = "count-display";

  const faqDiv = document.createElement("div");
  faqDiv.className = "faq-list";

  const pageDetailsDiv = document.createElement("div");
  pageDetailsDiv.className = "page-details";

  const onStartPageClick = async () => {
    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const pageData = await response.json();
      console.log("API response count:", pageData.count);

      countDiv.textContent = `Count: ${pageData.count}`;

      const page = pageData.rows[0];
      const { name, metaTitle, slug, metaDescription, heroImage } = page;

      pageDetailsDiv.innerHTML = `
        <p>Name: ${name}</p>
        <p>Meta Title: ${metaTitle}</p>
        <p>Meta Description: ${metaDescription}</p>
        <p>Slug: ${slug}</p>
        <p>Hero Image:</p>
        <img src="${heroImage[0].publicUrl}" alt="Hero Image">
      `;

      const _ahdJs = new AHDjs(pageData);
      _ahdJs.start();
    } catch (error) {
      console.error("Failed to start the faq:", error);
      countDiv.textContent = "Failed to load count";
    }
  };

  const button = createButton({
    size: "small",
    label: "Fetch Page Details",
    onClick: onStartPageClick,
    className: "btn-start-tour",
  });

  article.appendChild(countDiv);
  article.appendChild(button);
  article.appendChild(pageDetailsDiv);
  article.appendChild(faqDiv);

  return article;
};
