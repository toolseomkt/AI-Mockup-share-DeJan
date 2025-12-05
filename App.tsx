
import React, { useState, useCallback, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Gallery } from './components/Gallery';
import { generateMockups } from './services/aiGenerator';
import type { GenerationOptions, GeneratedImage } from './types';
import { ASPECT_RATIOS, BACKGROUND_STYLES, PRESET_COLORS, DISPLAY_MODES, PRODUCT_CATEGORIES } from './constants';

const App: React.FC = () => {
    // Theme State Management
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('dejan-theme');
            if (savedTheme) return savedTheme as 'light' | 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    // Load saved options from LocalStorage or use defaults
    const [options, setOptions] = useState<GenerationOptions>(() => {
        if (typeof window !== 'undefined') {
            const savedOptions = localStorage.getItem('dejan-options');
            if (savedOptions) {
                try {
                    return JSON.parse(savedOptions);
                } catch (e) {
                    console.error("Failed to parse saved options", e);
                }
            }
        }
        return {
            productCategory: PRODUCT_CATEGORIES[1].value as any, // Default to Office Uniform
            aspectRatio: ASPECT_RATIOS[0].value,
            numImages: 4,
            backgroundStyle: BACKGROUND_STYLES[0].value as any, // Default Studio
            displayMode: 'model',
            variation: 'keep',
            color: PRESET_COLORS[0].value,
            
            // Model defaults
            modelGender: 'random',
            modelEthnicity: 'random',
            modelAge: '26-35',
            modelStyle: 'corporate',
            shotType: 'waist-up',
            consistentModel: false,

            // Text defaults
            productDescription: '',
            marketingContext: '',
        };
    });

    const [originalImage, setOriginalImage] = useState<{ file: File, previewUrl: string } | null>(null);
    // New state for Custom Model Face
    const [customModelImage, setCustomModelImage] = useState<{ file: File, previewUrl: string } | null>(null);
    
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    // Cooldown state for Rate Limits (seconds)
    const [cooldown, setCooldown] = useState(0);

    // Persist Theme
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('dejan-theme', theme);
    }, [theme]);

    // Persist Options
    useEffect(() => {
        localStorage.setItem('dejan-options', JSON.stringify(options));
    }, [options]);

    // Cooldown Timer Effect
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleGenerate = useCallback(async () => {
        if (cooldown > 0) return; // Prevent generation during cooldown

        if (!originalImage) {
            setError('Vui lòng upload ảnh sản phẩm gốc trước.');
            return;
        }

        setIsLoading(true);
        setProgress(0);
        setError(null);
        setGeneratedImages([]); // Clear previous results

        try {
            const results = await generateMockups(
                originalImage.file, 
                options,
                customModelImage?.file, // Pass the custom model file if it exists
                (percent) => setProgress(percent)
            );
            setGeneratedImages(results);
        } catch (err: any) {
            // Handle error message gracefully
            let msg = 'Đã có lỗi xảy ra khi tạo mockup. Vui lòng thử lại.';
            
            const isQuota = err.message === 'RATE_LIMIT_EXCEEDED' || 
                            err.message?.includes('quota') || 
                            err.message?.includes('429');

            if (isQuota) {
                msg = 'Hệ thống đang quá tải (Limit Exceeded). Vui lòng đợi trong giây lát.';
                setCooldown(60); // Set 60s cooldown
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
            console.error(err);
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    }, [originalImage, options, cooldown, customModelImage]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-300">
            {/* Premium Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mini Logo */}
                        <div className="w-8 h-8 bg-gradient-to-br from-[#A53435] to-[#7f2627] rounded-lg shadow-sm flex items-center justify-center text-white font-bold text-xs tracking-wider">
                            AI
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                AI <span className="text-[#A53435]">Mockup</span>
                            </h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">Professional Studio</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600">
                            v3.1 PRO
                        </span>
                        
                        {/* Dark Mode Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A53435]"
                            aria-label="Toggle Dark Mode"
                        >
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero / Intro */}
                <div className="text-center mb-10 animate-fade-in">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                        Tạo mockup quảng cáo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A53435] to-[#111827] dark:to-white">siêu chân thật</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Chọn bối cảnh, chọn người mẫu và để AI sáng tạo.
                    </p>
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Control Panel */}
                    <div className="lg:col-span-4 xl:col-span-4 space-y-6 animate-fade-in delay-100">
                         <div className="sticky top-24">
                            <Controls
                                options={options}
                                setOptions={setOptions}
                                setOriginalImage={setOriginalImage}
                                customModelImage={customModelImage}
                                setCustomModelImage={setCustomModelImage}
                                onGenerate={handleGenerate}
                                isLoading={isLoading}
                                progress={progress}
                                cooldown={cooldown}
                            />
                        </div>
                    </div>

                    {/* Right Column: Gallery Display */}
                    <div className="lg:col-span-8 xl:col-span-8 animate-fade-in delay-200">
                        <Gallery
                            originalImage={originalImage}
                            generatedImages={generatedImages}
                            isLoading={isLoading}
                            progress={progress}
                            error={error}
                            onRegenerate={handleGenerate}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-10 text-center animate-fade-in delay-200">
                <p className="text-sm text-gray-400 dark:text-gray-500 font-light flex items-center justify-center gap-1.5">
                    Crafted with <span className="text-red-400">❤️</span> by 
                    <a 
                        href="https://maikimtuyen.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium text-gray-600 dark:text-gray-400 hover:text-[#A53435] dark:hover:text-[#ff5a5b] transition-colors border-b border-transparent hover:border-[#A53435] dark:hover:border-[#ff5a5b]"
                    >
                        Mai Kim Tuyến
                    </a>
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 font-light mt-2">
                    Liên hệ công việc: 0369 608 268 (có Zalo)
                </p>
            </footer>
        </div>
    );
};

export default App;
