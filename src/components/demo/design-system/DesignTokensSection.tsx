import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HugeiconsIcon } from '@hugeicons/react';
import { PaintBoardIcon, InformationCircleIcon } from '@hugeicons/core-free-icons';

interface TokenGroup {
    category: string;
    tokens: string[];
}

const tokenGroups: TokenGroup[] = [
    {
        category: "Core Base Colors",
        tokens: [
            "--background",
            "--foreground",
            "--card",
            "--card-foreground",
            "--popover",
            "--popover-foreground"
        ]
    },
    {
        category: "Component Colors",
        tokens: [
            "--primary",
            "--primary-foreground",
            "--secondary",
            "--secondary-foreground",
            "--muted",
            "--muted-foreground",
            "--accent",
            "--accent-foreground",
            "--destructive",
            "--destructive-foreground"
        ]
    },
    {
        category: "Borders & Inputs",
        tokens: [
            "--border",
            "--input",
            "--ring"
        ]
    },
    {
        category: "Global Metrics",
        tokens: [
            "--radius"
        ]
    }
];

const industrialGroups: TokenGroup[] = [
    {
        category: "Industrial Slate (Grays)",
        tokens: [
            "--industrial-slate-50",
            "--industrial-slate-100",
            "--industrial-slate-200",
            "--industrial-slate-300",
            "--industrial-slate-400",
            "--industrial-slate-500",
            "--industrial-slate-600",
            "--industrial-slate-700",
            "--industrial-slate-800",
            "--industrial-slate-900",
        ]
    },
    {
        category: "Brand Purple (Nova)",
        tokens: [
            "--brand-purple-500",
            "--brand-purple-600",
            "--brand-purple-700",
        ]
    },
    {
        category: "Safety Amber",
        tokens: [
            "--safety-amber-500",
            "--safety-amber-600",
            "--safety-amber-700",
        ]
    },
    {
        category: "Operational Green",
        tokens: [
            "--operational-green-500",
            "--operational-green-600",
            "--operational-green-700",
        ]
    },
    {
        category: "Alert Red",
        tokens: [
            "--alert-red-500",
            "--alert-red-600",
            "--alert-red-700",
        ]
    }
];

const TokenSwatch = ({ name, value }: { name: string, value: string }) => {
    // Determine if the value is an HSL string (space separated numbers) or a hex/rgb string
    // shadcn/ui uses space separated HSL values for its root variables e.g., "262.1 83.3% 57.8%"
    // Industrial theme uses hex codes e.g., "#a855f7"

    let bgStyle = value;
    const isHslList = /^\d+(\.\d+)?(\s+\d+(\.\d+)?%){2}$/.test(value.trim());

    if (isHslList) {
        bgStyle = `hsl(${value})`;
    }

    return (
        <div className="flex items-center gap-3 p-2 rounded border border-gray-100 bg-white shadow-sm">
            <div
                className="w-12 h-12 rounded border border-gray-200 shadow-inner shrink-0"
                style={{ background: bgStyle }}
                aria-label={`Color swatch for ${name}`}
            />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate" title={name}>{name}</p>
                <code className="text-[10px] text-gray-500 truncate block mt-1" title={value}>{value}</code>
            </div>
        </div>
    );
};

const DesignTokensSection: React.FC = () => {
    const [tokenValues, setTokenValues] = useState<Record<string, string>>({});

    useEffect(() => {
        // Function to read all token values from the computed styles
        const readTokens = () => {
            const styles = getComputedStyle(document.documentElement);
            const newValues: Record<string, string> = {};

            [...tokenGroups, ...industrialGroups].forEach(group => {
                group.tokens.forEach(token => {
                    newValues[token] = styles.getPropertyValue(token).trim();
                });
            });

            setTokenValues(newValues);
        };

        // Read immediately
        readTokens();

        // Optional: Re-read on theme change if we had a theme switcher context, 
        // but for now a simple mount read is sufficient for the demo page.
    }, []);

    return (
        <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <HugeiconsIcon icon={PaintBoardIcon} size={20} />
                    Live Design Tokens
                </CardTitle>
                <CardDescription className="text-indigo-700">
                    Programmatically retrieved CSS variable values from the active stylesheet.
                    These represent the <strong>actual code source of truth</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

                {/* Core Shadcn System */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-slate-900 rounded-full"></span>
                        Core Shadcn System
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Values defined in <code>App.css</code> using HSL channel format.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tokenGroups.map((group) => (
                            <div key={group.category} className="bg-white/80 p-4 rounded-lg border border-indigo-100 backdrop-blur-sm">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">{group.category}</h4>
                                <div className="space-y-2">
                                    {group.tokens.map(token => (
                                        <TokenSwatch key={token} name={token} value={tokenValues[token] || 'Loading...'} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Industrial Theme System */}
                <div className="space-y-4 mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                        Industrial Theme System
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Values defined in <code>industrial-theme.css</code> using Hex format.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {industrialGroups.map((group) => (
                            <div key={group.category} className="bg-white/80 p-4 rounded-lg border border-purple-100 backdrop-blur-sm">
                                <h4 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">{group.category}</h4>
                                <div className="space-y-2">
                                    {group.tokens.map(token => (
                                        <TokenSwatch key={token} name={token} value={tokenValues[token] || 'Loading...'} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Alert className="bg-white border-indigo-200">
                    <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-indigo-600" />
                    <AlertTitle className="text-indigo-900">Developer Note</AlertTitle>
                    <AlertDescription className="text-indigo-800 text-xs">
                        These values are live-read from <code>document.documentElement</code>.
                        If you see a color here, it is available globally throughout the application.
                        Use standard shadcn variables (<code>--primary</code>) for components and Industrial variables (<code>--industrial-slate-500</code>) for custom workshop features.
                    </AlertDescription>
                </Alert>

            </CardContent>
        </Card>
    );
};

export default DesignTokensSection;
