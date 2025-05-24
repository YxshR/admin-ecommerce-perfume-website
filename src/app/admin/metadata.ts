import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Dashboard | Fraganote",
  description: "Admin dashboard for Fraganote perfume store",
  robots: {
    index: false,
    follow: false,
  },
  // Prevent caching and indexing of admin pages
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fraganote.com',
    title: 'Admin Area',
    description: 'Administrative area - authorized personnel only',
    siteName: 'Fraganote',
    images: [
      {
        url: '/images/admin-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Admin Dashboard',
      }
    ],
  }
}; 