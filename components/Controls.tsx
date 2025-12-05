
import React, { useState } from 'react';
import type { GenerationOptions } from '../types';
import { 
    ASPECT_RATIOS, BACKGROUND_STYLES, PRESET_COLORS, 
    DISPLAY_MODES, PRODUCT_CATEGORIES, 
    GENDER_OPTIONS, ETHNICITY_OPTIONS, AGE_OPTIONS, MODEL_STYLES, SHOT_TYPES 
} from '../constants';

interface ControlsProps {
    options: GenerationOptions;
    setOptions: React.Dispatch<React.SetStateAction<GenerationOptions>>;
    setOriginalImage: (image: { file: File, previewUrl: string } | null) => void;
    // New Props for Custom Model
    customModelImage?: { file: File, previewUrl: string } | null;
    setCustomModelImage?: (image: { file: File, previewUrl: string } | null) => void;
    
    onGenerate: () => void;
    isLoading: boolean;
    progress?: number;
    cooldown?: number;
}

// Icons
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#A53435]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#A53435]"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#A53435]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#A53435]"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 dark:border-gray-700 p-5 transition-all hover:shadow-md dark:shadow-none">
        <div className="flex items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
            {icon}
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase ${className}`}>
        {children}
    </label>
);

const Select: React.FC<{ id: string, value: string, onChange: (val: string) => void, options: {name: string, value: string}[] }> = ({ id, value, onChange, options }) => (
    <div className="relative">
        <select 
            id={id} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#A53435] focus:border-transparent outline-none appearance-none cursor-pointer"
        >
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
        </select>
        <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
    </div>
);

export const Controls: React.FC<ControlsProps> = ({ 
    options, setOptions, setOriginalImage, 
    customModelImage, setCustomModelImage,
    onGenerate, isLoading, progress = 0, cooldown = 0 
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [useCustomModel, setUseCustomModel] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            setOriginalImage({ file, previewUrl });
        }
    };

    const handleModelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && setCustomModelImage) {
            const previewUrl = URL.createObjectURL(file);
            setCustomModelImage({ file, previewUrl });
        }
    };

    const handleOptionChange = (field: keyof GenerationOptions, value: any) => {
        setOptions(prev => ({ ...prev, [field]: value }));
    };

    // Helper to clear custom model if user switches back to AI
    const handleToggleCustomModel = (isCustom: boolean) => {
        setUseCustomModel(isCustom);
        if (!isCustom && setCustomModelImage) {
            setCustomModelImage(null); // Clear image if toggled off
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Upload Section */}
            <Section icon={<UploadIcon />} title="1. Upload Ảnh Sản Phẩm">
                <div 
                    className={`relative w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer group
                        ${imagePreview 
                            ? 'border-[#A53435] bg-white dark:bg-gray-700' 
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'}`}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full group-hover:opacity-90 transition-opacity">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                                Click để đổi ảnh
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2 text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chọn ảnh sản phẩm</span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </Section>

            {/* 2. Product Category (Vital for Context) */}
            <Section icon={<BriefcaseIcon />} title="2. Loại sản phẩm">
                <Label htmlFor="productCategory">Sản phẩm của bạn thuộc nhóm nào?</Label>
                <Select 
                    id="productCategory"
                    value={options.productCategory}
                    onChange={(val) => handleOptionChange('productCategory', val)}
                    options={PRODUCT_CATEGORIES}
                />
            </Section>

            {/* 3. Setting & Display (Decoupled) */}
            <Section icon={<SettingsIcon />} title="3. Bối cảnh & Hiển thị">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="backgroundStyle">Địa điểm / Bối cảnh</Label>
                        <Select 
                            id="backgroundStyle"
                            value={options.backgroundStyle}
                            onChange={(val) => handleOptionChange('backgroundStyle', val)}
                            options={BACKGROUND_STYLES}
                        />
                    </div>

                    <div>
                        <Label htmlFor="displayMode">Cách hiển thị sản phẩm</Label>
                        <Select 
                            id="displayMode"
                            value={options.displayMode}
                            onChange={(val) => handleOptionChange('displayMode', val)}
                            options={DISPLAY_MODES}
                        />
                    </div>

                    {/* Common Settings Grid */}
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <Label htmlFor="aspectRatio">Tỷ lệ</Label>
                            <Select 
                                id="aspectRatio"
                                value={options.aspectRatio}
                                onChange={(val) => handleOptionChange('aspectRatio', val)}
                                options={ASPECT_RATIOS}
                            />
                        </div>
                        <div>
                            <Label htmlFor="numImages">Số lượng ảnh</Label>
                            <input
                                id="numImages"
                                type="number"
                                min="1"
                                max="20"
                                value={options.numImages}
                                onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = 1;
                                    if (val < 1) val = 1;
                                    if (val > 20) val = 20;
                                    handleOptionChange('numImages', val);
                                }}
                                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#A53435] focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* 4. Model Settings (Conditional) */}
            {options.displayMode === 'model' && (
                <Section icon={<UserIcon />} title="4. Tùy chỉnh Người mẫu">
                    <div className="space-y-4 animate-fade-in">
                        {/* Custom Model Toggle */}
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                            <button
                                onClick={() => handleToggleCustomModel(false)}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!useCustomModel ? 'bg-white dark:bg-gray-600 shadow-sm text-[#A53435]' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                AI Tạo
                            </button>
                            <button
                                onClick={() => handleToggleCustomModel(true)}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${useCustomModel ? 'bg-white dark:bg-gray-600 shadow-sm text-[#A53435]' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Ảnh Mẫu Của Bạn
                            </button>
                        </div>

                        {useCustomModel ? (
                            <div className="animate-fade-in">
                                <Label className="mb-2">Upload ảnh người mẫu (Chân dung/Toàn thân)</Label>
                                <div 
                                    className={`relative w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all overflow-hidden cursor-pointer group
                                        ${customModelImage 
                                            ? 'border-[#A53435] bg-white dark:bg-gray-700' 
                                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                                >
                                    {customModelImage ? (
                                        <div className="relative w-full h-full">
                                            <img src={customModelImage.previewUrl} alt="Custom Model" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-medium">Thay đổi</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-1 text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                            </div>
                                            <span className="text-[10px] text-gray-500">Chọn ảnh mẫu</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleModelFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic">
                                    AI sẽ dùng gương mặt và dáng người từ ảnh này.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 animate-fade-in">
                                <div>
                                    <Label htmlFor="modelGender">Giới tính</Label>
                                    <Select id="modelGender" value={options.modelGender} onChange={v => handleOptionChange('modelGender', v)} options={GENDER_OPTIONS} />
                                </div>
                                <div>
                                    <Label htmlFor="modelAge">Độ tuổi</Label>
                                    <Select id="modelAge" value={options.modelAge} onChange={v => handleOptionChange('modelAge', v)} options={AGE_OPTIONS} />
                                </div>
                                <div>
                                    <Label htmlFor="modelEthnicity">Chủng tộc</Label>
                                    <Select id="modelEthnicity" value={options.modelEthnicity} onChange={v => handleOptionChange('modelEthnicity', v)} options={ETHNICITY_OPTIONS} />
                                </div>
                                <div>
                                    <Label htmlFor="modelStyle">Phong cách</Label>
                                    <Select id="modelStyle" value={options.modelStyle} onChange={v => handleOptionChange('modelStyle', v)} options={MODEL_STYLES} />
                                </div>
                            </div>
                        )}
                        
                        <div className="col-span-2 mt-2">
                            <Label htmlFor="shotType">Góc chụp</Label>
                            <Select id="shotType" value={options.shotType} onChange={v => handleOptionChange('shotType', v)} options={SHOT_TYPES} />
                        </div>

                        {!useCustomModel && (
                            <div className="flex items-start p-3 mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center h-5">
                                    <input
                                        id="consistentModel"
                                        type="checkbox"
                                        checked={options.consistentModel}
                                        onChange={(e) => handleOptionChange('consistentModel', e.target.checked)}
                                        className="w-4 h-4 text-[#A53435] border-gray-300 rounded focus:ring-[#A53435]"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="consistentModel" className="font-medium text-gray-700 dark:text-gray-300">Giữ nguyên người mẫu</label>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Dùng cùng 1 khuôn mặt cho tất cả ảnh.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {/* 5. Context & Description */}
            <Section icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-[#A53435]"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} title="5. Chi tiết sản phẩm & Bối cảnh">
                 <div className="space-y-4">
                     <div>
                        <Label htmlFor="productDescription">Mô tả sản phẩm</Label>
                        <textarea
                            id="productDescription"
                            value={options.productDescription || ''}
                            onChange={(e) => handleOptionChange('productDescription', e.target.value)}
                            placeholder="VD: Áo thun cotton 100%, màu đỏ đô, in logo trước ngực..."
                            rows={2}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#A53435] focus:border-transparent outline-none resize-none"
                        />
                    </div>
                    <div>
                        <Label htmlFor="marketingContext">Bối cảnh / Mục tiêu quảng cáo</Label>
                        <textarea
                            id="marketingContext"
                            value={options.marketingContext || ''}
                            onChange={(e) => handleOptionChange('marketingContext', e.target.value)}
                            placeholder="VD: Nhân viên lễ tân đang chào khách, không khí chuyên nghiệp, thân thiện. Dùng cho banner website."
                            rows={3}
                            className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#A53435] focus:border-transparent outline-none resize-none"
                        />
                         <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                            Mô tả càng chi tiết bối cảnh sử dụng, ảnh càng chân thật.
                        </p>
                    </div>
                </div>
            </Section>

            {/* Generate Button */}
            <button 
                onClick={onGenerate} 
                disabled={isLoading || (cooldown !== undefined && cooldown > 0)} 
                className={`w-full group relative overflow-hidden rounded-xl font-bold text-white shadow-lg transition-all duration-300 transform active:scale-[0.98]
                    ${(isLoading || (cooldown !== undefined && cooldown > 0)) ? 'bg-gray-800 dark:bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-[#A53435] to-[#111827] hover:shadow-xl hover:brightness-110'}`}
            >
                {/* Progress Bar Background Overlay */}
                {isLoading && (
                    <div 
                        className="absolute inset-0 bg-white/10 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                )}
                
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative py-4 px-6 flex items-center justify-center">
                    {cooldown && cooldown > 0 ? (
                        <>
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                             <span>Vui lòng đợi {cooldown}s...</span>
                        </>
                    ) : isLoading ? (
                        <>
                            <div className="spinner mr-2"></div> 
                            <span className="text-sm">Đang xử lý {progress}%...</span>
                        </>
                    ) : (
                        <>
                            <span className="mr-2 text-lg">✨</span>
                            <span>Tạo Mockup AI</span>
                        </>
                    )}
                </div>
            </button>
        </div>
    );
};
