'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Eye, Save, FileText, Sparkles } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'default',
    name: 'Default Invitation',
    subject: 'Interview Invitation for {{jobTitle}}',
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}.

We would like to invite you to complete our AI-powered interview process. This interview will help us better understand your qualifications and experience.

Please click the link below to start your interview:
{{interviewLink}}

The interview should take approximately 30-45 minutes to complete. You can complete it at your convenience within the next 7 days.

If you have any questions, please don't hesitate to reach out.

Best regards,
{{hrName}}
{{companyName}} Hiring Team`,
  },
  {
    id: 'friendly',
    name: 'Friendly & Casual',
    subject: 'Let\'s talk about {{jobTitle}} at {{companyName}}!',
    body: `Hi {{candidateName}},

Thanks so much for applying to join our team as a {{jobTitle}}!

We're excited to learn more about you. We've set up a quick AI-powered interview that will help us get to know your skills and experience better.

Here's your personal interview link:
{{interviewLink}}

It should only take about 30-45 minutes, and you can do it whenever works best for you over the next week.

Looking forward to hearing from you!

Cheers,
{{hrName}} and the {{companyName}} team`,
  },
  {
    id: 'formal',
    name: 'Formal & Professional',
    subject: 'Invitation to Interview - {{jobTitle}} Position',
    body: `Dear {{candidateName}},

We are pleased to inform you that your application for the {{jobTitle}} position at {{companyName}} has been selected for the next stage of our recruitment process.

You are invited to participate in an automated interview assessment, which will evaluate your qualifications and suitability for this role. Please access the interview through the following link:

{{interviewLink}}

This assessment is expected to take approximately 30 to 45 minutes. You will have seven (7) calendar days from the receipt of this email to complete the interview.

Should you require any assistance or have questions regarding this process, please do not hesitate to contact our Human Resources department.

We look forward to reviewing your responses.

Sincerely,

{{hrName}}
Human Resources Department
{{companyName}}`,
  },
];

const TEMPLATE_VARIABLES = [
  { name: '{{candidateName}}', description: 'Candidate\'s full name' },
  { name: '{{jobTitle}}', description: 'Job position title' },
  { name: '{{companyName}}', description: 'Your company name' },
  { name: '{{hrName}}', description: 'HR manager\'s name' },
  { name: '{{interviewLink}}', description: 'Unique interview link for the candidate' },
];

export function EmailTemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(DEFAULT_TEMPLATES[0]);
  const [customSubject, setCustomSubject] = useState(selectedTemplate.subject);
  const [customBody, setCustomBody] = useState(selectedTemplate.body);
  const [isPreview, setIsPreview] = useState(false);

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomBody(template.body);
  };

  const insertVariable = (variable: string) => {
    setCustomBody(customBody + ' ' + variable);
  };

  const getPreviewText = (text: string) => {
    return text
      .replace(/\{\{candidateName\}\}/g, 'John Doe')
      .replace(/\{\{jobTitle\}\}/g, 'Senior Software Engineer')
      .replace(/\{\{companyName\}\}/g, 'TechCorp Inc.')
      .replace(/\{\{hrName\}\}/g, 'Sarah Johnson')
      .replace(/\{\{interviewLink\}\}/g, 'https://interview.example.com/abc123');
  };

  const cardClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <div className="space-y-6">
      <Card className={cardClass}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Template
              </CardTitle>
              <CardDescription className="text-gray-300 mt-1">
                Customize the invitation email sent to candidates
              </CardDescription>
            </div>
            <Badge className="bg-white/10 text-white border-white/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Template Variables Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label className="text-white font-bold mb-3 block">Choose a Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEFAULT_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  onClick={() => handleTemplateSelect(template)}
                  className={`h-auto py-4 px-4 flex flex-col items-start gap-2 rounded-xl ${
                    selectedTemplate.id === template.id
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl mb-2">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{template.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{template.subject.slice(0, 40)}...</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Template Variables Helper */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-4">
            <Label className="text-white font-bold mb-2 block text-sm">Available Variables</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATE_VARIABLES.map((variable) => (
                <Button
                  key={variable.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => insertVariable(variable.name)}
                  className="justify-start text-left h-auto py-2 px-3 hover:bg-white/10 rounded-lg"
                >
                  <code className="text-purple-400 font-mono text-xs mr-2">{variable.name}</code>
                  <span className="text-gray-400 text-xs">{variable.description}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Editor/Preview Tabs */}
          <Tabs value={isPreview ? 'preview' : 'edit'} onValueChange={(v) => setIsPreview(v === 'preview')}>
            <TabsList className="bg-white/10 border-white/20 rounded-xl">
              <TabsTrigger 
                value="edit" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="subject" className="text-white font-bold mb-2 block">
                  Email Subject
                </Label>
                <Input
                  id="subject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 rounded-xl"
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <Label htmlFor="body" className="text-white font-bold mb-2 block">
                  Email Body
                </Label>
                <Textarea
                  id="body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 min-h-[300px] font-mono text-sm rounded-xl"
                  placeholder="Enter email body..."
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="border-b border-white/20 pb-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">Subject:</p>
                  <p className="font-semibold text-white">{getPreviewText(customSubject)}</p>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
                    {getPreviewText(customBody)}
                  </pre>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                Preview shows example values for template variables
              </p>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={() => {
                setCustomSubject(selectedTemplate.subject);
                setCustomBody(selectedTemplate.body);
              }}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              Reset to Template
            </Button>
            <Button className="gap-2 bg-white text-black hover:opacity-90 rounded-xl shadow-md hover:shadow-lg transition-all">
              <Save className="w-4 h-4" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}