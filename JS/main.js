//Плавная, анимированая смена фотографий
let current = 0; 
const slides = document.querySelectorAll('.slide1');

setInterval(() => {
  slides[current].classList.remove('active');
  current = (current + 1) % slides.length;
  slides[current].classList.add('active');
}, 2500); // каждые 2 секунды

//Плавное появление/исчезновение блоков
window.addEventListener('load', () => {
  // Событие 'load' срабатывает ТОЛЬКО после полной загрузки всех ресурсов (включая картинки)
  document.querySelectorAll('.fade-block').forEach(block => {
    block.classList.add('visible');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Убираем наблюдение после появления (опционально)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.4, // сработает, когда 40% блока станет видно
    rootMargin: '0px 0px -50px 0px' // можно добавить отступ снизу (например, -50px)
  });

  // Наблюдаем за всеми блоками с классом fade-in-on-scroll
  document.querySelectorAll('.fade-in-on-scroll').forEach(block => {
    observer.observe(block);
  });
});

//Переключение фотографий через кнопки 
const mainImage = document.getElementById('mainImage');
const buttons = document.querySelectorAll('.image-buttons button');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const newSrc = button.getAttribute('data-img');

    // Если это то же изображение — ничего не делаем
    if (mainImage.src === newSrc) return;

    // Плавно скрываем текущее изображение
    mainImage.classList.add('fade-out');

    // Через 500 мс (время анимации) меняем изображение и показываем его
    setTimeout(() => {
      mainImage.src = newSrc;
      mainImage.alt = button.textContent;
      mainImage.classList.remove('fade-out');
    }, 250);
  });
})

//Slider

document.addEventListener('DOMContentLoaded', () => {

  // === Список изображений ===
  const imageSources = [
    'https://images.uzum.uz/cs6bkvmfh2vj1qtk8tjg/original.jpg',
    'https://ichip.ru/images/cache/2025/7/24/q90_1114412_1c0fdbd5f6fade3e2184a6e99.jpeg',
    'https://content.onliner.by/news/large/8f1505b304561b515d48b06af0f8bbb8.jpg'
  ];

  let currentIndex = 0;
  let isAnimating = false;

  // === Элементы ===
  const gallerySection = document.getElementById('gallery');
  const popupMenu = document.getElementById('popupMenu');
  const slider = document.querySelector('.image-slider');

  // Проверка наличия слайдера
  if (!slider || slider.querySelectorAll('.slide').length < 2) {
    console.error('Ошибка: в .image-slider должно быть два элемента с классом "slide"');
    return;
  }

  let manuallyClosed = false;

  // === Intersection Observer: показ меню при прокрутке к галерее ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!manuallyClosed) {
          popupMenu.classList.add('visible');
        }
      } else {
        popupMenu.classList.remove('visible');
        manuallyClosed = false;
      }
    });
  }, { threshold: 0.3 });

  observer.observe(gallerySection);

  // === Закрытие меню при клике вне его ===
  document.addEventListener('click', (e) => {
    if (!popupMenu.contains(e.target)) {
      popupMenu.classList.remove('visible');
      manuallyClosed = true;
    }
  });

  // === Плавное переключение изображений ===
  function switchImage(newIndex, direction) {
    if (
      isAnimating ||
      newIndex === currentIndex ||
      newIndex < 0 ||
      newIndex >= imageSources.length
    ) {
      return;
    }

    isAnimating = true;
    const newSrc = imageSources[newIndex];

    // 🔍 Динамически находим текущие active и next
    const activeSlide = slider.querySelector('.slide.active');
    const nextSlide = slider.querySelector('.slide.next');

    if (!activeSlide || !nextSlide) {
      console.error('Не найдены слайды с классами .active или .next');
      isAnimating = false;
      return;
    }

    // Предзагрузка изображения
    const img = new Image();
    img.src = newSrc;

    img.onload = () => {
      nextSlide.src = newSrc;

      // Сброс классов и стилей
      activeSlide.className = 'slide';
      nextSlide.className = 'slide';

      if (direction === 'next') {
        // Текущее уезжает ВЛЕВО, новое въезжает СПРАВА
        activeSlide.style.transform = 'translateX(0)';
        nextSlide.style.transform = 'translateX(100%)';
        nextSlide.style.opacity = '1';
        activeSlide.offsetHeight; // триггер рендеринга

        activeSlide.classList.add('animate');
        nextSlide.classList.add('animate');
        activeSlide.style.transform = 'translateX(-100%)';
        nextSlide.style.transform = 'translateX(0)';
      } else {
        // Текущее уезжает ВПРАВО, новое въезжает СЛЕВА
        activeSlide.style.transform = 'translateX(0)';
        nextSlide.style.transform = 'translateX(-100%)';
        nextSlide.style.opacity = '1';
        activeSlide.offsetHeight;

        activeSlide.classList.add('animate');
        nextSlide.classList.add('animate');
        activeSlide.style.transform = 'translateX(100%)';
        nextSlide.style.transform = 'translateX(0)';
      }

      // Завершение анимации
      setTimeout(() => {
        activeSlide.classList.remove('animate');
        nextSlide.classList.remove('animate');
        activeSlide.classList.add('next');     // бывший active → next
        nextSlide.classList.add('active');     // бывший next → active
        currentIndex = newIndex;
        isAnimating = false;
      }, 600);
    };

    img.onerror = () => {
      console.error('Не удалось загрузить изображение:', newSrc);
      isAnimating = false;
    };
  }

  // === Обработка выбора в меню ===
  popupMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const newIndex = parseInt(e.target.getAttribute('data-index'), 10);
      const direction = newIndex > currentIndex ? 'next' : 'prev';
      switchImage(newIndex, direction);
    }
  });

});