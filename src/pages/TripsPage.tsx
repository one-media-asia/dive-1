import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  UserCheck
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
    <div className="space-y-6">
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
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('week')}
              >
                <List className="h-4 w-4 mr-2" />
                Basic Week
              </Button>
              <Button 
                variant={viewMode === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('month')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Dive Trip
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Trip Schedules
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Daily Summary
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          Dive Trips List
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Home className="h-4 w-4" />
          Accommodation
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Reports
        </Button>
      </div>

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
    </div>
  );
}
