const generateForm = document.querySelector(".generate-form");
const imgGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "Your_API_Key"; 
let isImageGenerating = false;

const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imgGallery.querySelectorAll(".img-card")[index]; // ✅ FIXED: `imgGallery`
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        // Set AI-generated image
        const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImg;

        // Remove loading & set download link
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg); // ✅ FIXED: `setAttribute`
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        };
    });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "dall-e-2", // Ensure correct model is used
                prompt: userPrompt,
                n: Math.min(Math.max(parseInt(userImgQuantity), 1), 4), // ✅ FIXED: Ensure valid number
                size: "512x512",
                response_format: "b64_json",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Get detailed error
            throw new Error(errorData.error.message || "Failed to generate images! Please try again.");
        }

        const { data } = await response.json();
        updateImageCard([...data]);
    } catch (error) {
        alert(error.message);
    } finally {
        isImageGenerating = false;
    }
};

const handleFormSubmission = (e) => {
    e.preventDefault();
    if (isImageGenerating) return;
    isImageGenerating = true;

    const userPrompt = e.target[0].value;
    const userImgQuantity = e.target[1].value;

    // Generate image cards with loading state
    const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
        `<div class="img-card loading">
            <img src="/images/loader.svg" alt="image">
            <a href="#" class="download-btn">
                <img src="/images/download.svg" alt="download-icon">
            </a>
        </div>`
    ).join("");

    imgGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleFormSubmission);
