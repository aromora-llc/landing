// Global variables
let translations = {};
let currentLanguage = 'en';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSystem();
    initializeNavigation();
    initializeAnimations();
    initializeContactForm();
    initializeSmoothScrolling();
    initializeImageLoading();
    setCurrentYear();
});

// Language System
async function initializeLanguageSystem() {
    try {
        // Load default English translations
        const response = await fetch('./languages/en.json');
        translations['en'] = await response.json();
        
        // Set up language switcher
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', handleLanguageChange);
            
            // Check for saved language preference
            const savedLanguage = localStorage.getItem('aromoraLanguage');
            if (savedLanguage && translations[savedLanguage]) {
                currentLanguage = savedLanguage;
                languageSelect.value = savedLanguage;
            }
        }
        
        // Apply initial translations
        applyTranslations();
        
    } catch (error) {
        console.log('Language system initialization failed:', error);
        // Fallback to default content if language system fails
    }
}

async function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    
    if (selectedLanguage === currentLanguage) return;
    
    try {
        // Load translations if not already loaded
        if (!translations[selectedLanguage]) {
            const response = await fetch(`./languages/${selectedLanguage}.json`);
            translations[selectedLanguage] = await response.json();
        }
        
        currentLanguage = selectedLanguage;
        localStorage.setItem('aromoraLanguage', selectedLanguage);
        
        // Apply new translations with fade effect
        await animateLanguageChange();
        applyTranslations();
        
    } catch (error) {
        console.error('Failed to load language:', selectedLanguage, error);
        // Reset to previous language
        event.target.value = currentLanguage;
        showNotification('Failed to load language. Please try again.', 'error');
    }
}

function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(key);
        
        if (translation) {
            // Handle different types of elements
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update page title and meta description
    const currentTranslations = translations[currentLanguage];
    if (currentTranslations && currentTranslations.meta) {
        document.title = currentTranslations.meta.title;
        
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && currentTranslations.meta.description) {
            metaDescription.setAttribute('content', currentTranslations.meta.description);
        }
    }
}

function getNestedTranslation(key) {
    const keys = key.split('.');
    let result = translations[currentLanguage];
    
    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return null;
        }
    }
    
    return result;
}

async function animateLanguageChange() {
    const elementsToAnimate = document.querySelectorAll('[data-i18n]');
    
    // Fade out
    elementsToAnimate.forEach(element => {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0.5';
    });
    
    // Wait for fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Fade in
    elementsToAnimate.forEach(element => {
        element.style.opacity = '1';
    });
    
    // Clean up transition styles
    setTimeout(() => {
        elementsToAnimate.forEach(element => {
            element.style.transition = '';
        });
    }, 300);
}

// Navigation
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Animate hamburger
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (hamburger.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = '';
                    span.style.opacity = '';
                }
            });
        });
    }
    
    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        });
    });
    
    // Active link highlighting based on scroll position
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Initial check
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPosition = window.pageYOffset + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Animation System
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Elements to animate
    const elementsToAnimate = document.querySelectorAll([
        '.service-card',
        '.project-card',
        '.feature-card',
        '.team-member',
        '.contact-item',
        '.section-header'
    ].join(','));
    
    elementsToAnimate.forEach(element => {
        element.classList.add('loading');
        observer.observe(element);
    });
    
    // Parallax effect for hero background
    window.addEventListener('scroll', handleParallax);
}

function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const delay = Array.from(element.parentNode.children).indexOf(element) * 100;
            
            setTimeout(() => {
                element.classList.remove('loading');
                element.classList.add('fade-in-up');
            }, delay);
        }
    });
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground && scrolled < window.innerHeight) {
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
    }
}

// Contact Form
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Form validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
        
        // Floating labels
        inputs.forEach(input => {
            if (input.value) {
                input.parentNode.querySelector('label').style.top = '-8px';
            }
        });
    }
}

function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Remove previous error styling
    clearValidationError(event);
    
    // Validation rules
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Apply error styling
    if (!isValid) {
        input.style.borderColor = '#ef4444';
        showInputError(input, errorMessage);
    }
    
    return isValid;
}

function clearValidationError(event) {
    const input = event.target;
    input.style.borderColor = '';
    
    // Remove error message
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

function showInputError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.color = '#ef4444';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.textContent = message;
    
    input.parentNode.appendChild(errorElement);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Validate all inputs
    const inputs = form.querySelectorAll('input, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateInput({ target: input })) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please correct the errors above', 'error');
        return;
    }
    
    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    try {
        // Simulate form submission (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        form.reset();
        
        // Reset floating labels
        inputs.forEach(input => {
            const label = input.parentNode.querySelector('label');
            if (label && !input.value) {
                label.style.top = '';
            }
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Performance optimization: debounced scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll handlers
const debouncedParallax = debounce(handleParallax, 16); // ~60fps
const debouncedNavUpdate = debounce(updateActiveNavLink, 100);

// Replace the direct event listeners
window.removeEventListener('scroll', handleParallax);
window.removeEventListener('scroll', updateActiveNavLink);
window.addEventListener('scroll', debouncedParallax);
window.addEventListener('scroll', debouncedNavUpdate);

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    // ESC key closes mobile menu
    if (event.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const hamburger = document.getElementById('hamburger');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        }
    }
});

// Smooth image loading for better UX
function initializeImageLoading() {
    const images = document.querySelectorAll('img[src]');
    
    images.forEach(img => {
        // Only apply fade-in if image hasn't loaded yet
        if (!img.complete) {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            img.onload = () => {
                img.style.opacity = '1';
            };
        }
    });
}

// Error handling for missing images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Create placeholder for missing images
            this.style.background = 'linear-gradient(135deg, #6366f1, #10b981)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.color = 'white';
            this.style.fontSize = '14px';
            this.style.fontWeight = '500';
            this.alt = 'Image will be added soon';
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMF8xKSIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+SW1hZ2UgY29taW5nIHNvb248L3RleHQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMF8xIiB4MT0iMCIgeTE9IjAiIHgyPSIyMDAiIHkyPSIyMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzYzNjZGMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxMEI5ODEiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
        });
    });
});

// Set current year in footer
function setCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Export functions for potential external use
window.AROMORA = {
    showNotification,
    applyTranslations,
    initializeLanguageSystem,
    setCurrentYear
};