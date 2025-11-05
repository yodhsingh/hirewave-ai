'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Phone,
  Video,
  FileText,
  Clock,
  Trash2,
  GripVertical,
  Edit,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Users,
  Target,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { QuestionCreate } from '@/types';

interface QuestionBuilderProps {
  questions: QuestionCreate[];
  onQuestionsChange: (questions: QuestionCreate[]) => void;
}

const QUESTION_TYPES = [
  {
    type: 'phone' as const,
    icon: Phone,
    title: 'AI Phone Interview',
    description: 'Automated AI voice call for technical screening',
    recommended: true,
  },
  {
    type: 'video' as const,
    icon: Video,
    title: 'Video Response',
    description: 'Candidates record video answers',
    recommended: false,
  },
  {
    type: 'text' as const,
    icon: FileText,
    title: 'Text Response',
    description: 'Written answers in paragraph form',
    recommended: false,
  },
  {
    type: 'multiple_choice' as const,
    icon: CheckSquare,
    title: 'Multiple Choice',
    description: 'Select from predefined options',
    recommended: false,
  },
];

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  phone: [
    'Explain your experience with the key technologies mentioned in the job description',
    'Describe a complex technical problem you solved and walk me through your approach',
    'What is your experience with system design and architecture?',
    'How do you approach debugging and troubleshooting production issues?',
    'Explain a recent project where you had to learn new technologies quickly',
  ],
  video: [
    'Tell us about yourself and why you are interested in this role.',
    'Describe a challenging project you worked on and how you overcame obstacles.',
    'What are your greatest strengths and how do they align with this position?',
    'Where do you see yourself professionally in the next 3-5 years?',
  ],
  text: [
    'What specific skills and experiences make you a good fit for this role?',
    'Describe your approach to problem-solving with a specific example.',
    'How do you stay updated with industry trends and technologies?',
    'What motivates you in your professional career?',
  ],
  multiple_choice: [
    'How many years of relevant experience do you have?',
    'What is your preferred work arrangement?',
    'When can you start if selected?',
    'Are you authorized to work in this location?',
  ],
};

const TIME_LIMITS = [
  { value: '300', label: '5 minutes', type: 'phone' },
  { value: '600', label: '10 minutes', type: 'phone' },
  { value: '900', label: '15 minutes', type: 'phone' },
  { value: '1200', label: '20 minutes', type: 'phone' },
  { value: '1800', label: '30 minutes', type: 'phone' },
  { value: '30', label: '30 seconds', type: 'video' },
  { value: '60', label: '1 minute', type: 'video' },
  { value: '90', label: '90 seconds', type: 'video' },
  { value: '120', label: '2 minutes', type: 'video' },
  { value: '180', label: '3 minutes', type: 'video' },
  { value: '300', label: '5 minutes', type: 'text' },
  { value: '600', label: '10 minutes', type: 'text' },
  { value: '900', label: '15 minutes', type: 'text' },
  { value: '0', label: 'No limit', type: 'all' },
];

export function QuestionBuilder({ questions, onQuestionsChange }: QuestionBuilderProps) {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [newQuestion, setNewQuestion] = useState<Partial<QuestionCreate>>({
    question: '',
    type: 'phone',
    timeLimit: 900,
    required: true,
  });

  const [mcOptions, setMcOptions] = useState<string[]>(['']);

  const handleAddQuestion = () => {
    if (newQuestion.question?.trim()) {
      const questionToAdd: QuestionCreate = {
        question: newQuestion.question,
        type: newQuestion.type || 'phone',
        timeLimit: newQuestion.timeLimit || 900,
        required: newQuestion.required !== false,
        options: newQuestion.type === 'multiple_choice' ? mcOptions.filter(o => o.trim()) : undefined,
        order: editingIndex !== null ? editingIndex : questions.length,
      };

      if (editingIndex !== null) {
        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = questionToAdd;
        onQuestionsChange(updatedQuestions);
        setEditingIndex(null);
      } else {
        onQuestionsChange([...questions, questionToAdd]);
      }

      resetForm();
    }
  };

  const resetForm = () => {
    setNewQuestion({ question: '', type: 'video', timeLimit: 60, required: true });
    setMcOptions(['']);
    setIsAddingQuestion(false);
    setEditingIndex(null);
  };

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setNewQuestion(question);
    setMcOptions(question.options || ['']);
    setEditingIndex(index);
    setIsAddingQuestion(true);
  };

  const handleDeleteQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updatedQuestions = [...questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] =
    [updatedQuestions[newIndex], updatedQuestions[index]];
    onQuestionsChange(updatedQuestions);
  };

  const generateAIQuestions = async () => {
    setIsGeneratingAI(true);

    setTimeout(() => {
      const aiGeneratedQuestions: QuestionCreate[] = [
        {
          question: "Tell us about yourself and your experience with the key technologies mentioned in this job description.",
          type: 'phone',
          timeLimit: 900,
          required: true,
          order: 0,
        },
        {
          question: "Describe a complex technical problem you've solved recently. Walk through your approach step by step.",
          type: 'phone',
          timeLimit: 900,
          required: true,
          order: 1,
        },
        {
          question: "What's your experience with system design and architecture? Can you describe a system you've designed or worked on?",
          type: 'phone',
          timeLimit: 900,
          required: true,
          order: 2,
        },
        {
          question: "How do you approach debugging and troubleshooting production issues? Give us a specific example.",
          type: 'phone',
          timeLimit: 600,
          required: true,
          order: 3,
        },
        {
          question: "What are your salary expectations for this role?",
          type: 'multiple_choice',
          timeLimit: 60,
          required: true,
          options: ['₹10L - ₹15L', '₹15L - ₹20L', '₹20L - ₹30L', '₹30L+', 'Negotiable'],
          order: 4,
        },
        {
          question: "When would you be available to start if selected?",
          type: 'multiple_choice',
          timeLimit: 30,
          required: true,
          options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Need to discuss'],
          order: 5,
        },
      ];

      onQuestionsChange(aiGeneratedQuestions);
      setIsGeneratingAI(false);
    }, 2000);
  };

  const addMcOption = () => {
    setMcOptions([...mcOptions, '']);
  };

  const updateMcOption = (index: number, value: string) => {
    const updated = [...mcOptions];
    updated[index] = value;
    setMcOptions(updated);
  };

  const removeMcOption = (index: number) => {
    setMcOptions(mcOptions.filter((_, i) => i !== index));
  };

  const getQuestionIcon = (type: QuestionCreate['type']) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'multiple_choice':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const cardClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl hover:border-white/30 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]';

  return (
    <div className="space-y-6">
      {/* AI Generation Section */}
      <Card className={cardClass}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Interview Setup</h3>
                  <Badge className="bg-white/10 text-white border-white/20 mt-1">
                    Voice-Based AI Screening
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                Automated AI voice calls will conduct technical screening interviews with candidates.
                Our Gen AI system engages in natural conversations, asks follow-up questions, and evaluates responses in real-time.
              </p>

              {questions.length === 0 && (
                <Alert className="mb-4 border-white/20 bg-white/10">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-gray-200">
                    <strong>Recommended:</strong> Start with AI-generated questions for best results.
                    You can customize them after generation.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={generateAIQuestions}
                disabled={isGeneratingAI}
                className="gap-2 bg-white text-black hover:opacity-90 rounded-xl"
                size="lg"
              >
                {isGeneratingAI ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating AI Questions...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Generate AI Interview
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Bar */}
      <div className={`${cardClass} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">Total Questions</p>
              <p className="text-2xl font-bold text-white">{questions.length}</p>
            </div>
            
            <div className="h-8 w-px bg-white/20" />
            
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <Phone className="w-3 h-3 text-purple-400" />
                </div>
                <span className="font-medium text-white">
                  {questions.filter(q => q.type === 'phone').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <Video className="w-3 h-3 text-blue-400" />
                </div>
                <span className="font-medium text-white">
                  {questions.filter(q => q.type === 'video').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <FileText className="w-3 h-3 text-gray-400" />
                </div>
                <span className="font-medium text-white">
                  {questions.filter(q => q.type === 'text').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                  <CheckSquare className="w-3 h-3 text-green-400" />
                </div>
                <span className="font-medium text-white">
                  {questions.filter(q => q.type === 'multiple_choice').length}
                </span>
              </div>
            </div>
          </div>
          
          {questions.length < 3 && (
            <Alert className="max-w-xs border-orange-500/30 bg-orange-500/10">
              <AlertCircle className="h-4 w-4 text-orange-400" />
              <AlertDescription className="text-sm text-orange-200">
                Add at least 3 questions for a comprehensive interview
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Questions List */}
      <AnimatePresence>
        {questions.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={cardClass}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <button className="mt-1 cursor-move text-gray-400 hover:text-white">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-white/10 text-white border-white/20">
                          {getQuestionIcon(question.type)}
                          <span className="ml-1 capitalize">
                            {question.type.replace('_', ' ')}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-gray-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {question.timeLimit ? `${question.timeLimit}s` : 'No limit'}
                        </Badge>
                        {question.required && (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Required</Badge>
                        )}
                      </div>
                      <p className="font-bold text-white">Question {index + 1}</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {question.question}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 text-sm">
                              <div className="w-4 h-4 rounded-full border-2 border-white/30" />
                              <span className="text-gray-300">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                      className="text-gray-400 hover:text-white"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditQuestion(index)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Question Button */}
      {!isAddingQuestion && (
        <Button
          onClick={() => setIsAddingQuestion(true)}
          className="w-full gap-2 bg-white/10 text-white border-white/20 hover:bg-white/15 rounded-xl"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          Add Interview Question
        </Button>
      )}

      {/* Add/Edit Question Dialog */}
      <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1A1A1A] border-white/20">
          <DialogHeader>
            <DialogTitle className="font-bold text-white">
              {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create engaging questions to evaluate candidates effectively
            </DialogDescription>
          </DialogHeader>

          <Tabs value={newQuestion.type} onValueChange={(v) => setNewQuestion({ ...newQuestion, type: v as any })}>
            <TabsList className="grid grid-cols-4 w-full bg-white/10 border-white/20 rounded-xl">
              {QUESTION_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger 
                    key={type.type} 
                    value={type.type} 
                    className="gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg"
                  >
                    <Icon className="w-4 h-4" />
                    {type.title}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6 space-y-4">
              {/* Question Text */}
              <div>
                <Label htmlFor="question" className="font-bold text-white">Question</Label>
                <Textarea
                  id="question"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Enter your interview question..."
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-xl"
                  rows={3}
                />

                {/* Suggestions */}
                <div className="mt-3">
                  <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Suggested questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS[newQuestion.type || 'video'].slice(0, 3).map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white/10 text-gray-300 border-white/20 hover:bg-white/15 hover:text-white rounded-lg"
                        onClick={() => setNewQuestion({ ...newQuestion, question: q })}
                      >
                        {q.substring(0, 50)}...
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multiple Choice Options */}
              {newQuestion.type === 'multiple_choice' && (
                <div>
                  <Label className="font-bold text-white">Answer Options</Label>
                  <div className="space-y-2 mt-2">
                    {mcOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateMcOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 rounded-xl"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMcOption(index)}
                          disabled={mcOptions.length <= 1}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addMcOption}
                      className="gap-1 bg-white/10 text-white border-white/20 hover:bg-white/15 rounded-xl"
                    >
                      <Plus className="w-3 h-3" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {/* Time Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold text-white">Time Limit</Label>
                  <Select
                    value={String(newQuestion.timeLimit)}
                    onValueChange={(v) => setNewQuestion({ ...newQuestion, timeLimit: parseInt(v) })}
                  >
                    <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] text-white border-white/20">
                      {TIME_LIMITS.filter(
                        tl => tl.type === 'all' || tl.type === newQuestion.type
                      ).map((limit) => (
                        <SelectItem
                          key={limit.value}
                          value={limit.value}
                          className="text-white cursor-pointer hover:bg-white/10"
                        >
                          {limit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-bold text-white">Required</Label>
                  <Select
                    value={newQuestion.required ? 'yes' : 'no'}
                    onValueChange={(v) => setNewQuestion({ ...newQuestion, required: v === 'yes' })}
                  >
                    <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] text-white border-white/20">
                      <SelectItem value="yes" className="text-white cursor-pointer hover:bg-white/10">Yes, required</SelectItem>
                      <SelectItem value="no" className="text-white cursor-pointer hover:bg-white/10">No, optional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={resetForm} 
                  className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddQuestion} 
                  className="gap-2 bg-white text-black hover:opacity-90 rounded-xl"
                >
                  <Save className="w-4 h-4" />
                  {editingIndex !== null ? 'Update Question' : 'Add Question'}
                </Button>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Best Practices */}
      <Card className={cardClass}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-white mb-2">Interview Best Practices</p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Mix question types to evaluate different skills</li>
                <li>• Keep video responses under 2 minutes for better completion rates</li>
                <li>• Start with easier questions to help candidates warm up</li>
                <li>• Use multiple choice for screening, video for personality assessment</li>
                <li>• Include at least 3-5 questions for comprehensive evaluation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}