document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const categoryContainer = document.getElementById("category-container");
  const subCategoryContainer = document.getElementById("subcategory-container");
  const galleryGrid = document.getElementById("gallery-grid");
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector(".close");

  // State
  let galleryData = {};
  let currentCategory = null;
  let currentImagesList = [];
  let swiperInstance = null;

  // 👇 1. الترتيب اليدوي للأقسام (عدل هنا براحتك)
  // الأقسام اللي بتنكتب هون بتطلع بالأول وبنفس الترتيب
  // أي قسم في الداتا ومو مكتوب هون، بيطلع بالأخير
  const categoryOrder = [
    "تجاليد",
    "دواليب",
    "غرفة نوم",
    "علب حمامات",
    "مكتب",
    "وحدة السلم",
    "وحدة تلفاز",
    "ابواب",
    "صالة",
    "طاولة",
    "علب حائط",
  ];

  // 2. Fetch Data
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      galleryData = data;
      initCategories();
    });

  // 3. Initialize Categories (مع الترتيب المخصص)
  function initCategories() {
    // نجيب كل المفاتيح من الداتا
    let categories = Object.keys(galleryData);

    // دالة الترتيب السحرية
    categories.sort((a, b) => {
      let indexA = categoryOrder.indexOf(a);
      let indexB = categoryOrder.indexOf(b);

      // إذا العنصر غير موجود في القائمة، نعطيه رقم كبير عشان يروح للأخير
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;

      return indexA - indexB;
    });

    // إنشاء الأزرار بناءً على الترتيب الجديد
    categories.forEach((cat, index) => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = cat;
      btn.onclick = () => selectCategory(cat, btn);
      categoryContainer.appendChild(btn);

      // تفعيل أول زر تلقائياً
      if (index === 0) btn.click();
    });
  }

  // 4. Select Main Category
  function selectCategory(category, btnElement) {
    currentCategory = category;
    document
      .querySelectorAll("#category-container .btn")
      .forEach((b) => b.classList.remove("active"));
    btnElement.classList.add("active");

    // استدعاء دالة الأقسام الفرعية (موجودة وشغالة 100%)
    renderSubCategories(category);
  }

  // 5. Render Subcategories (الأقسام الفرعية)
  function renderSubCategories(category) {
    subCategoryContainer.innerHTML = "";

    subCategoryContainer.classList.remove("hidden");
    // زر "الكل"
    const allBtn = document.createElement("button");
    allBtn.className = "btn active";
    allBtn.textContent = "الكل";
    allBtn.onclick = () => filterImages("All", allBtn);
    subCategoryContainer.appendChild(allBtn);

    // جلب المفاتيح الفرعية من الداتا
    if (galleryData[category]) {
      Object.keys(galleryData[category]).forEach((sub) => {
        // تجاهل أي مفتاح يبدأ بـ _ (مثل الإعدادات لو وجد)
        if (!sub.startsWith("_")) {
          const btn = document.createElement("button");
          btn.className = "btn";
          btn.textContent = sub;
          btn.onclick = () => filterImages(sub, btn);
          subCategoryContainer.appendChild(btn);
        }
      });
    }

    // تحميل صور "الكل" كبداية
    loadImages(category, "All");
  }

  // 6. Filter Images
  function filterImages(subCategory, btnElement) {
    document
      .querySelectorAll("#subcategory-container .btn")
      .forEach((b) => b.classList.remove("active"));
    btnElement.classList.add("active");

    loadImages(currentCategory, subCategory);
  }

  // 7. Load Images into Grid
  function loadImages(category, subCategory) {
    galleryGrid.innerHTML = "";
    currentImagesList = [];

    // تجميع الصور حسب الاختيار
    if (subCategory === "All") {
      Object.values(galleryData[category]).forEach((imgs) => {
        currentImagesList = currentImagesList.concat(imgs);
      });
    } else {
      currentImagesList = galleryData[category][subCategory];
    }

    // إنشاء العناصر في الـ Grid
    currentImagesList.forEach((imgSrc, index) => {
      const div = document.createElement("div");
      div.className = "gallery-item";

      const img = document.createElement("img");
      img.src = imgSrc;
      img.setAttribute("loading", "lazy");

      // فحص الأبعاد لتحديد (Wide) و (Tall)
      img.onload = function () {
        const width = this.naturalWidth;
        const height = this.naturalHeight;
        const aspectRatio = width / height;

        if (aspectRatio > 1.3) {
          div.classList.add("wide"); // عريض
        } else if (aspectRatio < 0.8) {
          div.classList.add("tall"); // طويل
        }
      };

      // عند الضغط نفتح المودال
      div.onclick = () => openSwiperModal(index);

      div.appendChild(img);
      galleryGrid.appendChild(div);
    });
  }

  // --- SWIPER MODAL CONFIGURATION ---
  function openSwiperModal(startIndex) {
    // منع سكرول الصفحة الخلفية
    document.body.classList.add("no-scroll");
    modal.style.display = "block";

    if (swiperInstance) {
      swiperInstance.destroy(true, true);
    }

    const swiperWrapper = document.querySelector(".swiper-wrapper");
    swiperWrapper.innerHTML = "";

    // بناء السلايدات
    currentImagesList.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      // إضافة حاوية الزوم
      slide.innerHTML = `<div class="swiper-zoom-container"><img src="${src}"></div>`;
      swiperWrapper.appendChild(slide);
    });

    // إعدادات Swiper (تم إزالة زوم البكرة)
    swiperInstance = new Swiper(".mySwiper", {
      initialSlide: startIndex,
      spaceBetween: 30,

      // التعديل: تفعيل البكرة للتنقل بين الصور فقط (Next/Prev)
      // إذا ما بدك البكرة تعمل شي نهائياً، احذف هذا الجزء
      mousewheel: {
        forceToAxis: true,
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      // إعدادات الزوم: دبل كليك أو Pinch فقط
      zoom: {
        maxRatio: 5,
        minRatio: 1,
        toggle: true, // يسمح بالدبل كليك
      },

      keyboard: {
        enabled: true,
      },
    });
  }

  function closeModal() {
    document.body.classList.remove("no-scroll");
    modal.style.display = "none";
  }

  closeBtn.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target.classList.contains("swiper") || e.target === modal) {
      closeModal();
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
