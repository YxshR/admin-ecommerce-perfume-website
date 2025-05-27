'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiImage,
  FiVideo,
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiX,
  FiLayout,
  FiPackage
} from 'react-icons/fi';
import AdminLayout from '@/app/components/AdminLayout';
import { useAdminAuth, getAdminToken } from '@/app/lib/admin-auth';

// Define page sections for customization
interface SectionItem {
  id: string;
  type: 'product' | 'image' | 'video' | 'text' | 'banner' | 'gallery';
  content: any;
  position: number;
}

interface LayoutPage {
  pageId: string;
  pageName: string;
  pagePath: string;
  sections: SectionItem[];
}

// Mock data for available products
interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function AdminLayoutPage() {
  const router = useRouter();
  const { loading: authLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<LayoutPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionType, setSectionType] = useState<SectionItem['type']>('product');
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  // Mock available pages that can be customized
  const availablePages = [
    { pageId: 'home', pageName: 'Home Page', pagePath: '/' },
    { pageId: 'store', pageName: 'Store Page', pagePath: '/store-routes/store' },
    { pageId: 'collection', pageName: 'Collection Page', pagePath: '/collection' },
    { pageId: 'discovery-set', pageName: 'Discovery Sets', pagePath: '/discovery-set' },
    { pageId: 'combos', pageName: 'Combo Offers', pagePath: '/combos' },
    { pageId: 'new-arrivals', pageName: 'New Arrivals', pagePath: '/new-arrivals' },
    { pageId: 'gifting', pageName: 'Gifting Page', pagePath: '/gifting' },
    { pageId: 'about-us', pageName: 'About Us', pagePath: '/about-us' }
  ];

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
      fetchLayoutData();
    }
  }, [authLoading]);
  
  const fetchProducts = async () => {
    try {
      // Use the dedicated layout products API endpoint instead of the main products API
      const token = getAdminToken();
      if (!token) {
        console.error('No admin token found');
        return;
      }

      const response = await fetch('/api/layout/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setAvailableProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Provide fallback mock data when API fails
      const mockProducts = [
        {
          _id: 'mock-prod-1',
          name: 'Royal Oud Perfume',
          price: 2999,
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Royal+Oud' }]
        },
        {
          _id: 'mock-prod-2',
          name: 'Floral Dreams',
          price: 1899,
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Floral+Dreams' }]
        },
        {
          _id: 'mock-prod-3',
          name: 'Citrus Splash',
          price: 1599,
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Citrus+Splash' }]
        },
        {
          _id: 'mock-prod-4',
          name: 'Woody Collection',
          price: 2499,
          images: [{ url: 'https://placehold.co/400x400/272420/FFFFFF?text=Woody+Collection' }]
        }
      ];
      setAvailableProducts(mockProducts);
    }
  };

  const fetchLayoutData = async () => {
    setLoading(true);
    try {
      // Fetch layout data from the API
      console.log('Fetching layout data from API...');
      const response = await fetch('/api/admin/layout/get', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch layout data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.layouts && data.layouts.length > 0) {
        // We have existing layouts from the database
        console.log(`Found ${data.layouts.length} layouts in the database`);
        setPages(data.layouts);
        
        // Set first page as selected by default
        if (data.layouts.length > 0 && !selectedPageId) {
          console.log('Setting default selected page:', data.layouts[0].pageId);
          setSelectedPageId(data.layouts[0].pageId);
        }
      } else {
        // No layouts found in the database, use available pages as templates
        console.log('No existing layouts found, creating templates from availablePages');
        const templateLayouts: LayoutPage[] = availablePages.map(page => ({
          pageId: page.pageId,
          pageName: page.pageName,
          pagePath: page.pagePath,
          sections: []
        }));
        
        console.log(`Created ${templateLayouts.length} template layouts`);
        setPages(templateLayouts);
      
        // Set first page as selected by default
        if (templateLayouts.length > 0 && !selectedPageId) {
          console.log('Setting default selected page from templates:', templateLayouts[0].pageId);
          setSelectedPageId(templateLayouts[0].pageId);
        }
      }
    } catch (error) {
      console.error('Error fetching layout data:', error);
      // Fallback to templates
      console.log('Error occurred, falling back to template layouts');
      const templateLayouts: LayoutPage[] = availablePages.map(page => ({
        pageId: page.pageId,
        pageName: page.pageName,
        pagePath: page.pagePath,
        sections: []
      }));
      
      console.log(`Created ${templateLayouts.length} fallback template layouts`);
      setPages(templateLayouts);
      
      // Set first page as selected by default
      if (templateLayouts.length > 0 && !selectedPageId) {
        console.log('Setting default selected page from fallback templates:', templateLayouts[0].pageId);
        setSelectedPageId(templateLayouts[0].pageId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (pageId: string) => {
    console.log('Page selected:', pageId);
    setSelectedPageId(pageId);
    setPreviewMode(false);
    
    // Check if the page exists in the pages array
    const pageExists = pages.find(page => page.pageId === pageId);
    console.log('Page exists in pages array:', !!pageExists);
    
    if (!pageExists) {
      // Create a new page template if it doesn't exist
      console.log('Creating new page template for:', pageId);
      const pageTemplate = availablePages.find(page => page.pageId === pageId);
      
      if (pageTemplate) {
        const newPage = {
          pageId: pageTemplate.pageId,
          pageName: pageTemplate.pageName,
          pagePath: pageTemplate.pagePath,
          sections: []
        };
        
        setPages(prevPages => [...prevPages, newPage]);
        console.log('Added new page template:', newPage);
      }
    }
  };

  const getCurrentPage = (): LayoutPage | undefined => {
    const currentPage = pages.find(page => page.pageId === selectedPageId);
    console.log('getCurrentPage called, selectedPageId:', selectedPageId);
    console.log('Found page:', currentPage ? currentPage.pageName : 'Not found');
    
    // If page not found but selectedPageId exists, create a template page
    if (!currentPage && selectedPageId) {
      const template = availablePages.find(page => page.pageId === selectedPageId);
      if (template) {
        console.log('Creating template page for:', template.pageName);
        const newPage = {
          pageId: template.pageId,
          pageName: template.pageName,
          pagePath: template.pagePath,
          sections: []
        };
        
        // Add the new page to the pages array
        setPages(prevPages => [...prevPages, newPage]);
        return newPage;
      }
    }
    
    return currentPage;
  };

  const addNewSection = () => {
    setSectionType('product');
    setEditingSection(null);
    setShowSectionModal(true);
  };

  const editSection = (section: SectionItem) => {
    setEditingSection(section);
    setSectionType(section.type);
    setShowSectionModal(true);
  };

  const removeSection = (sectionId: string) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;

    // Filter out the section to be removed
    const updatedSections = currentPage.sections.filter(section => section.id !== sectionId);
    
    // Update the pages state with the new sections array
    setPages(prevPages => 
      prevPages.map(page => 
        page.pageId === currentPage.pageId 
          ? { ...page, sections: updatedSections } 
          : page
      )
    );
  };

  const moveSectionUp = (index: number) => {
    const currentPage = getCurrentPage();
    if (!currentPage || index <= 0) return;
    
    // Create a copy of the sections array
    const sections = [...currentPage.sections];
    
    // Swap positions with the section above
    const temp = sections[index];
    sections[index] = sections[index - 1];
    sections[index - 1] = temp;

    // Update positions
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      position: idx
    }));
    
    // Update the pages state
    setPages(prevPages => 
      prevPages.map(page => 
        page.pageId === currentPage.pageId 
          ? { ...page, sections: updatedSections } 
          : page
      )
    );
  };

  const moveSectionDown = (index: number) => {
    const currentPage = getCurrentPage();
    if (!currentPage || index >= currentPage.sections.length - 1) return;

    // Create a copy of the sections array
    const sections = [...currentPage.sections];
    
    // Swap positions with the section below
    const temp = sections[index];
    sections[index] = sections[index + 1];
    sections[index + 1] = temp;

    // Update positions
    const updatedSections = sections.map((section, idx) => ({
      ...section,
      position: idx
    }));
    
    // Update the pages state
    setPages(prevPages => 
      prevPages.map(page => 
        page.pageId === currentPage.pageId 
          ? { ...page, sections: updatedSections } 
          : page
      )
    );
  };

  const handleSaveSection = async (sectionData: any) => {
    const currentPage = getCurrentPage();
    if (!currentPage) {
      console.error("No page selected");
      alert("Error: No page selected");
      return;
    }
    
    let uploadedImageUrl = sectionData.imageUrl || '';
    let uploadedVideoUrl = sectionData.videoUrl || '';
    let uploadedThumbnailUrl = sectionData.thumbnailUrl || '';

    // Handle Image Upload with progress tracking
    if (selectedImageFile) {
      setIsImageUploading(true);
      setImageUploadProgress(0);
      
      const imageFormData = new FormData();
      imageFormData.append('file', selectedImageFile);
      imageFormData.append('type', 'image');
      
      try {
        console.log('Uploading image file:', selectedImageFile.name, 'Size:', (selectedImageFile.size / (1024 * 1024)).toFixed(2), 'MB', 'Type:', selectedImageFile.type);
        
        // Use relative URL instead of absolute
        const uploadUrl = '/api/admin/upload';
        console.log('Using upload URL:', uploadUrl);
        
        // Use fetch API which is simpler but doesn't track progress
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: imageFormData,
          headers: {
            'Authorization': `Bearer ${getAdminToken()}`
          }
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Upload error response:', errorData || response.statusText);
          throw new Error(
            errorData?.error || `HTTP error ${response.status}: ${response.statusText}`
          );
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.success && result.url) {
          uploadedImageUrl = result.url;
        } else {
          throw new Error(result.error || 'Unknown upload error');
        }
        
        // Reset progress after successful upload
        setIsImageUploading(false);
        setImageUploadProgress(100);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsImageUploading(false);
        return;
      }
    }

    // Handle Video Upload with progress tracking
    if (selectedVideoFile) {
      setIsVideoUploading(true);
      setVideoUploadProgress(0);
      
      const videoFormData = new FormData();
      videoFormData.append('file', selectedVideoFile);
      videoFormData.append('type', 'video');
      
      try {
        console.log('Uploading video file:', selectedVideoFile.name, 'Size:', (selectedVideoFile.size / (1024 * 1024)).toFixed(2), 'MB', 'Type:', selectedVideoFile.type);
        
        // Use relative URL instead of absolute
        const uploadUrl = '/api/admin/upload';
        console.log('Using upload URL:', uploadUrl);
        
        // Use XMLHttpRequest to track upload progress
        uploadedVideoUrl = await uploadFileWithProgress(
          videoFormData, 
          uploadUrl, 
          setVideoUploadProgress
        );
        
        // Reset progress after successful upload
        setIsVideoUploading(false);
        
        // Handle thumbnail logic (same as before)
        if (sectionData.thumbnailUrl && !uploadedThumbnailUrl) {
          uploadedThumbnailUrl = '';
        }
      } catch (error) {
        console.error('Error uploading video:', error);
        alert(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsVideoUploading(false);
        return;
      }
    }

    let updatedSections: SectionItem[];
    const commonContent = {
      title: sectionData.title,
      subtitle: sectionData.subtitle,
      description: sectionData.description,
      buttonText: sectionData.buttonText,
      buttonLink: sectionData.buttonLink,
    };
    
    if (editingSection) {
      updatedSections = currentPage.sections.map(section =>
        section.id === editingSection.id
          ? {
              ...section,
              type: sectionType,
              content: {
                ...section.content,
                ...commonContent,
                ...(sectionType === 'product' && { productIds: sectionData.productIds }),
                ...((sectionType === 'image' || sectionType === 'banner') && { 
                  imageUrl: uploadedImageUrl || (section.content.imageUrl || '') 
                }),
                ...(sectionType === 'video' && { 
                  videoUrl: uploadedVideoUrl || (section.content.videoUrl || ''), 
                  thumbnailUrl: uploadedThumbnailUrl || (section.content.thumbnailUrl || '') 
                }),
                ...(sectionType === 'text' && { body: sectionData.body }),
              }
            }
          : section
      );
    } else {
      const newSection: SectionItem = {
        id: `section-${Date.now()}`,
        type: sectionType,
        content: {
          ...commonContent,
          ...(sectionType === 'product' && { productIds: sectionData.productIds || [] }),
          ...((sectionType === 'image' || sectionType === 'banner') && { imageUrl: uploadedImageUrl }),
          ...(sectionType === 'video' && { 
            videoUrl: uploadedVideoUrl, 
            thumbnailUrl: uploadedThumbnailUrl
          }),
          ...(sectionType === 'text' && { body: sectionData.body || '' }),
        },
        position: currentPage.sections.length
      };
      updatedSections = [...currentPage.sections, newSection];
    }

    setPages(prevPages => 
      prevPages.map(page => 
        page.pageId === selectedPageId
          ? { ...page, sections: updatedSections } 
          : page
      )
    );
    
    setShowSectionModal(false);
    setEditingSection(null);
    setSelectedImageFile(null);
    setSelectedVideoFile(null);
  };

  const handleSaveLayout = async () => {
    try {
      // Save layout data to the database through API
      console.log('Saving layout data:', pages);
      
      const selectedPage = getCurrentPage();
      if (!selectedPage) {
        alert('No page selected to save');
        return;
      }
      
      setLoading(true);
      
      const response = await fetch('/api/admin/layout/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          pageId: selectedPage.pageId,
          pageName: selectedPage.pageName,
          pagePath: selectedPage.pagePath,
          sections: selectedPage.sections
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to save layout: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Layout saved successfully:', result);
      
      alert('Layout saved successfully! Changes will be visible on the website.');
      setLoading(false);
    } catch (error) {
      console.error('Error saving layout:', error);
      alert(`Failed to save layout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  // Helper function to upload file with progress tracking
  const uploadFileWithProgress = (formData: FormData, url: string, setProgress: (progress: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Debug the request before sending
      console.log('XHR setup for URL:', url);
      console.log('FormData contents:', 
        [...formData.entries()].map(([key, value]) => {
          if (value instanceof File) {
            return `${key}: File(${value.name}, ${value.type}, ${(value.size / 1024).toFixed(2)}KB)`;
          }
          return `${key}: ${value}`;
        })
      );
      
      // Setup progress event
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      });
      
      // Setup load event
      xhr.addEventListener('load', () => {
        console.log('XHR load event fired, status:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('XHR successful response:', response);
            if (response.success) {
              resolve(response.url);
            } else {
              console.error('Server returned error:', response.error || 'Unknown error');
              reject(new Error(response.error || 'Upload failed'));
            }
          } catch (error) {
            console.error('Failed to parse server response:', xhr.responseText);
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            // Try to parse error from response
            const errorData = JSON.parse(xhr.responseText);
            console.error(`HTTP error ${xhr.status}: ${errorData.error || xhr.statusText}`);
            reject(new Error(errorData.error || `HTTP error ${xhr.status}: ${xhr.statusText}`));
          } catch (e) {
            // If we can't parse JSON, use the status text
            console.error(`HTTP error ${xhr.status}: ${xhr.statusText}, Response:`, xhr.responseText);
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        }
      });
      
      // Setup error event
      xhr.addEventListener('error', () => {
        console.error('Network error during upload');
        reject(new Error('Network error occurred'));
      });
      
      // Setup timeout event
      xhr.addEventListener('timeout', () => {
        console.error('Upload request timed out');
        reject(new Error('Request timeout'));
      });
      
      // Get the file type from formData
      const fileType = formData.get('type') as string;
      const isVideo = fileType === 'video';
      
      // Open and send the request - try with a more specific API path
      console.log('Opening XHR connection to:', url);
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${getAdminToken()}`);
      
      // Set longer timeout for videos (5 minutes) vs images (2 minutes)
      xhr.timeout = isVideo ? 300000 : 120000; // 5 minutes for videos, 2 minutes for images
      
      // Send the request
      console.log('Sending XHR request with FormData');
      xhr.send(formData);
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentPage = getCurrentPage();

  return (
    <AdminLayout activeRoute="/admin/layout">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Layout Editor</h1>
          <p className="text-gray-600">Customize the appearance and content of your store pages</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center text-gray-700 bg-white hover:bg-gray-50"
          >
            <FiEye className="mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            onClick={handleSaveLayout}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
          >
            <FiSave className="mr-2" />
            Save Layout
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        {/* Page Selector Sidebar */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4 flex items-center">
            <FiLayout className="mr-2" /> Page Templates
          </h2>
          <div className="space-y-2">
            {availablePages.map(page => (
              <button
                key={page.pageId}
                onClick={() => handlePageSelect(page.pageId)}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  selectedPageId === page.pageId
                    ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-100'
                }`}
              >
                {page.pageName}
              </button>
            ))}
          </div>
        </div>
        
        {/* Layout Editor */}
        <div className="col-span-3 bg-white rounded-lg shadow">
          {!currentPage ? (
            <div className="p-6 text-center text-gray-500">
              Select a page to edit its layout
            </div>
          ) : previewMode ? (
            // Preview Mode
            <div className="p-6">
              <div className="mb-4 text-sm text-gray-500">
                Preview of {currentPage.pageName} ({currentPage.pagePath})
              </div>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[500px] bg-gray-50">
                {currentPage.sections.map((section, index) => (
                  <div key={section.id} className="mb-8 border-b pb-6">
                    {section.type === 'banner' && (
                      <div className="relative">
                        <img 
                          src={section.content.imageUrl} 
                          alt={section.content.title} 
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-black bg-opacity-40 rounded-lg">
                          <h2 className="text-3xl font-bold mb-2">{section.content.title}</h2>
                          <p className="text-xl">{section.content.subtitle}</p>
                        </div>
                      </div>
                    )}
                    
                    {section.type === 'product' && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">{section.content.title}</h3>
                        <div className="grid grid-cols-4 gap-4">
                          {availableProducts.slice(0, 4).map(product => (
                            <div key={product._id} className="border rounded-lg p-3">
                              <img 
                                src={product.images[0]?.url}
                                alt={product.name}
                                className="w-full h-32 object-contain mb-2"
                              />
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-blue-600">₹{product.price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {section.type === 'text' && (
                      <div className="prose max-w-none">
                        <h3 className="text-xl font-semibold mb-2">{section.content.title}</h3>
                        <p>{section.content.body}</p>
                      </div>
                    )}
                    
                    {section.type === 'video' && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">{section.content.title}</h3>
                        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
                          {section.content.videoUrl ? (
                            <video
                              src={section.content.videoUrl}
                              autoPlay
                              loop
                              muted={false}
                              playsInline
                              controls={false}
                              className="absolute inset-0 w-full h-full object-cover"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ pointerEvents: 'none' }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <>
                              <img
                                src={section.content.thumbnailUrl}
                                alt="Video thumbnail"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-blue-600 ml-1"></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="p-6">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Editing: {currentPage.pageName} ({currentPage.pagePath})
                </h2>
                <button
                  onClick={addNewSection}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm flex items-center hover:bg-blue-700"
                >
                  <FiPlus className="mr-1" /> Add Section
                </button>
              </div>
              
              {currentPage.sections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">This page has no sections yet</p>
                  <button
                    onClick={addNewSection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center mx-auto hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2" /> Add Your First Section
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentPage.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md uppercase">
                            {section.type}
                          </span>
                          <h3 className="font-medium mt-1">
                            {section.content.title || `Untitled ${section.type} section`}
                          </h3>
                        </div>
                        <div className="flex space-x-2">
                          {index > 0 && (
                            <button 
                              onClick={() => moveSectionUp(index)} 
                              className="p-1 text-gray-500 hover:text-blue-600"
                              title="Move up"
                            >
                              ↑
                            </button>
                          )}
                          {index < currentPage.sections.length - 1 && (
                            <button 
                              onClick={() => moveSectionDown(index)} 
                              className="p-1 text-gray-500 hover:text-blue-600"
                              title="Move down"
                            >
                              ↓
                            </button>
                          )}
                          <button 
                            onClick={() => editSection(section)}
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Edit section"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => removeSection(section.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                            title="Remove section"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                        {section.type === 'banner' && (
                          <div className="flex items-center">
                            <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                              <img
                                src={section.content.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{section.content.title}</p>
                              <p className="truncate text-gray-500 text-xs">{section.content.subtitle}</p>
                            </div>
                          </div>
                        )}
                        
                        {section.type === 'product' && (
                          <div>
                            <p className="font-medium">{section.content.title}</p>
                            <p className="text-gray-500 text-xs">
                              {section.content.productIds ? `${section.content.productIds.length} products selected` : 'No products selected'}
                            </p>
                          </div>
                        )}
                        
                        {section.type === 'text' && (
                          <div>
                            <p className="font-medium">{section.content.title}</p>
                            <p className="text-gray-500 text-xs truncate">{section.content.body}</p>
                          </div>
                        )}
                        
                        {section.type === 'video' && (
                          <div className="flex items-center">
                            <div className="w-20 h-12 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0 relative">
                              <img
                                src={section.content.thumbnailUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-t-3 border-b-3 border-l-4 border-transparent border-l-blue-600 ml-0.5"></div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="truncate font-medium">{section.content.title}</p>
                              <p className="truncate text-gray-500 text-xs">Video content</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section Edit Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h3>
              <button 
                onClick={() => setShowSectionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form 
              className="p-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formElement = e.currentTarget;
                const formData = new FormData(formElement);
                const sectionData: any = {};
                
                // Convert FormData to object
                formData.forEach((value, key) => {
                  if (key === 'productIds') {
                    // Handle multiple select for products
                    const select = formElement.querySelector('select[name="productIds"]') as HTMLSelectElement;
                    const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
                    sectionData[key] = selectedOptions;
                  } else {
                    sectionData[key] = value;
                  }
                });
                
                handleSaveSection(sectionData);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                <select
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value as SectionItem['type'])}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={!!editingSection}
                >
                  <option value="product">Product Collection</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="text">Text</option>
                  <option value="banner">Banner</option>
                  <option value="gallery">Media Gallery</option>
                </select>
              </div>
              
              {/* Common Fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingSection?.content.title || ''}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Section title"
                />
              </div>
              
              {(sectionType !== 'text') && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
                    <input
                      type="text"
                      name="subtitle"
                      defaultValue={editingSection?.content.subtitle || ''}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Section subtitle"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      name="description"
                      defaultValue={editingSection?.content.description || ''}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Short description"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Text (Optional)</label>
                      <input
                        type="text"
                        name="buttonText"
                        defaultValue={editingSection?.content.buttonText || ''}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Shop Now"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Link (Optional)</label>
                      <input
                        type="text"
                        name="buttonLink"
                        defaultValue={editingSection?.content.buttonLink || ''}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., /collection"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* Product Section */}
              {sectionType === 'product' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Products</label>
                  <select
                    name="productIds"
                    multiple
                    className="w-full p-2 border border-gray-300 rounded-md h-40"
                    defaultValue={editingSection?.type === 'product' ? editingSection?.content.productIds : []}
                  >
                    {availableProducts.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ₹{product.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple products</p>
                </div>
              )}
              
              {/* Image or Banner Section */}
              {(sectionType === 'image' || sectionType === 'banner') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {sectionType === 'banner' ? 'Background Image URL' : 'Image URL'}
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    defaultValue={editingSection?.content.imageUrl || ''}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Enter image URL or upload new"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload New Image</label>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={(e) => setSelectedImageFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={isImageUploading}
                  />
                  {selectedImageFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedImageFile.name}</p>}
                  {editingSection?.content.imageUrl && !selectedImageFile && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Current image:</p>
                      <img src={editingSection.content.imageUrl} alt="Current" className="max-h-20 border rounded"/>
                    </div>
                  )}
                  
                  {/* Image upload progress bar */}
                  {isImageUploading && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Uploading: {imageUploadProgress}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${imageUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Section */}
              {sectionType === 'video' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                    <input
                      type="text"
                      name="videoUrl"
                      defaultValue={editingSection?.content.videoUrl || ''}
                      className="w-full p-2 border border-gray-300 rounded-md mb-2"
                      placeholder="Enter video URL (e.g., YouTube, Vimeo) or upload new"
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload New Video</label>
                    <input
                      type="file"
                      name="videoFile"
                      accept="video/*"
                      onChange={(e) => setSelectedVideoFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={isVideoUploading}
                    />
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-700">
                        <strong>Note:</strong> Videos will automatically play in a loop without controls or sound options.
                        Make sure your video is appropriately sized and optimized.
                      </p>
                    </div>
                    {selectedVideoFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedVideoFile.name}</p>}
                    {editingSection?.type === 'video' && editingSection?.content.videoUrl && !selectedVideoFile && (
                      <p className="text-xs text-gray-500 mt-1">Current video: {editingSection.content.videoUrl}</p>
                    )}
                    
                    {/* Video upload progress bar */}
                    {isVideoUploading && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Uploading: {videoUploadProgress}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${videoUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Thumbnail URL (Optional)</label>
                    <input
                      type="text"
                      name="thumbnailUrl"
                      defaultValue={editingSection?.type === 'video' ? editingSection?.content.thumbnailUrl : ''}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="URL for video thumbnail (if not uploading video)"
                    />
                    <p className="text-xs text-gray-500 mt-1">If uploading a video, a thumbnail might be auto-generated or you can upload one with the video.</p>
                  </div>
                </>
              )}
              
              {/* Text Section */}
              {sectionType === 'text' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Content</label>
                  <textarea
                    name="body"
                    defaultValue={editingSection?.type === 'text' ? editingSection?.content.body : ''}
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter text content here..."
                  ></textarea>
                </div>
              )}
              
              {/* Media Gallery Section */}
              {sectionType === 'gallery' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Gallery</label>
                  
                  {/* Display existing media items */}
                  {editingSection?.content?.mediaItems && editingSection.content.mediaItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {editingSection.content.mediaItems.map((item: any, index: number) => (
                        <div key={index} className="border rounded-md p-2">
                          <div className="relative w-full h-32 bg-gray-100 mb-2 rounded overflow-hidden">
                            {item.type === 'image' ? (
                              <img src={item.url} alt={`Gallery item ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl text-gray-400">▶</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 truncate">{item.type}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this ${item.type}?`)) {
                                  const updatedMediaItems = [...editingSection.content.mediaItems];
                                  updatedMediaItems.splice(index, 1);
                                  const updatedContent = {...editingSection.content, mediaItems: updatedMediaItems};
                                  setEditingSection({...editingSection, content: updatedContent});
                                }
                              }}
                              className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">No media items added yet.</p>
                  )}
                  
                  <div className="border rounded-md p-3 bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Add New Media Item</h4>
                    
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">Media Type</label>
                      <select 
                        name="newMediaType" 
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-xs text-gray-600 mb-1">Upload File</label>
                      <input
                        type="file"
                        name="newMediaFile"
                        accept="image/*,video/*"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={async (e) => {
                        const form = e.currentTarget.closest('form');
                        if (!form) return;
                        
                        const mediaTypeSelect = form.querySelector('select[name="newMediaType"]') as HTMLSelectElement;
                        const mediaFileInput = form.querySelector('input[name="newMediaFile"]') as HTMLInputElement;
                        
                        if (!mediaTypeSelect || !mediaFileInput || !mediaFileInput.files?.[0]) {
                          alert('Please select a file to upload');
                          return;
                        }
                        
                        const mediaType = mediaTypeSelect.value as 'image' | 'video';
                        const file = mediaFileInput.files[0];
                        
                        // Set uploading state based on media type
                        if (mediaType === 'image') {
                          setIsImageUploading(true);
                          setImageUploadProgress(0);
                        } else {
                          setIsVideoUploading(true);
                          setVideoUploadProgress(0);
                        }
                        
                        try {
                          // Create form data for upload
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('type', mediaType);
                          
                          // Upload the file
                          const uploadUrl = '/api/admin/upload';
                          console.log(`Uploading ${mediaType} for gallery:`, file.name);
                          
                          const response = await fetch(uploadUrl, {
                            method: 'POST',
                            body: formData,
                            headers: {
                              'Authorization': `Bearer ${getAdminToken()}`
                            }
                          });
                          
                          if (!response.ok) {
                            const errorData = await response.json().catch(() => null);
                            throw new Error(errorData?.error || `Upload failed: ${response.status} ${response.statusText}`);
                          }
                          
                          const result = await response.json();
                          
                          if (!result.success || !result.url) {
                            throw new Error(result.error || 'Upload failed - no URL returned');
                          }
                          
                          // Add the new media item to the section
                          const newMediaItem = {
                            type: mediaType,
                            url: result.url,
                            title: file.name
                          };
                          
                          // Update the editing section with the new media item
                          const currentMediaItems = editingSection?.content?.mediaItems || [];
                          const updatedContent = {
                            ...editingSection?.content,
                            mediaItems: [...currentMediaItems, newMediaItem]
                          };
                          
                          setEditingSection({
                            ...editingSection!,
                            content: updatedContent
                          });
                          
                          // Reset form and state
                          mediaFileInput.value = '';
                          setIsImageUploading(false);
                          setIsVideoUploading(false);
                          setImageUploadProgress(0);
                          setVideoUploadProgress(0);
                          
                          alert(`${mediaType} added to gallery successfully!`);
                        } catch (error) {
                          console.error(`Error uploading ${mediaType} for gallery:`, error);
                          alert(`Failed to upload ${mediaType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          setIsImageUploading(false);
                          setIsVideoUploading(false);
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      disabled={isImageUploading || isVideoUploading}
                    >
                      {isImageUploading || isVideoUploading ? (
                        <span>Uploading... {isImageUploading ? imageUploadProgress : videoUploadProgress}%</span>
                      ) : (
                        <span>Add to Gallery</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Image or Banner Section */}
              {(sectionType === 'image' || sectionType === 'banner') && (
                <div className="mb-4">
                  {editingSection?.content?.imageUrl && (
                    <div className="mb-3 p-3 border rounded-md">
                      <p className="text-sm font-medium mb-2">Current Image</p>
                      <div className="flex items-center">
                        <img 
                          src={editingSection.content.imageUrl} 
                          alt="Current image" 
                          className="w-20 h-20 object-cover rounded-md mr-3"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 truncate">{editingSection.content.imageUrl}</p>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this image?')) {
                                // Create a copy of the editing section with the image removed
                                const updatedContent = {...editingSection.content, imageUrl: ''};
                                setEditingSection({...editingSection, content: updatedContent});
                              }
                            }}
                            className="mt-2 px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200 hover:bg-red-100"
                          >
                            Delete Image
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Video Section */}
              {sectionType === 'video' && (
                <div className="mb-4">
                  {editingSection?.content?.videoUrl && (
                    <div className="mb-3 p-3 border rounded-md">
                      <p className="text-sm font-medium mb-2">Current Video</p>
                      <div className="flex items-center">
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-md mr-3">
                          <span className="text-3xl text-gray-400">▶</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 truncate">{editingSection.content.videoUrl}</p>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this video?')) {
                                // Create a copy of the editing section with the video removed
                                const updatedContent = {...editingSection.content, videoUrl: '', thumbnailUrl: ''};
                                setEditingSection({...editingSection, content: updatedContent});
                              }
                            }}
                            className="mt-2 px-2 py-1 bg-red-50 text-red-600 text-xs rounded border border-red-200 hover:bg-red-100"
                          >
                            Delete Video
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                  disabled={isImageUploading || isVideoUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isImageUploading || isVideoUploading}
                >
                  {isImageUploading || isVideoUploading ? 'Uploading...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 