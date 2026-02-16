import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  Smartphone,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  CheckCircle
} from 'lucide-react';

interface QRCodeConfig {
  type: 'diver_registration' | 'trip_booking' | 'feedback' | 'contact';
  title: string;
  description: string;
  redirectUrl: string;
  requiredFields: string[];
  customMessage?: string;
}

interface GeneratedQR {
  id: string;
  config: QRCodeConfig;
  url: string;
  createdAt: Date;
  scans: number;
}

export default function WeChatQRGenerator() {
  const [config, setConfig] = useState<QRCodeConfig>({
    type: 'diver_registration',
    title: 'New Diver Registration',
    description: 'Scan to register as a new diver',
    redirectUrl: 'https://your-dive-site.com/register',
    requiredFields: ['name', 'email', 'phone'],
    customMessage: '',
  });

  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([
    {
      id: '1',
      config: {
        type: 'diver_registration',
        title: 'New Diver Registration',
        description: 'Scan to register as a new diver',
        redirectUrl: 'https://your-dive-site.com/register',
        requiredFields: ['name', 'email', 'phone'],
      },
      url: 'https://your-dive-site.com/qr/diver-reg-123',
      createdAt: new Date('2026-02-15T10:30:00'),
      scans: 47,
    },
    {
      id: '2',
      config: {
        type: 'trip_booking',
        title: 'Book a Dive Trip',
        description: 'Scan to book your next adventure',
        redirectUrl: 'https://your-dive-site.com/book',
        requiredFields: ['name', 'email', 'trip_date'],
      },
      url: 'https://your-dive-site.com/qr/trip-book-456',
      createdAt: new Date('2026-02-14T14:20:00'),
      scans: 23,
    },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const qrTemplates = [
    {
      type: 'diver_registration' as const,
      title: 'New Diver Registration',
      description: 'Register new divers directly from WeChat',
      redirectUrl: 'https://your-dive-site.com/register',
      requiredFields: ['name', 'email', 'phone', 'certification'],
    },
    {
      type: 'trip_booking' as const,
      title: 'Dive Trip Booking',
      description: 'Book dive trips via WeChat',
      redirectUrl: 'https://your-dive-site.com/book',
      requiredFields: ['name', 'email', 'trip_date', 'experience'],
    },
    {
      type: 'feedback' as const,
      title: 'Dive Feedback',
      description: 'Collect feedback after dives',
      redirectUrl: 'https://your-dive-site.com/feedback',
      requiredFields: ['name', 'rating', 'comments'],
    },
    {
      type: 'contact' as const,
      title: 'Contact Information',
      description: 'Share contact details and emergency info',
      redirectUrl: 'https://your-dive-site.com/contact',
      requiredFields: ['name', 'phone', 'emergency_contact'],
    },
  ];

  const handleTemplateSelect = (template: typeof qrTemplates[0]) => {
    setConfig({
      ...template,
      customMessage: '',
    });
  };

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // Simulate QR code generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newQR: GeneratedQR = {
        id: Date.now().toString(),
        config: { ...config },
        url: `${config.redirectUrl}/qr/${Date.now()}`,
        createdAt: new Date(),
        scans: 0,
      };
      
      setGeneratedQRs(prev => [newQR, ...prev]);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQR = (qr: GeneratedQR) => {
    // Simulate download
    const link = document.createElement('a');
    link.download = `qr-${qr.config.type}-${qr.id}.png`;
    link.href = '/api/placeholder-qrcode.png'; // Placeholder
    link.click();
  };

  const shareQR = (qr: GeneratedQR) => {
    if (navigator.share) {
      navigator.share({
        title: qr.config.title,
        text: qr.config.description,
        url: qr.url,
      });
    } else {
      copyToClipboard(qr.url);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diver_registration':
        return <User className="h-4 w-4" />;
      case 'trip_booking':
        return <Globe className="h-4 w-4" />;
      case 'feedback':
        return <FileText className="h-4 w-4" />;
      case 'contact':
        return <Phone className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'diver_registration':
        return 'default';
      case 'trip_booking':
        return 'secondary';
      case 'feedback':
        return 'outline';
      case 'contact':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>QR Code Type</Label>
              <Select value={config.type} onValueChange={(value: any) => {
                const template = qrTemplates.find(t => t.type === value);
                if (template) handleTemplateSelect(template);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qrTemplates.map((template) => (
                    <SelectItem key={template.type} value={template.type}>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        {template.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="QR code title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Describe what this QR code does"
                rows={2}
              />
            </div>

            <div>
              <Label>Redirect URL</Label>
              <Input
                value={config.redirectUrl}
                onChange={(e) => setConfig({ ...config, redirectUrl: e.target.value })}
                placeholder="https://your-site.com/page"
              />
            </div>

            <div>
              <Label>Required Fields</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['name', 'email', 'phone', 'certification', 'experience', 'trip_date'].map((field) => (
                  <Badge
                    key={field}
                    variant={config.requiredFields.includes(field) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const newFields = config.requiredFields.includes(field)
                        ? config.requiredFields.filter(f => f !== field)
                        : [...config.requiredFields, field];
                      setConfig({ ...config, requiredFields: newFields });
                    }}
                  >
                    {field}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Custom Message (Optional)</Label>
              <Textarea
                value={config.customMessage}
                onChange={(e) => setConfig({ ...config, customMessage: e.target.value })}
                placeholder="Additional message for users"
                rows={2}
              />
            </div>

            <Button 
              onClick={generateQRCode} 
              disabled={isGenerating || !config.title || !config.redirectUrl}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </CardContent>
        </Card>

        {/* QR Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4 p-6 border-2 border-dashed border-muted rounded-lg">
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-gray-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold">{config.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Required: {config.requiredFields.join(', ')}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Test Scan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated QR Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generated QR Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedQRs.map((qr) => (
              <div key={qr.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(qr.config.type)}
                    <Badge variant={getTypeBadge(qr.config.type)}>
                      {qr.config.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {qr.scans} scans
                  </div>
                </div>
                
                <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-400" />
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">{qr.config.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {qr.createdAt.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(qr.url)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadQR(qr)}>
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareQR(qr)}>
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
