import React, { useState, useEffect } from 'react';
import './MroiEmbedPage.css';

const MROI_EXTERNAL_URL = 'http://10.2.113.35:4173/mroi';

interface IframeError {
  type: 'cors' | 'timeout' | 'auth' | 'unknown';
  message: string;
}

export const MroiEmbedPage: React.FC = () => {
  const [iframeError, setIframeError] = useState<IframeError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Set timeout สำหรับ detect error จากการ load iframe
    const loadTimeout = setTimeout(() => {
      if (!iframeLoaded) {
        setIframeError({
          type: 'timeout',
          message: 'ไม่สามารถโหลด MROI ได้ในเวลาที่กำหนด',
        });
        setIsLoading(false);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(loadTimeout);
  }, [iframeLoaded]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIframeLoaded(true);
    setIframeError(null);
  };

  const handleIframeError = () => {
    setIframeError({
      type: 'cors',
      message: 'ไม่สามารถโหลด MROI ได้ (อาจเนื่องจาก CORS หรือ X-Frame-Options)',
    });
    setIsLoading(false);
  };

  const handleRedirect = () => {
    window.location.href = MROI_EXTERNAL_URL;
  };

  const handleRetry = () => {
    setIsLoading(true);
    setIframeError(null);
    setIframeLoaded(false);
  };

  return (
    <div className="mroi-embed-container">
      {/* Header */}
      <div className="mroi-header">
        <h1>🎥 MROI Dashboard</h1>
        <p>Multiple Region of Interest Management System</p>
      </div>

      {/* Loading State */}
      {isLoading && !iframeError && (
        <div className="mroi-loading">
          <div className="spinner"></div>
          <p>กำลังโหลด MROI Dashboard...</p>
        </div>
      )}

      {/* Error State */}
      {iframeError && (
        <div className="mroi-error-container">
          <div className="mroi-error">
            <div className="error-icon">⚠️</div>
            <h2>ไม่สามารถโหลด MROI ได้</h2>
            <p className="error-message">{iframeError.message}</p>
            <p className="error-type">
              ประเภท: <code>{iframeError.type}</code>
            </p>

            {/* Error Details for CORS */}
            {iframeError.type === 'cors' && (
              <div className="error-details">
                <h3>สาเหตุที่เป็นไปได้:</h3>
                <ul>
                  <li>Server MROI ห้ามไม่ให้ iframe จาก domain อื่น (X-Frame-Options)</li>
                  <li>CORS policy ไม่อนุญาต</li>
                  <li>Server MROI ไม่สามารถเข้าถึงได้</li>
                </ul>
              </div>
            )}

            {/* Fallback Options */}
            <div className="error-actions">
              <button className="btn btn-primary" onClick={handleRetry}>
                🔄 ลองใหม่อีกครั้ง
              </button>
              <button className="btn btn-secondary" onClick={handleRedirect}>
                🔗 เปิดใน Tab ใหม่
              </button>
            </div>

            {/* Additional Info */}
            <div className="error-info">
              <p>
                <strong>URL ที่พยายามเข้าถึง:</strong> <code>{MROI_EXTERNAL_URL}</code>
              </p>
              <p className="hint">
                💡 หากปัญหายังคงเกิดขึ้น โปรดติดต่อผู้ดูแลระบบ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Iframe - Hidden when error or loading */}
      {!iframeError && (
        <div className={`mroi-iframe-wrapper ${iframeLoaded ? 'loaded' : ''}`}>
          <iframe
            src={MROI_EXTERNAL_URL}
            title="MROI Dashboard"
            className="mroi-iframe"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
            allow="camera; microphone; geolocation"
          />
        </div>
      )}
    </div>
  );
};

export default MroiEmbedPage;
