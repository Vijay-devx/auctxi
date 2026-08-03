import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuctions } from '../../../hooks/useAuctions';
import { api } from '../../../services/api';

const AuctionCreate = () => {
  const navigate = useNavigate();
  const { createAuction } = useAuctions();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [ruleTemplates, setRuleTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    registrationMode: 'MANAGER_APPROVAL',
    date: '',
    time: '',
    location: '',
    // Template
    ruleTemplateId: '',
    // Overrides
    purseValue: '',
    bidTimer: '30',
    retries: '3',
    maxTeams: '',
    minPlayers: '',
    maxPlayers: '',
    registrationFee: ''
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const response = await api.get('/api/v1/rule-templates/active');
        setRuleTemplates(response.data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (templateId) => {
    const template = ruleTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        ruleTemplateId: template.id,
        purseValue: template.defaultPurseValue?.toString() || '',
        bidTimer: template.bidTimerSeconds?.toString() || '30',
        retries: template.unsoldRetries?.toString() || '3',
        maxTeams: template.maxTeams?.toString() || '',
        minPlayers: template.minPlayersPerTeam?.toString() || '',
        maxPlayers: template.maxPlayersPerTeam?.toString() || '',
        registrationFee: '' // Templates don't seem to have this by default
      }));
    } else {
      setFormData(prev => ({ ...prev, ruleTemplateId: '' }));
    }
  };

  const validateStep1 = () => {
    if (!formData.name) {
      setErrorMsg("Please provide an Auction Name.");
      return false;
    }
    
    if (!formData.date) {
      setErrorMsg("Please provide a valid Date. If you have entered one, ensure it is a real calendar day (e.g. April has 30 days).");
      return false;
    }

    const selectedYear = new Date(formData.date).getFullYear();
    if (selectedYear < new Date().getFullYear()) {
      setErrorMsg("Please provide a valid future year. The date cannot be in the past.");
      return false;
    }

    if (!formData.time) {
      setErrorMsg("Please provide a Time.");
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.purseValue || !formData.maxTeams) {
      setErrorMsg("Please ensure Purse Value and Max Teams are provided.");
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    setCurrentStep(prev => prev - 1);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep !== 3) return;
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const scheduledDateTime = formData.date && formData.time 
        ? new Date(`${formData.date}T${formData.time}`).toISOString() 
        : null;

      const payload = {
        name: formData.name,
        scheduledStartTime: scheduledDateTime,
        rules: {
          templateId: formData.ruleTemplateId || null,
          initialPurse: parseFloat(formData.purseValue),
          bidTimerSeconds: parseInt(formData.bidTimer),
          maxParticipatingTeams: parseInt(formData.maxTeams),
          minSquadSize: parseInt(formData.minPlayers),
          maxSquadSize: parseInt(formData.maxPlayers),
          minBidAmount: 50,
          bidIncrement: 10,
          maxOverseasPlayers: 4,
          minBatsmen: 0,
          minBowlers: 0,
          minAllRounders: 0,
          minWicketKeepers: 0,
          autoSellTimeout: 3,
          nominationMethod: 'MANAGER_SELECTION',
          registrationMode: formData.registrationMode,
          allowLateRegistration: false,
          allowUnsoldReentry: false,
          allowOverseas: true,
          allowUncapped: true,
          allowRetired: true,
          allowManagerCreatedPlayers: true,
          registrationFee: parseFloat(formData.registrationFee) || 0
        }
      };
      
      await createAuction(payload);
      navigate('/manager/auctions');
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(err.response?.data?.message || 'Failed to create auction. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map(step => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              currentStep === step 
                ? 'border-amber-500 bg-amber-500 text-white' 
                : currentStep > step 
                  ? 'border-amber-500 text-amber-500 bg-amber-50' 
                  : 'border-gray-200 text-gray-400 bg-gray-50'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 rounded ${currentStep > step ? 'bg-amber-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      <PageHeader 
        title="Create Auction" 
        breadcrumbs={[
          { label: 'Auctions', href: '/manager/auctions' },
          { label: 'Create Auction' }
        ]}
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-8">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: General Info */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Step 1: General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Auction Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Registration Mode <span className="text-red-500">*</span></label>
                    <select name="registrationMode" value={formData.registrationMode} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                      <option value="OPEN">Open Registration (Auto-approve)</option>
                      <option value="MANAGER_APPROVAL">Manager Approval</option>
                      <option value="INVITE_ONLY">Invite Only</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                    <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Time <span className="text-red-500">*</span></label>
                    <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Location / Venue</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Rules */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Step 2: Rules & Budgets</h3>
                
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apply a Rule Template (Optional)</label>
                  {loadingTemplates ? (
                    <p className="text-sm text-gray-500">Loading templates...</p>
                  ) : (
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                      value={formData.ruleTemplateId}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                    >
                      <option value="">-- Custom Rules --</option>
                      {ruleTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Selecting a template will auto-fill the fields below. You can override them if needed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Default Purse (₹) <span className="text-red-500">*</span></label>
                    <input type="number" name="purseValue" required value={formData.purseValue} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Registration Fee (₹) <span className="text-red-500">*</span></label>
                    <input type="number" name="registrationFee" required value={formData.registrationFee} onChange={handleChange} placeholder="e.g. 500 (0 for free)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bid Timer (sec) <span className="text-red-500">*</span></label>
                    <input type="number" name="bidTimer" required value={formData.bidTimer} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Unsold Retries <span className="text-red-500">*</span></label>
                    <input type="number" name="retries" required value={formData.retries} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Max Teams <span className="text-red-500">*</span></label>
                    <input type="number" name="maxTeams" required value={formData.maxTeams} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Min Players/Team <span className="text-red-500">*</span></label>
                    <input type="number" name="minPlayers" required value={formData.minPlayers} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Max Players/Team <span className="text-red-500">*</span></label>
                    <input type="number" name="maxPlayers" required value={formData.maxPlayers} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Step 3: Review & Confirm</h3>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div><span className="text-gray-500 text-sm">Name:</span> <p className="font-medium">{formData.name}</p></div>
                  <div><span className="text-gray-500 text-sm">Schedule:</span> <p className="font-medium">{formData.date} at {formData.time}</p></div>
                  <div><span className="text-gray-500 text-sm">Location:</span> <p className="font-medium">{formData.location || 'TBA'}</p></div>
                  <div><span className="text-gray-500 text-sm">Reg. Fee:</span> <p className="font-medium">₹{Number(formData.registrationFee).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-sm">Base Purse:</span> <p className="font-medium">₹{Number(formData.purseValue).toLocaleString()}</p></div>
                  <div><span className="text-gray-500 text-sm">Teams allowed:</span> <p className="font-medium">{formData.maxTeams}</p></div>
                  <div><span className="text-gray-500 text-sm">Squad limits:</span> <p className="font-medium">{formData.minPlayers} to {formData.maxPlayers} players</p></div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
              <Button type="button" variant="outline" onClick={currentStep === 1 ? () => navigate('/manager/auctions') : handleBack} disabled={isSubmitting}>
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>Next Step</Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Auction'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionCreate;
