import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { fadeIn } from '@/lib/framer-animations';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const waitlistSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export const WaitlistForm = () => {
  const { toast } = useToast();

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const joinWaitlist = useMutation({
    mutationFn: async (formData: {name: string, email: string}) => {
      const resposne = await fetch('/api/waitlist',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      })
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to our waitlist. We'll be in touch soon!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinNowForm = () =>{
    return apiRequest('POST','/api/joinNowFormAPI',{name: name, email: email})
  }

  const onSubmit = (data: WaitlistFormValues) => {
    joinWaitlist.mutate(data);
  };

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2 
            className="font-heading font-bold text-3xl mb-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn()}
          >
            Join Our Waitlist
          </motion.h2>
          <motion.p 
            className="mb-8 text-neutral-300"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn("up", 0.1)}
          >
            Be the first to know when we launch new collections and get exclusive offers.
          </motion.p>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn("up", 0.2)}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 mx-auto max-w-xl">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Your Name" 
                          className="px-4 py-3 rounded-md bg-white/10 border border-white/30 focus:outline-none focus:border-[#e53e3e] placeholder-white/50 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          placeholder="Your Email" 
                          type="email"
                          className="px-4 py-3 rounded-md bg-white/10 border border-white/30 focus:outline-none focus:border-[#e53e3e] placeholder-white/50 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="px-6 py-3 bg-[#e53e3e] text-white font-heading font-medium rounded-md hover:bg-red-700 transition"
                  disabled={joinWaitlist.isPending}
                  >
                  {joinWaitlist.isPending ? "Joining..." : "Join Now"}
                </Button>
              </form>
            </Form>
            
            <p className="mt-4 text-sm text-neutral-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
