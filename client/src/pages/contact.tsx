import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { fadeIn } from '@/lib/framer-animations';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const Contact = () => {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    sendMessage.mutate(data);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      details: ["Tower A, Hamraz Complex Kanpur, UP", "India, IN 208001"]
    },
    {
      icon: Phone,
      title: "Phone Number",
      details: ["+91 (967) 0433-355", "+91 (933) 500-4989"]
    },
    {
      icon: Mail,
      title: "Email Address",
      details: ["mdAdil@adilclub.com", "support@adilclub.com"]
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday-Friday: 9AM - 6PM", "Saturday: 10AM - 4PM", "Sunday: Closed"]
    }
  ];

  return (
    <>
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl font-heading font-bold mb-4"
            initial="hidden"
            animate="show"
            variants={fadeIn()}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className="max-w-2xl mx-auto text-neutral-300"
            initial="hidden"
            animate="show"
            variants={fadeIn("up", 0.1)}
          >
            We're here to help with any questions about our products, orders, or services.
            Reach out to us and we'll respond as soon as we can.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div 
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeIn("up", index * 0.1)}
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="text-primary" />
                  </div>
                  <h3 className="font-heading font-medium text-lg mb-2">{info.title}</h3>
                  <div className="text-neutral-600">
                    {info.details.map((detail, i) => (
                      <p key={i}>{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn("right")}
          >
            <h2 className="text-3xl font-heading font-bold mb-6">Get In Touch</h2>
            <p className="text-neutral-600 mb-8">
              Fill out the form below and our team will get back to you as soon as possible.
              We value your feedback and are eager to assist you with any inquiries.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Message Subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your Message" 
                          className="min-h-[150px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-[#e53e3e] text-white px-8 py-3"
                  disabled={sendMessage.isPending}
                >
                  {sendMessage.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn("left")}
            className="rounded-lg overflow-hidden shadow-lg"
          >
            <iframe 
              // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96714.68291250726!2d-74.05953969406828!3d40.75468158321536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2588f046ee661%3A0xa0b3281fcecc08c!2sManhattan%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1686517129174!5m2!1sen!2sus" 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.8354125392902!2d80.33946917609038!3d26.461033779354057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c47670d21e9a9%3A0x60d4c01ba7c73bb1!2sHamaj%20Complex%2C%20Railway%20Rd%2C%20Cooperganj%2C%20Kanpur%2C%20Uttar%20Pradesh%20208003!5e0!3m2!1sen!2sin!4v1743022543406!5m2!1sen!2sin"
              width="100%" 
              height="500" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Kabir Club Location"
            ></iframe>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Contact;