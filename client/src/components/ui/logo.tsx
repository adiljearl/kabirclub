import { Link } from 'wouter';

export const Logo = () => {
  return (
    // <span className="font-heading font-bold text-2xl tracking-tight text-primary">
    //   <span className="text-[#e53e3e]">Kabir</span> Club
    // </span>
    <div className="flex items-center">
    {/* <img 
      src="./kabirclublogo.png" 
      alt="Knight Logo" 
      className="mr-2 w-12 h-12"
    /> */}
    <span 
      className="font-serif font-bold text-2xl tracking-tight" 
      style={{
        fontFamily: "'Times New Roman', Times, serif",
        color: 'black'
      }}
    >
      Kabir Club
    </span>
  </div>
  );
};

export default Logo;
