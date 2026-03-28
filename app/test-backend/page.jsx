'use client';

import { useState } from 'react';

export default function BackendTestPage() {
    const [testResults, setTestResults] = useState(null);
    const [testing, setTesting] = useState(false);

    const runTests = async () => {
        setTesting(true);
        setTestResults(null);

        const results = {
            backendReachable: false,
            corsConfigured: false,
            endpointPublic: false,
            responseBody: '',
            headers: {},
            error: null
        };

        try {
            // Test the endpoint
            const response = await fetch('http://localhost:8080/api/auth/register-organization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: "Test Gym",
                    ownerEmail: "test@example.com",
                    phone: "1234567890",
                    password: "TestPass123!"
                })
            });

            results.backendReachable = true;
            results.headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'content-type': response.headers.get('content-type')
            };

            results.corsConfigured = !!response.headers.get('access-control-allow-origin');
            results.endpointPublic = response.status !== 403;

            const text = await response.text();
            results.responseBody = text;
            results.status = response.status;

        } catch (error) {
            results.error = error.message;
        }

        setTestResults(results);
        setTesting(false);
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <h1 style={{ marginBottom: '30px', color: '#00ff88' }}>🔧 Backend API Diagnostic Test</h1>

            <button
                onClick={runTests}
                disabled={testing}
                style={{
                    padding: '15px 30px',
                    background: testing ? '#555' : '#00ff88',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: testing ? 'not-allowed' : 'pointer',
                    marginBottom: '30px'
                }}
            >
                {testing ? 'Testing...' : '🚀 Run Diagnostic Test'}
            </button>

            {testResults && (
                <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
                    <h2 style={{ marginBottom: '20px', color: '#00ff88' }}>Test Results</h2>

                    {/* Backend Reachable */}
                    <div style={{ marginBottom: '20px', padding: '15px', background: testResults.backendReachable ? '#1a4d2e' : '#4d1a1a', borderRadius: '8px' }}>
                        <h3 style={{ margin: 0, marginBottom: '10px' }}>
                            {testResults.backendReachable ? '✅' : '❌'} Backend Reachable
                        </h3>
                        {!testResults.backendReachable && testResults.error && (
                            <div>
                                <p style={{ color: '#ff6b6b' }}>Error: {testResults.error}</p>
                                <p style={{ fontSize: '14px', color: '#aaa' }}>
                                    <strong>Solution:</strong> Start your Spring Boot backend on http://localhost:8080
                                </p>
                                <code style={{ display: 'block', background: '#000', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                                    cd /path/to/backend<br />
                                    ./mvnw spring-boot:run
                                </code>
                            </div>
                        )}
                    </div>

                    {testResults.backendReachable && (
                        <>
                            {/* CORS Configuration */}
                            <div style={{ marginBottom: '20px', padding: '15px', background: testResults.corsConfigured ? '#1a4d2e' : '#4d1a1a', borderRadius: '8px' }}>
                                <h3 style={{ margin: 0, marginBottom: '10px' }}>
                                    {testResults.corsConfigured ? '✅' : '❌'} CORS Configuration
                                </h3>
                                <p style={{ fontSize: '14px', color: '#aaa' }}>
                                    Access-Control-Allow-Origin: {testResults.headers['access-control-allow-origin'] || '❌ NOT SET'}
                                </p>
                                {!testResults.corsConfigured && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>🔴 CORS is NOT configured!</p>
                                        <p style={{ fontSize: '14px' }}>Add this to your AuthController:</p>
                                        <code style={{ display: 'block', background: '#000', padding: '10px', borderRadius: '4px', marginTop: '5px', fontSize: '12px' }}>
                                            @CrossOrigin(origins = "http://localhost:3000")<br />
                                            @RestController<br />
                                            @RequestMapping("/api/auth")<br />
                                            public class AuthController &#123; ... &#125;
                                        </code>
                                    </div>
                                )}
                            </div>

                            {/* Endpoint Access */}
                            <div style={{ marginBottom: '20px', padding: '15px', background: testResults.endpointPublic ? '#1a4d2e' : '#4d1a1a', borderRadius: '8px' }}>
                                <h3 style={{ margin: 0, marginBottom: '10px' }}>
                                    {testResults.endpointPublic ? '✅' : '❌'} Endpoint Access (Status: {testResults.status})
                                </h3>
                                {!testResults.endpointPublic && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>🔴 403 Forbidden - Spring Security is blocking!</p>
                                        <p style={{ fontSize: '14px' }}>Update your SecurityConfig.java:</p>
                                        <code style={{ display: 'block', background: '#000', padding: '10px', borderRadius: '4px', marginTop: '5px', fontSize: '12px' }}>
                                            @Bean<br />
                                            public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception &#123;<br />
                                            &nbsp;&nbsp;http<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;.csrf(csrf -&gt; csrf.disable())<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;.authorizeHttpRequests(auth -&gt; auth<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.requestMatchers("/api/auth/**").permitAll()<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.anyRequest().authenticated()<br />
                                            &nbsp;&nbsp;&nbsp;&nbsp;);<br />
                                            &nbsp;&nbsp;return http.build();<br />
                                            &#125;
                                        </code>
                                    </div>
                                )}
                            </div>

                            {/* Response Body */}
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                                <h3 style={{ margin: 0, marginBottom: '10px' }}>📄 Response Body</h3>
                                <pre style={{ background: '#000', padding: '10px', borderRadius: '4px', overflow: 'auto', fontSize: '12px' }}>
                                    {testResults.responseBody || '(empty)'}
                                </pre>
                            </div>

                            {/* Summary */}
                            <div style={{ padding: '20px', background: '#000', borderRadius: '8px', border: '2px solid #00ff88' }}>
                                <h3 style={{ margin: 0, marginBottom: '15px', color: '#00ff88' }}>📊 Summary</h3>
                                {testResults.backendReachable && testResults.corsConfigured && testResults.endpointPublic ? (
                                    <div>
                                        <p style={{ fontSize: '18px', color: '#00ff88', fontWeight: 'bold' }}>
                                            ✅ Everything looks good! Your backend is properly configured.
                                        </p>
                                        <p style={{ color: '#aaa' }}>You can now use the registration page.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: '18px', color: '#ff6b6b', fontWeight: 'bold', marginBottom: '10px' }}>
                                            ⚠️ Issues Found - Backend Configuration Required
                                        </p>
                                        <p style={{ color: '#aaa', marginBottom: '15px' }}>Follow the solutions above, then:</p>
                                        <ol style={{ color: '#aaa', lineHeight: '1.8' }}>
                                            <li>Make the required code changes to your backend</li>
                                            <li>Restart your backend server</li>
                                            <li>Click "Run Diagnostic Test" again</li>
                                            <li>When all checks pass ✅, try registration</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div style={{ marginTop: '40px', padding: '20px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>💡 Quick Actions</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                    <a
                        href="/components/register"
                        style={{ padding: '12px', background: '#00ff88', color: '#000', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}
                    >
                        Go to Registration Page
                    </a>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '12px', background: 'transparent', color: '#00ff88', border: '1px solid #00ff88', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
}
