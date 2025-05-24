'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiLogOut, FiSettings, FiSave, FiEye } from 'react-icons/fi';

// Define types for our theme configs
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  buttonText: string;
  navBackground: string;
  footerBackground: string;
}

interface ThemeFonts {
  heading: string;
  body: string;
}

interface ButtonStyles {
  roundedFull: boolean;
  roundedMd: boolean;
  roundedNone: boolean;
  shadow: boolean;
  uppercase: boolean;
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Theme settings state
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#3b82f6', // blue-500
    secondary: '#1f2937', // gray-800
    accent: '#f59e0b', // amber-500
    background: '#ffffff', // white
    text: '#111827', // gray-900
    buttonText: '#ffffff', // white
    navBackground: '#ffffff', // white
    footerBackground: '#f3f4f6', // gray-100
  });
  
  const [fonts, setFonts] = useState<ThemeFonts>({
    heading: 'Montserrat',
    body: 'Montserrat',
  });
  
  const [buttonStyles, setButtonStyles] = useState<ButtonStyles>({
    roundedFull: false,
    roundedMd: true,
    roundedNone: false,
    shadow: true,
    uppercase: false,
  });
  
  const [otherSettings, setOtherSettings] = useState({
    showAnnouncementBar: true,
    enableDarkMode: false,
    useAnimations: true,
    productCardsStyle: 'minimal',
  });
  
  // Available options
  const fontOptions = ['Montserrat', 'Inter', 'Roboto', 'Lato', 'Open Sans', 'Playfair Display', 'Poppins'];
  const productCardStyles = ['minimal', 'bordered', 'shadowed', 'elegant'];
  
  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      
      setIsAdmin(true);
      setUserName(userData.name || 'Admin');
      
      // Load saved theme settings
      loadSettings();
      
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Load settings from localStorage (in a real app, this would be from your API)
  const loadSettings = () => {
    try {
      const savedColors = localStorage.getItem('theme_colors');
      const savedFonts = localStorage.getItem('theme_fonts');
      const savedButtonStyles = localStorage.getItem('theme_button_styles');
      const savedOtherSettings = localStorage.getItem('theme_other_settings');
      
      if (savedColors) {
        setColors(JSON.parse(savedColors));
      }
      
      if (savedFonts) {
        setFonts(JSON.parse(savedFonts));
      }
      
      if (savedButtonStyles) {
        setButtonStyles(JSON.parse(savedButtonStyles));
      }
      
      if (savedOtherSettings) {
        setOtherSettings(JSON.parse(savedOtherSettings));
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };
  
  // Handle color input changes
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setColors(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle font select changes
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFonts(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle button style changes
  const handleButtonStyleChange = (property: keyof ButtonStyles) => {
    if (['roundedFull', 'roundedMd', 'roundedNone'].includes(property)) {
      // These are mutually exclusive
      const updatedStyles: ButtonStyles = {
        ...buttonStyles,
        roundedFull: false,
        roundedMd: false,
        roundedNone: false
      };
      updatedStyles[property] = true;
      setButtonStyles(updatedStyles);
    } else {
      // Toggle the value
      setButtonStyles(prev => ({
        ...prev,
        [property]: !prev[property]
      }));
    }
  };
  
  // Handle other settings changes
  const handleOtherSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setOtherSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  // Save settings
  const saveSettings = () => {
    try {
      // Save to localStorage (in a real app, you would save to your database via API)
      localStorage.setItem('theme_colors', JSON.stringify(colors));
      localStorage.setItem('theme_fonts', JSON.stringify(fonts));
      localStorage.setItem('theme_button_styles', JSON.stringify(buttonStyles));
      localStorage.setItem('theme_other_settings', JSON.stringify(otherSettings));
      
      // Apply CSS variables to the root element (this would be done at app level in a real app)
      document.documentElement.style.setProperty('--color-primary', colors.primary);
      document.documentElement.style.setProperty('--color-secondary', colors.secondary);
      document.documentElement.style.setProperty('--color-accent', colors.accent);
      document.documentElement.style.setProperty('--color-background', colors.background);
      document.documentElement.style.setProperty('--color-text', colors.text);
      document.documentElement.style.setProperty('--color-button-text', colors.buttonText);
      
      // Show success message
      setSaveSuccess(true);
      setSaveError('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
      setSaveSuccess(false);
    }
  };
  
  // Reset settings to default
  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all theme settings to default?')) {
      localStorage.removeItem('theme_colors');
      localStorage.removeItem('theme_fonts');
      localStorage.removeItem('theme_button_styles');
      localStorage.removeItem('theme_other_settings');
      
      // Reset state to defaults
      setColors({
        primary: '#3b82f6', // blue-500
        secondary: '#1f2937', // gray-800
        accent: '#f59e0b', // amber-500
        background: '#ffffff', // white
        text: '#111827', // gray-900
        buttonText: '#ffffff', // white
        navBackground: '#ffffff', // white
        footerBackground: '#f3f4f6', // gray-100
      });
      
      setFonts({
        heading: 'Montserrat',
        body: 'Montserrat',
      });
      
      setButtonStyles({
        roundedFull: false,
        roundedMd: true,
        roundedNone: false,
        shadow: true,
        uppercase: false,
      });
      
      setOtherSettings({
        showAnnouncementBar: true,
        enableDarkMode: false,
        useAnimations: true,
        productCardsStyle: 'minimal',
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-blue-700 to-indigo-800">
          <h2 className="text-xl font-bold text-white">Fraganote Admin</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiBox className="mr-3" /> Dashboard
            </div>
          </Link>
          <Link href="/admin/products" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Products
            </div>
          </Link>
          <Link href="/admin/orders" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiShoppingBag className="mr-3" /> Orders
            </div>
          </Link>
          <Link href="/admin/users" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiUsers className="mr-3" /> Users
            </div>
          </Link>
          <Link href="/admin/settings" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> Settings
            </div>
          </Link>
          <Link href="/admin/system" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiSettings className="mr-3" /> System
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full text-left py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900"
          >
            <div className="flex items-center">
              <FiLogOut className="mr-3" /> Logout
            </div>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Customize the appearance of your store</p>
        </div>
        
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Settings saved successfully! Changes will take effect immediately.
          </div>
        )}
        
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {saveError}
          </div>
        )}
        
        {/* Theme Configuration */}
        <div className="grid grid-cols-1 gap-8">
          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6">Theme Preview</h2>
            
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6" style={{ backgroundColor: colors.background, color: colors.text }}>
                <div style={{ fontFamily: fonts.heading }}>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: colors.secondary }}>
                    Preview Your Theme
                  </h3>
                  
                  <p className="mb-4" style={{ fontFamily: fonts.body }}>
                    This is how your theme will look like on your website. The color scheme, typography, 
                    and button styles shown here will be applied across your store.
                  </p>
                  
                  <div className="mb-4 flex space-x-4">
                    <button 
                      style={{
                        backgroundColor: colors.primary, 
                        color: colors.buttonText,
                        borderRadius: buttonStyles.roundedFull ? '9999px' : 
                                     buttonStyles.roundedMd ? '0.375rem' : '0',
                        boxShadow: buttonStyles.shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
                        textTransform: buttonStyles.uppercase ? 'uppercase' : 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Primary Button
                    </button>
                    
                    <button
                      style={{
                        backgroundColor: colors.secondary,
                        color: colors.buttonText,
                        borderRadius: buttonStyles.roundedFull ? '9999px' : 
                                     buttonStyles.roundedMd ? '0.375rem' : '0',
                        boxShadow: buttonStyles.shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
                        textTransform: buttonStyles.uppercase ? 'uppercase' : 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Secondary Button
                    </button>
                    
                    <button
                      style={{
                        backgroundColor: colors.accent,
                        color: colors.buttonText,
                        borderRadius: buttonStyles.roundedFull ? '9999px' : 
                                     buttonStyles.roundedMd ? '0.375rem' : '0',
                        boxShadow: buttonStyles.shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
                        textTransform: buttonStyles.uppercase ? 'uppercase' : 'none',
                        padding: '0.5rem 1rem'
                      }}
                    >
                      Accent Button
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-2" style={{ color: colors.secondary, fontFamily: fonts.heading }}>
                      Product Example
                    </h4>
                    <div className="flex">
                      <div className="w-20 h-20 bg-gray-200 rounded-md mr-4"></div>
                      <div>
                        <h5 className="font-medium" style={{ fontFamily: fonts.heading }}>Product Name</h5>
                        <p className="text-sm" style={{ fontFamily: fonts.body }}>Product description goes here</p>
                        <p className="font-bold mt-1" style={{ color: colors.accent }}>₹1,499.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Color Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Color Settings</h2>
            <p className="text-gray-500 mb-6">Set the color scheme for your store</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="primary"
                    value={colors.primary}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.primary}
                    onChange={handleColorChange}
                    name="primary"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="secondary"
                    value={colors.secondary}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.secondary}
                    onChange={handleColorChange}
                    name="secondary"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="accent"
                    value={colors.accent}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.accent}
                    onChange={handleColorChange}
                    name="accent"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="background"
                    value={colors.background}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.background}
                    onChange={handleColorChange}
                    name="background"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="text"
                    value={colors.text}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.text}
                    onChange={handleColorChange}
                    name="text"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="buttonText"
                    value={colors.buttonText}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.buttonText}
                    onChange={handleColorChange}
                    name="buttonText"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nav Background Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="navBackground"
                    value={colors.navBackground}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.navBackground}
                    onChange={handleColorChange}
                    name="navBackground"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Background Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    name="footerBackground"
                    value={colors.footerBackground}
                    onChange={handleColorChange}
                    className="h-10 w-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={colors.footerBackground}
                    onChange={handleColorChange}
                    name="footerBackground"
                    className="ml-2 flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Typography Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Typography</h2>
            <p className="text-gray-500 mb-6">Configure the fonts used across your store</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading Font
                </label>
                <select
                  name="heading"
                  value={fonts.heading}
                  onChange={handleFontChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-lg font-medium" style={{ fontFamily: fonts.heading }}>
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Font
                </label>
                <select
                  name="body"
                  value={fonts.body}
                  onChange={handleFontChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
                <div className="mt-2" style={{ fontFamily: fonts.body }}>
                  The quick brown fox jumps over the lazy dog. This text shows how body text will appear throughout your website.
                </div>
              </div>
            </div>
          </div>
          
          {/* Button Styles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Button Styles</h2>
            <p className="text-gray-500 mb-6">Configure the appearance of buttons</p>
            
            <div className="space-y-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Button Shape</p>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={buttonStyles.roundedNone}
                      onChange={() => handleButtonStyleChange('roundedNone')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Square</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={buttonStyles.roundedMd}
                      onChange={() => handleButtonStyleChange('roundedMd')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Rounded</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={buttonStyles.roundedFull}
                      onChange={() => handleButtonStyleChange('roundedFull')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Pill</span>
                  </label>
                </div>
              </div>
              
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Button Options</p>
                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={buttonStyles.shadow}
                      onChange={() => handleButtonStyleChange('shadow')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add Shadow</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={buttonStyles.uppercase}
                      onChange={() => handleButtonStyleChange('uppercase')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Uppercase Text</span>
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="block text-sm font-medium text-gray-700 mb-2">Button Preview</p>
                <div className="flex space-x-4">
                  <button 
                    className="px-4 py-2"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.buttonText,
                      borderRadius: buttonStyles.roundedFull ? '9999px' : 
                                 buttonStyles.roundedMd ? '0.375rem' : '0',
                      boxShadow: buttonStyles.shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
                      textTransform: buttonStyles.uppercase ? 'uppercase' : 'none'
                    }}
                  >
                    Primary Button
                  </button>
                  
                  <button 
                    className="px-4 py-2"
                    style={{
                      backgroundColor: colors.secondary,
                      color: colors.buttonText,
                      borderRadius: buttonStyles.roundedFull ? '9999px' : 
                                 buttonStyles.roundedMd ? '0.375rem' : '0',
                      boxShadow: buttonStyles.shadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none',
                      textTransform: buttonStyles.uppercase ? 'uppercase' : 'none'
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Other Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Additional Settings</h2>
            <p className="text-gray-500 mb-6">Configure other visual aspects of your store</p>
            
            <div className="space-y-4">
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="showAnnouncementBar"
                    checked={otherSettings.showAnnouncementBar}
                    onChange={handleOtherSettingChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show announcement bar</span>
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="enableDarkMode"
                    checked={otherSettings.enableDarkMode}
                    onChange={handleOtherSettingChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable dark mode option</span>
                </label>
              </div>
              
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="useAnimations"
                    checked={otherSettings.useAnimations}
                    onChange={handleOtherSettingChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Use animations and transitions</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Card Style
                </label>
                <select
                  name="productCardsStyle"
                  value={otherSettings.productCardsStyle}
                  onChange={handleOtherSettingChange}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minimal">Minimal</option>
                  <option value="bordered">Bordered</option>
                  <option value="shadowed">Shadowed</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={resetSettings}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={saveSettings}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <FiSave className="mr-2" /> Save Settings
          </button>
        </div>
        
        {/* Preview Link */}
        <div className="mt-6 text-center">
          <Link href="/" target="_blank" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FiEye className="mr-1" /> Preview changes on your store
          </Link>
        </div>
      </div>
    </div>
  );
} 