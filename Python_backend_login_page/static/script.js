// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fetch features from the backend
    fetchFeatures();

    // Handle feature form submission
    const featureForm = document.getElementById('featureForm');
    if (featureForm) {
        featureForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('featureTitle').value;
            const description = document.getElementById('featureDescription').value;

            try {
                const response = await fetch('/api/features', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: title,
                        description: description
                    })
                });

                if (response.ok) {
                    // Clear the form
                    featureForm.reset();
                    // Refresh the features list
                    fetchFeatures();
                } else {
                    console.error('Failed to add feature');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // Add animation to feature cards when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Update copyright year automatically
    const copyrightYear = document.querySelector('footer p');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.textContent = `© ${currentYear} My Website. All rights reserved.`;
    }
});

// Function to fetch features from the backend
async function fetchFeatures() {
    try {
        const response = await fetch('/api/features');
        const features = await response.json();
        displayFeatures(features);
    } catch (error) {
        console.error('Error fetching features:', error);
    }
}

// Function to display features
function displayFeatures(features) {
    const featuresContainer = document.querySelector('.features');
    if (!featuresContainer) return;

    featuresContainer.innerHTML = ''; // Clear existing content

    features.forEach(feature => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        card.innerHTML = `
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
            <small>Posted by: ${feature.author}</small>
        `;

        featuresContainer.appendChild(card);

        // Observe the new card for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        observer.observe(card);
    });
} 