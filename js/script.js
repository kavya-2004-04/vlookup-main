document.addEventListener('DOMContentLoaded', function() {
    // ===== Mobile Menu Toggle =====
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');

    if (hamburger && navbar) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active'); // For hamburger animation
            navbar.classList.toggle('active');    // For sliding menu
        });

        // Close mobile menu when clicking on a link
        const navLinks = navbar.querySelectorAll("a");
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navbar.classList.remove("active");
            });
        });
    }

    // ===== Smooth scrolling for anchor links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Add scroll animation to elements =====
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.service-card, .team-member, .about-image, .about-content');
        const windowHeight = window.innerHeight;

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animated elements
    const animatedElements = document.querySelectorAll('.service-card, .team-member, .about-image, .about-content');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // ===== Sticky header on scroll =====
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }

    // ===== Mission Section Animations =====
    const missionSection = document.querySelector('.mission');
    if (missionSection) {
        const missionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const heading = entry.target.querySelector('.mission-heading');
                    const texts = entry.target.querySelectorAll('.mission-text');
                    if (heading) heading.classList.add('animate');
                    texts.forEach(text => text.classList.add('animate'));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        missionObserver.observe(missionSection);
    }
});
