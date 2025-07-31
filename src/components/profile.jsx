import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  Edit3, 
  Save, 
  Phone, 
  MapPin, 
  Heart, 
  Shield, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Default profile data for new users
  const defaultProfile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: 'Cameroonian',
    region: '',
    city: '',
    quarter: '',
    address: '',
    profession: '',
    emergencyContact: '',
    emergencyRelation: '',
    emergencyPhone: '',
    bloodType: '',
    genotype: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    primaryHospital: '',
    primaryPhysician: '',
    medicalHistory: '',
    vaccinationHistory: '',
    lastDentalVisit: '',
    lastEyeExam: '',
    lifestyle: {
      smokes: false,
      alcohol: 'Never',
      exercise: 'Never',
      diet: 'Balanced'
    },
    familyHistory: ''
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [editedProfile, setEditedProfile] = useState({ ...defaultProfile });

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('https://backend-b5jw.onrender.com/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok) {
          // Merge fetched data with default profile to fill any missing fields
          const mergedProfile = {
            ...defaultProfile,
            ...data,
            lifestyle: {
              ...defaultProfile.lifestyle,
              ...data.lifestyle
            }
          };
          setProfile(mergedProfile);
          setEditedProfile(mergedProfile);
          setError('');
        } else if (response.status === 404) {
          // If no profile exists (404), use default profile
          setProfile(defaultProfile);
          setEditedProfile(defaultProfile);
          setError('');
        } else {
          setError(data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError('Error connecting to the server');
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const validateProfile = () => {
    if (!editedProfile.firstName.trim()) return 'First name is required';
    if (!editedProfile.lastName.trim()) return 'Last name is required';
    if (!editedProfile.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) return 'Invalid email format';
    if (editedProfile.phone && !editedProfile.phone.match(/^\+237\s?6[0-9]{8}$/)) return 'Phone number must be in format +237 6XX XX XX XX';
    if (editedProfile.emergencyPhone && !editedProfile.emergencyPhone.match(/^\+237\s?6[0-9]{8}$/)) return 'Emergency phone number must be in format +237 6XX XX XX XX';
    return '';
  };

  const handleSave = async () => {
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        setEditedProfile(data.profile);
        setIsEditing(false);
        setSuccess('Profile updated successfully! 🎉');
        setError('');
      } else {
        setError(data.message || 'Failed to save profile');
        setSuccess('');
      }
    } catch (err) {
      setError('Error connecting to the server');
      setSuccess('');
    }
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const cameroonRegions = [
    'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 
    'North', 'Northwest', 'South', 'Southwest', 'West'
  ];

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact & Address', icon: MapPin },
    { id: 'emergency', label: 'Emergency Contact', icon: Phone },
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'insurance', label: 'Insurance', icon: Shield }
  ];

  const renderField = (label, field, type = 'text', options = null, placeholder = '') => {
    const value = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj[key], editedProfile)
      : editedProfile[field];
    
    const displayValue = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj[key], profile)
      : profile[field];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {isEditing ? (
          <>
            {type === 'select' && options ? (
              <select
                value={value || ''}
                onChange={(e) => {
                  if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    handleNestedInputChange(parent, child, e.target.value);
                  } else {
                    handleInputChange(field, e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : type === 'textarea' ? (
              <textarea
                value={value || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                rows="3"
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            ) : (
              <input
                type={type}
                value={value || ''}
                onChange={(e) => {
                  if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    const newValue = type === 'checkbox' ? e.target.checked : e.target.value;
                    handleNestedInputChange(parent, child, newValue);
                  } else {
                    handleInputChange(field, e.target.value);
                  }
                }}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            )}
          </>
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg min-h-[2.5rem] flex items-center">
            <span className="text-gray-900">
              {type === 'checkbox' 
                ? (displayValue ? 'Yes' : 'No')
                : displayValue || 'Not specified'
              }
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderPersonalSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('First Name', 'firstName', 'text', null, 'Enter your first name')}
        {renderField('Last Name', 'lastName', 'text', null, 'Enter your last name')}
        {renderField('Date of Birth', 'dateOfBirth', 'date')}
        {renderField('Gender', 'gender', 'select', [
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
          { value: 'Other', label: 'Other' }
        ])}
        {renderField('Marital Status', 'maritalStatus', 'select', [
          { value: 'Single', label: 'Single' },
          { value: 'Married', label: 'Married' },
          { value: 'Divorced', label: 'Divorced' },
          { value: 'Widowed', label: 'Widowed' }
        ])}
        {renderField('Nationality', 'nationality', 'text', null, 'e.g., Cameroonian')}
        {renderField('Profession', 'profession', 'text', null, 'Your occupation')}
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Email Address', 'email', 'email', null, 'your.email@example.com')}
        {renderField('Phone Number', 'phone', 'tel', null, '+237 6 XX XX XX XX')}
        {renderField('Region', 'region', 'select', cameroonRegions.map(r => ({ value: r, label: r })))}
        {renderField('City', 'city', 'text', null, 'e.g., Douala')}
        {renderField('Quarter/Neighborhood', 'quarter', 'text', null, 'e.g., Bonanjo')}
      </div>
      <div className="grid grid-cols-1 gap-6">
        {renderField('Full Address', 'address', 'textarea', null, 'Complete street address')}
      </div>
    </div>
  );

  const renderEmergencySection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Emergency Contact Name', 'emergencyContact', 'text', null, 'Full name')}
        {renderField('Relationship', 'emergencyRelation', 'text', null, 'e.g., Spouse, Parent')}
        {renderField('Emergency Phone', 'emergencyPhone', 'tel', null, '+237 6 XX XX XX XX')}
      </div>
    </div>
  );

  const renderMedicalSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Blood Type', 'bloodType', 'select', [
          { value: 'A+', label: 'A+' },
          { value: 'A-', label: 'A-' },
          { value: 'B+', label: 'B+' },
          { value: 'B-', label: 'B-' },
          { value: 'AB+', label: 'AB+' },
          { value: 'AB-', label: 'AB-' },
          { value: 'O+', label: 'O+' },
          { value: 'O-', label: 'O-' }
        ])}
        {renderField('Genotype', 'genotype', 'select', [
          { value: 'AA', label: 'AA' },
          { value: 'AS', label: 'AS' },
          { value: 'SS', label: 'SS' },
          { value: 'AC', label: 'AC' },
          { value: 'SC', label: 'SC' }
        ])}
        {renderField('Primary Hospital', 'primaryHospital', 'text', null, 'Your preferred hospital')}
        {renderField('Primary Physician', 'primaryPhysician', 'text', null, 'Your main doctor')}
        {renderField('Last Dental Visit', 'lastDentalVisit', 'date')}
        {renderField('Last Eye Exam', 'lastEyeExam', 'date')}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {renderField('Known Allergies', 'allergies', 'textarea', null, 'List any allergies you have')}
        {renderField('Chronic Conditions', 'chronicConditions', 'textarea', null, 'Ongoing medical conditions')}
        {renderField('Current Medications', 'medications', 'textarea', null, 'List current medications and dosages')}
        {renderField('Medical History', 'medicalHistory', 'textarea', null, 'Previous diagnoses and treatments')}
        {renderField('Vaccination History', 'vaccinationHistory', 'textarea', null, 'Vaccines received')}
        {renderField('Family Medical History', 'familyHistory', 'textarea', null, 'Relevant family medical conditions')}
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lifestyle Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('Smoking Status', 'lifestyle.smokes', 'select', [
            { value: false, label: 'No' },
            { value: true, label: 'Yes' }
          ])}
          {renderField('Alcohol Consumption', 'lifestyle.alcohol', 'select', [
            { value: 'Never', label: 'Never' },
            { value: 'Occasionally', label: 'Occasionally' },
            { value: 'Regularly', label: 'Regularly' }
          ])}
          {renderField('Exercise Frequency', 'lifestyle.exercise', 'select', [
            { value: 'Never', label: 'Never' },
            { value: 'Rarely', label: 'Rarely' },
            { value: '1-2 times weekly', label: '1-2 times weekly' },
            { value: '3 times weekly', label: '3 times weekly' },
            { value: '4+ times weekly', label: '4+ times weekly' }
          ])}
          {renderField('Diet Type', 'lifestyle.diet', 'select', [
            { value: 'Balanced', label: 'Balanced' },
            { value: 'Vegetarian', label: 'Vegetarian' },
            { value: 'Vegan', label: 'Vegan' },
            { value: 'High-protein', label: 'High-protein' },
            { value: 'Low-carb', label: 'Low-carb' }
          ])}
        </div>
      </div>
    </div>
  );

  const renderInsuranceSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField('Insurance Provider', 'insuranceProvider', 'text', null, 'e.g., CNPS')}
        {renderField('Insurance Number', 'insuranceNumber', 'text', null, 'Your policy number')}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalSection();
      case 'contact': return renderContactSection();
      case 'emergency': return renderEmergencySection();
      case 'medical': return renderMedicalSection();
      case 'insurance': return renderInsuranceSection();
      default: return renderPersonalSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feedback Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.firstName || 'User'} {profile.lastName}
                  </h1>
                  <p className="text-gray-500">{profile.profession || 'Not specified'} • {profile.city || 'Not specified'}, {profile.region || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                {isEditing && (
                  <p className="text-sm text-gray-500 mt-1">
                    Make your changes and click "Save Changes" when done.
                  </p>
                )}
              </div>
              
              <div className="px-6 py-6">
                {renderCurrentSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;