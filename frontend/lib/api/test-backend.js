/**
 * Backend Test Script
 * Open browser console and run: testBackendAPI()
 */

export async function testBackendAPI() {
    const url = 'http://localhost:8080/api/auth/register-organization';

    console.log('🧪 Testing Backend API...');
    console.log('URL:', url);
    console.log('');

    const testData = {
        name: "Test Gym",
        ownerEmail: "test@example.com",
        phone: "1234567890",
        password: "TestPass123!"
    };

    console.log('📤 Sending request with data:', testData);
    console.log('');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('📥 Response received:');
        console.log('  Status:', response.status, response.statusText);
        console.log('  OK:', response.ok);
        console.log('');

        console.log('📋 Response Headers:');
        console.log('  Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin') || '❌ NOT SET');
        console.log('  Access-Control-Allow-Methods:', response.headers.get('access-control-allow-methods') || '❌ NOT SET');
        console.log('  Access-Control-Allow-Headers:', response.headers.get('access-control-allow-headers') || '❌ NOT SET');
        console.log('  Content-Type:', response.headers.get('content-type'));
        console.log('');

        const text = await response.text();
        console.log('📄 Response Body (raw):', text || '(empty)');
        console.log('');

        if (text) {
            try {
                const json = JSON.parse(text);
                console.log('📄 Response Body (parsed):', json);
            } catch (e) {
                console.log('⚠️ Response is not valid JSON');
            }
        }

        console.log('');
        console.log('═══════════════════════════════════');

        if (response.status === 403) {
            console.log('❌ DIAGNOSIS: 403 Forbidden Error');
            console.log('');
            console.log('This means your backend is blocking the request.');
            console.log('');

            const hasCorHeaders = response.headers.get('access-control-allow-origin');

            if (!hasCorHeaders) {
                console.log('🔴 PROBLEM: CORS is not configured!');
                console.log('');
                console.log('SOLUTION: Add this to your Spring Boot backend:');
                console.log('');
                console.log('Option 1: Add to your controller');
                console.log('─────────────────────────────────');
                console.log('@CrossOrigin(origins = "http://localhost:3000")');
                console.log('@RestController');
                console.log('@RequestMapping("/api/auth")');
                console.log('public class AuthController { ... }');
                console.log('');
                console.log('Option 2: Create CorsConfig.java');
                console.log('─────────────────────────────────');
                console.log('@Configuration');
                console.log('public class CorsConfig implements WebMvcConfigurer {');
                console.log('    @Override');
                console.log('    public void addCorsMappings(CorsRegistry registry) {');
                console.log('        registry.addMapping("/api/**")');
                console.log('            .allowedOrigins("http://localhost:3000")');
                console.log('            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")');
                console.log('            .allowedHeaders("*");');
                console.log('    }');
                console.log('}');
                console.log('');
            } else {
                console.log('✅ CORS headers are present');
                console.log('');
                console.log('🔴 PROBLEM: Spring Security is blocking the request!');
                console.log('');
                console.log('SOLUTION: Update SecurityConfig.java');
                console.log('─────────────────────────────────');
                console.log('@Bean');
                console.log('public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {');
                console.log('    http');
                console.log('        .csrf(csrf -> csrf.disable())');
                console.log('        .authorizeHttpRequests(auth -> auth');
                console.log('            .requestMatchers("/api/auth/**").permitAll()  // ⭐ ADD THIS');
                console.log('            .anyRequest().authenticated()');
                console.log('        );');
                console.log('    return http.build();');
                console.log('}');
                console.log('');
            }

            console.log('After making changes:');
            console.log('1. Restart your backend server');
            console.log('2. Run this test again');
            console.log('3. Try registration from the frontend');

        } else if (response.status === 200 || response.status === 201) {
            console.log('✅ SUCCESS! Backend is working correctly');
        } else {
            console.log(`⚠️ Received ${response.status} - Check response body above`);
        }

        console.log('═══════════════════════════════════');

    } catch (error) {
        console.log('');
        console.log('═══════════════════════════════════');
        console.log('❌ REQUEST FAILED');
        console.log('');
        console.log('Error:', error.message);
        console.log('');

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            console.log('🔴 PROBLEM: Cannot connect to backend');
            console.log('');
            console.log('SOLUTIONS:');
            console.log('1. Check if backend is running on http://localhost:8080');
            console.log('2. Check if there are any firewall issues');
            console.log('3. Try: curl http://localhost:8080');
        } else {
            console.log('Unexpected error type');
        }

        console.log('═══════════════════════════════════');
    }
}

// Make it globally available in browser console
if (typeof window !== 'undefined') {
    window.testBackendAPI = testBackendAPI;
    console.log('💡 Run testBackendAPI() in console to debug backend connection');
}
