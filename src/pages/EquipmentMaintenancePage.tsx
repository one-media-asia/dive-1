import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/integrations/api/client';
import { 
  Trash2, Plus, Save, Wrench, AlertTriangle, CheckCircle, 
  Package, DollarSign, Search, Filter, Calendar, Clock
} from 'lucide-react';

export default function EquipmentMaintenancePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, any>>({});
  const [assignments, setAssignments] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.equipment.list();
      setItems(Array.isArray(data) ? data : []);
      console.log('Equipment loaded:', data);
    } catch (err) {
      console.error('Failed to load equipment', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const loadAssignments = async () => {
    try {
      const data = await apiClient.rentalAssignments.list();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assignments', err);
      setAssignments([]);
    }
  };

  useEffect(() => { loadAssignments(); }, []);

  const getStatus = (it: any) => {
    if (typeof it.quantity_available_for_rent === 'number') {
      return it.quantity_available_for_rent > 0 ? 'Available' : 'Rented out';
    }
    return 'Unknown';
  };

  const getMaintenanceStatus = (it: any) => {
    // Simple logic - in real app this would be based on last maintenance date
    const daysSinceLastUse = Math.floor(Math.random() * 100); // Mock data
    if (daysSinceLastUse > 90) return { status: 'Due', color: 'destructive', icon: AlertTriangle };
    if (daysSinceLastUse > 60) return { status: 'Soon', color: 'secondary', icon: Wrench };
    return { status: 'Good', color: 'default', icon: CheckCircle };
  };

  const handleEdit = (id: string, field: string, value: any) => {
    setEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));
  };

  const handleSave = async (id: string) => {
    const payload = edits[id];
    if (!payload || Object.keys(payload).length === 0) {
      alert('No changes to save');
      return;
    }
    setSavingId(id);
    try {
      const existing = items.find(i => i.id === id);
      if (!existing) {
        alert('Item not found');
        setSavingId(null);
        return;
      }
      const fullPayload = { ...existing, ...payload };
      console.log('Saving equipment with payload:', fullPayload);
      const result = await apiClient.equipment.update(id, fullPayload);
      console.log('Save result:', result);
      await load();
      setEdits((e) => { const c = { ...e }; delete c[id]; return c; });
      alert('Equipment saved successfully');
    } catch (err) {
      console.error('Save failed', err);
      alert(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this equipment item?')) return;
    try {
      await apiClient.equipment.delete(id);
      await load();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete');
    }
  };

  const addExamples = async () => {
    const examples = [
      { name: 'Scuba Fins', category: 'Fins', price: 89.99, can_rent: true, rent_price_per_day: 8, quantity_in_stock: 8, quantity_available_for_rent: 8 },
      { name: 'Dive Boots', category: 'Shoe', price: 49.99, can_rent: true, rent_price_per_day: 5, quantity_in_stock: 6, quantity_available_for_rent: 6 },
      { name: 'BCD Jacket', category: 'BCD', price: 299.99, can_rent: true, rent_price_per_day: 15, quantity_in_stock: 4, quantity_available_for_rent: 4 },
      { name: 'Wetsuit 3mm', category: 'Wetsuit', price: 129.99, can_rent: true, rent_price_per_day: 10, quantity_in_stock: 5, quantity_available_for_rent: 5 },
      { name: 'Dive Computer', category: 'Computer', price: 399.99, can_rent: true, rent_price_per_day: 20, quantity_in_stock: 3, quantity_available_for_rent: 3 },
      { name: 'Dive Mask', category: 'Mask', price: 59.99, can_rent: true, rent_price_per_day: 4, quantity_in_stock: 12, quantity_available_for_rent: 12 },
      { name: 'Mask & Snorkel Set', category: 'Fins', price: 39.99, can_rent: true, rent_price_per_day: 4, quantity_in_stock: 10, quantity_available_for_rent: 10 },
      { name: 'Regulator Set', category: 'Shoe', price: 349.99, can_rent: true, rent_price_per_day: 18, quantity_in_stock: 3, quantity_available_for_rent: 3 },
      { name: 'Dive Knife', category: 'Fins', price: 29.99, can_rent: true, rent_price_per_day: 3, quantity_in_stock: 7, quantity_available_for_rent: 7 },
      { name: 'Dive Light', category: 'Computer', price: 79.99, can_rent: true, rent_price_per_day: 6, quantity_in_stock: 4, quantity_available_for_rent: 4 },
    ];
    try {
      for (const ex of examples) {
        await apiClient.equipment.create(ex);
      }
      await load();
      await loadAssignments();
    } catch (err) {
      console.error('Failed to create examples', err);
      alert('Failed to add example items');
    }
  };

  const rentedCountFor = (id: string) => {
    return assignments.filter(a => a.equipment_id === id && a.status === 'active').reduce((s, a) => s + (a.quantity || 0), 0);
  };

  const handleCheckOut = async (it: any) => {
    const max = it.quantity_available_for_rent ?? it.quantity_in_stock ?? 0;
    const qStr = window.prompt(`Quantity to check out (max ${max}):`, '1');
    if (!qStr) return;
    const qty = Math.max(1, Number(qStr));
    if (qty > max) { alert('Not enough available units'); return; }
    const bookingId = window.prompt('Booking ID (optional):', '');
    const checkIn = window.prompt('Check-in date (YYYY-MM-DD):', new Date().toISOString().slice(0,10));
    const checkOut = window.prompt('Check-out date (YYYY-MM-DD):', new Date(Date.now()+24*60*60*1000).toISOString().slice(0,10));
    try {
      const payload: any = { equipment_id: it.id, quantity: qty, check_in: checkIn, check_out: checkOut };
      if (bookingId) payload.booking_id = bookingId;
      const res = await apiClient.rentalAssignments.create(payload);
      const newAvail = (it.quantity_available_for_rent || 0) - qty;
      await apiClient.equipment.update(it.id, { quantity_available_for_rent: Math.max(0, newAvail) });
      await load();
      await loadAssignments();
      alert('Checked out');
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Failed to check out');
    }
  };

  const handleReturnAssignment = async (assignment: any) => {
    if (!confirm(`Return ${assignment.quantity} x ${assignment.equipment_name}?`)) return;
    try {
      await apiClient.rentalAssignments.delete(assignment.id);
      const eq = items.find(i => i.id === assignment.equipment_id);
      const newAvail = (eq.quantity_available_for_rent || 0) + (assignment.quantity || 0);
      await apiClient.equipment.update(assignment.equipment_id, { quantity_available_for_rent: newAvail });
      await load();
      await loadAssignments();
      alert('Returned');
    } catch (err) {
      console.error('Return failed', err);
      alert('Failed to return');
    }
  };

  const categories = ['All', 'Fins', 'Shoe', 'BCD', 'Wetsuit', 'Computer', 'Mask'];
  
  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'All' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between mb-4">
        <div>
          <h1 className="page-title">Equipment Items and Rental - Maintenance</h1>
          <p className="page-description">Manage equipment rentals and maintenance schedules</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addExamples} variant="outline"><Plus className="mr-2 h-4 w-4" />Add Equipment Item</Button>
          <Button onClick={load}><Save className="mr-2 h-4 w-4" />Refresh</Button>
        </div>
      </div>

      {/* Equipment Rentals Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Equipment Rentals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={filter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(cat)}
              >
                {cat}
              </Button>
            ))}
            <select className="ml-4 px-3 py-1 border rounded">
              <option>Rental</option>
              <option>Maintenance</option>
              <option>Available</option>
            </select>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm">Clear</Button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading equipment…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">No equipment found</div>
              ) : filteredItems.map((it) => {
                const maintenance = getMaintenanceStatus(it);
                const MaintenanceIcon = maintenance.icon;
                return (
                  <Card key={it.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{it.name}</h3>
                          <p className="text-sm text-muted-foreground">{it.category} {it.sku && `• ${it.sku}`}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Name:</Label>
                              <Input
                                value={edits[it.id]?.name || it.name}
                                onChange={(e) => handleEdit(it.id, 'name', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Equipment name"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Price:</Label>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={edits[it.id]?.price || it.price}
                                  onChange={(e) => handleEdit(it.id, 'price', parseFloat(e.target.value))}
                                  className="h-8 text-sm w-24"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Daily Rent:</Label>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  value={edits[it.id]?.rent_price_per_day || it.rent_price_per_day}
                                  onChange={(e) => handleEdit(it.id, 'rent_price_per_day', parseFloat(e.target.value))}
                                  className="h-8 text-sm w-24"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${it.price?.toFixed(2) || '0.00'}</span>
                          <Badge variant={getStatus(it) === 'Available' ? 'secondary' : 'destructive'}>
                            {getStatus(it)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span>Rent: ${it.rent_price_per_day?.toFixed(2) || '0.00'}/day</span>
                          <Badge variant={maintenance.color} className="flex items-center gap-1">
                            <MaintenanceIcon className="w-3 h-3" />
                            {maintenance.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Available: {it.quantity_available_for_rent || 0} / {it.quantity_in_stock || 0}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(it.id, 'name', prompt('Edit name:', it.name))}
                            variant="outline"
                            className="flex-1"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCheckOut(it)}
                            disabled={getStatus(it) !== 'Available'}
                            className="flex-1"
                          >
                            Rent
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`Delete "${it.name}"? This action cannot be undone.`)) {
                                handleDelete(it.id);
                              }
                            }}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Rentals */}
      {assignments.filter(a => a.status === 'active').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.filter(a => a.status === 'active').map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{assignment.equipment_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {assignment.quantity} | {assignment.check_in} to {assignment.check_out}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReturnAssignment(assignment)}
                  >
                    Return
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
