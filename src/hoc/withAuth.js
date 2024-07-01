import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      Auth.currentAuthenticatedUser()
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          // Store the attempted URL for redirection after login
          const redirectTo = router.asPath;
          router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
        });
    }, [router]);

    if (!isAuthenticated) return null;

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
