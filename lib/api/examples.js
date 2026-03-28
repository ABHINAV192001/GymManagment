/**
 * API Usage Examples
 * Demonstrates how to use the authentication API services
 */

import {
    registerOrganization,
    login,
    sendOTP,
    verifyOTP,
    forgotPassword,
    logout,
    isAuthenticated,
    getCurrentUser,
    APIError,
} from '@/lib/api';

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Register a new organization
 */
export const exampleRegisterOrganization = async () => {
    try {
        const registrationData = {
            name: "Gym Bros Fitness",
            ownerEmail: "owner@gymbros.com",
            phone: "9876543210",
            password: "SecurePass123!",
            branches: [
                {
                    name: "Gym Bros Indiranagar",
                    adminEmail: "admin.indiranagar@gymbros.com",
                    password: "AdminPass123!"
                },
                {
                    name: "Gym Bros Whitefield",
                    adminEmail: "admin.whitefield@gymbros.com",
                    password: "AdminPass456!"
                }
            ]
        };

        const response = await registerOrganization(registrationData);

        console.log('Registration successful!');
        console.log('Token:', response.token);
        console.log('Role:', response.role);
        console.log('Organization ID:', response.organizationId);

        // Token is automatically stored in localStorage
        // Redirect to dashboard
        window.location.href = '/admin/dashboard';

        return response;
    } catch (error) {
        if (error instanceof APIError) {
            console.error('Registration failed:', error.message);
            console.error('Status:', error.status);

            // Handle validation errors
            if (error.errors) {
                error.errors.forEach(err => {
                    console.error(`${err.field}: ${err.message}`);
                });
            }
        }
        throw error;
    }
};

/**
 * Example 2: Login
 */
export const exampleLogin = async () => {
    try {
        const credentials = {
            identifier: "owner@gymbros.com", // Can be email or username
            password: "SecurePass123!"
        };

        const response = await login(credentials);

        console.log('Login successful!');
        console.log('Role:', response.role);

        // Token is automatically stored in localStorage
        // Redirect based on role
        if (response.role === 'ORG_ADMIN') {
            window.location.href = '/admin/dashboard';
        } else if (response.role === 'BRANCH_ADMIN') {
            window.location.href = '/branch/dashboard';
        } else {
            window.location.href = '/user/dashboard';
        }

        return response;
    } catch (error) {
        if (error instanceof APIError) {
            if (error.status === 401) {
                console.error('Invalid credentials');
            }
        }
        throw error;
    }
};

/**
 * Example 3: Send OTP
 */
export const exampleSendOTP = async () => {
    try {
        const otpData = {
            email: "admin.indiranagar@gymbros.com",
            phone: "9876543210",
            otpType: "register_org"
        };

        const response = await sendOTP(otpData);

        console.log('OTP sent successfully!');
        console.log('OTP ID:', response.otpId);
        console.log('Expires at:', response.expiresAt);

        // Store otpId for verification
        return response.otpId;
    } catch (error) {
        if (error instanceof APIError) {
            console.error('Failed to send OTP:', error.message);
        }
        throw error;
    }
};

/**
 * Example 4: Verify OTP
 */
export const exampleVerifyOTP = async (otpId, otpCode) => {
    try {
        const verificationData = {
            otpId: otpId,
            otpCode: otpCode
        };

        const response = await verifyOTP(verificationData);

        if (response.verified) {
            console.log('OTP verified successfully!');
            return true;
        }

        return false;
    } catch (error) {
        if (error instanceof APIError) {
            console.error('OTP verification failed:', error.message);
        }
        throw error;
    }
};

/**
 * Example 5: Forgot Password
 */
export const exampleForgotPassword = async () => {
    try {
        const response = await forgotPassword({
            email: "owner@gymbros.com"
        });

        console.log(response.message);
        return response;
    } catch (error) {
        if (error instanceof APIError) {
            console.error('Password reset request failed:', error.message);
        }
        throw error;
    }
};

/**
 * Example 6: Logout
 */
export const exampleLogout = () => {
    logout();
    console.log('Logged out successfully');
    window.location.href = '/auth/login';
};

/**
 * Example 7: Check authentication status
 */
export const exampleCheckAuth = () => {
    if (isAuthenticated()) {
        const user = getCurrentUser();
        console.log('User is authenticated');
        console.log('Role:', user.role);
        console.log('Organization ID:', user.organizationId);
        return true;
    } else {
        console.log('User is not authenticated');
        window.location.href = '/auth/login';
        return false;
    }
};

// ==================== REACT COMPONENT EXAMPLES ====================

/**
 * Example React Component: Registration Form
 */
export const RegistrationFormExample = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        ownerEmail: '',
        phone: '',
        password: '',
        branches: []
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await registerOrganization(formData);
            // Success - redirect handled in the function
        } catch (err) {
            if (err instanceof APIError) {
                setError(err.message);

                // Display field-specific errors
                if (err.errors) {
                    err.errors.forEach(fieldError => {
                        console.error(`${fieldError.field}: ${fieldError.message}`);
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            {/* Form fields here */}
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
};

/**
 * Example React Component: Login Form
 */
export const LoginFormExample = () => {
    const [credentials, setCredentials] = React.useState({
        identifier: '',
        password: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(credentials);
            // Success - redirect handled in the function
        } catch (err) {
            if (err instanceof APIError) {
                if (err.status === 401) {
                    setError('Invalid email or password');
                } else {
                    setError(err.message);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <input
                type="text"
                placeholder="Email or Username"
                value={credentials.identifier}
                onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
            />
            <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
};

/**
 * Example: Protected Route Component
 */
export const ProtectedRouteExample = ({ children }) => {
    React.useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/auth/login';
        }
    }, []);

    if (!isAuthenticated()) {
        return <div>Redirecting to login...</div>;
    }

    return children;
};
