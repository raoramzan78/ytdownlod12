// DOM Elements
const videoUrlInput = document.getElementById('video-url');
const getThumbnailBtn = document.getElementById('get-thumbnail');
const thumbnailsContainer = document.querySelector('.thumbnails-container');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const results = document.getElementById('results');
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const accordionItems = document.querySelectorAll('.accordion-item');

// Configuration
const LOADING_DELAY = 18000; // 18 seconds loading delay
const DEFAULT_FILENAME = "RAO RAMZAN YT DOWNLOADER";

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme based on saved preference
    initTheme();
    
    // Initialize animations
    animateOnScroll();
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Get thumbnail button
    if (getThumbnailBtn) {
        getThumbnailBtn.addEventListener('click', handleGetThumbnail);
    }
    
    // Enter key in input field
    if (videoUrlInput) {
        videoUrlInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleGetThumbnail();
            }
        });
    }
    
    // Example URL click handler
    const exampleLinks = document.querySelectorAll('.url-example');
    exampleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (videoUrlInput) {
                videoUrlInput.value = link.dataset.url;
                handleGetThumbnail();
            }
        });
    });
    
    // Accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            accordionItem.classList.toggle('active');
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});

// Initialize theme based on saved preference
function initTheme() {
    const savedTheme = localStorage.getItem('dark-mode');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-mode');
        updateThemeIcons(true);
    } else {
        updateThemeIcons(false);
    }
}

// Toggle theme function
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dark-mode', isDarkMode);
    updateThemeIcons(isDarkMode);
    
    // Show toast notification
    const message = isDarkMode ? 'Dark mode enabled' : 'Light mode enabled';
    showToast(message, 'info');
}

// Update theme icons visibility
function updateThemeIcons(isDarkMode) {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    
    themeToggles.forEach(toggle => {
        const moonIcon = toggle.querySelector('.fa-moon');
        const sunIcon = toggle.querySelector('.fa-sun');
        
        if (isDarkMode) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
        } else {
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
        }
    });
}

// Initialize Loading Progress Bar
function initLoadingProgress() {
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.value = 0;
    }
}

// Update Loading Progress
function updateLoadingProgress(percent) {
    const progressBar = document.getElementById('loading-progress');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        progressBar.value = percent;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(percent)}%`;
    }
}

// Add animation to elements when they come into view
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const staggerContainers = document.querySelectorAll('.stagger-animation');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        observer.observe(element);
    });
    
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    staggerContainers.forEach(container => {
        staggerObserver.observe(container);
    });
}

// Lazy load images for better performance
function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// Handle Get Thumbnail
function handleGetThumbnail() {
    const videoUrl = videoUrlInput.value.trim();
    
    if (!videoUrl) {
        showError('Please enter a YouTube video URL');
        return;
    }
    
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
        showError('Invalid YouTube URL. Please enter a valid YouTube video URL');
        return;
    }
    
    showLoader();
    hideError();
    
    // Clear previous results
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
    }
    
    // Simulate loading with progress
    simulateLoading(videoId);
}

// Simulate loading with progress bar
function simulateLoading(videoId) {
    const loadingProgress = document.getElementById('loading-progress');
    const progressText = document.getElementById('progress-text');
    
    if (!loadingProgress || !progressText) {
        // Fallback if elements don't exist
        setTimeout(() => {
            hideLoader();
            getThumbnails(videoId);
        }, LOADING_DELAY);
        return;
    }
    
    let progress = 0;
    const interval = 100; // Update every 100ms
    const steps = LOADING_DELAY / interval;
    const increment = 100 / steps;
    
    const progressInterval = setInterval(() => {
        progress += increment;
        const roundedProgress = Math.min(Math.round(progress), 100);
        loadingProgress.value = roundedProgress;
        progressText.textContent = `${roundedProgress}%`;
        
        if (roundedProgress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                hideLoader();
                getThumbnails(videoId);
            }, 500);
        }
    }, interval);
}

// Extract Video ID from URL
function extractVideoId(url) {
    // Regular expressions to match different YouTube URL formats
    const regexps = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/[^\/]+\/?\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/i
    ];
    
    for (const regexp of regexps) {
        const match = url.match(regexp);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// Create thumbnail cards with proper download functionality and preview
function createThumbnailCard(thumbnail, videoTitle) {
    const card = document.createElement('div');
    card.className = 'thumbnail-card premium-card animate-on-scroll';
    
    const imgContainer = document.createElement('div');
    imgContainer.className = 'thumbnail-img-container';
    
    const img = document.createElement('img');
    img.className = 'thumbnail-img lazy-load';
    img.dataset.src = thumbnail.url; // For lazy loading
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E'; // Tiny placeholder
    img.alt = `${videoTitle} - ${thumbnail.name}`;
    
    // Add preview functionality
    img.addEventListener('click', () => {
        openPreviewModal(thumbnail.url, videoTitle, thumbnail.name, thumbnail.size);
    });
    
    const details = document.createElement('div');
    details.className = 'thumbnail-details';
    
    const title = document.createElement('h3');
    title.textContent = thumbnail.name;
    
    const quality = document.createElement('span');
    quality.className = 'thumbnail-quality';
    quality.textContent = thumbnail.size;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn-primary btn-download';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    downloadBtn.addEventListener('click', () => {
        downloadThumbnail(thumbnail.url, `RAO RAMZAN YT DOWNLOADER_${thumbnail.size}.jpg`);
    });
    
    const previewBtn = document.createElement('button');
    previewBtn.className = 'btn-secondary btn-preview';
    previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
    previewBtn.addEventListener('click', () => {
        openPreviewModal(thumbnail.url, videoTitle, thumbnail.name, thumbnail.size);
    });
    
    const overlay = document.createElement('div');
    overlay.className = 'thumbnail-overlay';
    
    const overlayButtons = document.createElement('div');
    overlayButtons.className = 'overlay-buttons';
    
    const overlayDownload = document.createElement('button');
    overlayDownload.className = 'overlay-btn';
    overlayDownload.innerHTML = '<i class="fas fa-download"></i>';
    overlayDownload.title = 'Download';
    overlayDownload.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadThumbnail(thumbnail.url, `RAO RAMZAN YT DOWNLOADER_${thumbnail.size}.jpg`);
    });
    
    const overlayPreview = document.createElement('button');
    overlayPreview.className = 'overlay-btn';
    overlayPreview.innerHTML = '<i class="fas fa-search-plus"></i>';
    overlayPreview.title = 'Preview';
    overlayPreview.addEventListener('click', (e) => {
        e.stopPropagation();
        openPreviewModal(thumbnail.url, videoTitle, thumbnail.name, thumbnail.size);
    });
    
    overlayButtons.appendChild(overlayDownload);
    overlayButtons.appendChild(overlayPreview);
    overlay.appendChild(overlayButtons);
    
    imgContainer.appendChild(img);
    imgContainer.appendChild(overlay);
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(previewBtn);
    
    details.appendChild(title);
    details.appendChild(quality);
    details.appendChild(buttonContainer);
    
    card.appendChild(imgContainer);
    card.appendChild(details);
    
    return card;
}

// Download Thumbnail Function with proper naming
function downloadThumbnail(url, filename) {
    // Show loading indicator
    const loadingToast = showToast('Preparing download...', 'info');
    
    // Create a temporary anchor element
    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.setAttribute('download', filename);
    tempLink.setAttribute('target', '_blank');
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    
    // Click the link to trigger download
    tempLink.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(tempLink);
        hideToast(loadingToast);
        showToast('Download complete!', 'success');
    }, 1000);
}

// Create and open preview modal
function openPreviewModal(imageUrl, videoTitle, qualityName, qualitySize) {
    // Remove any existing modal
    const existingModal = document.querySelector('.preview-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'preview-modal-content';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'preview-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'preview-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = videoTitle;
    
    const modalQuality = document.createElement('div');
    modalQuality.className = 'preview-quality';
    modalQuality.textContent = qualityName;
    
    const modalImage = document.createElement('img');
    modalImage.src = imageUrl;
    modalImage.alt = `${videoTitle} - ${qualityName}`;
    modalImage.className = 'preview-image';
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'preview-footer';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn-primary';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download this thumbnail';
    downloadBtn.addEventListener('click', () => {
        downloadThumbnail(imageUrl, `RAO RAMZAN YT DOWNLOADER_${qualitySize}.jpg`);
        // Don't close modal after download to allow multiple downloads
    });
    
    // Assemble modal
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    modalFooter.appendChild(modalQuality);
    modalFooter.appendChild(downloadBtn);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalImage);
    modalContent.appendChild(modalFooter);
    
    modal.appendChild(modalContent);
    
    // Add modal to DOM
    document.body.appendChild(modal);
    
    // Add event listener to close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add keyboard event to close modal with Escape key
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
    
    // Show success toast
    showToast(`Previewing ${qualityName} thumbnail`, 'info');
}

// Get Thumbnails
function getThumbnails(videoId) {
    const thumbnailQualities = [
        { name: 'Standard Quality (450p)', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, size: '450p' },
        { name: 'HD Quality (760p)', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, size: '760p' },
        { name: 'Full HD (1080p)', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '1080p' },
        { name: '2K Quality', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '2K' },
        { name: '4K Quality', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, size: '4K' }
    ];
    
    // Fetch video title using oEmbed API
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch video title');
            }
            return response.json();
        })
        .then(data => {
            const videoTitle = data.title;
            
            // Create and append thumbnail cards
            thumbnailQualities.forEach(thumbnail => {
                const card = createThumbnailCard(thumbnail, videoTitle);
                if (thumbnailsContainer) {
                    thumbnailsContainer.appendChild(card);
                }
            });
            
            // Show results section
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
            // Initialize lazy loading for the new images
            lazyLoadImages();
            
            // Re-initialize animations for the new elements
            animateOnScroll();
            
            // Show success message
            showToast('Thumbnails loaded successfully!', 'success');
        })
        .catch(error => {
            console.error('Error fetching video title:', error);
            
            // Create and append thumbnail cards without title
            thumbnailQualities.forEach(thumbnail => {
                const card = createThumbnailCard(thumbnail, 'YouTube Video');
                if (thumbnailsContainer) {
                    thumbnailsContainer.appendChild(card);
                }
            });
            
            // Show results section
            const resultsSection = document.getElementById('results');
            if (resultsSection) {
                resultsSection.style.display = 'block';
            }
            
            // Initialize lazy loading for the new images
            lazyLoadImages();
            
            // Re-initialize animations for the new elements
            animateOnScroll();
            
            // Show warning message
            showToast('Thumbnails loaded, but video title could not be fetched.', 'info');
        });
}

// Toast notification system for better UX
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    // Add to DOM
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    document.querySelector('.toast-container').appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds for success/info messages
    if (type !== 'error') {
        setTimeout(() => {
            hideToast(toast);
        }, 3000);
    } else {
        // Add close button for error messages
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => hideToast(toast));
        toast.appendChild(closeBtn);
    }
    
    return toast;
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        
        // Remove container if empty
        const container = document.querySelector('.toast-container');
        if (container && container.children.length === 0) {
            container.parentNode.removeChild(container);
        }
    }, 300);
}

// Show Loader
function showLoader() {
    if (loader) {
        loader.style.display = 'flex';
    }
}

// Hide Loader
function hideLoader() {
    if (loader) {
        loader.style.display = 'none';
    }
}

// Show Error
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

// Hide Error
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}
