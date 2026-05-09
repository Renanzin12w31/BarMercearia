(function () {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  }

  function setupMenu() {
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  function setupReveal() {
    const revealItems = document.querySelectorAll('.reveal');
    if (!revealItems.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px'
    });

    revealItems.forEach((item) => observer.observe(item));
  }

  function setupAddressCopy() {
    const copyButtons = document.querySelectorAll('[data-copy-address]');
    if (!copyButtons.length) return;

    let feedbackTimer;

    function showFeedback(feedback, message) {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.classList.add('is-visible');
      window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(() => {
        feedback.classList.remove('is-visible');
      }, 2200);
    }

    function fallbackCopy(text) {
      const input = document.createElement('textarea');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.top = '-999px';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      return copied;
    }

    copyButtons.forEach((copyButton) => {
      copyButton.addEventListener('click', async () => {
        const address = copyButton.getAttribute('data-copy-address');
        const scope = copyButton.closest('.location-action-row, .contact-card');
        const feedback = scope
          ? scope.querySelector('.location-copy-feedback, .contact-feedback')
          : document.querySelector('.location-copy-feedback, .contact-feedback');
        if (!address) return;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(address);
          } else if (!fallbackCopy(address)) {
            throw new Error('Copy failed');
          }

          showFeedback(feedback, 'Endere\u00e7o copiado.');
        } catch (error) {
          showFeedback(feedback, 'N\u00e3o foi poss\u00edvel copiar.');
        }
      });
    });
  }

  function setupContactPage() {
    const contactPage = document.querySelector('.contact-page');
    if (!contactPage) return;

    const whatsappLink = contactPage.querySelector('[data-contact-whatsapp]');
    const feedback = contactPage.querySelector('.contact-feature .contact-feedback');
    let feedbackTimer;

    function showContactFeedback(message) {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.classList.add('is-visible');
      window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(() => {
        feedback.classList.remove('is-visible');
      }, 2200);
    }

    contactPage.querySelectorAll('[data-wa-message]').forEach((button) => {
      button.addEventListener('click', async () => {
        const message = button.getAttribute('data-wa-message');
        if (!message || !whatsappLink) return;

        whatsappLink.href = `https://wa.me/5515996318154?text=${encodeURIComponent(message)}`;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(message);
            showContactFeedback('Mensagem pronta copiada.');
          } else {
            showContactFeedback('Mensagem pronta selecionada.');
          }
        } catch (error) {
          showContactFeedback('Mensagem pronta selecionada.');
        }
      });
    });

    contactPage.querySelectorAll('.contact-faq-item button').forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.contact-faq-item');
        if (!item) return;

        const isOpen = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
        button.querySelector('[aria-hidden="true"]').textContent = isOpen ? '-' : '+';
      });
    });
  }

  setHeaderState();
  setupMenu();
  setupReveal();
  setupAddressCopy();
  setupContactPage();
  window.addEventListener('scroll', setHeaderState, { passive: true });
})();
