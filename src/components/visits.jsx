import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  X, 
  Eye, 
  User,
  Stethoscope,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  MoreHorizontal,
  CalendarDays,
  SortAsc,
  SortDesc
} from 'lucide-react';

const AllVisits = () => {
  const [visits, setVisits] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      patientAge: 45,
      patientGender: 'Male',
      date: '2024-01-15',
      time: '10:30 AM',
      location: 'Room 101',
      purpose: 'Routine Checkup',
      status: 'Completed',
      doctor: 'Dr. Smith',
      notes: 'Patient in good health. Blood pressure normal. Recommended annual follow-up.',
      diagnosis: 'Healthy - No issues found',
      medications: 'None prescribed',
      nextAppointment: '2025-01-15'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      patientAge: 32,
      patientGender: 'Female',
      date: '2024-01-14',
      time: '2:15 PM',
      location: 'Room 205',
      purpose: 'Follow-up',
      status: 'Completed',
      doctor: 'Dr. Johnson',
      notes: 'Medication adjustment needed. Patient responding well to treatment.',
      diagnosis: 'Hypertension - controlled',
      medications: 'Lisinopril 10mg daily',
      nextAppointment: '2024-02-14'
    },
    {
      id: 3,
      patientName: 'Mike Wilson',
      patientAge: 28,
      patientGender: 'Male',
      date: '2024-01-13',
      time: '11:45 AM',
      location: 'Room 103',
      purpose: 'Emergency',
      status: 'Completed',
      doctor: 'Dr. Brown',
      notes: 'Treated for minor injury. Wound cleaned and bandaged.',
      diagnosis: 'Minor laceration - left hand',
      medications: 'Antibiotic ointment',
      nextAppointment: '2024-01-20'
    },
    {
      id: 4,
      patientName: 'Sarah Davis',
      patientAge: 55,
      patientGender: 'Female',
      date: '2024-01-16',
      time: '9:00 AM',
      location: 'Room 202',
      purpose: 'Consultation',
      status: 'Scheduled',
      doctor: 'Dr. Wilson',
      notes: 'Initial consultation for new patient',
      diagnosis: 'Pending examination',
      medications: 'To be determined',
      nextAppointment: 'TBD'
    },
    {
      id: 5,
      patientName: 'Robert Taylor',
      patientAge: 67,
      patientGender: 'Male',
      date: '2024-01-12',
      time: '3:30 PM',
      location: 'Room 104',
      purpose: 'Check-up',
      status: 'Cancelled',
      doctor: 'Dr. Anderson',
      notes: 'Patient cancelled due to illness',
      diagnosis: 'N/A',
      medications: 'N/A',
      nextAppointment: 'Rescheduling required'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDoctor, setFilterDoctor] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  // Get unique doctors for filter
  const doctors = useMemo(() => {
    return [...new Set(visits.map(visit => visit.doctor))];
  }, [visits]);

  // Filter and sort visits
  const filteredAndSortedVisits = useMemo(() => {
    let filtered = visits.filter(visit => {
      const matchesSearch = 
        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || visit.status === filterStatus;
      const matchesDoctor = filterDoctor === 'All' || visit.doctor === filterDoctor;
      
      return matchesSearch && matchesStatus && matchesDoctor;
    });

    // Sort visits
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [visits, searchTerm, filterStatus, filterDoctor, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (purpose) => {
    switch(purpose.toLowerCase()) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleCardExpansion = (visitId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(visitId)) {
      newExpanded.delete(visitId);
    } else {
      newExpanded.add(visitId);
    }
    setExpandedCards(newExpanded);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const VisitCard = ({ visit }) => {
    const isExpanded = expandedCards.has(visit.id);
    
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
        {/* Main Card Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{visit.patientName}</h3>
                  <p className="text-sm text-gray-500">{visit.patientAge} years old • {visit.patientGender}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                  {visit.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(visit.purpose)}`}>
                  {visit.purpose}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedVisit(visit)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View full details"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleCardExpansion(visit.id)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title={isExpanded ? "Show less" : "Show more"}
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{formatDate(visit.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{visit.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{visit.location}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Stethoscope className="w-4 h-4 text-purple-500" />
            <span className="font-medium">{visit.doctor}</span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Diagnosis
                </h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                  {visit.diagnosis}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Medications</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                  {visit.medications}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                  {visit.notes}
                </p>
              </div>
              
              {visit.nextAppointment && visit.nextAppointment !== 'TBD' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Next Appointment
                  </h4>
                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border">
                    {visit.nextAppointment}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medical Visits</h1>
              <p className="text-gray-600 mt-1">
                {filteredAndSortedVisits.length} visits found
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => console.log('Export visits')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => console.log('Print visits')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients, doctors, diagnosis..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Doctor Filter */}
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                >
                  <option value="All">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { key: 'date', label: 'Date' },
                  { key: 'patientName', label: 'Patient' },
                  { key: 'doctor', label: 'Doctor' },
                  { key: 'status', label: 'Status' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => handleSort(option.key)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                      sortBy === option.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.key && (
                      sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Visits List */}
        <div className="space-y-4">
          {filteredAndSortedVisits.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredAndSortedVisits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))
          )}
        </div>

        {/* Visit Details Modal */}
        {selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Visit Details</h2>
                    <p className="text-gray-500">{selectedVisit.patientName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Patient Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{selectedVisit.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{selectedVisit.patientAge} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{selectedVisit.patientGender}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{formatDate(selectedVisit.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time:</span>
                          <span className="font-medium">{selectedVisit.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedVisit.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor:</span>
                          <span className="font-medium">{selectedVisit.doctor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Purpose:</span>
                          <span className="font-medium">{selectedVisit.purpose}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedVisit.status)}`}>
                            {selectedVisit.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {selectedVisit.diagnosis}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {selectedVisit.medications}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes</label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {selectedVisit.notes}
                          </p>
                        </div>
                        {selectedVisit.nextAppointment && selectedVisit.nextAppointment !== 'TBD' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Next Appointment</label>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                              {selectedVisit.nextAppointment}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllVisits;