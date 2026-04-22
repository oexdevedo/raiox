import logoImage from '@/assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 36, text: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 48, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 64, text: 'text-3xl', sub: 'text-sm' },
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <div className="absolute inset-0 bg-[#DFA83F]/20 rounded-full blur-md group-hover:blur-lg transition-all" />
        <img 
          src={logoImage} 
          alt="Raio X Ex Devedor Logo" 
          width={sizes[size].icon} 
          height={sizes[size].icon}
          className="relative rounded-full ring-2 ring-[#DFA83F]/40 hover:ring-[#DFA83F]/60 transition-all shadow-md"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black ${sizes[size].text} text-foreground leading-tight tracking-tighter uppercase`}>
            Raio X
          </span>
          <span className={`${sizes[size].sub} font-bold text-[#DFA83F] -mt-1 tracking-[0.2em] uppercase`}>
            Ex Devedor
          </span>
        </div>
      )}
    </div>
  );
};
