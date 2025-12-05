
import React, { useEffect, useState } from 'react';
import type { Template, LogoState, TextState } from '../types';

interface PreviewCanvasProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    template: Template;
    templateImage: HTMLImageElement | null;
    fabricColor: string;
    logo: LogoState;
    onLogoChange?: React.Dispatch<React.SetStateAction<LogoState>>;
    companyName: TextState;
    slogan: TextState;
}

export const drawOnCanvas = (
    ctx: CanvasRenderingContext2D,
    template: Template,
    templateImage: HTMLImageElement | null,
    fabricColor: string,
    logo: LogoState,
    companyName: TextState,
    slogan: TextState,
    isDownload: boolean = false
) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!templateImage) {
        return;
    }

    if (!isDownload) {
        // Draw checkerboard background for transparency indication
        const checkerSize = 20;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#eee';
        for (let y = 0; y < canvas.height; y += checkerSize) {
            for (let x = 0; x < canvas.width; x += checkerSize) {
                if ((x / checkerSize + y / checkerSize) % 2 === 0) {
                    ctx.fillRect(x, y, checkerSize, checkerSize);
                }
            }
        }
    }

    // Draw colored template
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = template.width;
    tempCanvas.height = template.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        tempCtx.drawImage(templateImage, 0, 0, template.width, template.height);
        tempCtx.globalCompositeOperation = 'source-in';
        tempCtx.fillStyle = fabricColor;
        tempCtx.fillRect(0, 0, template.width, template.height);
        ctx.drawImage(tempCanvas, (canvas.width - template.width) / 2, (canvas.height - template.height) / 2, template.width, template.height);
    }

    // Draw Logo
    if (logo.image) {
        ctx.save();
        ctx.translate(logo.x, logo.y);
        ctx.rotate(logo.rotation * Math.PI / 180);
        ctx.scale(logo.scale, logo.scale);
        const w = logo.image.width;
        const h = logo.image.height;
        ctx.drawImage(logo.image, -w / 2, -h / 2, w, h);
        ctx.restore();
    }

    // Draw Company Name
    if (companyName.visible) {
        ctx.fillStyle = companyName.color;
        ctx.font = `${companyName.size}px ${companyName.font}`;
        ctx.textAlign = 'center';
        ctx.fillText(companyName.content, companyName.x, companyName.y);
    }

    // Draw Slogan
    if (slogan.visible) {
        ctx.fillStyle = slogan.color;
        ctx.font = `${slogan.size}px ${slogan.font}`;
        ctx.textAlign = 'center';
        ctx.fillText(slogan.content, slogan.x, slogan.y);
    }
};


export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
    canvasRef,
    template,
    templateImage,
    fabricColor,
    logo,
    onLogoChange,
    companyName,
    slogan,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        drawOnCanvas(ctx, template, templateImage, fabricColor, logo, companyName, slogan);

    }, [canvasRef, template, templateImage, fabricColor, logo, companyName, slogan]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const isInsideLogo = (x: number, y: number) => {
        if (!logo.image) return false;
        const w = logo.image.width * logo.scale;
        const h = logo.image.height * logo.scale;
        // This simple bounding box check does not account for rotation.
        // For a more accurate check with rotation, a more complex geometric calculation would be needed.
        // However, for this UI, it's generally sufficient.
        return x > logo.x - w / 2 && x < logo.x + w / 2 && y > logo.y - h / 2 && y < logo.y + h / 2;
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!onLogoChange || !logo.image) return;
        const pos = getMousePos(e);
        if (isInsideLogo(pos.x, pos.y)) {
            setIsDragging(true);
            setDragStart({
                x: pos.x - logo.x,
                y: pos.y - logo.y,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        if (isDragging && onLogoChange) {
            onLogoChange(prev => ({
                ...prev,
                x: pos.x - dragStart.x,
                y: pos.y - dragStart.y,
            }));
        }
        
        if (logo.image && isInsideLogo(pos.x, pos.y)) {
            e.currentTarget.style.cursor = 'move';
        } else {
            e.currentTarget.style.cursor = 'default';
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="border border-gray-300 rounded-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
};
