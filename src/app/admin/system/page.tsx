'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave } from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth } from '@/app/lib/admin-auth';

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
  const { loading: authLoading } = useAdminAuth();
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
      // Load saved theme settings
      loadSettings();
      setLoading(false);
  }, []);
  
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
      
      // Show success message
      setSaveSuccess(true);
      setSaveError('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving theme settings:', error);
      setSaveError('Failed to save theme settings. Please try again.');
    }
  };
  
  // Reset settings to defaults
  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all theme settings to defaults?')) {
      setColors({
        primary: '#3b82f6', // blue-500
        secondary: '#1f2937', // gray-800
        accent: '#f59e0b', // amber-500
        background: '#ffffff', // white
        text: '#111827', // gray-900
        buttonText: '#ffffff', // white
        navBackground: '#ffffff', // white
        footerBackground: '#f3f4f6', // gray-100,
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
      
      // Remove from localStorage
      localStorage.removeItem('theme_colors');
      localStorage.removeItem('theme_fonts');
      localStorage.removeItem('theme_button_styles');
      localStorage.removeItem('theme_other_settings');
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <AdminLayout activeRoute="/admin/system">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Customize your store's theme and appearance</p>
        </div>
        
        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Theme settings saved successfully!
          </div>
        )}
        
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {saveError}
          </div>
        )}
          
          {/* Color Settings */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="flex">
                  <input
                    type="color"
                  id={key}
                  name={key}
                  value={value}
                    onChange={handleColorChange}
                  className="h-10 w-10 border border-gray-300 rounded mr-2"
                  />
                  <input
                    type="text"
                  value={value}
                    onChange={handleColorChange}
                  name={key}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
                </div>
              </div>
              
      {/* Font Settings */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(fonts).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key} Font
                </label>
                <select
                id={key}
                name={key}
                value={value}
                  onChange={handleFontChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {fontOptions.map(font => (
                  <option key={font} value={font}>{font}</option>
                  ))}
                </select>
            </div>
          ))}
            </div>
          </div>
          
          {/* Button Styles */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Button Styles</h2>
            <div className="space-y-4">
              <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Corner Radius</p>
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
            <p className="text-sm font-medium text-gray-700 mb-2">Options</p>
            <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={buttonStyles.shadow}
                      onChange={() => handleButtonStyleChange('shadow')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                <span className="ml-2 text-sm text-gray-700">Drop Shadow</span>
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
              
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                  <button 
              className={`px-4 py-2 bg-${colors.primary} text-${colors.buttonText} 
                ${buttonStyles.roundedFull ? 'rounded-full' : ''} 
                ${buttonStyles.roundedMd ? 'rounded-md' : ''}
                ${buttonStyles.roundedNone ? 'rounded-none' : ''}
                ${buttonStyles.shadow ? 'shadow-md' : ''}
                ${buttonStyles.uppercase ? 'uppercase' : ''}
              `}
              style={{ backgroundColor: colors.primary, color: colors.buttonText }}
            >
              Button Preview
                  </button>
              </div>
            </div>
          </div>
          
          {/* Other Settings */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Additional Settings</h2>
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
              <span className="ml-2 text-sm text-gray-700">Show Announcement Bar</span>
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
              <span className="ml-2 text-sm text-gray-700">Enable Dark Mode Option</span>
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
              <span className="ml-2 text-sm text-gray-700">Use Animations</span>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {productCardStyles.map(style => (
                <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
              ))}
                </select>
            </div>
          </div>
        </div>
        
      {/* Action Buttons */}
      <div className="flex justify-between">
          <button
            onClick={resetSettings}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset to Defaults
          </button>
          
          <button
            onClick={saveSettings}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
          <FiSave className="mr-2 -ml-1 h-5 w-5" />
          Save Settings
          </button>
      </div>
    </AdminLayout>
  );
} 