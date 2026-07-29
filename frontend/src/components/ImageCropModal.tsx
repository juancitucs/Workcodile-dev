import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { RotateCw } from 'lucide-react';

interface ImageCropModalProps {
    image: string;
    isOpen: boolean;
    onClose: () => void;
    onCropComplete: (croppedImage: Blob) => void;
}

export function ImageCropModal({ image, isOpen, onClose, onCropComplete }: ImageCropModalProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isProcessing, setIsProcessing] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const drawImage = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 220;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);

        ctx.save();
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(-size / 2 + position.x, -size / 2 + position.y);

        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.restore();

        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();
    };

    useEffect(() => {
        if (isOpen && image) {
            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
                drawImage();
            };
            img.src = image;
        }
    }, [isOpen, image]);

    useEffect(() => {
        drawImage();
    }, [zoom, rotation, position]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleApply = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsProcessing(true);
        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                }, 'image/jpeg', 0.95);
            });

            onCropComplete(blob);
            onClose();
        } catch (e) {
            console.error('Error cropping image:', e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 3));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[320px] !w-[320px]" style={{ width: '320px', maxWidth: '320px' }}>
                <DialogHeader>
                    <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Arrastra para mover, usa la rueda del mouse para zoom
                    </p>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="flex justify-center">
                        <canvas
                            ref={canvasRef}
                            width={220}
                            height={220}
                            className="rounded-full cursor-move border-2 border-border"
                            style={{ width: '220px', height: '220px' }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onWheel={handleWheel}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label></Label>
                        <Slider
                            value={[zoom]}
                            onValueChange={(value) => setZoom(value[0])}
                            min={0.5}
                            max={3}
                            step={0.1}
                            className="w-full [&>span:first-child]:bg-green-500 [&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-600"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Rotacion</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRotate}
                            className="flex items-center gap-2"
                        >
                            <RotateCw className="h-4 w-4" />
                            Rotar 90
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancelar
                    </Button>
                    <Button onClick={handleApply} disabled={isProcessing}>
                        {isProcessing ? 'Procesando...' : 'Aplicar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
