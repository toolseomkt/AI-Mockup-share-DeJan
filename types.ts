
export type AspectRatio = '1:1' | '3:4' | '4:5' | '16:9';

// Backgrounds are now strictly locations
export type BackgroundStyle = 'studio-white' | 'studio-gray' | 'office-modern' | 'office-classic' | 'street-day' | 'cafe' | 'hotel-lobby' | 'medical-clinic' | 'industrial' | 'nature';

// New: How the product is displayed
export type DisplayMode = 'model' | 'mannequin' | 'hanging' | 'flat-lay';

export type Variation = 'keep' | 'recolor';

// Model Specifics
export type ModelGender = 'male' | 'female' | 'random';
export type ModelEthnicity = 'asian' | 'european' | 'african' | 'hispanic' | 'random';
export type ModelAge = '18-25' | '26-35' | '36-45' | '46+' | 'random';
export type ModelStyle = 'casual' | 'corporate' | 'luxury' | 'medical' | 'industrial' | 'random';
export type ShotType = 'full-body' | 'waist-up' | 'close-up' | 'random';

// Product Categories help AI infer context
export type ProductCategory = 'fashion-general' | 'uniform-office' | 'uniform-medical' | 'uniform-hotel' | 'uniform-industrial' | 'streetwear';

export interface GenerationOptions {
    productCategory: ProductCategory;
    aspectRatio: AspectRatio;
    numImages: number;
    backgroundStyle: BackgroundStyle;
    displayMode: DisplayMode;
    variation: Variation;
    color: string;
    
    // Model Options (used if displayMode === 'model')
    modelGender: ModelGender;
    modelEthnicity: ModelEthnicity;
    modelAge: ModelAge;
    modelStyle: ModelStyle;
    shotType: ShotType;
    consistentModel: boolean; // Try to keep same model across batch
    
    // Text Inputs
    productDescription?: string; // Physical description of item
    marketingContext?: string; // Vibe, audience, setting description
}

export interface GeneratedImage {
    id: string;
    url: string; 
}

export interface LogoState {
    image: HTMLImageElement | null;
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export interface TextState {
    content: string;
    font: string;
    size: number;
    color: string;
    x: number;
    y: number;
    visible: boolean;
}

export interface Template {
    name: string;
    src: string;
    width: number;
    height: number;
    logoArea: { x: number; y: number; scale: number };
    companyNameArea: { x: number; y: number; size: number };
    sloganArea: { x: number; y: number; size: number };
}
