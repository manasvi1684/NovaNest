// NovaNest/client/src/components/bugtrace/IssueFormModal.jsx
import React, { useState, useEffect } from 'react';
import useBugTraceStore from '../../store/useBugTraceStore';
import Modal from '../common/Modal';

const IssueFormModal = ({ isOpen, onClose, issueToEdit = null }) => {
  const { createIssueInCurrentProject, updateIssueDetails, isLoadingMutation, currentProject } = useBugTraceStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    tags: [],
    dueDate: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or when editing different issue
  useEffect(() => {
    if (isOpen) {
      if (issueToEdit) {
        setFormData({
          title: issueToEdit.title || '',
          description: issueToEdit.description || '',
          status: issueToEdit.status || 'open',
          priority: issueToEdit.priority || 'medium',
          tags: issueToEdit.tags || [],
          dueDate: issueToEdit.dueDate ? new Date(issueToEdit.dueDate).toISOString().split('T')[0] : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'open',
          priority: 'medium',
          tags: [],
          dueDate: ''
        });
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, issueToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for API
    const submitData = {
      ...formData,
      dueDate: formData.dueDate || null
    };

    try {
      if (issueToEdit) {
        await updateIssueDetails(issueToEdit._id, submitData);
      } else {
        await createIssueInCurrentProject(submitData);
      }
      onClose();
    } catch (err) {
      // Error is handled by the store and shown via toast
      console.error('Issue form submission error:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', status: 'open', priority: 'medium', tags: [], dueDate: '' });
    setTagInput('');
    setErrors({});
    onClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      in_review: 'bg-purple-100 text-purple-800',
      closed: 'bg-green-100 text-green-800',
      reopened: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={issueToEdit ? 'Edit Issue' : 'Create New Issue'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Issue Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Issue Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter issue title"
            disabled={isLoadingMutation}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Issue Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Describe the issue in detail (optional)"
            disabled={isLoadingMutation}
          />
        </div>

        {/* Status and Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoadingMutation}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={isLoadingMutation}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoadingMutation}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add a tag and press Enter"
              disabled={isLoadingMutation}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              disabled={isLoadingMutation || !tagInput.trim()}
            >
              Add
            </button>
          </div>
          
          {/* Display Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-500 focus:outline-none"
                    disabled={isLoadingMutation}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            disabled={isLoadingMutation}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            disabled={isLoadingMutation}
          >
            {isLoadingMutation 
              ? (issueToEdit ? 'Updating...' : 'Creating...') 
              : (issueToEdit ? 'Update Issue' : 'Create Issue')
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueFormModal; 