import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { usePlayers } from '../../../hooks/usePlayers';
import { uploadMedia } from '../../../services/api';

export default function PlayerCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { createPlayer, updatePlayer, getPlayer } = usePlayers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(isEditMode);

  const [formData, setFormData] = useState({
    name: '',
    role: 'BATSMAN',
    category: 'CAPPED', 
    basePrice: '',
    isWicketKeeper: false,
    matches: '',
    runs: '',
    highestScore: '',
    battingAverage: '',
    strikeRate: '',
    wickets: '',
    bestBowlingWickets: '',
    bestBowlingRuns: '',
    economy: '',
    catches: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!isEditMode) return;
      try {
        const p = await getPlayer(id);
        setFormData({
          name: p.name || '',
          role: p.role || 'BATSMAN',
          category: p.category || 'CAPPED',
          basePrice: p.basePrice || '',
          isWicketKeeper: p.isWicketKeeper || false,
          matches: p.statistics?.matches || '',
          runs: p.statistics?.runs || '',
          highestScore: p.statistics?.highestScore || '',
          battingAverage: p.statistics?.battingAverage || '',
          strikeRate: p.statistics?.strikeRate || '',
          wickets: p.statistics?.wickets || '',
          bestBowlingWickets: p.statistics?.bestBowlingWickets || '',
          bestBowlingRuns: p.statistics?.bestBowlingRuns || '',
          economy: p.statistics?.economy || '',
          catches: p.statistics?.catches || ''
        });
      } catch (err) {
        console.error('Failed to load player:', err);
        setErrorMsg('Failed to load player data.');
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, [id, isEditMode]); // removed getPlayer to prevent reset on state change

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadRes = await uploadMedia(imageFile);
        imageUrl = uploadRes.url;
      }

      const payload = {
        name: formData.name,
        role: formData.role.toUpperCase(),
        basePrice: parseFloat(formData.basePrice) || 0,
        imageUrl: imageUrl,
        category: formData.category.toUpperCase(),
        isWicketKeeper: formData.isWicketKeeper,
        statistics: {
          matches: parseInt(formData.matches) || 0,
          runs: parseInt(formData.runs) || 0,
          highestScore: parseInt(formData.highestScore) || 0,
          battingAverage: parseFloat(formData.battingAverage) || 0,
          strikeRate: parseFloat(formData.strikeRate) || 0,
          wickets: parseInt(formData.wickets) || 0,
          bestBowlingWickets: parseInt(formData.bestBowlingWickets) || 0,
          bestBowlingRuns: parseInt(formData.bestBowlingRuns) || 0,
          economy: parseFloat(formData.economy) || 0,
          catches: parseInt(formData.catches) || 0
        }
      };

      if (isEditMode) {
        if (!imageUrl) delete payload.imageUrl;
        await updatePlayer(id, payload);
      } else {
        await createPlayer(payload);
      }
      navigate('/manager/player-pool');
    } catch (err) {
      console.error('Failed to create player:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save player. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? "Edit Player" : "Add New Player"}
        description={isEditMode ? "Update player details." : "Register a new player for the auction pool."}
        backUrl="/manager/player-pool"
      />

      {isLoadingData ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
          Loading player data...
        </div>
      ) : (
      <>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Player Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">1. Player Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Player Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="e.g., Virat Kohli"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Primary Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
                >
                  <option value="BATSMAN">Batter</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-rounder</option>
                </select>
              </div>
              
              <div className="space-y-2 flex items-center h-full pt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isWicketKeeper"
                    checked={formData.isWicketKeeper}
                    onChange={handleChange}
                    className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Is Wicket Keeper?</span>
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">Base Price (₹) *</label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  required
                  min="0"
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="e.g., 20000000"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="playerImage" className="block text-sm font-medium text-gray-700">Profile Photo (Optional)</label>
                <div className="border border-gray-300 rounded-lg p-2 bg-white flex items-center">
                  <input
                    type="file"
                    id="playerImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
                {imageFile && <span className="text-xs text-green-600 font-medium">Selected: {imageFile.name}</span>}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Batting Statistics */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">2. Batting Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="matches" className="block text-sm font-medium text-gray-700">Matches</label>
                <input type="number" id="matches" name="matches" value={formData.matches} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="runs" className="block text-sm font-medium text-gray-700">Runs</label>
                <input type="number" id="runs" name="runs" value={formData.runs} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="highestScore" className="block text-sm font-medium text-gray-700">Highest Score</label>
                <input type="number" id="highestScore" name="highestScore" value={formData.highestScore} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="battingAverage" className="block text-sm font-medium text-gray-700">Batting Average</label>
                <input type="number" step="0.01" id="battingAverage" name="battingAverage" value={formData.battingAverage} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label htmlFor="strikeRate" className="block text-sm font-medium text-gray-700">Strike Rate</label>
                <input type="number" step="0.01" id="strikeRate" name="strikeRate" value={formData.strikeRate} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0.00" />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Bowling & Fielding Statistics */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">3. Bowling & Fielding Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="wickets" className="block text-sm font-medium text-gray-700">Wickets</label>
                <input type="number" id="wickets" name="wickets" value={formData.wickets} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Best Bowling (Wkts / Runs)</label>
                <div className="flex items-center space-x-2">
                  <input type="number" name="bestBowlingWickets" value={formData.bestBowlingWickets} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors text-center" placeholder="W" />
                  <span className="text-gray-400 font-bold text-xl">/</span>
                  <input type="number" name="bestBowlingRuns" value={formData.bestBowlingRuns} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors text-center" placeholder="R" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="economy" className="block text-sm font-medium text-gray-700">Economy Rate</label>
                <input type="number" step="0.01" id="economy" name="economy" value={formData.economy} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0.00" />
              </div>

              <div className="space-y-2">
                <label htmlFor="catches" className="block text-sm font-medium text-gray-700">Catches</label>
                <input type="number" id="catches" name="catches" value={formData.catches} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors" placeholder="0" />
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" type="button" onClick={() => navigate('/manager/player-pool')} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Player' : 'Save Player')}
          </Button>
        </div>
      </form>
      </>
      )}
    </div>
  );
}
