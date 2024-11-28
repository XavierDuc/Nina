(function () {
  // Remove jQuery dependency, use vanilla JavaScript
  function mauGallery(galleryElement, options) {
    // Default options with reduced complexity
    const defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: "galleryLightbox",
      showTags: true,
      tagsPosition: "bottom",
      navigation: true,
    };

    // Merge options
    const settings = { ...defaults, ...options };
    const tagsCollection = new Set();

    // Performance optimization: Use event delegation
    function initEventListeners() {
      galleryElement.addEventListener("click", handleGalleryClick);
    }

    function handleGalleryClick(event) {
      const target = event.target;

      // Efficient tag filtering
      if (target.matches(".nav-link")) {
        filterByTag(target);
        return;
      }

      // Lightbox handling
      if (settings.lightBox && target.matches(".gallery-item")) {
        openLightBox(target);
      }
    }

    // Lazy loading implementation
    function lazyLoadImages() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.add("loaded");
              observer.unobserve(img);
            }
          });
        },
        { rootMargin: "50px" }
      );

      document.querySelectorAll(".gallery-item[data-src]").forEach((img) => {
        observer.observe(img);
      });
    }

    // Efficient image wrapping
    function wrapImages() {
      const items = galleryElement.querySelectorAll(".gallery-item");
      items.forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.className = `item-column mb-4 col-${Math.ceil(
          12 / settings.columns
        )}`;
        item.parentNode.insertBefore(wrapper, item);
        wrapper.appendChild(item);

        // Collect tags efficiently
        if (settings.showTags) {
          const tag = item.dataset.galleryTag;
          if (tag) tagsCollection.add(tag);
        }
      });
    }

    // Simplified tag rendering
    function renderTags() {
      if (!settings.showTags) return;

      const tagBar = document.createElement("ul");
      tagBar.className = "my-4 tags-bar nav nav-pills";

      // All tag
      const allTag = document.createElement("li");
      allTag.innerHTML =
        '<span class="nav-link active active-tag" data-images-toggle="all">Tous</span>';
      tagBar.appendChild(allTag);

      // Individual tags
      tagsCollection.forEach((tag) => {
        const tagItem = document.createElement("li");
        tagItem.innerHTML = `<span class="nav-link" data-images-toggle="${tag}">${tag}</span>`;
        tagBar.appendChild(tagItem);
      });

      settings.tagsPosition === "bottom"
        ? galleryElement.appendChild(tagBar)
        : galleryElement.insertBefore(tagBar, galleryElement.firstChild);
    }

    function filterByTag(tagElement) {
      const tag = tagElement.dataset.imagesToggle;

      // Remove active states
      document.querySelectorAll(".active-tag").forEach((el) => {
        el.classList.remove("active", "active-tag");
      });
      tagElement.classList.add("active", "active-tag");

      // Efficient filtering
      document.querySelectorAll(".gallery-item").forEach((item) => {
        const column = item.closest(".item-column");
        column.style.display =
          tag === "all" || item.dataset.galleryTag === tag ? "block" : "none";
      });
    }

    function openLightBox(item) {
      const lightbox = document.getElementById(settings.lightboxId);
      const lightboxImage = lightbox.querySelector(".lightboxImage");
      lightboxImage.src = item.src;

      // Toggle lightbox (assuming Bootstrap modal)
      const modal = new bootstrap.Modal(lightbox);
      modal.toggle();
    }

    // Initialize gallery
    function init() {
      wrapImages();
      renderTags();
      initEventListeners();
      lazyLoadImages();
    }

    init();
  }

  // Expose to global scope
  window.mauGallery = mauGallery;
})();
