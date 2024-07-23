export const BacicAppBanner = () => {
  const article = document.createElement("article");

  async function displayContent() {
    const apiUrl =
      "https://pagepilot.fabbuilder.com/api/tenant/6655bc2b30a6760d8f897581/client/app-banners?filter[isActive]=true";

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const sequences = data.rows;

      const carousels = sequences.filter(
        (sequence) => sequence.type === "carousel"
      );

      const popupContent = sequences.find(
        (sequence) => sequence.type === "popup"
      );

      const carouselContainer = document.createElement("div");
      carouselContainer.style.position = "relative";
      carouselContainer.style.overflow = "hidden";
      carouselContainer.style.width = "100%";
      carouselContainer.style.maxWidth = "1200px";
      carouselContainer.style.margin = "0 auto";

      const slidesContainer = document.createElement("div");
      slidesContainer.style.display = "flex";
      slidesContainer.style.transition = "transform 0.5s ease-in-out";

      carousels.forEach((sequence) => {
        const container = document.createElement("div");
        container.style.position = "relative";
        container.style.textAlign = "center";
        container.style.width = "100%";
        container.style.flex = "0 0 100%";
        container.style.maxWidth = "1200px";
        container.style.margin = "0 auto";
        container.style.overflow = "hidden";

        const imageUrl = sequence.content.image[0].publicUrl;
        const link = sequence.link;

        const imageLink = document.createElement("a");
        imageLink.href = `http://${link}`;
        imageLink.target = "_blank";
        imageLink.style.display = "block";

        const imageElement = document.createElement("img");
        imageElement.src = imageUrl;
        imageElement.alt = sequence.content.title;
        imageElement.style.width = "100%";
        imageElement.style.height = "300px";

        imageLink.appendChild(imageElement);
        container.appendChild(imageLink);

        const contentOverlay = document.createElement("div");
        contentOverlay.innerHTML = `
          <h1>${sequence.content.title}</h1>
          <h3>${sequence.content.content}</h3>
        `;
        contentOverlay.style.position = "absolute";
        contentOverlay.style.top = "50%";
        contentOverlay.style.left = "50%";
        contentOverlay.style.transform = "translate(-50%, -50%)";
        contentOverlay.style.color = "#FFFFFF";
        contentOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        contentOverlay.style.padding = "20px";
        contentOverlay.style.borderRadius = "8px";
        contentOverlay.style.textAlign = "center";
        contentOverlay.style.maxWidth = "90%";

        container.appendChild(contentOverlay);

        if (sequence.buttonText) {
          const buttonLink = document.createElement("a");
          buttonLink.href = `http://${sequence.link}`;
          buttonLink.target = "_blank";

          const button = document.createElement("button");
          button.textContent = sequence.buttonText;
          button.style.color = sequence.buttonTextColor;
          button.style.backgroundColor = sequence.buttonColor;
          button.style.border = "none";
          button.style.padding = "10px 20px";
          button.style.borderRadius = "5px";
          button.style.cursor = "pointer";
          button.style.marginTop = "10px";

          buttonLink.appendChild(button);
          contentOverlay.appendChild(buttonLink);
        }

        slidesContainer.appendChild(container);
      });

      carouselContainer.appendChild(slidesContainer);

      const prevButton = document.createElement("button");
      prevButton.innerHTML = "&#9664;";
      prevButton.style.position = "absolute";
      prevButton.style.top = "50%";
      prevButton.style.left = "10px";
      prevButton.style.transform = "translateY(-50%)";
      prevButton.style.zIndex = "2";
      prevButton.style.background = "none";
      prevButton.style.border = "none";
      prevButton.style.color = "red";
      prevButton.style.fontSize = "24px";
      prevButton.addEventListener("click", () => {
        const currentTransform =
          parseInt(getComputedStyle(slidesContainer).transform.split(",")[4]) ||
          0;
        const slideWidth = (slidesContainer.children[0] as HTMLElement)
          .offsetWidth;
        if (currentTransform < 0) {
          slidesContainer.style.transform = `translateX(${Math.min(
            0,
            currentTransform + slideWidth
          )}px)`;
        }
      });

      const nextButton = document.createElement("button");
      nextButton.innerHTML = "&#9654;";
      nextButton.style.position = "absolute";
      nextButton.style.top = "50%";
      nextButton.style.right = "10px";
      nextButton.style.transform = "translateY(-50%)";
      nextButton.style.zIndex = "2";
      nextButton.style.background = "none";
      nextButton.style.border = "none";
      nextButton.style.color = "red";
      nextButton.style.fontSize = "24px";
      nextButton.addEventListener("click", () => {
        const slideWidth = (slidesContainer.children[0] as HTMLElement)
          .offsetWidth;
        const maxTransform =
          -(slidesContainer.children.length - 1) * slideWidth;
        const currentTransform =
          parseInt(getComputedStyle(slidesContainer).transform.split(",")[4]) ||
          0;
        if (currentTransform > maxTransform) {
          slidesContainer.style.transform = `translateX(${Math.max(
            maxTransform,
            currentTransform - slideWidth
          )}px)`;
        }
      });

      carouselContainer.appendChild(prevButton);
      carouselContainer.appendChild(nextButton);
      article.appendChild(carouselContainer);

      if (popupContent) {
        const popup = createPopup(popupContent);
        article.appendChild(popup);

        let popupVisible = false;
        setInterval(() => {
          if (!popupVisible) {
            popup.style.display = "block";
            popupVisible = true;
          }
        }, 5000);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  function createPopup(popupContent) {
    const popupContainer = document.createElement("div");
    popupContainer.style.position = "fixed";
    popupContainer.style.top = "50%";
    popupContainer.style.left = "50%";
    popupContainer.style.transform = "translate(-50%, -50%)";
    popupContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    popupContainer.style.padding = "20px";
    popupContainer.style.borderRadius = "8px";
    popupContainer.style.color = "#FFFFFF";
    popupContainer.style.zIndex = "9999";
    popupContainer.style.display = "none";

    const imageUrl = popupContent.content.image[0].publicUrl;

    const imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    imageElement.alt = popupContent.content.title;
    imageElement.style.width = "100%";
    imageElement.style.height = "300px";
    imageElement.style.borderRadius = "8px";

    const content = document.createElement("div");
    content.innerHTML = `
      <h1>${popupContent.content.title}</h1>
      <p>${popupContent.content.content}</p>
    `;
    content.style.textAlign = "center";

    popupContainer.appendChild(imageElement);
    popupContainer.appendChild(content);

     if (popupContent.buttonText) {
      const closeButton = document.createElement("button");
      closeButton.textContent = popupContent.buttonText;
      closeButton.style.color = popupContent.buttonTextColor;
      closeButton.style.backgroundColor = popupContent.buttonColor;
      closeButton.style.border = "none";
      closeButton.style.padding = "10px 20px";
      closeButton.style.borderRadius = "5px";
      closeButton.style.cursor = "pointer";
      closeButton.style.marginTop = "10px";
      closeButton.addEventListener("click", () => {
        popupContainer.style.display = "none";
      });

      content.appendChild(closeButton);
    }

    return popupContainer;
  }

  displayContent();

  return article;
};
