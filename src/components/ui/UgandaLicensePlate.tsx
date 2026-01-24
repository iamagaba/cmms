import React from 'react';
import { cn } from '@/lib/utils';

interface UgandaLicensePlateProps {
    plateNumber: string;
    className?: string;
}

export const UgandaLicensePlate: React.FC<UgandaLicensePlateProps> = ({
    plateNumber,
    className
}) => {
    // Format usually: UAA 123A
    // Ensure uppercase
    const formattedPlate = plateNumber.toUpperCase().replace(/\s/g, ''); // Remove existing spaces to control spacing manually

    // Split assuming format UMA 001AA (3 letters, space, rest) or similar standard Uganda formats
    // Simple heuristic: First 3 chars, then space, then rest.
    const prefix = formattedPlate.substring(0, 3);
    const suffix = formattedPlate.substring(3);

    return (
        <>



            <div
                className={cn(
                    "inline-flex bg-white border border-gray-400 rounded overflow-hidden select-none box-border",
                    "h-[26px] min-w-[110px]", // Significantly reduced height and width
                    className
                )}
                title="Uganda Registration Plate"
                style={{
                    borderColor: '#9ca3af', // gray-400
                    borderWidth: '1px',
                }}
            >
                {/* Left Strip */}
                <div
                    className="flex flex-col items-center h-full border-r border-gray-400 bg-white"
                    style={{ width: '18px', padding: '2px 0' }} // Narrower strip
                >
                    {/* Flag */}
                    <div className="flex flex-col w-[12px] h-[8px] mb-[1.5px]">
                        <div className="flex-1 bg-black"></div>
                        <div className="flex-1 bg-[#ffd700]"></div>
                        <div className="flex-1 bg-[#d40000]"></div>
                    </div>

                    {/* Country Text */}
                    <div className="text-center font-bold leading-none text-black transform scale-[0.8]" style={{ fontSize: '4px' }}>
                        <div>UGANDA</div>
                        <div className="mt-[0.5px]">EAC</div>
                    </div>
                </div>

                {/* Plate Content */}
                <div className="flex-1 flex items-center justify-center relative overflow-hidden px-1.5">
                    {/* Font styling to mimic FE-Schrift */}
                    <span
                        className="text-black font-black leading-none whitespace-nowrap"
                        style={{
                            fontFamily: 'monospace',
                            fontSize: '16px', // Reduced font size
                            letterSpacing: '1px',
                            WebkitTextStroke: '0.2px #000'
                        }}
                    >
                        {prefix}<span style={{ display: 'inline-block', width: '6px' }}></span>{suffix}
                    </span>
                </div>
            </div>
        </>
    );
};

