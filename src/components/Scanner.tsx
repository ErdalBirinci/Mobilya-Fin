import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (text) => {
        scanner.clear();
        onScan(text);
      },
      (err) => {
        // We usually don't show all scan errors as they happen constantly until a code is found
        console.warn(err);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      <div className="p-4 flex justify-between items-center bg-slate-800 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <Camera size={20} /> Ürün Tarat
        </h3>
        <button onClick={onClose} className="p-2 bg-slate-700 rounded-full">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center p-4 bg-black">
        <div id="qr-reader" className="w-full max-w-sm bg-white rounded-lg overflow-hidden"></div>
        {error && <p className="text-red-400 mt-4 text-sm font-medium">{error}</p>}
        <p className="text-white mt-8 text-center text-sm opacity-70">
          Kamerayı kullanarak ürün üzerindeki QR kodu okutun.
        </p>
      </div>
    </div>
  );
};
