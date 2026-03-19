export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">Privacy Policy</h1>
      <div className="prose prose-base dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground mb-8">
          At DevOps Hub, we take your privacy seriously. This policy outlines what data we collect and how we use it.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We only collect information necessary to provide you with the best experience on our platform. This includes:
        </p>
        <ul>
          <li><strong>Account Information:</strong> Your name, email address, and profile picture (via Google OAuth).</li>
          <li><strong>Usage Data:</strong> How you interact with our roadmaps, notes, and community resources.</li>
          <li><strong>Content Provided:</strong> Any notes, comments, or links you securely submit to DevOps Hub.</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>
          Your data is used strictly to enhance our platform. We use it to:
        </p>
        <ul>
          <li>Personalize your dashboard and learning journey.</li>
          <li>Ensure community guidelines are followed during moderation.</li>
          <li>Communicate with you regarding your account and community updates.</li>
        </ul>

        <h2>3. Data Protection and Sharing</h2>
        <p>
          We do not sell your data to third parties. We use industry-standard encryption and secure databases (like Neon PostgreSQL) to store your information. Data may be shared with trusted third-party services (like authentication providers) strictly for operational purposes.
        </p>

        <h2>4. Your Rights</h2>
        <p>
          You have the right to request access to, modification of, or deletion of your personal data at any time. Contact our support team for any privacy queries.
        </p>
        
        <p className="text-sm text-muted-foreground mt-12 pt-8 border-t">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}
