'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PolicyPage() {
  const [copied, setCopied] = useState(false);
  const meetLink = "https://meet.google.com/wvq-xjzu-mam";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-medium mb-8">Company Policies</h1>
        
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-4">Virtual Consultation Policy</h2>
          <p className="text-gray-600 mb-6">
            We offer virtual consultations for customers who want personalized fragrance recommendations 
            or have questions about our products. You can connect with our fragrance experts using the Google Meet link below:
          </p>
          
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-6 flex items-center justify-between">
            <a 
              href={meetLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {meetLink}
            </a>
            <button 
              onClick={copyToClipboard}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Please note the following guidelines for virtual consultations:
          </p>
          
          <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
            <li>Consultations are available Monday to Friday, 10 AM to 6 PM.</li>
            <li>Please schedule your consultation at least 24 hours in advance.</li>
            <li>Sessions typically last 15-30 minutes.</li>
            <li>Come prepared with any questions about fragrances or products.</li>
            <li>Our experts can recommend products based on your preferences and needs.</li>
          </ul>
        </div>
        
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-4">Return Policy</h2>
          <p className="text-gray-600 mb-4">
            We want you to be completely satisfied with your purchase. If you're not, we offer a hassle-free return policy:
          </p>
          
          <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
            <li>Returns accepted within 30 days of purchase with original receipt.</li>
            <li>Products must be unused, unopened, and in original packaging.</li>
            <li>Refunds will be processed to the original payment method.</li>
            <li>Shipping costs are non-refundable.</li>
            <li>Gift cards and sale items are final sale and cannot be returned.</li>
          </ul>
        </div>
        
        <div className="mb-12">
          <h2 className="text-xl font-medium mb-4">Privacy Policy</h2>
          <p className="text-gray-600 mb-4">
            We value your privacy and are committed to protecting your personal information:
          </p>
          
          <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
            <li>We collect only necessary information for processing orders and improving our services.</li>
            <li>Your data is never sold to third parties.</li>
            <li>We use industry-standard security measures to protect your information.</li>
            <li>You may opt out of marketing communications at any time.</li>
            <li>We use cookies to enhance your browsing experience on our website.</li>
          </ul>
          
          <p className="text-gray-600">
            For our complete privacy policy, please visit our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</Link> page.
          </p>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 