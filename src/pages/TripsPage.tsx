import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users,
  List,
  Home,
  FileText,
  UserCheck,
  MessageSquare, 
  Phone, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';

interface DiveTrip {
  id: string;
  name: string;
  start_at: string;
  location?: string;
  diver_count?: number;
  diver_names?: string[];
}

export default function TripsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 16)); // February 2026
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [activeTab, setActiveTab] = useState('calendar');

  // WhatsApp integration stats
  const integrationStats = {
    totalDivers: 1247,
    whatsappDivers: 234,
    autoImportRate: 82,
    avgConfidence: 88,
    monthlyGrowth: 31,
    responseTime: '1.8 min',
    clickToChatClicks: 1456,
    messageTemplates: 12,
  };

  // Sample trip data matching the image
  const trips: DiveTrip[] = [
    {
      id: '1',
      name: 'Ghost Bay Dive',
      start_at: '2026-02-16T09:00:00',
      location: 'Ghost Bay',
      diver_count: 1,
      diver_names: ['Peter Greaney']
    },
    {
      id: '2',
      name: 'Coral Reef Exploration',
      start_at: '2026-02-18T11:30:00',
      location: 'Coral Reef',
      diver_count: 3,
      diver_names: ['Sarah Johnson', 'Mike Chen', 'Emily Davis']
    },
    {
      id: '3',
      name: 'Deep Wall Adventure',
      start_at: '2026-02-20T14:00:00',
      location: 'Deep Wall',
      diver_count: 2,
      diver_names: ['John Smith', 'Lisa Wong']
    }
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (direction === 'prev') {
        return subMonths(prev, 1);
      } else {
        return addMonths(prev, 1);
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTripsForDay = (day: Date) => {
    return trips.filter(trip => isSameDay(new Date(trip.start_at), day));
  };

  const formatTripTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'ha').toLowerCase();
  };

  const formatTripDisplay = (trip: DiveTrip) => {
    const time = formatTripTime(trip.start_at);
    const diverInfo = trip.diver_count && trip.diver_names 
      ? `(${trip.diver_count}) ${trip.diver_names.join(', ')}`
      : trip.diver_names 
      ? trip.diver_names.join(', ')
      : '';
    const location = trip.location ? `, ${trip.location}` : '';
    return `${time} ${diverInfo}${location}`;
  };

  // Custom day component to show trips
  const renderDay = (day: Date) => {
    const dayTrips = getTripsForDay(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    
    return (
      <div className="relative h-20 w-full p-1">
        <div className={`text-sm ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>
          {format(day, 'd')}
        </div>
        <div className="space-y-1 mt-1">
          {dayTrips.slice(0, 2).map((trip, index) => (
            <div 
              key={trip.id} 
              className="text-xs bg-blue-100 text-blue-800 rounded px-1 truncate"
              title={formatTripDisplay(trip)}
            >
              {formatTripTime(trip.start_at)} ({trip.diver_count || 1}) {trip.diver_names?.[0]}
            </div>
          ))}
          {dayTrips.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{dayTrips.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with title and badges */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips & WhatsApp Integration</h1>
          <p className="text-muted-foreground">
            Manage dive trips and WhatsApp-based diver communication
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            Business API
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Auto-Import Active
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="whatsapp-overview">WhatsApp Overview</TabsTrigger>
          <TabsTrigger value="parser">Message Parser</TabsTrigger>
          <TabsTrigger value="autoimport">Auto-Import</TabsTrigger>
          <TabsTrigger value="chatlinks">Chat Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
      {/* Header with navigation and action buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Dive Trip
              </Button>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Trip Schedules
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Daily Summary
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Dive Trips & Accommodation
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'month' ? (
            // Month View
            <div className="grid grid-cols-7 gap-0">
              {/* Weekday headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {(() => {
                const monthStart = startOfMonth(currentDate);
                const monthEnd = endOfMonth(currentDate);
                const calendarStart = new Date(monthStart);
                calendarStart.setDate(calendarStart.getDate() - (calendarStart.getDay() || 7) + 1);
                
                const days = [];
                const currentDay = new Date(calendarStart);
                
                for (let i = 0; i < 42; i++) {
                  days.push(new Date(currentDay));
                  currentDay.setDate(currentDay.getDate() + 1);
                }
                
                return days.map((day, index) => (
                  <div 
                    key={index} 
                    className={`min-h-[80px] border-b border-r p-1 ${
                      !isSameMonth(day, currentDate) ? 'bg-muted/30' : ''
                    } ${isSameDay(day, new Date(2026, 1, 16)) ? 'bg-blue-50' : ''}`}
                  >
                    {renderDay(day)}
                  </div>
                ));
              })()}
            </div>
          ) : (
            // Week View
            <div className="grid grid-cols-7 gap-0">
              {/* Weekday headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r">
                  {day}
                </div>
              ))}
              
              {/* Week days */}
              {(() => {
                const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
                const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
                
                return weekDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`min-h-[120px] border-b border-r p-1 ${
                      isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {renderDay(day)}
                  </div>
                ));
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend/Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trip Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {trips.length} Total Trips
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {trips.reduce((sum, trip) => sum + (trip.diver_count || 1), 0)} Total Divers
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[...new Set(trips.map(trip => trip.location).filter(Boolean))].length} Locations
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="whatsapp-overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Divers</p>
                    <p className="text-2xl font-bold">{integrationStats.totalDivers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp Divers</p>
                    <p className="text-2xl font-bold">{integrationStats.whatsappDivers}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Auto-Import Rate</p>
                    <p className="text-2xl font-bold">{integrationStats.autoImportRate}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    <p className="text-2xl font-bold">{integrationStats.avgConfidence}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                WhatsApp Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Enhanced Message Parsing</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced parsing for WhatsApp's conversational format and international phone numbers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Auto-Reply System</h4>
                  <p className="text-sm text-muted-foreground">
                    Intelligent responses based on message content and confidence scores
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Click-to-Chat Links</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate direct chat links for website and marketing materials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Parser</CardTitle>
            </CardHeader>
            <CardContent>
              <p>WhatsApp Message Parser - Extract diver information from WhatsApp messages automatically.</p>
              <div className="mt-4">
                <Button>Test Parser</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autoimport" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Import Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configure automatic import of WhatsApp messages into diver profiles.</p>
              <div className="mt-4">
                <Button>Configure Auto-Import</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatlinks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Click-to-Chat Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate WhatsApp links that allow customers to start conversations with a single click.</p>
              <div className="mt-4">
                <Button>Generate Chat Links</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">WhatsApp Business API Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure your WhatsApp Business API credentials
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone-number-id" className="text-sm font-medium">Phone Number ID</label>
                  <input 
                    id="phone-number-id"
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    placeholder="1234567890"
                    aria-label="Phone Number ID"
                  />
                </div>
                <div>
                  <label htmlFor="whatsapp-business-id" className="text-sm font-medium">WhatsApp Business ID</label>
                  <input 
                    id="whatsapp-business-id"
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    placeholder="your-business@whatsapp"
                    aria-label="WhatsApp Business ID"
                  />
                </div>
                <div>
                  <label htmlFor="api-token" className="text-sm font-medium">API Token</label>
                  <input 
                    id="api-token"
                    type="password" 
                    className="w-full p-2 border rounded-md"
                    placeholder="your_whatsapp_api_token"
                    aria-label="WhatsApp API Token"
                  />
                </div>
                <div>
                  <label htmlFor="webhook-url" className="text-sm font-medium">Webhook URL</label>
                  <input 
                    id="webhook-url"
                    type="url" 
                    className="w-full p-2 border rounded-md"
                    value="https://your-domain.com/api/whatsapp/webhook"
                    readOnly
                    aria-label="Webhook URL for WhatsApp Business API"
                    title="Webhook URL - This endpoint receives WhatsApp messages"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Message Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Pre-approved templates for common responses
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Welcome Message</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Hello! 👋 Thank you for contacting our dive center. How can we help you today?"
                  </p>
                </div>
                <div className="p-3 border rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Booking Confirmation</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Great! 🎉 Your dive trip has been confirmed. We'll send you details shortly."
                  </p>
                </div>
              </div>

              <Button className="w-full">
                Save WhatsApp Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
