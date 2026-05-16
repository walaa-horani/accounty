import { CreateOrganization } from "@clerk/nextjs";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Welcome to Accounty
        </h1>
        <p className="mb-8 text-gray-500">
          Create your organization to get started.
        </p>
        <CreateOrganization
          afterCreateOrganizationUrl="/dashboard"
          skipInvitationScreen
        />
      </div>
    </div>
  );
}
