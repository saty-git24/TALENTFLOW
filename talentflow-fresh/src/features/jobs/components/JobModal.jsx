import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { Modal, ModalContent, ModalFooter } from '../../../components/ui/Modal.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Textarea } from '../../../components/ui/Textarea.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { jobSchema } from '../../../utils/validation.js';
import { generateSlug } from '../../../utils/helpers.js';
import { JOB_TAGS } from '../../../utils/constants.js';

export const JobModal = ({
  isOpen,
  onClose,
  onSubmit,
  job = null,
  loading = false
}) => {
  const isEditing = !!job;
  const [selectedTags, setSelectedTags] = React.useState(job?.tags || []);
  const [tagInput, setTagInput] = React.useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      slug: job?.slug || '',
      description: job?.description || '',
      requirements: job?.requirements || '',
      status: job?.status || 'active',
      location: job?.location || '',
      department: job?.department || '',
      type: job?.type || 'full-time',
      salary: {
        min: job?.salary?.min || undefined,
        max: job?.salary?.max || undefined,
        currency: job?.salary?.currency || 'USD'
      }
    }
  });

  const watchedTitle = watch('title');

  // Auto-generate slug from title
  React.useEffect(() => {
    if (watchedTitle && !isEditing) {
      const slug = generateSlug(watchedTitle);
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue, isEditing]);

  // Reset form when modal opens/closes or job changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedTags(job?.tags || []);
      reset({
        title: job?.title || '',
        slug: job?.slug || '',
        description: job?.description || '',
        requirements: job?.requirements || '',
        status: job?.status || 'active',
        location: job?.location || '',
        department: job?.department || '',
        type: job?.type || 'full-time',
        salary: {
          min: job?.salary?.min || undefined,
          max: job?.salary?.max || undefined,
          currency: job?.salary?.currency || 'USD'
        }
      });
    }
  }, [isOpen, job, reset]);

  const handleTagAdd = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleCustomTagAdd = () => {
    const customTag = tagInput.trim();
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags([...selectedTags, customTag]);
      setTagInput('');
    }
  };

  const onFormSubmit = async (data) => {
    try {
      const jobData = {
        ...data,
        tags: selectedTags,
        // Clean up salary object
        salary: (data.salary.min || data.salary.max) ? {
          min: data.salary.min || undefined,
          max: data.salary.max || undefined,
          currency: data.salary.currency || 'USD'
        } : undefined
      };

      await onSubmit(jobData);
      onClose();
    } catch (error) {
      console.error('Failed to submit job:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Job' : 'Create New Job'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <ModalContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Job Title"
              required
              {...register('title')}
              error={errors.title?.message}
            />
            
            <Input
              label="Slug"
              required
              {...register('slug')}
              error={errors.slug?.message}
              helperText="URL-friendly version of the title"
            />
          </div>

          <Textarea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            rows={4}
          />

          <Textarea
            label="Requirements"
            {...register('requirements')}
            error={errors.requirements?.message}
            rows={3}
            helperText="List key requirements and qualifications"
          />

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              {...register('status')}
              error={errors.status?.message}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Archived', value: 'archived' }
              ]}
            />
            
            <Select
              label="Type"
              {...register('type')}
              error={errors.type?.message}
              options={[
                { label: 'Full-time', value: 'full-time' },
                { label: 'Part-time', value: 'part-time' },
                { label: 'Contract', value: 'contract' },
                { label: 'Intern', value: 'intern' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              {...register('location')}
              error={errors.location?.message}
              placeholder="e.g., Remote, New York, NY"
            />
            
            <Input
              label="Department"
              {...register('department')}
              error={errors.department?.message}
              placeholder="e.g., Engineering, Marketing"
            />
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Range (Optional)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                type="number"
                placeholder="Minimum"
                {...register('salary.min', { valueAsNumber: true })}
                error={errors.salary?.min?.message}
              />
              
              <Input
                type="number"
                placeholder="Maximum"
                {...register('salary.max', { valueAsNumber: true })}
                error={errors.salary?.max?.message}
              />
              
              <Select
                {...register('salary.currency')}
                options={[
                  { label: 'USD', value: 'USD' },
                  { label: 'EUR', value: 'EUR' },
                  { label: 'GBP', value: 'GBP' }
                ]}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Available tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {JOB_TAGS
                .filter(tag => !selectedTags.includes(tag))
                .slice(0, 10)
                .map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagAdd(tag)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {tag}
                  </button>
                ))
              }
            </div>
            
            {/* Custom tag input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add custom tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomTagAdd();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCustomTagAdd}
                disabled={!tagInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {isEditing ? 'Update Job' : 'Create Job'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};