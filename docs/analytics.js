// Enhanced Google Analytics 4 Tracking for The Fire Hacker
// Track detailed page views, sections, and user interactions

// Initialize enhanced tracking after page load
document.addEventListener('DOMContentLoaded', function() {
    
    // Track page sections viewed
    const sections = document.querySelectorAll('.hero-section, .recent-posts, .til-grid, .project-cards, .about-container');
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = getSectionName(entry.target);
                gtag('event', 'section_view', {
                    'section_name': sectionName,
                    'page_title': document.title,
                    'page_location': window.location.href
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Track blog post card clicks
    document.querySelectorAll('.post-card a, .til-card').forEach(element => {
        element.addEventListener('click', function(e) {
            const cardTitle = this.closest('.post-card, .til-card').querySelector('h3, strong')?.textContent || 'Unknown';
            const cardType = this.closest('.post-card') ? 'blog_post' : 'til_card';
            
            gtag('event', 'card_click', {
                'card_type': cardType,
                'card_title': cardTitle,
                'link_url': this.href || window.location.href
            });
        });
    });

    // Track project card interactions
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const projectName = this.querySelector('h4')?.textContent || 'Unknown Project';
            gtag('event', 'project_card_click', {
                'project_name': projectName
            });
        });
    });

    // Track CTA button clicks
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            gtag('event', 'cta_click', {
                'button_text': buttonText,
                'button_type': this.classList.contains('btn-primary') ? 'primary' : 'secondary'
            });
        });
    });

    // Track social links
    document.querySelectorAll('.social-link, .navbar-nav a[href*="github"], .navbar-nav a[href*="twitter"]').forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.href.includes('github') ? 'github' : 
                            this.href.includes('twitter') ? 'twitter' : 
                            this.href.includes('x.com') ? 'twitter' : 'other';
            
            gtag('event', 'social_click', {
                'platform': platform,
                'link_url': this.href
            });
        });
    });

    // Track navigation clicks
    document.querySelectorAll('.navbar-nav .nav-link').forEach(navLink => {
        navLink.addEventListener('click', function() {
            const navText = this.textContent.trim();
            gtag('event', 'navigation_click', {
                'nav_item': navText,
                'destination_url': this.href
            });
        });
    });

    // Track scroll depth
    let maxScroll = 0;
    let scrollDepthSent = {25: false, 50: false, 75: false, 90: false};
    
    window.addEventListener('scroll', throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
        }

        // Send scroll depth events
        Object.keys(scrollDepthSent).forEach(depth => {
            if (scrollPercent >= parseInt(depth) && !scrollDepthSent[depth]) {
                scrollDepthSent[depth] = true;
                gtag('event', 'scroll_depth', {
                    'scroll_depth': parseInt(depth),
                    'page_title': document.title
                });
            }
        });
    }, 1000));

    // Track time on page
    const startTime = Date.now();
    let timeTracked = false;

    // Send time on page when user leaves
    window.addEventListener('beforeunload', function() {
        if (!timeTracked) {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            gtag('event', 'time_on_page', {
                'time_seconds': timeOnPage,
                'page_title': document.title,
                'max_scroll_depth': maxScroll
            });
            timeTracked = true;
        }
    });

    // Also track time on page after 30 seconds for engaged users
    setTimeout(() => {
        if (!timeTracked && maxScroll > 25) {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            gtag('event', 'engaged_time', {
                'time_seconds': timeOnPage,
                'page_title': document.title,
                'scroll_depth': maxScroll
            });
        }
    }, 30000);

    // Track file downloads (if any)
    document.querySelectorAll('a[href$=".pdf"], a[href$=".zip"], a[href$=".doc"], a[href$=".docx"]').forEach(link => {
        link.addEventListener('click', function() {
            const fileName = this.href.split('/').pop();
            gtag('event', 'file_download', {
                'file_name': fileName,
                'file_url': this.href
            });
        });
    });

    // Track external link clicks
    document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])').forEach(link => {
        link.addEventListener('click', function() {
            const domain = new URL(this.href).hostname;
            gtag('event', 'external_link_click', {
                'link_domain': domain,
                'link_url': this.href,
                'link_text': this.textContent.trim()
            });
        });
    });
});

// Helper function to get section name
function getSectionName(element) {
    if (element.classList.contains('hero-section')) return 'hero';
    if (element.classList.contains('recent-posts')) return 'recent_posts';
    if (element.classList.contains('til-grid')) return 'today_i_learned';
    if (element.classList.contains('project-cards')) return 'projects';
    if (element.classList.contains('about-container')) return 'about';
    
    // Fallback: use closest heading or class name
    const heading = element.querySelector('h1, h2, h3');
    if (heading) return heading.textContent.toLowerCase().replace(/\s+/g, '_');
    
    return element.className.split(' ')[0] || 'unknown_section';
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Track page load performance
window.addEventListener('load', function() {
    setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            gtag('event', 'page_load_time', {
                'load_time': Math.round(navTiming.loadEventEnd - navTiming.fetchStart),
                'dom_content_loaded': Math.round(navTiming.domContentLoadedEventEnd - navTiming.fetchStart),
                'page_title': document.title
            });
        }
    }, 0);
});

// Track search queries if search is implemented later
function trackSearch(query, results) {
    gtag('event', 'search', {
        'search_term': query,
        'search_results': results
    });
}

// Custom event for tracking email subscriptions or contact form submissions
function trackEmailContact(action) {
    gtag('event', 'email_contact', {
        'contact_method': action, // 'email_click', 'contact_form', etc.
        'contact_email': 'firehacker@bubblspace.com'
    });
}

// Enhanced tracking for CUDA kernel tutorial
if (window.location.pathname.includes('cuda-kernels-basics')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Track CUDA-specific content engagement
        gtag('event', 'technical_content_view', {
            'content_type': 'cuda_kernel_tutorial',
            'difficulty_level': 'beginner',
            'programming_language': 'cuda_cpp',
            'hardware_target': 'rtx_2050'
        });

        // Track clicks on code sections
        document.querySelectorAll('pre code, .sourceCode').forEach(codeBlock => {
            codeBlock.addEventListener('click', function() {
                const language = this.className.match(/language-(\w+)/)?.[1] || 'unknown';
                gtag('event', 'code_section_click', {
                    'code_language': language,
                    'content_type': 'cuda_tutorial'
                });
            });
        });

        // Track clicks on repository links
        document.querySelectorAll('a[href*="reference-kernels"]').forEach(link => {
            link.addEventListener('click', function() {
                gtag('event', 'repository_link_click', {
                    'repository': 'reference_kernels',
                    'link_context': 'cuda_tutorial',
                    'action': 'visit_practice_repo'
                });
            });
        });

        // Track reading progress through sections
        const sections = document.querySelectorAll('h2, h3');
        const totalSections = sections.length;
        let sectionsViewed = 0;

        sections.forEach((section, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        sectionsViewed++;
                        const progressPercent = Math.round((sectionsViewed / totalSections) * 100);

                        gtag('event', 'tutorial_progress', {
                            'progress_percent': progressPercent,
                            'sections_viewed': sectionsViewed,
                            'total_sections': totalSections,
                            'current_section': entry.target.textContent.trim()
                        });
                    }
                });
            }, { threshold: 0.7 });
            observer.observe(section);
        });

        // Track time spent on technical content
        let startTime = Date.now();
        let engagementTracked = false;

        setTimeout(() => {
            if (!engagementTracked) {
                const timeSpent = Math.round((Date.now() - startTime) / 1000);
                gtag('event', 'technical_content_engagement', {
                    'time_spent_seconds': timeSpent,
                    'content_type': 'cuda_tutorial',
                    'engagement_level': timeSpent > 300 ? 'high' : timeSpent > 120 ? 'medium' : 'low'
                });
                engagementTracked = true;
            }
        }, 120000); // Track after 2 minutes
    });
}