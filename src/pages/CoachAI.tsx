import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, TrendingUp, DollarSign, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const CoachAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load conversation from localStorage
    const saved = localStorage.getItem('fingenius-conversation');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: 'Ciao! Sono FinGenius, il tuo coach personale di Finanza Creativa 🚀\n\nSono qui per aiutarti a capire come funziona la piattaforma e guidarti verso investimenti più consapevoli. Come posso aiutarti oggi?',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    // Save conversation to localStorage
    if (messages.length > 0) {
      localStorage.setItem('fingenius-conversation', JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    { icon: BarChart3, label: 'Come leggo la dashboard?', query: 'Come leggo la dashboard?' },
    { icon: DollarSign, label: "Cos'è il PAC?", query: "Cos'è il Piano di Accumulo Capitale?" },
    { icon: Shield, label: 'Come funziona la protezione?', query: 'Come funziona la protezione assicurativa?' },
    { icon: TrendingUp, label: 'Cosa sono i segnali AI?', query: 'Cosa sono i segnali AI e come li uso?' },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
    handleSend(query);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non autenticato');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fingenius-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }));
        console.error('[COACH-AI] Edge function error:', response.status, errorData);
        
        toast({
          title: "Errore",
          description: errorData.error || "Si è verificato un errore. Riprova.",
          variant: "destructive"
        });
        
        setIsLoading(false);
        return;
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';

      const addOrUpdateAssistantMessage = (content: string) => {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return prev.map((m, i) => 
              i === prev.length - 1 
                ? { ...m, content } 
                : m
            );
          }
          return [...prev, {
            role: 'assistant' as const,
            content,
            timestamp: new Date()
          }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              addOrUpdateAssistantMessage(assistantContent);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':')) continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              addOrUpdateAssistantMessage(assistantContent);
            }
          } catch {}
        }
      }

    } catch (error) {
      console.error('[COACH-AI] Error sending message:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Si è verificato un errore imprevisto. Riprova.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  FinGenius
                  {isLoading && (
                    <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                      <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground">Il tuo coach AI personale</p>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <Card className="p-6 mb-4 min-h-[500px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === 'assistant' && (
                        <MessageCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </Card>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => handleQuickAction(action.query)}
                  disabled={isLoading}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Scrivi qui..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CoachAI;
