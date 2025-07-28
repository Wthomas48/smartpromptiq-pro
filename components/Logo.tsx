interface LogoProps {
  size?: number;
}

export default function Logo({ size = 40 }: LogoProps) {
  return (
    <div 
      className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        IQ
      </span>
    </div>
  );
}
