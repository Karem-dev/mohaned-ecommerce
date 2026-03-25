import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Rocket, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const years = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ]
    },
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/shop' },
        { name: 'Featured', href: '/shop?featured=true' },
        { name: 'New Arrivals', href: '/shop?sort=newest' },
        { name: 'Categories', href: '/categories' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Shipping & Returns', href: '/shipping' },
        { name: 'Track Order', href: '/account/orders' },
      ]
    },
  ];

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">

        {/* Brand & Newsletter */}
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 text-slate-900 shadow-2xl">
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic">Mohaned store</span>
          </Link>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
            Elevating your shopping experience with premium curated collections and seamless service. Welcome to the gravity-defying marketplace.
          </p>
          <div className="pt-4 flex gap-4">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:border-white transition-all transform hover:-translate-y-1"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {footerLinks.map((section) => (
          <div key={section.title} className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{section.title}</h4>
            <ul className="space-y-4">
              {section.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Info */}
        <div className="space-y-6 lg:ml-auto">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 group">
              <Mail className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <span className="block text-xs font-black uppercase text-slate-600 mb-1">Email</span>
                <a href="mailto:[EMAIL_ADDRESS]" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">[EMAIL_ADDRESS]</a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <span className="block text-xs font-black uppercase text-slate-600 mb-1">Phone</span>
                <span className="text-sm font-bold text-slate-300">+2 010 224 99 888</span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-slate-600 mt-1" />
              <div>
                <span className="block text-xs font-black uppercase text-slate-600 mb-1">Address</span>
                <span className="text-sm font-bold text-slate-300">Egypt - Alexandria</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          &copy; {years} Mohaned store Marketplace Inc. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/MasterCard_Logo.svg/1024px-MasterCard_Logo.svg.png" className="h-5" alt="MasterCard" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1024px-Visa_Inc._logo.svg.png" className="h-3" alt="Visa" />
        </div>
      </div>

      {/* Background Micro-Decoration */}
      <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-slate-800 rounded-full blur-[200px] opacity-20 pointer-events-none" />
      <div className="absolute -top-1/4 -left-1/4 w-[400px] h-[400px] bg-slate-900 rounded-full blur-[150px] opacity-10 pointer-events-none" />
    </footer>
  );
};

export default Footer;
