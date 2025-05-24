'use client';

import { useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { FiArrowRight } from 'react-icons/fi';

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState('story');
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <>
      <Nav />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="w-full h-[50vh] bg-gray-100 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70 z-10"></div>
          <img 
            src="https://placehold.co/1200x600/272420/FFFFFF?text=About+Fraganote" 
            alt="About Us"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="text-center px-4 z-20 relative text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Story</h1>
            <p className="text-lg md:text-xl max-w-lg mx-auto">
              Crafting memorable fragrances since 2015
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12 overflow-x-auto border-b border-gray-200">
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'story' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-500 hover:text-black'}`}
            onClick={() => handleTabChange('story')}
          >
            Our Story
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'philosophy' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-500 hover:text-black'}`}
            onClick={() => handleTabChange('philosophy')}
          >
            Philosophy
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'craftsmanship' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-500 hover:text-black'}`}
            onClick={() => handleTabChange('craftsmanship')}
          >
            Craftsmanship
          </button>
          <button 
            className={`px-6 py-3 font-medium ${activeTab === 'sustainability' 
              ? 'border-b-2 border-black text-black' 
              : 'text-gray-500 hover:text-black'}`}
            onClick={() => handleTabChange('sustainability')}
          >
            Sustainability
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Our Story Tab */}
          {activeTab === 'story' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
                <div>
                  <h2 className="text-2xl font-bold mb-4">How It All Began</h2>
                  <p className="text-gray-600 mb-4">
                    Fraganote was born in 2015 when our founder, Rajan Sharma, realized that the Indian fragrance market lacked truly premium, locally-made perfumes that could compete with international brands.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Driven by his passion for scents and with a background in chemistry, Rajan started experimenting with creating unique fragrances in his Mumbai apartment. What began as a personal project quickly gained attention among friends and family.
                  </p>
                  <p className="text-gray-600">
                    By 2016, Fraganote launched its first collection of three signature scents, which sold out within weeks. This remarkable response fueled our commitment to crafting exceptional fragrances that celebrate Indian heritage while appealing to global sensibilities.
                  </p>
                </div>
                <div>
                  <img 
                    src="https://placehold.co/500x600/272420/FFFFFF?text=Founder" 
                    alt="Fraganote Founder"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">Our Journey</h2>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
                  
                  {/* Timeline items */}
                  <div className="relative z-10">
                    <div className="mb-12 grid grid-cols-9 items-center">
                      <div className="col-span-4 text-right pr-6">
                        <h3 className="font-bold">2015</h3>
                        <p className="text-gray-600">Fraganote is founded in Mumbai</p>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                      <div className="col-span-4"></div>
                    </div>
                    
                    <div className="mb-12 grid grid-cols-9 items-center">
                      <div className="col-span-4"></div>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                      <div className="col-span-4 pl-6">
                        <h3 className="font-bold">2016</h3>
                        <p className="text-gray-600">Launch of first signature collection</p>
                      </div>
                    </div>
                    
                    <div className="mb-12 grid grid-cols-9 items-center">
                      <div className="col-span-4 text-right pr-6">
                        <h3 className="font-bold">2018</h3>
                        <p className="text-gray-600">Opened our first flagship store in Delhi</p>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                      <div className="col-span-4"></div>
                    </div>
                    
                    <div className="mb-12 grid grid-cols-9 items-center">
                      <div className="col-span-4"></div>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                      <div className="col-span-4 pl-6">
                        <h3 className="font-bold">2020</h3>
                        <p className="text-gray-600">Launched our e-commerce platform</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-9 items-center">
                      <div className="col-span-4 text-right pr-6">
                        <h3 className="font-bold">2023</h3>
                        <p className="text-gray-600">Expanded to 10 stores across India</p>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      </div>
                      <div className="col-span-4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Link 
                  href="/collection"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Discover Our Collections <FiArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          )}
          
          {/* Philosophy Tab */}
          {activeTab === 'philosophy' && (
            <div>
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">Our Philosophy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <img 
                      src="https://placehold.co/600x800/272420/FFFFFF?text=Philosophy" 
                      alt="Our Philosophy"
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                  <div>
                    <p className="text-gray-600 mb-6">
                      At Fraganote, we believe that a perfume is more than just a scent—it's a journey, a memory, an expression of identity. Our philosophy is built around three core principles that guide every fragrance we create:
                    </p>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Authenticity</h3>
                      <p className="text-gray-600">
                        We create fragrances that tell genuine stories. Each scent is carefully crafted to evoke authentic emotions and experiences, drawing inspiration from India's rich cultural heritage and natural beauty.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Quality Without Compromise</h3>
                      <p className="text-gray-600">
                        We source the finest ingredients from around the world, working with skilled perfumers who blend tradition with innovation. No shortcuts, no compromises—just exceptional quality in every bottle.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-2">Personal Expression</h3>
                      <p className="text-gray-600">
                        We create diverse fragrances that help individuals express their unique personalities. We believe that the right scent can be transformative, enhancing confidence and leaving a lasting impression.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-16">
                <blockquote className="italic text-xl text-center max-w-2xl mx-auto text-gray-600 border-l-4 border-black pl-4">
                  "Fragrance is the voice of inanimate things. It speaks to our emotions in a language that transcends words."
                  <footer className="mt-2 text-sm text-right">— Rajan Sharma, Founder</footer>
                </blockquote>
              </div>
            </div>
          )}
          
          {/* Craftsmanship Tab */}
          {activeTab === 'craftsmanship' && (
            <div>
              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-center">The Art of Perfumery</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold mb-3">01</div>
                    <h3 className="text-lg font-medium mb-3">Ingredient Selection</h3>
                    <p className="text-gray-600">
                      We source rare and premium ingredients from around the world, from Indian jasmine to French lavender and Bulgarian rose.
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold mb-3">02</div>
                    <h3 className="text-lg font-medium mb-3">Extraction Processes</h3>
                    <p className="text-gray-600">
                      We use various extraction methods including steam distillation, cold-pressing, and enfleurage to capture the purest essence of each ingredient.
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold mb-3">03</div>
                    <h3 className="text-lg font-medium mb-3">Blending & Aging</h3>
                    <p className="text-gray-600">
                      Our master perfumers blend ingredients in precise combinations, then allow the compositions to mature, developing complex and harmonious profiles.
                    </p>
                  </div>
                </div>
                
                <div className="aspect-w-16 aspect-h-9 mb-12">
                  <img 
                    src="https://placehold.co/1200x675/272420/FFFFFF?text=Craftsmanship" 
                    alt="Perfume Crafting Process"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-xl font-bold mb-4">Meet Our Master Perfumer</h3>
                  <p className="text-gray-600 mb-4">
                    Leading our fragrance development is Nisha Mehta, a perfumer with over 15 years of experience who trained in Grasse, France—the world capital of perfumery. Nisha brings a unique perspective that blends Western techniques with an appreciation for traditional Indian scents.
                  </p>
                  <p className="text-gray-600 mb-4">
                    "Creating a perfume is like composing music," says Nisha. "Each note plays a specific role, contributing to a harmonious whole that evolves over time and reveals different aspects of its character."
                  </p>
                  <p className="text-gray-600">
                    Under Nisha's guidance, our team spends months—sometimes years—perfecting each fragrance before it reaches our customers. This dedication to craftsmanship is evident in every Fraganote perfume.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Sustainability Tab */}
          {activeTab === 'sustainability' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Our Commitment to Sustainability</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
                <div>
                  <p className="text-gray-600 mb-4">
                    At Fraganote, we believe that luxury and responsibility can—and should—go hand in hand. Our commitment to sustainability shapes every aspect of our business, from ingredient sourcing to packaging design.
                  </p>
                  <p className="text-gray-600 mb-4">
                    We recognize that the perfume industry has traditionally had a significant environmental footprint. That's why we've made it our mission to pioneer more sustainable practices while maintaining the exceptional quality our customers expect.
                  </p>
                  <p className="text-gray-600">
                    Our sustainability journey is ongoing. We constantly evaluate our processes, seeking innovative ways to reduce our environmental impact while creating fragrances that delight the senses.
                  </p>
                </div>
                <div>
                  <img 
                    src="https://placehold.co/600x400/272420/FFFFFF?text=Sustainability" 
                    alt="Sustainable Practices"
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg mb-16">
                <h3 className="text-xl font-bold mb-6">Our Sustainability Initiatives</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium mb-2">Responsible Sourcing</h4>
                    <p className="text-gray-600 mb-4">
                      We partner with suppliers who share our values of ethical practices and environmental stewardship. Many of our botanicals come from farms that practice regenerative agriculture.
                    </p>
                    
                    <h4 className="font-medium mb-2">Eco-Friendly Packaging</h4>
                    <p className="text-gray-600">
                      Our boxes are made from 100% recycled materials and are fully recyclable. We've also redesigned our bottles to use 30% less glass while maintaining their premium feel.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Carbon-Neutral Operations</h4>
                    <p className="text-gray-600 mb-4">
                      Since 2021, we've offset 100% of carbon emissions from our manufacturing and shipping operations through investments in renewable energy projects in India.
                    </p>
                    
                    <h4 className="font-medium mb-2">Refill Program</h4>
                    <p className="text-gray-600">
                      Our innovative refill program allows customers to reuse their perfume bottles, reducing waste while saving money. Currently available in our flagship stores and coming soon online.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-12">
                <h3 className="text-xl font-bold mb-4">Our Goals for 2025</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-black mb-2">100%</div>
                    <p className="text-gray-600">Recyclable or biodegradable packaging</p>
                  </div>
                  
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-black mb-2">50%</div>
                    <p className="text-gray-600">Reduction in water usage across operations</p>
                  </div>
                  
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="text-2xl font-bold text-black mb-2">75%</div>
                    <p className="text-gray-600">Ingredients from certified sustainable sources</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Team Section - Visible on all tabs */}
        <div className="mt-20 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Our Leadership Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://placehold.co/300x400/272420/FFFFFF?text=Rajan+Sharma" 
                  alt="Rajan Sharma"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-lg font-bold">Rajan Sharma</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://placehold.co/300x400/272420/FFFFFF?text=Nisha+Mehta" 
                  alt="Nisha Mehta"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-lg font-bold">Nisha Mehta</h3>
              <p className="text-gray-600">Master Perfumer</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://placehold.co/300x400/272420/FFFFFF?text=Vikram+Patel" 
                  alt="Vikram Patel"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-lg font-bold">Vikram Patel</h3>
              <p className="text-gray-600">Head of Operations</p>
            </div>
            
            <div className="text-center">
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  src="https://placehold.co/300x400/272420/FFFFFF?text=Priya+Reddy" 
                  alt="Priya Reddy"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-lg font-bold">Priya Reddy</h3>
              <p className="text-gray-600">Creative Director</p>
            </div>
          </div>
        </div>
        
        {/* Careers Section */}
        <div className="max-w-4xl mx-auto border-t border-gray-200 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
              <p className="text-gray-600 mb-4">
                We're always looking for passionate individuals to join our growing team. If you share our love for fragrances and our commitment to quality and sustainability, we'd love to hear from you.
              </p>
              <p className="text-gray-600 mb-6">
                Explore current opportunities and discover what it's like to be part of the Fraganote family.
              </p>
              <Link 
                href="/careers"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
              >
                View Open Positions <FiArrowRight className="ml-2" />
              </Link>
            </div>
            <div>
              <img 
                src="https://placehold.co/600x400/272420/FFFFFF?text=Join+Our+Team" 
                alt="Career Opportunities"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
} 