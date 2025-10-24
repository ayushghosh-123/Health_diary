'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  User, 
  Brain, 
  Heart, 
  Activity,
  TrendingUp,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface HealthChatbotProps {
  entries: any[];
  className?: string;
}

const healthInsights = [
  {
    trigger: ['sleep', 'tired', 'exhausted', 'insomnia'],
    response: "I notice you've been tracking your sleep patterns. Based on your data, here are some insights about your sleep quality and suggestions for improvement.",
    suggestions: ['How can I improve my sleep?', 'What affects my sleep quality?', 'Sleep hygiene tips']
  },
  {
    trigger: ['mood', 'depressed', 'anxious', 'stress', 'sad'],
    response: "I see you're discussing your mood and mental health. Your diary entries show patterns that we can explore together.",
    suggestions: ['How is my mood trending?', 'What affects my mood?', 'Mental health resources']
  },
  {
    trigger: ['exercise', 'workout', 'fitness', 'activity'],
    response: "Great to hear about your physical activity! Let me analyze your exercise patterns and provide some insights.",
    suggestions: ['Exercise recommendations', 'How does exercise affect my mood?', 'Fitness goals']
  },
  {
    trigger: ['nutrition', 'diet', 'food', 'eating', 'meal'],
    response: "Nutrition plays a crucial role in your overall health. Let me help you understand the connection between your diet and well-being.",
    suggestions: ['Nutritional insights', 'How does food affect my energy?', 'Healthy eating tips']
  }
];

export function HealthChatbot({ entries, className }: HealthChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your health assistant. I can help you analyze your health data, provide insights, and answer questions about your wellness journey. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        'Analyze my recent health trends',
        'What patterns do you see in my data?',
        'Give me health recommendations',
        'How can I improve my well-being?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateInsight = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find matching insight
    const matchedInsight = healthInsights.find(insight => 
      insight.trigger.some(trigger => lowerMessage.includes(trigger))
    );

    if (matchedInsight) {
      return {
        response: matchedInsight.response,
        suggestions: matchedInsight.suggestions
      };
    }

    // Generate generic health insights based on entries
    const recentEntries = entries.slice(0, 7);
    const avgMood = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => {
          const moodValues = { excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1 };
          return sum + (moodValues[entry.mood as keyof typeof moodValues] || 3);
        }, 0) / recentEntries.length
      : 3;

    const avgSleep = recentEntries.length > 0
      ? recentEntries.reduce((sum, entry) => sum + entry.sleep_hours, 0) / recentEntries.length
      : 0;

    const totalExercise = recentEntries.reduce((sum, entry) => sum + entry.exercise_minutes, 0);

    let response = "Based on your recent health data, here's what I've observed:\n\n";
    
    if (avgMood >= 4) {
      response += "🌟 Your mood has been quite positive recently! ";
    } else if (avgMood <= 2) {
      response += "💙 I notice your mood has been lower lately. ";
    } else {
      response += "📊 Your mood has been fairly stable. ";
    }

    if (avgSleep >= 7) {
      response += "Your sleep quality looks good with an average of " + avgSleep.toFixed(1) + " hours. ";
    } else if (avgSleep < 6) {
      response += "Your sleep might need attention - averaging " + avgSleep.toFixed(1) + " hours. ";
    }

    if (totalExercise > 150) {
      response += "Great job staying active! ";
    } else if (totalExercise < 60) {
      response += "Consider adding more physical activity to your routine. ";
    }

    response += "\n\nWould you like me to dive deeper into any specific area?";

    return {
      response,
      suggestions: [
        'Tell me more about my sleep patterns',
        'How can I improve my mood?',
        'What exercise routine would work for me?',
        'Show me my health trends'
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const insight = generateInsight(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: insight.response,
        timestamp: new Date(),
        suggestions: insight.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Bot className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Health Assistant</CardTitle>
            <p className="text-sm text-slate-600">AI-powered health insights</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.type === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-rose-100 text-rose-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.type === 'user' 
                  ? "bg-rose-600 text-white" 
                  : "bg-slate-100 text-slate-800"
              )}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-rose-50 hover:border-rose-300 text-xs"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {message.type === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-100 text-slate-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-rose-100 text-rose-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-slate-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health data..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-rose-600 hover:bg-rose-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
