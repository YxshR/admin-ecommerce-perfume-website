'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiBox, 
  FiShoppingBag, 
  FiUsers, 
  FiLogOut, 
  FiSettings, 
  FiGrid,
  FiImage,
  FiVideo,
  FiPackage,
  FiEdit,
  FiEye,
  FiSave,
  FiPlus,
  FiX,
  FiLayout
} from 'react-icons/fi';

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

export default function AdminLayout() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
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
      fetchProducts();
      fetchLayoutData();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/admin/login');
    }
  }, [router]);
  
  const fetchProducts = async () => {
    try {
      // Use the dedicated layout products API endpoint instead of the main products API
      const response = await fetch('/api/layout/products');
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

    const updatedSections = currentPage.sections.filter(section => section.id !== sectionId);
    
    // Update the page with new sections
    const updatedPages = pages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          sections: updatedSections
        };
      }
      return page;
    });

    setPages(updatedPages);
  };

  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    
    const currentPage = getCurrentPage();
    if (!currentPage) return;

    const updatedSections = [...currentPage.sections];
    const temp = updatedSections[index - 1];
    updatedSections[index - 1] = updatedSections[index];
    updatedSections[index] = temp;

    // Update positions
    updatedSections.forEach((section, idx) => {
      section.position = idx;
    });
    
    const updatedPages = pages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          sections: updatedSections
        };
      }
      return page;
    });

    setPages(updatedPages);
  };

  const moveSectionDown = (index: number) => {
    const currentPage = getCurrentPage();
    if (!currentPage || index >= currentPage.sections.length - 1) return;

    const updatedSections = [...currentPage.sections];
    const temp = updatedSections[index + 1];
    updatedSections[index + 1] = updatedSections[index];
    updatedSections[index] = temp;

    // Update positions
    updatedSections.forEach((section, idx) => {
      section.position = idx;
    });
    
    const updatedPages = pages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          sections: updatedSections
        };
      }
      return page;
    });

    setPages(updatedPages);
  };

  const handleSaveSection = (sectionData: any) => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;
    
    let updatedSections;
    
    if (editingSection) {
      // Update existing section
      updatedSections = currentPage.sections.map(section => {
        if (section.id === editingSection.id) {
          return {
            ...section,
            type: sectionType,
            content: sectionData
          };
        }
        return section;
      });
    } else {
      // Create new section
      const newSection: SectionItem = {
        id: `section-${Date.now()}`,
        type: sectionType,
        content: sectionData,
        position: currentPage.sections.length
      };
      updatedSections = [...currentPage.sections, newSection];
    }
    
    // Update the page with new sections
    const updatedPages = pages.map(page => {
      if (page.id === selectedPageId) {
        return {
          ...page,
          sections: updatedSections
        };
      }
      return page;
    });
    
    setPages(updatedPages);
    setShowSectionModal(false);
    setEditingSection(null);
  };

  const handleSaveLayout = async () => {
    try {
      // Send layout data to the dedicated layout save API
      const response = await fetch('/api/layout/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pages)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save layout');
      }
      
      alert('Layout saved successfully!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout. Please try again.');
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

  const currentPage = getCurrentPage();

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
          <Link href="/admin/layout" className="block py-3 px-4 text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 border-l-4 border-blue-600">
            <div className="flex items-center">
              <FiGrid className="mr-3" /> Layout
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
          <Link href="/admin/system" className="block py-3 px-4 text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900">
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Layout Management</h1>
            <p className="text-gray-600">Customize your store pages and layouts</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-4 py-2 rounded ${
                previewMode 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiEye className="mr-2" /> {previewMode ? 'Exit Preview' : 'Preview'}
            </button>
            <button
              onClick={handleSaveLayout}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FiSave className="mr-2" /> Save Changes
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Page Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-medium mb-4 text-gray-700">Select Page to Edit</h2>
              <div className="space-y-1">
                {availablePages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => handlePageSelect(page.id)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedPageId === page.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Page Editor or Preview */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {currentPage ? (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium">
                      {previewMode ? `Preview: ${currentPage.name}` : `Editing: ${currentPage.name}`}
                    </h2>
                    {!previewMode && (
                      <button
                        onClick={addNewSection}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <FiPlus className="mr-2" /> Add Section
                      </button>
                    )}
                  </div>
                  
                  {previewMode ? (
                    // Preview Mode
                    <div className="border rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[600px]">
                      <div className="p-4 bg-white">
                        <h3 className="text-lg font-medium text-center mb-6">Page Preview</h3>
                        
                        {currentPage.sections.sort((a, b) => a.position - b.position).map(section => (
                          <div key={section.id} className="mb-8 border rounded-lg p-4">
                            {section.type === 'banner' && (
                              <div className="relative">
                                <img 
                                  src={section.content.imageUrl} 
                                  alt={section.content.title} 
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                                  <div className="text-center text-white p-4">
                                    <h3 className="text-xl font-bold">{section.content.title}</h3>
                                    <p>{section.content.subtitle}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === 'product' && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">{section.content.title}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {availableProducts.slice(0, 4).map(product => (
                                    <div key={product._id} className="border rounded-lg p-2">
                                      <img 
                                        src={product.images[0]?.url || 'https://placehold.co/200x200/272420/FFFFFF?text=Product'} 
                                        alt={product.name}
                                        className="w-full h-24 object-cover rounded-lg"
                                      />
                                      <div className="mt-2">
                                        <p className="text-sm font-medium">{product.name}</p>
                                        <p className="text-xs text-gray-500">₹{product.price}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {section.type === 'video' && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">{section.content.title}</h3>
                                <div className="relative bg-black rounded-lg overflow-hidden aspect-w-16 aspect-h-9">
                                  <img
                                    src={section.content.thumbnailUrl}
                                    alt="Video thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                                      <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-gray-800 ml-1"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {section.type === 'text' && (
                              <div>
                                <h3 className="text-lg font-medium mb-3">{section.content.title}</h3>
                                <p className="text-gray-600">{section.content.body}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Edit Mode
                    <div className="border rounded-lg">
                      {currentPage.sections.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500">No sections yet. Click "Add Section" to start customizing this page.</p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section Type
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Content
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentPage.sections.sort((a, b) => a.position - b.position).map((section, index) => (
                              <tr key={section.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => moveSectionUp(index)} 
                                      disabled={index === 0}
                                      className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                      ↑
                                    </button>
                                    <span className="text-sm">{index + 1}</span>
                                    <button 
                                      onClick={() => moveSectionDown(index)} 
                                      disabled={index === currentPage.sections.length - 1}
                                      className={`p-1 rounded ${index === currentPage.sections.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {section.type === 'banner' && <FiImage className="mr-2 text-blue-500" />}
                                    {section.type === 'product' && <FiPackage className="mr-2 text-green-500" />}
                                    {section.type === 'video' && <FiVideo className="mr-2 text-red-500" />}
                                    {section.type === 'text' && <FiEdit className="mr-2 text-orange-500" />}
                                    <span className="capitalize">{section.type}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 truncate max-w-xs">
                                    {section.type === 'banner' && section.content.title}
                                    {section.type === 'product' && `${section.content.title} (${section.content.productIds?.length || 0} products)`}
                                    {section.type === 'video' && section.content.title}
                                    {section.type === 'text' && section.content.title}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      onClick={() => editSection(section)}
                                      className="text-blue-600 hover:text-blue-900 p-1"
                                    >
                                      <FiEdit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => removeSection(section.id)}
                                      className="text-red-600 hover:text-red-900 p-1"
                                    >
                                      <FiX size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">Select a page from the sidebar to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Edit Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingSection ? 'Edit Section' : 'Add New Section'}
                    </h3>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Type</label>
                      <select
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={sectionType}
                        onChange={(e) => setSectionType(e.target.value as SectionItem['type'])}
                      >
                        <option value="banner">Banner</option>
                        <option value="product">Product Showcase</option>
                        <option value="video">Video</option>
                        <option value="text">Text Content</option>
                      </select>
                    </div>
                    
                    <div className="mt-4">
                      {/* Dynamic form based on section type */}
                      {sectionType === 'banner' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.title || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.subtitle || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.imageUrl || 'https://placehold.co/1200x600/272420/FFFFFF?text=Banner'}
                            />
                          </div>
                        </div>
                      )}
                      
                      {sectionType === 'product' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.title || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Products</label>
                            <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                              {availableProducts.length === 0 ? (
                                <p className="text-sm text-gray-500 p-2">No products available</p>
                              ) : (
                                availableProducts.map(product => (
                                  <div key={product._id} className="flex items-center p-2 hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      id={product._id}
                                      className="mr-2"
                                      defaultChecked={editingSection?.content?.productIds?.includes(product._id)}
                                    />
                                    <label htmlFor={product._id} className="flex items-center text-sm cursor-pointer">
                                      <img 
                                        src={product.images[0]?.url || 'https://placehold.co/50x50/272420/FFFFFF?text=Product'} 
                                        alt={product.name}
                                        className="w-8 h-8 object-cover rounded-md mr-2"
                                      />
                                      {product.name} - ₹{product.price}
                                    </label>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {sectionType === 'video' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.title || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.videoUrl || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.thumbnailUrl || 'https://placehold.co/800x450/272420/FFFFFF?text=Video+Thumbnail'}
                            />
                          </div>
                        </div>
                      )}
                      
                      {sectionType === 'text' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                              type="text"
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              defaultValue={editingSection?.content?.title || ''}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                            <textarea
                              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={5}
                              defaultValue={editingSection?.content?.body || ''}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    // In a real app, gather form data properly
                    // For demo, we'll use mock data
                    const mockData = {
                      title: document.querySelector('input')?.value || 'Title',
                      // Include other fields based on section type
                      // This is simplified for demo
                      ...editingSection?.content
                    };
                    handleSaveSection(mockData);
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowSectionModal(false);
                    setEditingSection(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 