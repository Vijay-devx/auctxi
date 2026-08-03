import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/common/Table';
import { IconPlus, IconEdit, IconTrash, IconFilter } from '@tabler/icons-react';

const PlayerManagement = React.memo(() => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [filters, setFilters] = useState({ role: '', category: '', status: '' });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchPlayers = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (filters.role) query.append('role', filters.role);
      if (filters.category) query.append('category', filters.category);
      if (filters.status) query.append('status', filters.status);
      
      const res = await api.get(`/api/v1/players?${query.toString()}`);
      setPlayers(res.data.content || res.data || []);
    } catch (err) {}
  }, [filters]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/teams');
      setTeams(res.data);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, [fetchPlayers, fetchTeams]);

  const openModal = useCallback((player = null) => {
    setEditingPlayer(player);
    if (player) {
      reset({ 
        name: player.name, 
        basePrice: player.basePrice, 
        role: player.role, 
        category: player.category,
        teamId: player.team?.id || ''
      });
    } else {
      reset({ name: '', basePrice: 50000, role: 'BATSMAN', category: 'CAPPED', teamId: '' });
    }
    setIsModalOpen(true);
  }, [reset]);

  const onSubmit = useCallback(async (data) => {
    try {
      // Clean up teamId if empty
      if (!data.teamId) data.teamId = null;

      if (editingPlayer) {
        await api.put(`/api/v1/players/${editingPlayer.id}`, data);
        toast.success("Player updated");
      } else {
        await api.post('/api/v1/players', data);
        toast.success("Player created");
      }
      setIsModalOpen(false);
      fetchPlayers();
    } catch (err) {}
  }, [editingPlayer, fetchPlayers]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Delete this player?")) {
      try {
        await api.delete(`/api/v1/players/${id}`);
        toast.success("Player deleted");
        fetchPlayers();
      } catch (err) {}
    }
  }, [fetchPlayers]);

  const getStatusBadge = useCallback((status) => {
    const map = {
      'UNSOLD': 'default',
      'SOLD': 'success',
      'UNAVAILABLE': 'danger'
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  }, []);

  const renderedPlayers = useMemo(() => {
    if (players.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center h-32 text-slate-500">
            No players found matching your criteria.
          </TableCell>
        </TableRow>
      );
    }
    return players.map((player) => (
      <TableRow key={player.id}>
        <TableCell className="font-medium text-slate-900">{player.name}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Badge variant="outline">{player.role}</Badge>
            <Badge variant="outline">{player.category}</Badge>
          </div>
        </TableCell>
        <TableCell>${player.basePrice?.toLocaleString()}</TableCell>
        <TableCell>{getStatusBadge(player.status)}</TableCell>
        <TableCell>{player.team?.name || <span className="text-slate-400 italic">None</span>}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => openModal(player)}>
              <IconEdit size={18} className="text-blue-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(player.id)}>
              <IconTrash size={18} className="text-red-600" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  }, [players, getStatusBadge, openModal, handleDelete]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Player Directory</h2>
          <p className="text-sm text-slate-500">Manage the auction pool of players.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2 self-start sm:self-auto">
          <IconPlus size={18} />
          Add Player
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-48">
              <Select label="Filter Role" value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})}>
                <option value="">All Roles</option>
                <option value="BATSMAN">Batsman</option>
                <option value="BOWLER">Bowler</option>
                <option value="ALL_ROUNDER">All-Rounder</option>
                <option value="WICKET_KEEPER">Wicket Keeper</option>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select label="Filter Category" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                <option value="">All Categories</option>
                <option value="CAPPED">Capped</option>
                <option value="UNCAPPED">Uncapped</option>
                <option value="OVERSEAS">Overseas</option>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select label="Filter Status" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                <option value="">All Statuses</option>
                <option value="UNSOLD">Unsold</option>
                <option value="SOLD">Sold</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Role & Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Team</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderedPlayers}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingPlayer ? "Edit Player" : "Add Player"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input 
            label="Full Name" 
            placeholder="e.g. Virat Kohli" 
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" {...register("role", { required: "Role is required" })} error={errors.role?.message}>
              <option value="BATSMAN">Batsman</option>
              <option value="BOWLER">Bowler</option>
              <option value="ALL_ROUNDER">All-Rounder</option>
              <option value="WICKET_KEEPER">Wicket Keeper</option>
            </Select>
            <Select label="Category" {...register("category", { required: "Category is required" })} error={errors.category?.message}>
              <option value="CAPPED">Capped</option>
              <option value="UNCAPPED">Uncapped</option>
              <option value="OVERSEAS">Overseas</option>
            </Select>
          </div>
          <Input 
            label="Base Price ($)" 
            type="number" 
            step="10000"
            {...register("basePrice", { required: "Base price required" })}
            error={errors.basePrice?.message}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingPlayer ? "Save Changes" : "Create Player"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
});

export default PlayerManagement;
