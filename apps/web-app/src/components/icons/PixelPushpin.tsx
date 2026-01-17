import type { ImgHTMLAttributes, ReactNode } from 'react';

interface PixelPushpinProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    size?: number;
    /** When true, renders in grayscale. When false, renders in full color. */
    gray?: boolean;
}

export function PixelPushpin({ size = 24, gray = false, className, style, ...props }: PixelPushpinProps): ReactNode {
    return (
        <img
            src="/pushpin.svg"
            alt="Pin"
            width={size}
            height={size}
            className={className}
            style={{ ...style, filter: gray ? 'grayscale(1)' : undefined }}
            {...props}
        />
    );
}
