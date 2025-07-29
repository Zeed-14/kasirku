import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Konfigurasi scanner
    const config = {
      fps: 10, // Frames per second
      qrbox: { width: 250, height: 250 }, // Ukuran kotak scan
      rememberLastUsedCamera: true,
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      "barcode-scanner-container", // ID dari div container
      config,
      false // verbose
    );

    const handleScan = (decodedText, decodedResult) => {
      // Hentikan scanner dan panggil fungsi sukses
      html5QrcodeScanner.clear();
      onScanSuccess(decodedText);
    };

    const handleError = (errorMessage) => {
      // console.error(errorMessage);
    };

    html5QrcodeScanner.render(handleScan, handleError);

    // Cleanup function: penting untuk menghentikan kamera saat komponen unmount/modal ditutup
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Gagal membersihkan scanner.", error);
        });
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center">
      <div id="barcode-scanner-container" className="w-full max-w-md bg-white rounded-lg overflow-hidden"></div>
      <button
        onClick={onClose}
        className="mt-4 bg-white text-black font-bold py-2 px-6 rounded-lg"
      >
        Tutup
      </button>
    </div>
  );
};
