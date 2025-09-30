import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChatMessage } from '@/types/health';
import { Send, Bot, User, Heart, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export function HealthChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('health_chat_messages', []);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getHealthAdvice = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based responses for demo
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return "For fever management:\n• Rest and stay hydrated\n• Take temperature regularly\n• Consider over-the-counter fever reducers if needed\n• Seek medical attention if fever persists over 3 days or exceeds 103°F (39.4°C)\n• If you're a migrant worker, ensure you have access to medical care and don't hesitate to visit a healthcare facility.";
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return "For headache relief:\n• Ensure adequate hydration\n• Get proper rest in a quiet, dark room\n• Consider gentle neck and shoulder stretches\n• Apply cold or warm compress\n• If headaches are frequent or severe, please consult a doctor\n• For migrant workers: workplace stress can contribute to headaches - ensure proper work-rest balance.";
    }
    
    if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
      return "For cough and cold symptoms:\n• Stay hydrated with warm fluids\n• Get plenty of rest\n• Use honey for soothing throat irritation\n• Consider steam inhalation\n• Avoid smoking and secondhand smoke\n• If symptoms persist beyond a week or worsen, seek medical care\n• Wear a mask around others to prevent spread.";
    }
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('doctor')) {
      return "To book a medical appointment:\n• Use the 'Appointments' section in this app\n• Call your preferred hospital/clinic directly\n• For emergencies, visit the nearest emergency room\n• Keep your ABHA ID and identification ready\n• If you're a migrant worker, some states offer special health schemes - check with local authorities.";
    }
    
    if (lowerMessage.includes('vaccination') || lowerMessage.includes('vaccine')) {
      return "About vaccinations:\n• Keep your vaccination records updated in this app\n• Follow the national immunization schedule\n• For travel, check required vaccinations for your destination\n• COVID-19 vaccines are available at government centers\n• Migrant workers should ensure they're up-to-date with required vaccines for their work location.";
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return "In case of medical emergency:\n• Call 102 (ambulance) or 108 (emergency services) immediately\n• Go to the nearest hospital emergency department\n• Keep your emergency contact information updated\n• If you're a migrant worker, inform your supervisor and ensure someone knows your location\n• Keep important medical information easily accessible.";
    }
    
    if (lowerMessage.includes('medicine') || lowerMessage.includes('medication')) {
      return "About medications:\n• Always take medicines as prescribed by your doctor\n• Set reminders for medication times\n• Keep a list of all medications you're taking\n• Don't share medications with others\n• Store medicines properly (away from heat and moisture)\n• If you miss a dose, consult your doctor or pharmacist about what to do.";
    }
    
    if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('nutrition')) {
      return "For healthy nutrition:\n• Eat a balanced diet with fruits, vegetables, whole grains, and proteins\n• Stay hydrated - drink at least 8 glasses of water daily\n• Limit processed foods and excess sugar\n• For migrant workers: try to maintain nutritious eating habits despite work schedules\n• If you have dietary restrictions due to health conditions, follow your doctor's advice.";
    }
    
    // Default response
    return "I'm here to help with your health questions! I can provide general health advice, help you understand symptoms, guide you on when to seek medical care, and assist with using this health records system.\n\nFor specific medical concerns, please consult with a healthcare professional. If this is an emergency, please call 102 or visit the nearest hospital immediately.\n\nWhat specific health topic would you like to know more about?";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getHealthAdvice(inputMessage),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickQuestions = [
    "How do I book an appointment?",
    "What should I do for fever?",
    "Tell me about vaccination schedules",
    "How to manage common cold symptoms?",
    "Emergency contact information"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('chat.title')}</h1>
          <p className="text-muted-foreground">Get health advice and assistance 24/7</p>
        </div>
        <Button variant="outline" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-none border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div>
                  <CardTitle className="text-lg">Kerala Health Assistant</CardTitle>
                  <CardDescription>AI-powered health guidance</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                    <h3 className="font-semibold mb-2">Welcome to your Health Assistant!</h3>
                    <p className="text-muted-foreground mb-4">
                      Ask me anything about your health, medications, appointments, or general wellness.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage(question)}
                          className="text-xs"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] space-y-1 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.timestamp), 'HH:mm')}
                      </span>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-secondary">
                          {user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex-none border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chat.placeholder')}
                    disabled={isTyping}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={isTyping || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Questions</CardTitle>
              <CardDescription>Click to ask common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => setInputMessage(question)}
                >
                  <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Ambulance</p>
                <p className="text-muted-foreground">102 / 108</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Police</p>
                <p className="text-muted-foreground">100</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Fire</p>
                <p className="text-muted-foreground">101</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Helpline</p>
                <p className="text-muted-foreground">1056</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}