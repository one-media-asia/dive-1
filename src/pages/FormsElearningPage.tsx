import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Upload, 
  Plus, 
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  BookOpen
} from 'lucide-react';
import { apiClient } from '@/integrations/api/client';

interface FormSubmission {
  id: string;
  diverName: string;
  formType: string;
  status: 'completed' | 'pending' | 'expired';
  submittedDate: string;
  expiryDate: string;
}

interface Form {
  id: string;
  name: string;
  type: 'medical' | 'liability' | 'certification' | 'experience';
  description: string;
  downloadUrl: string;
}

interface Diver {
  id: string;
  name: string;
}

export default function FormsElearningPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [divers, setDivers] = useState<Diver[]>([]);
  const [selectedDiver, setSelectedDiver] = useState('');
  const [selectedForm, setSelectedForm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const forms: Form[] = [
    {
      id: 'medical-declaration',
      name: 'Medical Declaration Form',
      type: 'medical',
      description: 'PADI Medical Statement - Required for all divers',
      downloadUrl: '/forms/padi-medical-declaration.pdf'
    },
    {
      id: 'liability-release',
      name: 'Liability Release Form',
      type: 'liability',
      description: 'Liability Release and Assumption of Risk Agreement',
      downloadUrl: '/forms/liability-release.pdf'
    },
    {
      id: 'certification-card',
      name: 'Certification Card Application',
      type: 'certification',
      description: 'Replacement certification card application',
      downloadUrl: '/forms/certification-application.pdf'
    },
    {
      id: 'experience-log',
      name: 'Dive Experience Log',
      type: 'experience',
      description: 'Personal dive logbook for recording experiences',
      downloadUrl: '/forms/dive-log.pdf'
    }
  ];

  const sampleSubmissions: FormSubmission[] = [
    {
      id: '1',
      diverName: 'John Smith',
      formType: 'Medical Declaration',
      status: 'completed',
      submittedDate: '2024-02-10',
      expiryDate: '2025-02-10'
    },
    {
      id: '2',
      diverName: 'Sarah Johnson',
      formType: 'Liability Release',
      status: 'pending',
      submittedDate: '2024-02-12',
      expiryDate: '2024-03-12'
    },
    {
      id: '3',
      diverName: 'Mike Chen',
      formType: 'Medical Declaration',
      status: 'expired',
      submittedDate: '2023-12-01',
      expiryDate: '2024-12-01'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const diversRes = await apiClient.divers.list();
        setDivers(Array.isArray(diversRes) ? diversRes : []);
        setSubmissions(sampleSubmissions);
      } catch (error) {
        console.error('Failed to load data:', error);
        setSubmissions(sampleSubmissions);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateNewForm = () => {
    if (!selectedDiver || !selectedForm) {
      return;
    }
    
    const newSubmission: FormSubmission = {
      id: Date.now().toString(),
      diverName: divers.find(d => d.id === selectedDiver)?.name || 'Unknown',
      formType: forms.find(f => f.id === selectedForm)?.name || 'Unknown',
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setSubmissions([newSubmission, ...submissions]);
    setSelectedDiver('');
    setSelectedForm('');
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions(submissions.filter(s => s.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.diverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.formType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading forms and e-learning...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms & E-learning</h1>
          <p className="text-muted-foreground">
            Manage PADI forms, waivers, and educational materials
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {submissions.length} Active Forms
        </Badge>
      </div>

      <Tabs defaultValue="forms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="forms">PADI Forms</TabsTrigger>
          <TabsTrigger value="submissions">Form Submissions</TabsTrigger>
          <TabsTrigger value="elearning">E-learning</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {form.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Signed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Form Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="diver">Select Diver</Label>
                  <Select value={selectedDiver} onValueChange={setSelectedDiver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a diver" />
                    </SelectTrigger>
                    <SelectContent>
                      {divers.map((diver) => (
                        <SelectItem key={diver.id} value={diver.id}>
                          {diver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="form">Select Form</Label>
                  <Select value={selectedForm} onValueChange={setSelectedForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a form" />
                    </SelectTrigger>
                    <SelectContent>
                      {forms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreateNewForm} disabled={!selectedDiver || !selectedForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Submission
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Form Submissions</span>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission.status)}
                      <div>
                        <p className="font-medium">{submission.diverName}</p>
                        <p className="text-sm text-muted-foreground">{submission.formType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Due: {submission.expiryDate}
                      </span>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSubmission(submission.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elearning" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  PADI Open Water Course
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Complete e-learning theory for your Open Water certification
                </p>
                <Button className="w-full">
                  Start Course
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Advanced Open Water
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Advanced diving techniques and specialty knowledge
                </p>
                <Button className="w-full">
                  Start Course
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Rescue Diver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Learn rescue techniques and emergency management
                </p>
                <Button className="w-full">
                  Start Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}