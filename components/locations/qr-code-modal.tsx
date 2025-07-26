"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationData } from "@/lib/locations";
import { Download, QrCode, Info, X, ZoomIn, ZoomOut, RotateCcw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import QRCodeLib from 'qrcode';
import Image from 'next/image';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData | null;
}

const QR_SIZES = [
  {
    id: "a5",
    label: "A5 Boyut (14.8 x 21 cm)",
    width: "14.8cm",
    height: "21cm",
    previewScale: 0.8,
    pixelWidth: 420,
    pixelHeight: 595,
    mmWidth: 148,
    mmHeight: 210
  },
  {
    id: "slim",
    label: "1/3 A4 Slim (10 x 21 cm)",
    width: "10cm",
    height: "21cm",
    previewScale: 0.6,
    pixelWidth: 283,
    pixelHeight: 595,
    mmWidth: 100,
    mmHeight: 210
  },
  {
    id: "square",
    label: "Kare Stand (15 x 15 cm)",
    width: "15cm",
    height: "15cm",
    previewScale: 1.0,
    pixelWidth: 425,
    pixelHeight: 425,
    mmWidth: 150,
    mmHeight: 150
  },
  {
    id: "a6",
    label: "A6 Boyut (10.5 x 14.8 cm)",
    width: "10.5cm",
    height: "14.8cm",
    previewScale: 0.7,
    pixelWidth: 298,
    pixelHeight: 420,
    mmWidth: 105,
    mmHeight: 148
  }
];

export function QrCodeModal({ isOpen, onClose, location }: QrCodeModalProps) {
  const [selectedSizeId, setSelectedSizeId] = useState("a5");
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const printAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const selectedSize = QR_SIZES.find(size => size.id === selectedSizeId) || QR_SIZES[0];

  const qrUrl = location ? `${window.location.origin}/services/${location.slug}?qr_scan=true` : '';

  const generateQRCode = useCallback(async () => {
    if (!qrUrl) return;
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(qrUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: "QR kod oluşturulamadı",
        variant: "destructive",
      });
    }
  }, [qrUrl, toast]);

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, generateQRCode]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.4));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast({
        title: "Başarılı",
        description: "URL panoya kopyalandı",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "URL kopyalanamadı",
        variant: "destructive",
      });
    }
  };

  const drawQRStand = useCallback(async (canvas: HTMLCanvasElement, scale: number = 1) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !qrCodeDataUrl) return;

    const { pixelWidth, pixelHeight } = selectedSize;
    
    canvas.width = pixelWidth * scale;
    canvas.height = pixelHeight * scale;
    ctx.scale(scale, scale);

    const bgGradient = ctx.createLinearGradient(0, 0, pixelWidth, pixelHeight);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    const primaryGradient = ctx.createLinearGradient(0, 0, pixelWidth, pixelHeight);
    primaryGradient.addColorStop(0, 'rgba(220, 38, 38, 0.05)');
    primaryGradient.addColorStop(1, 'rgba(220, 38, 38, 0.1)');
    ctx.fillStyle = primaryGradient;
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);

    ctx.fillStyle = 'rgba(220, 38, 38, 0.05)';
    ctx.beginPath();
    ctx.arc(pixelWidth - 40, 40, 40, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(40, pixelHeight - 40, 32, 0, 2 * Math.PI);
    ctx.fill();

    const centerX = pixelWidth / 2;
    const centerY = pixelHeight / 2;

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INN Panel', centerX, centerY - 120);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(centerX - 60, centerY - 60, 120, 120, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(centerX - 48, centerY - 48, 96, 96, 4);
    ctx.fill();
    ctx.stroke();

    return new Promise<void>((resolve) => {
      const qrImage = new window.Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, centerX - 40, centerY - 40, 80, 80);
        
        const fontSize = selectedSizeId === 'slim' || selectedSizeId === 'a6' ? 11 : 14;
        ctx.font = `600 ${fontSize}px Poppins, Inter, system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = '#374151';
        ctx.fillText('Hizmetlerimizi görüntülemek için', centerX, centerY + 100);
        
        ctx.fillStyle = '#dc2626';
        const secondLineY = selectedSizeId === 'slim' || selectedSizeId === 'a6' ? centerY + 115 : centerY + 120;
        ctx.fillText('QR kodunu taratın', centerX, secondLineY);

        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('www.innpanel.com', centerX, centerY + 150);
        
        resolve();
      };
      qrImage.src = qrCodeDataUrl;
    });
  }, [qrCodeDataUrl, selectedSize, selectedSizeId]);

  const generateSVGContent = useCallback(async () => {
    const { pixelWidth, pixelHeight } = selectedSize;
        
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${pixelWidth}" height="${pixelHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${pixelWidth} ${pixelHeight}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dc2626;stop-opacity:0.05" />
      <stop offset="100%" style="stop-color:#dc2626;stop-opacity:0.1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  <rect width="100%" height="100%" fill="url(#primaryGradient)"/>
  
  <circle cx="${pixelWidth - 40}" cy="40" r="40" fill="#dc2626" opacity="0.05"/>
  <circle cx="40" cy="${pixelHeight - 40}" r="32" fill="#dc2626" opacity="0.05"/>
  
  <g transform="translate(${pixelWidth/2}, ${pixelHeight/2})">
    <text x="0" y="-120" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#dc2626">INN Panel</text>
    
    <rect x="-60" y="-60" width="120" height="120" fill="white" stroke="#dc2626" stroke-width="2" rx="8" filter="url(#shadow)"/>
    <rect x="-48" y="-48" width="96" height="96" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" rx="4"/>
    
    <image x="-40" y="-40" width="80" height="80" xlink:href="${qrCodeDataUrl}"/>
    
    <text x="0" y="100" text-anchor="middle" font-family="Poppins, Inter, system-ui, -apple-system, sans-serif" font-size="${selectedSizeId === 'slim' || selectedSizeId === 'a6' ? '11' : '14'}" font-weight="600" fill="#374151">Hizmetlerimizi görüntülemek için</text>
    <text x="0" y="${selectedSizeId === 'slim' || selectedSizeId === 'a6' ? '115' : '120'}" text-anchor="middle" font-family="Poppins, Inter, system-ui, -apple-system, sans-serif" font-size="${selectedSizeId === 'slim' || selectedSizeId === 'a6' ? '11' : '14'}" font-weight="600" fill="#dc2626">QR kodunu taratın</text>
    
    <text x="0" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af">www.innpanel.com</text>
  </g>
</svg>`;
  }, [qrCodeDataUrl, selectedSize, selectedSizeId]);

  const handleDownload = async () => {
    if (!location) return;
    try {
      const svgContent = await generateSVGContent();
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-stand-${location.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${selectedSize.id}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Başarılı",
        description: "QR stand SVG dosyası indirildi",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Hata",
        description: "SVG dosyası indirilemedi",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!location) return;
    try {
      const canvas = document.createElement('canvas');
      await drawQRStand(canvas, 3);

      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: selectedSize.mmWidth > selectedSize.mmHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [selectedSize.mmWidth, selectedSize.mmHeight]
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, selectedSize.mmWidth, selectedSize.mmHeight);

      pdf.save(`qr-stand-${location.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${selectedSize.id}.pdf`);

      toast({
        title: "Başarılı",
        description: "PDF dosyası indirildi",
      });

    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulamadı",
        variant: "destructive",
      });
    }
  };

  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[95vh] p-0 overflow-hidden">
        <DialogTitle>
          <VisuallyHidden.Root>QR Kodu Standı</VisuallyHidden.Root>
        </DialogTitle>
        
        <div className="flex h-full">
          <div className="w-80 border-r bg-muted/30 flex flex-col max-h-full">
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">QR Kodu Standı</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  onClick={() => setShowLocationInfo(true)}
                >
                  <Info className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {location.name} için QR kodu standı oluşturun
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6 min-h-full">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">QR Kod URLsi</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {qrUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyUrl}
                      className="flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Stand Boyutu Seçin</Label>
                  <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {QR_SIZES.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card className="border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Boyut Bilgileri</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">En: {selectedSize.width}</span>
                        </div>
                        <div>
                          <span className="font-medium">Boy: {selectedSize.height}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground pt-2">
                        Yazdırma boyutu: {selectedSize.mmWidth}mm x {selectedSize.mmHeight}mm
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="p-6 border-t bg-muted/40">
              <div className="space-y-3 mb-4">
                <Button 
                  onClick={handleDownload}
                  className="w-full"
                  variant="outline"
                  disabled={!qrCodeDataUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  İndir (SVG)
                </Button>
                <Button 
                  onClick={handleDownloadPDF}
                  className="w-full"
                  variant="outline"
                  disabled={!qrCodeDataUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  İndir (PDF)
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">• PDF formatı yazdırma için uygundur</p>
                <p>• SVG formatı düzenleme için idealdir</p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 flex flex-col">
            <div className="p-6 border-b bg-white flex items-center justify-between">
              <div>
              <h3 className="text-lg font-semibold text-gray-800">Ön İzleme</h3>
              <p className="text-sm text-muted-foreground">
                QR standının nasıl görüneceğini inceleyin
              </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.4}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 2}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-8 w-8 p-0"
                  title="Sıfırla"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8">
            <ScrollArea className="w-full h-full">
              <div className="flex items-center justify-center min-h-full">
                <div 
                  ref={printAreaRef}
                  className="bg-white shadow-2xl border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    width: selectedSizeId === "slim" ? "200px" : selectedSizeId === "square" ? "300px" : selectedSizeId === "a6" ? "210px" : "296px",
                    height: selectedSizeId === "square" ? "300px" : selectedSizeId === "a6" ? "296px" : "420px",
                    transform: `scale(${selectedSize.previewScale * zoomLevel})`,
                    transformOrigin: "center"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                  
                  <div className="relative z-10 text-center space-y-4 p-6">
                    <div className="space-y-1">
                      <h1 className="text-xl font-bold text-primary">INN Panel</h1>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary/20 mx-auto inline-block">
                      <div className="w-24 h-24 bg-white border border-gray-200 rounded flex items-center justify-center">
                        {qrCodeDataUrl ? (
                          <Image 
                            src={qrCodeDataUrl} 
                            alt="QR Code" 
                            width={80}
                            height={80}
                            className="w-20 h-20"
                          />
                        ) : (
                          <QrCode className="w-20 h-20 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={`font-semibold text-gray-700 ${selectedSizeId === "slim" || selectedSizeId === "a6" ? "text-xs" : "text-sm"}`} style={{ fontFamily: 'Poppins, Inter, system-ui, -apple-system, sans-serif' }}>
                        Hizmetlerimizi görüntülemek için
                      </p>
                      <p className={`font-semibold text-primary ${selectedSizeId === "slim" || selectedSizeId === "a6" ? "text-xs" : "text-sm"}`} style={{ fontFamily: 'Poppins, Inter, system-ui, -apple-system, sans-serif' }}>
                        QR kodunu taratın
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-gray-400">www.innpanel.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {showLocationInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Hizmet Noktası Bilgileri</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLocationInfo(false)}
                  className="p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <span className="font-medium text-sm">Hizmet Noktası:</span>
                  <p className="text-sm text-muted-foreground">{location.name}</p>
                </div>
                <div>
                  <span className="font-medium text-sm">Tür:</span>
                  <p className="text-sm text-muted-foreground">
                    {location.type === "hotel" ? "Otel" : 
                     location.type === "cafe" ? "Cafe" :
                     location.type === "restaurant" ? "Restoran" :
                     location.type === "agency" ? "Acenta" :
                     location.type === "activity" ? "Aktivite Merkezi" : "Diğer"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-sm">Yetkili:</span>
                  <p className="text-sm text-muted-foreground">{location.managerName}</p>
                </div>
                <div>
                  <span className="font-medium text-sm">QR URL:</span>
                  <p className="text-xs text-muted-foreground font-mono break-all">{qrUrl}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}