
import type { Template } from './types';

export const PRODUCT_CATEGORIES: { name: string; value: string }[] = [
    { name: 'Thời trang thường ngày', value: 'fashion-general' },
    { name: 'Đồng phục Công sở', value: 'uniform-office' },
    { name: 'Đồng phục Y tế / Bác sĩ', value: 'uniform-medical' },
    { name: 'Đồng phục Nhà hàng / Khách sạn', value: 'uniform-hotel' },
    { name: 'Đồng phục Bảo hộ / Kỹ thuật', value: 'uniform-industrial' },
    { name: 'Streetwear / Local Brand', value: 'streetwear' },
];

export const DISPLAY_MODES: { name: string; value: string }[] = [
    { name: 'Người mẫu mặc (Model)', value: 'model' },
    { name: 'Treo trên móc (Hanger)', value: 'hanging' },
    { name: 'Đặt trên bàn (Flatlay)', value: 'flat-lay' },
    { name: 'Manocanh (Mannequin)', value: 'mannequin' },
];

export const ASPECT_RATIOS: { name: string; value: '1:1' | '3:4' | '4:5' | '16:9' }[] = [
    { name: 'Vuông (1:1)', value: '1:1' },
    { name: 'Dọc (3:4)', value: '3:4' },
    { name: 'Dọc (4:5)', value: '4:5' },
    { name: 'Ngang (16:9)', value: '16:9' },
];

export const BACKGROUND_STYLES: { name: string; value: string }[] = [
    { name: 'Studio phông trắng', value: 'studio-white' },
    { name: 'Studio phông xám/nghệ thuật', value: 'studio-gray' },
    { name: 'Văn phòng hiện đại', value: 'office-modern' },
    { name: 'Đường phố / Ngoài trời', value: 'street-day' },
    { name: 'Quán Cafe / Chill', value: 'cafe' },
    { name: 'Sảnh khách sạn / Sang trọng', value: 'hotel-lobby' },
    { name: 'Bệnh viện / Phòng khám', value: 'medical-clinic' },
    { name: 'Nhà máy / Công xưởng', value: 'industrial' },
    { name: 'Thiên nhiên / Công viên', value: 'nature' },
];

export const PRESET_COLORS = [
    { name: 'Trắng', value: '#FFFFFF' },
    { name: 'Đen', value: '#111827' },
    { name: 'Navy', value: '#1E3A8A' },
    { name: 'Beige', value: '#F5F5DC' },
    { name: 'Đỏ DeJan', value: '#A53435' },
    { name: 'Xanh Rêu', value: '#3F4F3A' },
];

// Model Options
export const GENDER_OPTIONS: { name: string; value: string }[] = [
    { name: 'Ngẫu nhiên', value: 'random' },
    { name: 'Nam', value: 'male' },
    { name: 'Nữ', value: 'female' },
];

export const ETHNICITY_OPTIONS: { name: string; value: string }[] = [
    { name: 'Ngẫu nhiên', value: 'random' },
    { name: 'Châu Á (Asian)', value: 'asian' },
    { name: 'Châu Âu (Western)', value: 'european' },
    { name: 'Châu Phi (African)', value: 'african' },
];

export const AGE_OPTIONS: { name: string; value: string }[] = [
    { name: 'Ngẫu nhiên', value: 'random' },
    { name: 'Gen Z (18-25)', value: '18-25' },
    { name: 'Young Pro (26-35)', value: '26-35' },
    { name: 'Mature (36-45)', value: '36-45' },
    { name: 'Senior (46+)', value: '46+' },
];

export const MODEL_STYLES: { name: string; value: string }[] = [
    { name: 'Tự nhiên / Casual', value: 'casual' },
    { name: 'Công sở / Chuyên nghiệp', value: 'corporate' },
    { name: 'Sang trọng / Luxury', value: 'luxury' },
    { name: 'Tối giản / Minimalist', value: 'minimalist' },
];

export const SHOT_TYPES: { name: string; value: string }[] = [
    { name: 'Ngẫu nhiên', value: 'random' },
    { name: 'Toàn thân (Full Body)', value: 'full-body' },
    { name: 'Nửa người (Waist Up)', value: 'waist-up' },
    { name: 'Cận cảnh (Close Up)', value: 'close-up' },
];

export const FONTS = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino', 'Garamond'];

export const TEMPLATES: Record<string, Template> = {
    't-shirt': {
        name: 'Áo thun cổ tròn',
        src: '/templates/t-shirt.png',
        width: 500,
        height: 500,
        logoArea: { x: 250, y: 180, scale: 0.3 },
        companyNameArea: { x: 250, y: 300, size: 24 },
        sloganArea: { x: 250, y: 340, size: 18 },
    },
    'polo-shirt': {
        name: 'Áo polo',
        src: '/templates/polo-shirt.png',
        width: 500,
        height: 500,
        logoArea: { x: 180, y: 150, scale: 0.2 },
        companyNameArea: { x: 250, y: 300, size: 24 },
        sloganArea: { x: 250, y: 340, size: 18 },
    },
    'jacket': {
        name: 'Áo khoác',
        src: '/templates/jacket.png',
        width: 500,
        height: 500,
        logoArea: { x: 170, y: 160, scale: 0.25 },
        companyNameArea: { x: 250, y: 320, size: 24 },
        sloganArea: { x: 250, y: 360, size: 18 },
    }
};
