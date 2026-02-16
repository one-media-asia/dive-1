import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Phone, 
  Settings, 
  Users
} from 'lucide-react';

export default function WhatsAppIntegrationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration</h1>
          <p className="text-muted-foreground">
            Manage WhatsApp-based diver registration and automated communication
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parser">Message Parser</TabsTrigger>
          <TabsTrigger value="autoimport">Auto-Import</TabsTrigger>
          <TabsTrigger value="chatlinks">Chat Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>WhatsApp Integration Overview - This tab is working!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parser" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Parser</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Message Parser Tab - This tab is working!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autoimport" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Import</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Auto-Import Tab - This tab is working!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatlinks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Links</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Chat Links Tab - This tab is working!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings Tab - This tab is working!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
