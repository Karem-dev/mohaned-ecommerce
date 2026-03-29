import React from 'react';

/**
 * BiText Component
 * Standardizes bilingual (English/Arabic) text rendering across the platform.
 * 
 * @param {string} en - English text
 * @param {string} ar - Arabic text
 * @param {string} className - Additional CSS classes
 * @param {boolean} sub - If true, applies smaller typography
 * @param {string} colorClass - Override color classes (e.g., 'text-primary')
 * @param {string} align - text-left, text-center, text-right, text-justify
 */
const BiText = ({ en, ar, className = "", sub = false, colorClass = "", align = "" }) => {
    return (
        <div className={`flex flex-col ${align} ${className}`}>
            <span className={`${sub ? 'text-[9px]' : 'text-xs'} font-black uppercase tracking-widest italic leading-tight ${colorClass || 'text-on-surface-variant'}`}>
                {en}
            </span>
            <span 
                className={`${sub ? 'text-[10px]' : 'text-sm'} font-bold leading-tight ${colorClass || 'text-on-surface'}`} 
                style={{ fontFamily: "'Cairo', sans-serif" }}
            >
                {ar}
            </span>
        </div>
    );
};

export default BiText;
