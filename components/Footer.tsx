import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const navigation = {
    main: [
      { name: 'Trang chủ', href: '/' },
      { name: 'Giao dịch', href: '/trade' },
      { name: 'Tài khoản', href: '/account' },
      { name: 'Lịch sử giao dịch', href: '/orders' },
      { name: 'Nạp tiền', href: '/deposit' },
      { name: 'Rút tiền', href: '/withdraw' },
    ],
    support: [
      { name: 'Hướng dẫn', href: '/help' },
      { name: 'Điều khoản', href: '/terms' },
      { name: 'Bảo mật', href: '/privacy' },
      { name: 'Liên hệ', href: '/contact' },
    ],
  };

  const social = [
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <nav className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4" aria-label="Footer">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Điều hướng</h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.main.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Hỗ trợ</h3>
            <ul role="list" className="mt-4 space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Liên hệ</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400 mr-3 mt-0.5" />
                <span className="text-sm leading-6">123 Đường ABC, Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-400 mr-3" />
                <a href="tel:+84123456789" className="text-sm hover:text-white transition-colors duration-200">
                  +84 123 456 789
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-400 mr-3" />
                <a href="mailto:support@londonssi.com" className="text-sm hover:text-white transition-colors duration-200">
                  support@londonssi.com
                </a>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 flex-shrink-0 text-blue-400 mr-3 mt-0.5" />
                <span className="text-sm leading-6">Thứ 2 - Thứ 6: 8:00 - 17:00</span>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="mt-10 flex justify-center space-x-6">
          {social.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className="text-gray-400 hover:text-white transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        
        <p className="mt-10 text-center text-xs leading-5 text-gray-400">
          &copy; {currentYear} London SSI. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}
