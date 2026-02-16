import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Bot, 
  QrCode, 
  Settings, 
  BarChart3,
  Users,
  Zap,
  Shield,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

import WeChatMessageParser from '@/components/wechat/WeChatMessageParser';
import WeChatAutoImport from '@/components/wechat/WeChatAutoImport';
import WeChatQRGenerator from '@/components/wechat/WeChatQRGenerator';

export default function WeChatIntegrationPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const integrationStats = {
    totalDivers: 1247,
    wechatDivers: 186,
    autoImportRate: 78,
    avgConfidence: 85,
    monthlyGrowth: 23,
    responseTime: '2.3 min'
  };

  const handleImport = (data: any) => {
    console.log('Importing diver data:', data);
    // Implementation would integrate with your diver creation system
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WeChat Integration</h1>
          <p className="text-muted-foreground">
            Manage WeChat-based diver registration and automated data import
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Connected
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            Auto-Import Active
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parser">Message Parser</TabsTrigger>
          <TabsTrigger value="autoimport">Auto-Import</TabsTrigger>
          <TabsTrigger value="qrgenerator">QR Generator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                    <p className="text-sm text-muted-foreground">WeChat Divers</p>
                    <p className="text-2xl font-bold">{integrationStats.wechatDivers}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-green-600" />
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
                  <Bot className="h-8 w-8 text-purple-600" />
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
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Growth</p>
                    <p className="text-2xl font-bold">+{integrationStats.monthlyGrowth}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{integrationStats.responseTime}</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  WeChat Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Smart Message Parsing</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically extract diver information from WeChat messages using AI-powered parsing
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Auto-Import System</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatically create diver profiles when confidence score meets threshold
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">QR Code Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate QR codes for easy diver registration and trip booking
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Duplicate Detection</h4>
                    <p className="text-sm text-muted-foreground">
                      Prevent duplicate entries with intelligent matching algorithms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button className="h-20 flex-col gap-2">
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-sm">Test Parser</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <QrCode className="h-6 w-6" />
                    <span className="text-sm">Generate QR</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">Configure</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">View Stats</span>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>张伟 registered via WeChat</span>
                      <Badge variant="outline">2 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Sarah Johnson imported</span>
                      <Badge variant="outline">5 min ago</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>QR code generated for trip booking</span>
                      <Badge variant="outline">12 min ago</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Setup Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">1. Configure WeChat Official Account</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Set up server URL: https://your-domain.com/api/wechat/webhook</li>
                    <li>Configure token and encoding AESKey</li>
                    <li>Enable message receiving permissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Customize Auto-Import Settings</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Set confidence threshold (recommended: 70%)</li>
                    <li>Configure required fields</li>
                    <li>Enable duplicate checking</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Generate QR Codes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Create registration QR codes</li>
                    <li>Place QR codes at dive center</li>
                    <li>Share on social media and website</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. Monitor Performance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Track import success rates</li>
                    <li>Monitor confidence scores</li>
                    <li>Review parsing accuracy</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parser">
          <WeChatMessageParser onImport={handleImport} />
        </TabsContent>

        <TabsContent value="autoimport">
          <WeChatAutoImport />
        </TabsContent>

        <TabsContent value="qrgenerator">
          <WeChatQRGenerator />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">WeChat Configuration</h4>
                <p className="text-sm text-muted-foreground">
                  Configure your WeChat Official Account settings
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">App ID</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    placeholder="wx1234567890abcdef"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">App Secret</label>
                  <input 
                    type="password" 
                    className="w-full p-2 border rounded-md"
                    placeholder="your_app_secret"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Token</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    placeholder="your_wechat_token"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Encoding AESKey</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md"
                    placeholder="your_encoding_key"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Webhook Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure the webhook endpoint for receiving WeChat messages
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Webhook URL</label>
                <input 
                  type="url" 
                  className="w-full p-2 border rounded-md"
                  value="https://your-domain.com/api/wechat/webhook"
                  readOnly
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="webhook-enabled" defaultChecked />
                <label htmlFor="webhook-enabled" className="text-sm">
                  Enable webhook for receiving messages
                </label>
              </div>

              <Button className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
