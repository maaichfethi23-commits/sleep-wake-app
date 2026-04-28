import { useEffect, useRef } from 'react';

export default function MouseGlow() {
  const blobRef = useRef(null);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Smooth animation loop using lerp (linear interpolation)
    let animationFrameId;
    
    const animate = () => {
      // Lerp factor (lower = smoother/slower, higher = faster/snappier)
      // 0.15 gives a nice smooth trail effect
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      
      // Translate the blob. We use translate(-50%, -50%) to center it on the cursor.
      blob.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className="mouse-glow-blob" ref={blobRef}></div>
      <div className="mouse-glow-blur"></div>
    </>
  );
}