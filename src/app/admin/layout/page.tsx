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
  type: 'product' | 'image' | 'video' | 'text' | 'banner';
  content: any;
  position: number;
}

interface LayoutPage {
  id: string;
  name: string;
  path: string;
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

  // Mock available pages that can be customized
  const availablePages = [
    { id: 'home', name: 'Home Page', path: '/' },
    { id: 'collection', name: 'Collection Page', path: '/collection' },
    { id: 'discovery-set', name: 'Discovery Sets', path: '/discovery-set' },
    { id: 'combos', name: 'Combo Offers', path: '/combos' },
    { id: 'new-arrivals', name: 'New Arrivals', path: '/new-arrivals' },
    { id: 'gifting', name: 'Gifting Page', path: '/gifting' },
    { id: 'about-us', name: 'About Us', path: '/about-us' }
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
      // In a real application, we would fetch layout data from an API
      // For now, we'll use mock data based on availablePages
      const mockLayoutData = availablePages.map(page => ({
        ...page,
        sections: generateMockSections(page.id)
      }));
      
      setPages(mockLayoutData);
      
      // Set first page as selected by default
      if (mockLayoutData.length > 0 && !selectedPageId) {
        setSelectedPageId(mockLayoutData[0].id);
      }
    } catch (error) {
      console.error('Error fetching layout data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock sections for demo purposes
  const generateMockSections = (pageId: string): SectionItem[] => {
    switch (pageId) {
      case 'home':
        return [
          {
            id: 'hero-banner',
            type: 'banner',
            content: {
              title: 'Discover Your Signature Scent',
              subtitle: 'Luxury fragrances for every occasion',
              imageUrl: 'https://placehold.co/1200x600/272420/FFFFFF?text=Hero+Banner'
            },
            position: 0
          },
          {
            id: 'featured-products',
            type: 'product',
            content: {
              title: 'Featured Products',
              productIds: ['prod-1', 'prod-2', 'prod-3', 'prod-4']
            },
            position: 1
          },
          {
            id: 'promo-video',
            type: 'video',
            content: {
              title: 'Our Craftsmanship',
              videoUrl: 'https://www.example.com/videos/craftsmanship.mp4',
              thumbnailUrl: 'https://placehold.co/800x450/272420/FFFFFF?text=Video+Thumbnail'
            },
            position: 2
          }
        ];
      case 'collection':
        return [
          {
            id: 'collection-header',
            type: 'banner',
            content: {
              title: 'Our Collection',
              subtitle: 'Explore our range of premium fragrances',
              imageUrl: 'https://placehold.co/1200x600/272420/FFFFFF?text=Collection+Banner'
            },
            position: 0
          },
          {
            id: 'bestsellers',
            type: 'product',
            content: {
              title: 'Best Sellers',
              productIds: ['prod-5', 'prod-6', 'prod-7', 'prod-8']
            },
            position: 1
          }
        ];
      default:
        return [
          {
            id: `${pageId}-default`,
            type: 'text',
            content: {
              title: 'Welcome',
              body: 'This page is ready to be customized.'
            },
            position: 0
          }
        ];
    }
  };

  const handlePageSelect = (pageId: string) => {
    setSelectedPageId(pageId);
    setPreviewMode(false);
  };

  const getCurrentPage = (): LayoutPage | undefined => {
    return pages.find(page => page.id === selectedPageId);
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
        page.id === currentPage.id 
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
        page.id === currentPage.id 
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
        page.id === currentPage.id 
          ? { ...page, sections: updatedSections } 
          : page
      )
    );
  };

  const handleSaveSection = (sectionData: any) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    let updatedSections = [...currentPage.sections];
    
    if (editingSection) {
      // Update existing section
      updatedSections = updatedSections.map(section => 
        section.id === editingSection.id
          ? { ...section, ...sectionData }
          : section
      );
    } else {
      // Add new section
      const newSection: SectionItem = {
        id: `section-${Date.now()}`, // Generate a unique ID
        type: sectionType,
        content: sectionData,
        position: updatedSections.length // Place at the end
      };
      
      updatedSections.push(newSection);
    }
    
    // Update the pages state
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === currentPage.id 
          ? { ...page, sections: updatedSections } 
          : page
      )
    );
    
    // Close the modal
    setShowSectionModal(false);
    setEditingSection(null);
  };

  const handleSaveLayout = async () => {
    try {
      // In a real application, you would send the layout data to an API endpoint
      console.log('Saving layout data:', pages);
      
      // Mock successful save
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
    }
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
                    key={page.id}
                    onClick={() => handlePageSelect(page.id)}
                className={`w-full text-left px-3 py-2 rounded-md ${
                      selectedPageId === page.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-100'
                    }`}
                  >
                    {page.name}
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
                Preview of {currentPage.name} ({currentPage.path})
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
                  Editing: {currentPage.name} ({currentPage.path})
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            
            <div className="relative bg-white rounded-lg max-w-3xl w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h3>
                <button
                  onClick={() => setShowSectionModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              {!editingSection && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Type
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['banner', 'product', 'text', 'video'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSectionType(type as SectionItem['type'])}
                        className={`p-3 border rounded-lg text-center ${
                          sectionType === type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {type === 'banner' && <FiImage className="mx-auto mb-2" size={24} />}
                        {type === 'product' && <FiPackage className="mx-auto mb-2" size={24} />}
                        {type === 'text' && <FiEdit className="mx-auto mb-2" size={24} />}
                        {type === 'video' && <FiVideo className="mx-auto mb-2" size={24} />}
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Section form based on type */}
              <div className="space-y-4">
                <p className="text-gray-500 text-sm italic">
                  This is a demo interface. In a real implementation, you would see form fields specific to the section type.
                </p>
                
                <div className="flex justify-end">
                <button
                  onClick={() => {
                      // For demo purposes, we'll just create a simple content object
                      const demoContent = {
                        title: 'Demo Section Title',
                        ...(sectionType === 'banner' && {
                          subtitle: 'Demo subtitle text',
                          imageUrl: 'https://placehold.co/1200x600/272420/FFFFFF?text=Demo+Banner'
                        }),
                        ...(sectionType === 'product' && {
                          productIds: availableProducts.slice(0, 4).map(p => p._id)
                        }),
                        ...(sectionType === 'text' && {
                          body: 'This is a sample text section content. In a real implementation, this would be editable.'
                        }),
                        ...(sectionType === 'video' && {
                          videoUrl: 'https://www.example.com/demo-video.mp4',
                          thumbnailUrl: 'https://placehold.co/800x450/272420/FFFFFF?text=Demo+Video'
                        })
                      };
                      
                      handleSaveSection(demoContent);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Section
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 