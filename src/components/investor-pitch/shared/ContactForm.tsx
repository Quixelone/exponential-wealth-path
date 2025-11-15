import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const businessAngelSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  investmentRange: z.enum(['10k-50k', '50k-100k', '100k-150k', '150k+']),
});

const ventureCapitalSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  firm: z.string().min(2, 'Firm name required'),
  position: z.string().min(2, 'Position required'),
  aum: z.enum(['<100M', '100M-500M', '500M-1B', '>1B']),
  investmentThesis: z.string().min(50, 'Please provide detailed investment thesis (min 50 characters)'),
  timeframe: z.enum(['immediate', '1-3months', '3-6months']),
});

interface ContactFormProps {
  investorType: 'business-angel' | 'venture-capital';
}

export const ContactForm = ({ investorType }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const schema = investorType === 'business-angel' ? businessAngelSchema : ventureCapitalSchema;
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('investor-inquiry', {
        body: {
          investorType,
          ...data,
        },
      });

      if (error) throw error;

      toast({
        title: 'Thank you for your interest!',
        description: investorType === 'business-angel' 
          ? "We'll get back to you within 24 hours."
          : "We'll send you the data room access within 48 hours.",
      });
      
      reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">
        {investorType === 'business-angel' ? 'Get In Touch' : 'Request Data Room Access'}
      </h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message as string}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message as string}</p>
            )}
          </div>
        </div>

        {investorType === 'business-angel' ? (
          <>
            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input id="linkedin" {...register('linkedin')} placeholder="https://linkedin.com/in/..." />
              {errors.linkedin && (
                <p className="text-sm text-destructive mt-1">{errors.linkedin.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="investmentRange">Investment Range *</Label>
              <select
                id="investmentRange"
                {...register('investmentRange')}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="">Select range...</option>
                <option value="10k-50k">€10k - €50k</option>
                <option value="50k-100k">€50k - €100k</option>
                <option value="100k-150k">€100k - €150k</option>
                <option value="150k+">€150k+</option>
              </select>
              {errors.investmentRange && (
                <p className="text-sm text-destructive mt-1">{errors.investmentRange.message as string}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" {...register('message')} rows={4} />
              {errors.message && (
                <p className="text-sm text-destructive mt-1">{errors.message.message as string}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firm">Firm / Fund Name *</Label>
                <Input id="firm" {...register('firm')} />
                {errors.firm && (
                  <p className="text-sm text-destructive mt-1">{errors.firm.message as string}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input id="position" {...register('position')} placeholder="Partner, Associate, etc." />
                {errors.position && (
                  <p className="text-sm text-destructive mt-1">{errors.position.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="aum">AUM Range *</Label>
                <select
                  id="aum"
                  {...register('aum')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select range...</option>
                  <option value="<100M">&lt; €100M</option>
                  <option value="100M-500M">€100M - €500M</option>
                  <option value="500M-1B">€500M - €1B</option>
                  <option value=">1B">&gt; €1B</option>
                </select>
                {errors.aum && (
                  <p className="text-sm text-destructive mt-1">{errors.aum.message as string}</p>
                )}
              </div>

              <div>
                <Label htmlFor="timeframe">Investment Timeframe *</Label>
                <select
                  id="timeframe"
                  {...register('timeframe')}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">Select timeframe...</option>
                  <option value="immediate">Immediate</option>
                  <option value="1-3months">1-3 months</option>
                  <option value="3-6months">3-6 months</option>
                </select>
                {errors.timeframe && (
                  <p className="text-sm text-destructive mt-1">{errors.timeframe.message as string}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="investmentThesis">Investment Thesis *</Label>
              <Textarea 
                id="investmentThesis" 
                {...register('investmentThesis')} 
                rows={6}
                placeholder="Please share your investment thesis and why you're interested in Finanzacreativa..."
              />
              {errors.investmentThesis && (
                <p className="text-sm text-destructive mt-1">{errors.investmentThesis.message as string}</p>
              )}
            </div>
          </>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit Inquiry
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By submitting this form, you confirm that you are an accredited investor and agree to our terms.
        </p>
      </form>
    </div>
  );
};
