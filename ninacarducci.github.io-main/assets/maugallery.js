(function () {
  // Gallery Manager Class
  class GalleryManager {
    constructor(galleryElement, options = {}) {
      // Default configuration with sensible defaults
      this.config = {
        columns: 3,
        lightBox: true,
        lightboxId: "galleryLightbox",
        showTags: true,
        tagsPosition: "bottom",
        navigation: true,
      };

      // Merge user options with defaults
      this.config = { ...this.config, ...options };
      this.gallery = galleryElement;
      this.tagsCollection = new Set();

      this.init();
    }

    init() {
      this.wrapImages();
      this.renderTags();
      this.setupEventListeners();
      this.lazyLoadImages();
    }

    wrapImages() {
      const items = this.gallery.querySelectorAll(".gallery-item");
      items.forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.className = `item-column mb-4 col-${Math.ceil(
          12 / this.config.columns
        )}`;

        // Wrap the image
        item.parentNode.insertBefore(wrapper, item);
        wrapper.appendChild(item);

        // Collect tags
        if (this.config.showTags) {
          const tag = item.dataset.galleryTag;
          if (tag) this.tagsCollection.add(tag);
        }
      });
    }

    renderTags() {
      if (!this.config.showTags) return;

      const tagBar = document.createElement("ul");
      tagBar.className = "my-4 tags-bar nav nav-pills";

      // All tag
      const allTag = document.createElement("li");
      allTag.innerHTML =
        '<span class="nav-link active active-tag" data-images-toggle="all">Tous</span>';
      tagBar.appendChild(allTag);

      // Individual tags
      this.tagsCollection.forEach((tag) => {
        const tagItem = document.createElement("li");
        tagItem.innerHTML = `<span class="nav-link" data-images-toggle="${tag}">${tag}</span>`;
        tagBar.appendChild(tagItem);
      });

      // Position tags
      this.config.tagsPosition === "bottom"
        ? this.gallery.appendChild(tagBar)
        : this.gallery.insertBefore(tagBar, this.gallery.firstChild);
    }

    setupEventListeners() {
      this.gallery.addEventListener(
        "click",
        this.handleGalleryInteraction.bind(this)
      );
    }

    handleGalleryInteraction(event) {
      const target = event.target;

      // Tag filtering
      if (target.matches(".nav-link")) {
        this.filterByTag(target);
        return;
      }

      // Lightbox
      if (this.config.lightBox && target.matches(".gallery-item")) {
        this.openLightbox(target);
      }
    }

    filterByTag(tagElement) {
      const tag = tagElement.dataset.imagesToggle;

      // Reset active states
      document.querySelectorAll(".active-tag").forEach((el) => {
        el.classList.remove("active", "active-tag");
      });
      tagElement.classList.add("active", "active-tag");

      // Filter images
      document.querySelectorAll(".gallery-item").forEach((item) => {
        const column = item.closest(".item-column");
        column.style.display =
          tag === "all" || item.dataset.galleryTag === tag ? "block" : "none";
      });
    }

    openLightbox(item) {
      const lightbox = document.getElementById(this.config.lightboxId);
      const lightboxImage = lightbox.querySelector(".lightboxImage");
      lightboxImage.src = item.src;

      // Toggle lightbox (Bootstrap modal)
      const modal = new bootstrap.Modal(lightbox);
      modal.toggle();
    }

    lazyLoadImages() {
      // Use native lazy loading with Intersection Observer fallback
      if ("loading" in HTMLImageElement.prototype) {
        document.querySelectorAll(".gallery-item[data-src]").forEach((img) => {
          img.loading = "lazy";
          img.src = img.dataset.src;
        });
      } else {
        // Fallback for browsers without native lazy loading
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
          {
            rootMargin: "50px",
            threshold: 0.1,
          }
        );

        document.querySelectorAll(".gallery-item[data-src]").forEach((img) => {
          observer.observe(img);
        });
      }
    }
  }

  // Expose to global scope
  window.GalleryManager = GalleryManager;
})();

// Usage example
document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  if (gallery) {
    new GalleryManager(gallery);
  }
});
