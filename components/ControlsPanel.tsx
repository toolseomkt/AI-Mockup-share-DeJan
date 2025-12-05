
import React from 'react';
import type { LogoState, TextState } from '../types';
import { TEMPLATES, PRESET_COLORS, FONTS } from '../constants';

interface ControlsPanelProps {
    selectedProductId: string;
    onProductChange: (id: string) => void;
    fabricColor: string;
    onFabricColorChange: (color: string) => void;
    logo: LogoState;
    onLogoChange: React.Dispatch<React.SetStateAction<LogoState>>;
    companyName: TextState;
    onCompanyNameChange: React.Dispatch<React.SetStateAction<TextState>>;
    slogan: TextState;
    onSloganChange: React.Dispatch<React.SetStateAction<TextState>>;
    onDownload: (transparent: boolean) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">{title}</h3>
        {children}
    </div>
);

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-600 mb-1 ${className}`}>
        {children}
    </label>
);


export const ControlsPanel: React.FC<ControlsPanelProps> = ({
    selectedProductId,
    onProductChange,
    fabricColor,
    onFabricColorChange,
    logo,
    onLogoChange,
    companyName,
    onCompanyNameChange,
    slogan,
    onSloganChange,
    onDownload,
}) => {

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const defaultLogoArea = TEMPLATES[selectedProductId].logoArea;
                    onLogoChange(prev => ({ 
                        ...prev, 
                        image: img,
                        x: defaultLogoArea.x,
                        y: defaultLogoArea.y
                    }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            <Section title="1. Chọn sản phẩm">
                <select
                    value={selectedProductId}
                    onChange={(e) => onProductChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#A53435] focus:border-[#A53435]"
                >
                    {Object.entries(TEMPLATES).map(([id, { name }]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </Section>

            <Section title="2. Tùy chỉnh Logo">
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#A53435] file:text-white hover:file:bg-[#8e2a2b] cursor-pointer"
                />
                 {logo.image && (
                    <div className="mt-4 space-y-3">
                        <div>
                            <Label htmlFor="logo-scale">Kích thước (Scale): {logo.scale.toFixed(2)}</Label>
                            <input
                                id="logo-scale"
                                type="range"
                                min="0.1"
                                max="2"
                                step="0.05"
                                value={logo.scale}
                                onChange={(e) => onLogoChange(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#A53435]"
                            />
                        </div>
                        <div>
                            <Label htmlFor="logo-rotation">Xoay (Rotation): {logo.rotation}°</Label>
                            <input
                                id="logo-rotation"
                                type="range"
                                min="0"
                                max="360"
                                step="1"
                                value={logo.rotation}
                                onChange={(e) => onLogoChange(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#A53435]"
                            />
                        </div>
                    </div>
                )}
            </Section>

            <Section title="3. Chọn màu vải">
                 <div className="flex items-center space-x-2">
                    <Label htmlFor="color-picker" className="mb-0">Màu tùy chọn:</Label>
                    <input
                        id="color-picker"
                        type="color"
                        value={fabricColor}
                        onChange={(e) => onFabricColorChange(e.target.value)}
                        className="w-10 h-10 border-none cursor-pointer rounded-md"
                    />
                 </div>
                <div className="mt-2 flex flex-wrap gap-2">
                    {PRESET_COLORS.map(({ name, value }) => (
                        <button
                            key={name}
                            onClick={() => onFabricColorChange(value)}
                            className={`w-8 h-8 rounded-full border-2 ${fabricColor === value ? 'border-[#A53435]' : 'border-gray-300'}`}
                            style={{ backgroundColor: value }}
                            title={name}
                        />
                    ))}
                </div>
            </Section>

            <Section title="4. Thêm thông tin">
                <div className="space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="show-company" checked={companyName.visible} onChange={e => onCompanyNameChange(prev => ({...prev, visible: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-[#A53435] focus:ring-[#A53435]"/>
                        <Label htmlFor="show-company" className="ml-2 mb-0">Hiển thị Tên công ty</Label>
                    </div>
                    {companyName.visible && <>
                        <input type="text" value={companyName.content} onChange={e => onCompanyNameChange(prev => ({...prev, content: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md"/>
                        <select value={companyName.font} onChange={e => onCompanyNameChange(prev => ({...prev, font: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md">
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </>}
                    <div className="flex items-center mt-2">
                        <input type="checkbox" id="show-slogan" checked={slogan.visible} onChange={e => onSloganChange(prev => ({...prev, visible: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-[#A53435] focus:ring-[#A53435]"/>
                        <Label htmlFor="show-slogan" className="ml-2 mb-0">Hiển thị Slogan</Label>
                    </div>
                     {slogan.visible && <>
                        <input type="text" value={slogan.content} onChange={e => onSloganChange(prev => ({...prev, content: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md"/>
                        <select value={slogan.font} onChange={e => onSloganChange(prev => ({...prev, font: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md">
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </>}
                </div>
            </Section>
            
            <Section title="5. Xuất file">
                <div className="space-y-3">
                    <button onClick={() => onDownload(false)} className="w-full bg-[#A53435] text-white font-bold py-2 px-4 rounded-md hover:bg-[#8e2a2b] transition-colors">
                        Tải mockup PNG (nền trắng)
                    </button>
                    <button onClick={() => onDownload(true)} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                        Tải mockup PNG (nền trong)
                    </button>
                </div>
            </Section>
        </div>
    );
};
