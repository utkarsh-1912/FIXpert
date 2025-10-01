import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <h2 className="text-xl font-semibold text-foreground pt-4">1. Introduction</h2>
                <p>Welcome to FIXpert ("we", "our", "us"). These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our services, you agree to be bound by these Terms.</p>

                <h2 className="text-xl font-semibold text-foreground pt-4">2. Use of Our Services</h2>
                <p>You may use our services only in compliance with these Terms and all applicable laws. You agree not to misuse the services. For example, you must not interfere with our services or try to access them using a method other than the interface and the instructions that we provide.</p>

                <h2 className="text-xl font-semibold text-foreground pt-4">3. Accounts</h2>
                <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service.</p>

                <h2 className="text-xl font-semibold text-foreground pt-4">4. Intellectual Property</h2>
                <p>The service and its original content, features, and functionality are and will remain the exclusive property of UTAI Inc. and its licensors. The service is protected by copyright, trademark, and other laws of both India and foreign countries.</p>

                <h2 className="text-xl font-semibold text-foreground pt-4">5. Termination</h2>
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

                <h2 className="text-xl font-semibold text-foreground pt-4">6. Disclaimer of Warranty</h2>
                <p>Our services are provided "AS IS." We do not warrant that the service will be uninterrupted, secure, or free from errors or omissions.</p>

                <h2 className="text-xl font-semibold text-foreground pt-4">7. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of the State of Texas, United States, and the State of Karnataka, India, without regard to their conflict of law provisions. Any legal suit, action, or proceeding arising out of or related to these Terms or the services shall be instituted exclusively in the federal or state courts located in Dallas, Texas, or Bengaluru, Karnataka.</p>
                
                <h2 className="text-xl font-semibold text-foreground pt-4">8. Changes to Terms</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.</p>
            </CardContent>
        </Card>
    );
}
