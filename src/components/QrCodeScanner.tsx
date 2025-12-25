import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const QrCodeScanner: React.FC = () => {
  const navigate = useNavigate();
  const qrCodeScannerRef = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    html5QrCode.current = new Html5Qrcode("qr-reader");

    const config = {
      fps: 10,
      qrbox: 250,
    };

    html5QrCode.current.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        // Handle the scanned QR code
        navigate(`/assets/${decodedText}`);
        html5QrCode.current?.stop();
      },
      (errorMessage) => {
        // Handle scan error
        console.log(errorMessage);
      }
    ).catch(err => {
      console.error("Unable to start scanning:", err);
    });

    return () => {
      html5QrCode.current?.stop();
    };
  }, [navigate]);

  return (
    <div>
      <h2>Scan Asset QR Code</h2>
      <div id="qr-reader" ref={qrCodeScannerRef} style={{ width: "100%" }}></div>
    </div>
  );
};

export default QrCodeScanner;