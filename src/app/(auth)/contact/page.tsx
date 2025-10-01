
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { FixpertIcon } from "@/components/icons";


export default function ContactPage() {
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent!",
            description: "Thank you for contacting us. We will get back to you shortly.",
        });
        // Reset form
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <div className="w-full max-w-md">
            <Card>
                <CardHeader className="text-center">
                    <Link href="/" className="lg:hidden mx-auto mb-4 flex items-center justify-center gap-2">
                        <FixpertIcon className="size-8 text-primary" />
                        <CardTitle className="text-3xl">FIXpert</CardTitle>
                    </Link>
                    <CardTitle className="text-2xl">Contact Us</CardTitle>
                    <CardDescription>Have a question or feedback? We'd love to hear from you.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message..." rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full">Send Message</Button>
                        <Button variant="link" asChild className="mt-4 text-muted-foreground">
                            <Link href="/">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
