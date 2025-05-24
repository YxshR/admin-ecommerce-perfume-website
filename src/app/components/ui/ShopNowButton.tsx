import Link from 'next/link';

interface ShopNowButtonProps {
  href: string;
  className?: string;
}

export default function ShopNowButton({ href, className = '' }: ShopNowButtonProps) {
  return (
    <Link href={href}>
      <div className={`bg-black text-white px-8 py-3 rounded-md flex items-center justify-between hover:bg-gray-800 transition-colors ${className}`}>
        <span className="font-medium">Shop Now</span>
        <span className="ml-2">→</span>
      </div>
    </Link>
  );
} 