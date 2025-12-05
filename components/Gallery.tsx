import React from 'react';
import type { GeneratedImage } from '../types';

interface GalleryProps {
    originalImage: { file: File, previewUrl: string } | null;
    generatedImages: GeneratedImage[];
    isLoading: boolean;
    progress: number;
    error: string | null;
    onRegenerate: () => void;
}

const ImageCard: React.FC<{ image: GeneratedImage; onRegenerate: () => void }> = ({ image, onRegenerate }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `ai-mockup-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                    src={image.url} 
                    alt={`Generated Mockup ${image.id}`} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                />
            </div>
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-white text-gray-900 font-semibold py-2 px-5 rounded-full hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Tải xuống
                </button>
                
                <button
                    onClick={onRegenerate}
                    className="flex items-center gap-2 bg-[#A53435] text-white font-semibold py-2 px-5 rounded-full hover:bg-[#8e2a2b] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    Tạo lại
                </button>
            </div>
        </div>
    );
};

const SkeletonLoader: React.FC<{ progress: number }> = ({ progress }) => {
    return (
        <div className="col-span-1 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 h-full min-h-[300px] flex flex-col">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 animate-pulse relative">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            </div>
            <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                
                {/* Progress Bar inside skeleton */}
                <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                        <span>Đang xử lý...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-1.5">
                        <div 
                            className="bg-[#A53435] h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Gallery: React.FC<GalleryProps> = ({ originalImage, generatedImages, isLoading, progress, error, onRegenerate }) => {
    return (
        <div className="space-y-8">
             {/* Results Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                        <span className="w-2 h-6 bg-[#A53435] rounded-full mr-3"></span>
                        Kết quả Mockup
                    </h2>
                    {generatedImages.length > 0 && (
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={onRegenerate}
                                className="text-xs font-semibold text-[#A53435] hover:text-[#8e2a2b] bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                                Tạo lại
                            </button>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                                {generatedImages.length} ảnh
                            </span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start mb-6 animate-fade-in">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="font-bold">Lỗi</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                
                {isLoading && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {/* Display skeleton loaders based on estimated count, usually 3-4 */}
                        {[1, 2, 3].map((i) => (
                            <SkeletonLoader key={i} progress={progress} />
                        ))}
                    </div>
                )}

                {!isLoading && generatedImages.length === 0 && !error && (
                     <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 min-h-[300px]">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-gray-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chưa có ảnh nào</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">Tải ảnh lên và cấu hình ở cột bên trái để bắt đầu tạo mockup.</p>
                    </div>
                )}
                
                {generatedImages.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {generatedImages.map(img => (
                            <ImageCard key={img.id} image={img} onRegenerate={onRegenerate} />
                        ))}
                    </div>
                )}
            </div>

            {/* Original Image Section (Optional, moved to bottom or smaller) */}
            {originalImage && generatedImages.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Ảnh gốc tham khảo</h2>
                    <div className="w-24 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                        <img src={originalImage.previewUrl} alt="Original product" className="w-full h-full object-cover" />
                    </div>
                </div>
            )}
        </div>
    );
};