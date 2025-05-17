import React, { useRef, useState } from 'react';
import styles from '../../styles/SwipeToDelete.module.css';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export const SwipeToDelete: React.FC<SwipeToDeleteProps> = ({ children, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Só permite arrastar para a esquerda
    if (diff < 0) {
      setTranslateX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Verifica se arrastou o suficiente para mostrar o botão de deletar
    if (translateX < -100) {
      setTranslateX(-100); // Mantém o botão visível
    } else {
      setTranslateX(0); // Retorna à posição original
    }
  };

  const handleDelete = () => {
    onDelete();
    setTranslateX(0);
  };

  return (
    <div 
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={containerRef}
    >
      <div 
        className={styles.content}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {children}
      </div>
      <button 
        className={styles.deleteButton}
        onClick={handleDelete}
        style={{ opacity: translateX < -50 ? 1 : 0 }}
      >
        Deletar
      </button>
    </div>
  );
};