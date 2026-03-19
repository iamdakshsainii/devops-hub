export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">Terms of Service</h1>
      <div className="prose prose-base dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground mb-8">
          Welcome to DevOps Hub. By using our platform, you agree to these terms.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using DevOps Hub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our service.
        </p>

        <h2>2. User Content and Conduct</h2>
        <p>
          You are responsible for any content you post (notes, resources, events). You agree not to post content that is:
        </p>
        <ul>
          <li>Illegal, harmful, or abusive.</li>
          <li>Infringing on any third parties' intellectual property.</li>
          <li>Spam or malicious code.</li>
        </ul>
        <p>Our moderators reserve the right to remove any content or suspend any account that violates these guidelines without prior notice.</p>

        <h2>3. Intellectual Property</h2>
        <p>
          The roadmaps, curated content, design, and original resources provided by DevOps Hub are protected by intellectual property laws. You may not reproduce our core platform code or premium content without explicit permission.
        </p>

        <h2>4. Disclaimer of Warranties</h2>
        <p>
          Our service is provided "as is" and "as available". We make no warranties, expressed or implied, regarding the reliability or availability of the platform. We are not responsible for the accuracy of community-submitted resources or notes.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          In no event shall DevOps Hub or its creators be liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use our platform.
        </p>
        
        <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
