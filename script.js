/*
 * AI Images Generator - JavaScript File
 * Generates 3 images from user prompt using Pollinations AI
 * 
 * Includes:
 * - Auto-translation from any language to English
 * - Support for all languages
 * - Using fetch + blob to display images correctly
 */

// Get DOM elements
const inp = document.getElementById("inp");
const generateBtn = document.getElementById("generateBtn");
const imageContainers = document.querySelectorAll(".image-container");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

// Check if the text is in English
function isEnglish(text) {
    const englishRegex = /^[a-zA-Z0-9\s\.\,\!\?\;\:\-\(\)\'\"]+$/;
    return englishRegex.test(text.trim());
}

// Translate text to English using Google Translate API
async function translateToEnglish(text) {
    if (!text || text.trim() === '') return text;
    if (isEnglish(text)) return text.trim();

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[0][0][0].trim();
    } catch (error) {
        console.error("Translation failed:", error);
        return text.trim();
    }
}

// Show progress bar
function showProgress() {
    progressContainer.style.display = "flex";
    const fill = progressBar.querySelector('.fill');
    fill.style.width = "0%";
    setTimeout(() => {
        fill.style.width = "100%";
    }, 200);
    
    // Add animation effect to particles
    document.querySelectorAll('.particle').forEach(particle => {
        particle.style.animationPlayState = 'running';
        particle.style.opacity = '0.7';
    });
}

// Hide progress bar
function hideProgress() {
    progressContainer.style.display = "none";
    const fill = progressBar.querySelector('.fill');
    fill.style.width = "0%";
    
    // Reset particles animation
    setTimeout(() => {
        document.querySelectorAll('.particle').forEach(particle => {
            particle.style.opacity = '0.5';
        });
    }, 300);
}

// Show loading message in all containers
function showLoading() {
    imageContainers.forEach(container => {
        container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    });
}

// Click event for generate button
generateBtn.addEventListener("click", async () => {
    const prompt = inp.value.trim();
    if (!prompt) {
        // Use a more attractive alert
        showCustomAlert("Please enter a description.");
        return;
    }

    // Add click effect to button
    generateBtn.classList.add('clicked');
    setTimeout(() => {
        generateBtn.classList.remove('clicked');
    }, 300);

    showLoading();
    showProgress();

    // Translate text to English
    const finalPrompt = await translateToEnglish(prompt);

    // Generate images after translation
    setTimeout(() => {
        generateMultipleImages(finalPrompt, 3);
        hideProgress();
    }, 600);
});

// Add effect when pressing Enter in input field
inp.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        generateBtn.click();
    }
});

// Show custom alert
function showCustomAlert(message) {
    // Create alert element
    const alertEl = document.createElement('div');
    alertEl.className = 'custom-alert';
    alertEl.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="alert-close"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add alert to page
    document.body.appendChild(alertEl);
    
    // Alert appearance effect
    setTimeout(() => {
        alertEl.classList.add('show');
    }, 10);
    
    // Close alert when clicking close button
    const closeBtn = alertEl.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        alertEl.classList.remove('show');
        setTimeout(() => {
            alertEl.remove();
        }, 300);
    });
    
    // Auto close alert after 3 seconds
    setTimeout(() => {
        if (document.body.contains(alertEl)) {
            alertEl.classList.remove('show');
            setTimeout(() => {
                alertEl.remove();
            }, 300);
        }
    }, 3000);
}

// Generate multiple images using fetch + blob (to fix loading issue)
function generateMultipleImages(prompt, count) {
    imageContainers.forEach(async (container, index) => {
        container.innerHTML = '';
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&model=flux&quality=high`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Image load failed");

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const img = document.createElement("img");
            img.src = blobUrl;
            img.alt = prompt;
            img.classList.add("generated-image");

            img.onload = () => {
                container.appendChild(img);

                const buttonsDiv = document.createElement("div");
                buttonsDiv.classList.add("buttons");

                // Download button  
                const downloadBtn = document.createElement("button");
                downloadBtn.textContent = "Download";
                downloadBtn.classList.add("download-btn");
                downloadBtn.onclick = () => {
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = `image_${Date.now()}_${index + 1}.jpg`;
                    a.click();
                };

                // View button
                const viewBtn = document.createElement("button");
                viewBtn.textContent = "View";
                viewBtn.classList.add("view-btn");
                viewBtn.onclick = () => window.open(blobUrl, "_blank");

                buttonsDiv.appendChild(downloadBtn);
                buttonsDiv.appendChild(viewBtn);
                container.appendChild(buttonsDiv);
            };
        } catch (error) {
            container.innerHTML = '<div class="loading">Image load failed</div>';
            console.error("Error loading image:", error);
        }
    });
}