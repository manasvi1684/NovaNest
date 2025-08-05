// NovaNest/client/src/components/bugtrace/ProjectFormModal.jsx
import React, { useState, useEffect } from 'react';
import useBugTraceStore from '../../store/useBugTraceStore';
import Modal from '../common/Modal';

const ProjectFormModal = ({ isOpen, onClose, projectToEdit = null }) => {
  const { createProject, updateProjectDetails, isLoadingMutation } = useBugTraceStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or when editing different project
  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setFormData({
          name: projectToEdit.name || '',
          description: projectToEdit.description || '',
          status: projectToEdit.status || 'active'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'active'
        });
      }
      setErrors({});
    }
  }, [isOpen, projectToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (projectToEdit) {
        await updateProjectDetails(projectToEdit._id, formData);
      } else {
        await createProject(formData);
      }
      onClose();
    } catch (err) {
      // Error is handled by the store and shown via toast
      console.error('Project form submission error:', err);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', status: 'active' });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={projectToEdit ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter project name"
            disabled={isLoadingMutation}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Describe your project (optional)"
            disabled={isLoadingMutation}
          />
        </div>

        {/* Project Status */}
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
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
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
              ? (projectToEdit ? 'Updating...' : 'Creating...') 
              : (projectToEdit ? 'Update Project' : 'Create Project')
            }
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal; 