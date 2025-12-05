
import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerationOptions, GeneratedImage, BackgroundStyle, ProductCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper: Resize and Compress image to avoid "Payload Too Large" or XHR errors
const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                // Resize logic: Limit max dimension to 1024px
                const MAX_DIMENSION = 1024; 
                let width = img.width;
                let height = img.height;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height / width) * MAX_DIMENSION);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width / height) * MAX_DIMENSION);
                        height = MAX_DIMENSION;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context failed'));
                    return;
                }
                
                // Draw white background in case of transparent PNGs to avoid artifacts when converting to JPEG
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG 0.8 quality
                // This significantly reduces payload size compared to raw PNG/File
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const base64 = dataUrl.split(',')[1];
                resolve(base64);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Helper Functions for Prompt Generation ---

const getBackgroundDescription = (style: BackgroundStyle): string => {
    const map: Record<BackgroundStyle, string> = {
        'studio-white': 'a high-end professional photo studio with a seamless pure white background, perfectly lit',
        'studio-gray': 'a moody artistic studio with a textured dark gray concrete wall background',
        'office-modern': 'a bustling modern open-plan office with glass walls, bright natural light, and blurred workstations',
        'office-classic': 'a traditional executive office with wooden furniture and warm lighting',
        'street-day': 'a vibrant city street during daytime, shallow depth of field',
        'cafe': 'a cozy, stylish coffee shop with warm ambient lighting',
        'hotel-lobby': 'a luxurious hotel lobby with marble floors and grand decor',
        'medical-clinic': 'a clean, bright, sterile medical clinic corridor or patient room',
        'industrial': 'a spacious industrial factory floor or warehouse with machinery in background',
        'nature': 'a serene outdoor park with greenery and soft sunlight'
    };
    return map[style] || 'a professional studio setting';
};

const getProductCategoryContext = (cat: ProductCategory): string => {
    const map: Record<ProductCategory, string> = {
        'fashion-general': 'casual fashion photography, lifestyle vibe',
        'uniform-office': 'corporate branding photography, professional and trustworthy',
        'uniform-medical': 'healthcare photography, clean, sterile, empathetic',
        'uniform-hotel': 'hospitality industry photography, welcoming, premium service',
        'uniform-industrial': 'safety and durability photography, rugged, hard-working',
        'streetwear': 'edgy streetwear photography, cool, trendy, high contrast'
    };
    return map[cat] || 'commercial product photography';
};

// Generate a consistent character description if needed
const generateCharacterSeed = (options: GenerationOptions): string => {
    if (options.displayMode !== 'model') return '';

    const genders = options.modelGender === 'random' ? ['male', 'female'] : [options.modelGender];
    const ethnicities = options.modelEthnicity === 'random' ? ['Asian', 'Caucasian', 'African descent', 'Hispanic'] : [options.modelGender === 'random' ? 'Asian' : options.modelEthnicity];
    const ages = options.modelAge === 'random' ? ['25-year-old', '30-year-old', '40-year-old'] : [options.modelAge];
    
    // Pick one deterministically or randomly for the seed
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)];
    const ageMap: Record<string, string> = {
        '18-25': 'young Gen-Z (approx 22 years old)',
        '26-35': 'young professional (approx 30 years old)',
        '36-45': 'experienced professional (approx 40 years old)',
        '46+': 'senior professional (approx 50+ years old)',
        'random': 'adult'
    };
    const age = ageMap[options.modelAge as string] || 'adult';

    return `The model is a ${age} ${ethnicity} ${gender}.`;
};

const generatePrompt = (options: GenerationOptions, iteration: number, characterSeed: string, hasCustomModel: boolean): string => {
    const bgDesc = getBackgroundDescription(options.backgroundStyle);
    const catContext = getProductCategoryContext(options.productCategory);

    // Variation logic for lighting/angles
    const angles = ['front view', 'slight 3/4 angle', 'dynamic pose'];
    const angle = angles[iteration % angles.length];

    let subjectDesc = '';
    let actionDesc = '';

    // DISPLAY MODE LOGIC
    if (options.displayMode === 'model') {
        if (hasCustomModel) {
            // CUSTOM MODEL PROMPT
            subjectDesc = 'IDENTITY LOCK: Use the person in the SECOND IMAGE (Reference Model) as the model. You MUST preserve their facial features, hair, and physical identity exactly. Put the clothing product from the FIRST IMAGE (Product) onto this person.';
        } else {
            // AI GENERATED MODEL
            const charDesc = options.consistentModel && characterSeed ? characterSeed : generateCharacterSeed(options);
            
            let styleDesc = '';
            if (options.modelStyle !== 'random') {
                 styleDesc = `, dressed in a ${options.modelStyle} style (complimenting the product)`;
            }
            subjectDesc = `${charDesc} ${styleDesc}.`;
        }

        let shotDesc = '';
        if (options.shotType === 'full-body') shotDesc = 'Full body shot showing the entire outfit.';
        else if (options.shotType === 'waist-up') shotDesc = 'Medium shot, waist-up, focusing on the upper body and face.';
        else if (options.shotType === 'close-up') shotDesc = 'Close-up shot focusing on fabric details and collar.';
        else shotDesc = 'Professional portrait shot.';
        
        subjectDesc += ` ${shotDesc}`;

        // Action inference based on category + background
        if (options.marketingContext) {
            actionDesc = `Action/Context: ${options.marketingContext}.`;
        } else {
            // Default interactions
            if (options.backgroundStyle.includes('office')) actionDesc = 'The model is standing confidently in a workspace or holding a document.';
            else if (options.backgroundStyle.includes('cafe')) actionDesc = 'The model is relaxing with a drink.';
            else if (options.backgroundStyle.includes('medical')) actionDesc = 'The model looks caring and professional, possibly checking a chart.';
            else actionDesc = 'The model is posing naturally for a lookbook.';
        }

    } else if (options.displayMode === 'mannequin') {
        subjectDesc = 'The product is displayed on a high-quality invisible/ghost mannequin to show the 3D fit.';
    } else if (options.displayMode === 'hanging') {
        subjectDesc = 'The product is hanging on a premium wooden or metal hanger, showcasing the drape of the fabric.';
    } else if (options.displayMode === 'flat-lay') {
        subjectDesc = 'The product is laid flat (flat-lay style) with minimal props arranged neatly around it.';
    }

    // Build the final prompt
    let prompt = `Role: You are a world-class advertising photographer specializing in ${catContext}.

TASK: Create a photorealistic product mockup.

INPUT IMAGES:
Image 1: The Product (clothing item).
${hasCustomModel ? 'Image 2: The Reference Model (person).' : ''}

RULES:
1. HERO PRODUCT: The clothing item from Image 1 MUST be the focus. Keep its exact logo, pattern, texture, and shape.
2. INTEGRATION: Naturally blend the product into the scene. Lighting on the product must match the environment.
${hasCustomModel ? '3. FACE LOCK: You MUST use the facial identity of the person in Image 2. Do not change their face.' : ''}

SCENE SPECIFICATIONS:
- Location: ${bgDesc}.
- Display Mode: ${options.displayMode}.
- Subject Details: ${subjectDesc}
- Action/Vibe: ${actionDesc}
- Camera Angle: ${angle}.
- Aspect Ratio: ${options.aspectRatio}.

`;

    if (options.productDescription) {
        prompt += `PRODUCT DETAILS: "${options.productDescription}" (Use for material/fit context).\n`;
    }

    if (options.variation === 'recolor') {
        prompt += `EDITING TASK: Change the fabric color of the product to ${options.color}, but keep all logos/textures intact.\n`;
    }

    prompt += `\nOutput a high-resolution, commercial-grade photograph.`;

    return prompt;
};

export const generateMockups = async (
    productImageFile: File,
    options: GenerationOptions,
    customModelFile: File | undefined | null,
    onProgress?: (percent: number) => void
): Promise<GeneratedImage[]> => {
    
    // 1. Prepare Product Image (Compressed)
    const productBase64 = await processImage(productImageFile);
    const parts: any[] = [
        {
            inlineData: {
                data: productBase64,
                mimeType: 'image/jpeg', // Always sending JPEG now due to compression
            },
        }
    ];

    // 2. Prepare Custom Model Image (if exists and mode is 'model') (Compressed)
    const hasCustomModel = !!customModelFile && options.displayMode === 'model';
    if (hasCustomModel && customModelFile) {
        const modelBase64 = await processImage(customModelFile);
        parts.push({
            inlineData: {
                data: modelBase64,
                mimeType: 'image/jpeg',
            },
        });
    }

    const generatedImages: GeneratedImage[] = [];
    const total = options.numImages;

    // Generate a consistent character seed if requested (and no custom model)
    const characterSeed = options.consistentModel && !hasCustomModel ? generateCharacterSeed(options) : '';

    let consecutiveQuotaErrors = 0;

    // Use sequential loop with retry logic
    for (let i = 0; i < total; i++) {
        // Create prompt specific to iteration
        const uniquePrompt = generatePrompt(options, i, characterSeed, hasCustomModel);
        
        // Base delay between successful requests to be gentle on quota
        if (i > 0) {
            await wait(4000); 
        }

        let attempts = 0;
        const maxRetries = 2;
        let success = false;

        while (attempts <= maxRetries && !success) {
            attempts++;
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        // Spread parts to include Product + (Optional) Model + Prompt
                        parts: [...parts, { text: uniquePrompt }],
                    },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });

                if (response.candidates && response.candidates.length > 0) {
                     for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const base64ImageBytes: string = part.inlineData.data;
                            const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                            generatedImages.push({
                                id: `gen_${Date.now()}_${i}`,
                                url: imageUrl,
                            });
                            success = true;
                            consecutiveQuotaErrors = 0;
                        }
                    }
                } else {
                    console.warn(`Attempt ${attempts}: API returned no candidates for image ${i+1}.`);
                    success = true; // Assume filtered, move on
                }

            } catch (error: any) {
                const isQuotaError = error.message?.includes('429') || 
                                     error.message?.includes('quota') || 
                                     error.status === 'RESOURCE_EXHAUSTED' ||
                                     error.code === 429;

                // Also retry on generic 500 errors which might be temporary server hiccups or network glitches
                const isServerError = error.code === 500 || 
                                      error.status === 'UNKNOWN' ||
                                      error.status === 'INTERNAL';

                if (isQuotaError || isServerError) {
                    if (isQuotaError) consecutiveQuotaErrors++;
                    
                    console.warn(`Error for image ${i + 1} (Attempt ${attempts}): ${error.message || error.status}`);
                    
                    if (attempts <= maxRetries) {
                        const delay = 5000 * Math.pow(2, attempts - 1);
                        await wait(delay);
                        continue;
                    }
                } else {
                    console.error(`Generation failed for image ${i + 1}:`, error);
                }
                break;
            }
        }

        if (onProgress) {
            onProgress(Math.round(((i + 1) / total) * 100));
        }

        if (consecutiveQuotaErrors >= 2) {
             break;
        }
    }

    if (generatedImages.length === 0) {
        if (consecutiveQuotaErrors > 0) {
             throw new Error("RATE_LIMIT_EXCEEDED");
        }
        throw new Error("Không thể tạo ảnh. Vui lòng thử lại sau.");
    }

    return generatedImages;
};
