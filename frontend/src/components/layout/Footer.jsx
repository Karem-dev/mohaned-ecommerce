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
    <footer className="w-full rounded-t-[2rem] mt-20 bg-surface-container-low font-body">
      <div className="flex flex-col md:flex-row justify-between items-start px-8 md:px-12 py-16 gap-12 w-full max-w-7xl mx-auto">
        <div className="max-w-xs">
          <Link to="/" className="text-xl font-bold text-primary mb-6 block">Rose Store</Link>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            Defining digital luxury through curated vision and editorial excellence. Your destination for high-end aesthetics.
          </p>
          <div className="flex gap-4">
            {['alternate_email', 'share', 'chat'].map(icon => (
              <a key={icon} className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary transition-all group" href="#">
                <span className="material-symbols-outlined text-primary group-hover:text-white text-sm">{icon}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h4 className="text-primary font-bold text-sm uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4">
              {['Shop All', 'Trending', 'New Arrivals', 'About Us'].map(l => (
                <li key={l}><a className="text-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-primary font-bold text-sm uppercase tracking-widest mb-6">Service</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Shipping & Returns', 'Contact Us'].map(l => (
                <li key={l}><a className="text-sm text-on-surface-variant hover:text-primary hover:underline transition-all" href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full md:w-80">
          <h4 className="text-primary font-bold text-sm uppercase tracking-widest mb-6">Editorial Insights</h4>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">Subscribe to our weekly editorial newsletter for trends, early access, and curated luxury news.</p>
          <div className="relative">
            <input className="w-full bg-white border border-outline-variant/30 rounded-full py-4 pl-6 pr-12 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="email@address.com" type="email" />
            <button className="absolute right-2 top-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-secondary transition-all">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/5 py-8 px-12 text-center">
        <p className="text-xs text-on-surface-variant opacity-90">© 2026 Radiant Editorial. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
