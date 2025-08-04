'use client';

import { useEffect, useRef } from 'react';
import { animate, createScope } from 'animejs';
import Image from 'next/image';

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<any>(null);

  useEffect(() => {
    if (!navRef.current) return;
    
    scopeRef.current = createScope({ root: navRef.current }).add((self: any) => {
      // Logo animation on navbar hover
      self.add('navLogoAnimate', (element: HTMLElement) => {
        const logo = element.querySelector('.nav-logo');
        if (logo) {
          animate(logo, {
            scale: [1, 1.15, 1],
            translateY: [0, -3, 0],
            duration: 400,
            ease: 'out(2)'
          });
        }
      });
    });

    return () => scopeRef.current?.revert();
  }, []);

  const handleNavHover = (e: React.MouseEvent<HTMLElement>) => {
    scopeRef.current?.methods.navLogoAnimate(e.currentTarget);
  };

  return (
    <nav ref={navRef} className="border-b border-gray-700 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a 
          href="/" 
          className="flex items-center space-x-3 hover:text-gray-300 transition-colors"
          onMouseEnter={handleNavHover}
        >
          <div className="nav-logo">
            <Image
              src="/blindfold.svg"
              alt="Blindfold Logo"
              width={40}
              height={18}
              className="filter brightness-0 invert"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">
            BLINDFOLD LIBRARY
          </h1>
        </a>

        <div className="space-x-4">
          <a
            href="/store"
            className="hover:text-gray-300 transition-colors"
          >
            STORE
          </a>
          <a
            href="/match"
            className="hover:text-gray-300 transition-colors"
          >
            MATCH
          </a>
          <a href="/sum" className="hover:text-gray-300 transition-colors">
            SUM
          </a>
          <a
            href="/decrypt"
            className="hover:text-gray-300 transition-colors"
          >
            DECRYPT
          </a>
        </div>
      </div>
    </nav>
  );
}