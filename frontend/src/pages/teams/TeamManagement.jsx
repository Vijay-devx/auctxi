import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/common/Table';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchTeams = async () => {
    try {
      const res = await api.get('/api/v1/teams');
      setTeams(res.data);
    } catch (err) {
      // Error handled by interceptor
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const openModal = (team = null) => {
    setEditingTeam(team);
    if (team) {
      reset({ name: team.name, shortName: team.shortName, totalBudget: team.totalBudget });
    } else {
      reset({ name: '', shortName: '', totalBudget: 10000000 });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingTeam) {
        await api.put(`/api/v1/teams/${editingTeam.id}`, data);
        toast.success("Team updated successfully");
      } else {
        await api.post('/api/v1/teams', data);
        toast.success("Team created successfully");
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await api.delete(`/api/v1/teams/${id}`);
        toast.success("Team deleted successfully");
        fetchTeams();
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Team Management</h2>
          <p className="text-sm text-slate-500">Manage franchise teams and their budgets.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <IconPlus size={18} />
          Create Team
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Short Name</TableHead>
                <TableHead>Total Budget</TableHead>
                <TableHead>Remaining Purse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.shortName}</TableCell>
                  <TableCell>${team.totalBudget?.toLocaleString()}</TableCell>
                  <TableCell className={team.remainingPurse < 1000000 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                    ${team.remainingPurse?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(team)}>
                        <IconEdit size={18} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(team.id)}>
                        <IconTrash size={18} className="text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                    No teams found. Click Create Team to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTeam ? "Edit Team" : "Create Team"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input 
            label="Team Name" 
            placeholder="e.g. Royal Challengers" 
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />
          <Input 
            label="Short Name" 
            placeholder="e.g. RCB" 
            {...register("shortName", { required: "Short name is required" })}
            error={errors.shortName?.message}
          />
          <Input 
            label="Total Budget" 
            type="number" 
            step="10000"
            {...register("totalBudget", { 
              required: "Budget is required",
              min: { value: 0, message: "Budget must be positive" } 
            })}
            error={errors.totalBudget?.message}
            disabled={editingTeam !== null} // Usually don't let them change budget once set
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTeam ? "Save Changes" : "Create Team"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManagement;
