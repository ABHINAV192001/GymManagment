/**
 * Backend Connection Diagnostic Tool
 * 
 * This file provides utilities to diagnose connection issues with the backend API.
 * Run this in your browser console or create a test page to check backend connectivity.
 */

/**
 * Check if the backend API is reachable
 */
export async function checkBackendConnection() {
    const API_BASE_URL = 'http://localhost:8080';

    console.log('🔍 Checking backend connection...');
    console.log(`Target URL: ${API_BASE_URL}`);

    try {
        // Test basic connectivity
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            mode: 'cors',
        });

        console.log('✅ Backend is reachable!');
        console.log('Status:', response.status);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        return {
            reachable: true,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
        };

    } catch (error) {
        console.error('❌ Cannot reach backend');
        console.error('Error:', error.message);

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.log('\n⚠️ Possible issues:');
            console.log('1. Backend server is not running');
            console.log('2. Backend is running on a different port');
            console.log('3. CORS is not configured properly');
            console.log('4. Firewall is blocking the connection');
        }

        return {
            reachable: false,
            error: error.message
        };
    }
}

/**
 * Check if the registration endpoint exists
 */
export async function checkRegistrationEndpoint() {
    const ENDPOINT = 'http://localhost:8080/api/auth/register-organization';

    console.log('🔍 Checking registration endpoint...');
    console.log(`Target URL: ${ENDPOINT}`);

    try {
        // Send OPTIONS request to check if endpoint exists
        const response = await fetch(ENDPOINT, {
            method: 'OPTIONS',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('✅ Endpoint responded!');
        console.log('Status:', response.status);
        console.log('Allowed Methods:', response.headers.get('allow') || 'Not specified');
        console.log('CORS Headers:', {
            'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
            'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
            'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers'),
        });

        return {
            exists: response.status !== 404,
            status: response.status,
            corsEnabled: !!response.headers.get('access-control-allow-origin')
        };

    } catch (error) {
        console.error('❌ Cannot reach endpoint');
        console.error('Error:', error.message);

        return {
            exists: false,
            error: error.message
        };
    }
}

/**
 * Test registration with sample data
 */
export async function testRegistration() {
    const ENDPOINT = 'http://localhost:8080/api/auth/register-organization';

    const testData = {
        name: "Test Gym",
        ownerEmail: "test@example.com",
        phone: "1234567890",
        password: "TestPass123!",
        branches: [
            {
                name: "Test Branch",
                adminEmail: "admin@example.com",
                password: "AdminPass123!"
            }
        ]
    };

    console.log('🧪 Testing registration endpoint...');
    console.log('Request payload:', JSON.stringify(testData, null, 2));

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('Response body (raw):', responseText);

        if (responseText) {
            try {
                const data = JSON.parse(responseText);
                console.log('Response body (parsed):', data);

                if (response.ok) {
                    console.log('✅ Registration test successful!');
                    console.log('Token:', data.token);
                    console.log('Role:', data.role);
                } else {
                    console.log('❌ Registration failed');
                    console.log('Error message:', data.message);
                }

                return { success: response.ok, data };
            } catch (e) {
                console.error('❌ Response is not valid JSON');
                console.log('Raw response:', responseText);
                return { success: false, error: 'Invalid JSON response' };
            }
        } else {
            console.error('❌ Empty response from server');
            return { success: false, error: 'Empty response' };
        }

    } catch (error) {
        console.error('❌ Request failed');
        console.error('Error:', error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Run all diagnostic checks
 */
export async function runFullDiagnostics() {
    console.log('═══════════════════════════════════════════');
    console.log('🏥 Backend API Diagnostics');
    console.log('═══════════════════════════════════════════\n');

    // Check 1: Backend connection
    console.log('📡 CHECK 1: Backend Connection');
    const connectionCheck = await checkBackendConnection();
    console.log('\n');

    if (!connectionCheck.reachable) {
        console.log('⚠️ Backend is not reachable. Please start your backend server first.');
        console.log('Expected: Spring Boot application running on http://localhost:8080');
        return;
    }

    // Check 2: Registration endpoint
    console.log('📡 CHECK 2: Registration Endpoint');
    const endpointCheck = await checkRegistrationEndpoint();
    console.log('\n');

    if (!endpointCheck.corsEnabled) {
        console.log('⚠️ CORS might not be configured properly on the backend');
        console.log('Add the following to your Spring Boot configuration:');
        console.log(`
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
        `);
        console.log('\n');
    }

    // Check 3: Test registration
    console.log('📡 CHECK 3: Test Registration');
    const testResult = await testRegistration();
    console.log('\n');

    console.log('═══════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log('Backend Reachable:', connectionCheck.reachable ? '✅' : '❌');
    console.log('Endpoint Exists:', endpointCheck.exists ? '✅' : '❌');
    console.log('CORS Enabled:', endpointCheck.corsEnabled ? '✅' : '❌');
    console.log('Registration Works:', testResult.success ? '✅' : '❌');
    console.log('═══════════════════════════════════════════\n');

    if (connectionCheck.reachable && endpointCheck.exists && endpointCheck.corsEnabled && testResult.success) {
        console.log('🎉 Everything looks good! Your backend is properly configured.');
    } else {
        console.log('⚠️ Some issues were found. Please review the checks above.');
    }
}

// Quick check function for browser console
if (typeof window !== 'undefined') {
    window.checkBackend = runFullDiagnostics;
    console.log('💡 Tip: Run checkBackend() in the console to diagnose backend connection issues');
}
