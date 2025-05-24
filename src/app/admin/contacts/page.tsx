'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { requireAuth } from '@/app/lib/auth';
import { FiMail, FiUser, FiPhone, FiCalendar, FiCheck, FiX, FiEye } from 'react-icons/fi';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'responded';
  createdAt: string;
}

export default function AdminContactsPage() {
  const router = useRouter();
  
  // State variables
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Check authentication on page load
  useEffect(() => {
    if (!requireAuth(router)) return;
    
    fetchContacts();
  }, [router, currentPage, statusFilter]);
  
  // Fetch contact submissions from the API
  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Build query string
      let queryString = `?page=${currentPage}&limit=10`;
      if (statusFilter) {
        queryString += `&status=${statusFilter}`;
      }
      
      const response = await fetch(`/api/contact${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact submissions');
      }
      
      const result = await response.json();
      
      setContacts(result.data);
      setTotalPages(result.pagination.pages);
      
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setError(error.message || 'An error occurred while fetching contacts');
    } finally {
      setLoading(false);
    }
  };
  
  // Update contact status
  const updateContactStatus = async (id: string, status: 'pending' | 'read' | 'responded') => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update contact status');
      }
      
      // Update local state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === id ? { ...contact, status } : contact
        )
      );
      
      // If viewing a contact in modal, update that too
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact({ ...selectedContact, status });
      }
      
    } catch (error: any) {
      console.error('Error updating contact status:', error);
      alert(error.message || 'An error occurred while updating the contact');
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // View contact details
  const viewContact = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    setShowModal(true);
    
    // If contact is pending, mark it as read
    if (contact.status === 'pending') {
      await updateContactStatus(contact._id, 'read');
    }
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
        
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
          </select>
          
          <button
            onClick={fetchContacts}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No contact submissions found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-[200px]">{contact.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contact.status)}`}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewContact(contact)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <FiEye size={18} />
                        </button>
                        {contact.status !== 'responded' && (
                          <button
                            onClick={() => updateContactStatus(contact._id, 'responded')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as responded"
                          >
                            <FiCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-500">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            
            <div className="relative bg-white rounded-lg max-w-2xl w-full mx-auto p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{selectedContact.subject}</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-black"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <FiUser className="mr-2" />
                  <span className="font-medium mr-2">Name:</span>
                  <span>{selectedContact.name}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <FiMail className="mr-2" />
                  <span className="font-medium mr-2">Email:</span>
                  <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                
                {selectedContact.phone && (
                  <div className="flex items-center text-gray-700">
                    <FiPhone className="mr-2" />
                    <span className="font-medium mr-2">Phone:</span>
                    <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center text-gray-700">
                  <FiCalendar className="mr-2" />
                  <span className="font-medium mr-2">Date:</span>
                  <span>{formatDate(selectedContact.createdAt)}</span>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Message:</h4>
                  <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedContact.status)}`}>
                      {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, 'read')}
                      disabled={selectedContact.status === 'read'}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        selectedContact.status === 'read'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Mark as Read
                    </button>
                    
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, 'responded')}
                      disabled={selectedContact.status === 'responded'}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        selectedContact.status === 'responded'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      Mark as Responded
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`mailto:${selectedContact.email}?subject=RE: ${selectedContact.subject}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    onClick={() => updateContactStatus(selectedContact._id, 'responded')}
                  >
                    <FiMail className="mr-2" />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 