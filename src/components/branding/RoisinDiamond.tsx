import React from 'react';

interface RoisinDiamondProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
}

export default function RoisinDiamond({
  size = 20,
  className = '',
  color = 'currentColor',
  ...props
}: RoisinDiamondProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 175 127"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M144.29 105L101.9 132.89L59.14 105.37L15 134.74L101.99 231.06L189.08 134.74L144.29 105ZM141.69 112.96L150.57 132.49H112.5L141.69 112.96ZM62.25 113L91.44 132.52H53.37L62.25 113ZM147.7 114.07L175.65 132.42H156.25L147.7 114.07ZM56.24 114.1L47.69 132.45H28.29L56.24 114.1ZM156.74 137.87L178.81 138.07L129.58 191.09L156.74 137.87ZM25.26 137.88H47.6L75.59 191.81L25.26 137.88ZM109.02 137.88H150.95L139.77 159.44L109.02 137.88ZM53.61 137.97H70.51L93.5 211.76L53.61 137.97ZM75.87 137.97H97.94V206.77L75.87 137.97ZM103.94 140.83L137.42 164L114.89 207.23L103.94 219.98V140.83Z"
        transform="translate(-14.5, -104.5)"
        fill={color}
      />
    </svg>
  );
}
