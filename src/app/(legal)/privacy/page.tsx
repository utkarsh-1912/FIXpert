import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Privacy Policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <h2 className="text-xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
        <p>We, Utai Inc., collect information you provide directly to us, such as when you create an account, and information we get from your use of our services, like your IP address and usage data. This includes:</p>
        <ul className="list-disc list-inside pl-4">
          <li>Account Information: Your name, email address, password, and other registration information.</li>
          <li>Usage Information: We collect information about your activity on our services.</li>
          <li>Device Information: We collect device-specific information, such as your hardware model and operating system.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground pt-4">2. How We Use Information</h2>
        <p>We use the information we collect to provide, maintain, and improve our services, including to:</p>
        <ul className="list-disc list-inside pl-4">
          <li>Develop and provide new features and services.</li>
          <li>Personalize the services and provide content and features that match your interests.</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground pt-4">3. Information Sharing</h2>
        <p>We do not share your personal information with companies, organizations, or individuals outside of Utai Inc. except in the following cases:</p>
        <ul className="list-disc list-inside pl-4">
          <li>With your consent.</li>
          <li>For legal reasons, such as to meet any applicable law, regulation, legal process, or enforceable governmental request.</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground pt-4">4. Data Security</h2>
        <p>We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
        
        <h2 className="text-xl font-semibold text-foreground pt-4">5. Your Rights</h2>
        <p>You have the right to access, update, or delete the information we have on you. You can do this by accessing your account settings or contacting us directly.</p>
      </CardContent>
    </Card>
  );
}
