import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Komponen overlay untuk sudut-sudut area scan
const ScannerOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-full h-full">
      {/* Sudut-sudut */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
      
      {/* Garis Laser Animasi (dibatasi oleh parent) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 rounded-full animate-scan-laser"></div>
    </div>
  </div>
);

export const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode("barcode-scanner-container");
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      // Kita tidak lagi butuh qrbox karena video akan mengisi div-nya
    };

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      onScanSuccess(decodedText);
    };
    const qrCodeErrorCallback = (errorMessage) => { /* Abaikan error */ };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).catch((err) => {
      console.error("Gagal memulai scanner", err);
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch(err => console.error("Gagal menghentikan scanner.", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center p-4 animate-fade-in">
      {/* --- PERUBAHAN UTAMA ADA DI SINI --- */}
      {/* Jendela Viewfinder Kamera */}
      <div className="relative w-full max-w-md h-64 bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
        {/* Wadah untuk video kamera */}
        <div id="barcode-scanner-container" className="w-full h-full"></div>
        {/* Overlay di atas video */}
        <ScannerOverlay />
      </div>

      <p className="z-10 text-white text-lg mt-6">Posisikan barcode di dalam kotak</p>
      
      <button
        onClick={() => {
          if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop();
          }
          onClose();
        }}
        className="z-10 mt-6 bg-white bg-opacity-20 backdrop-blur-md text-white font-bold py-3 px-8 rounded-lg border border-white border-opacity-30"
      >
        Batal
      </button>
    </div>
  );
};
