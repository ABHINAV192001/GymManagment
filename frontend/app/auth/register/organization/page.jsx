"use client";



// Re-exporting the component from components folder would be cleaner, but copying ensures we control path imports
// We'll just import the existing component if it works, or copy code if it has issues finding imports.
// The existing component has "use client" so we can probably just proxy it.
// However, the existing component calls `router.push('/auth/login')`.
// Let's create a proxy page.

import Register from '@/app/components/register/page';

export default function RegisterPage() {
    return <Register />;
}
