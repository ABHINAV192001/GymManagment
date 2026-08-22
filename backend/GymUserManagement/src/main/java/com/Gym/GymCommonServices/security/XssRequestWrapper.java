package com.Gym.GymCommonServices.security;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Request Wrapper that sanitizes parameters, headers, and body streams against XSS.
 */
public class XssRequestWrapper extends HttpServletRequestWrapper {

    private byte[] rawBody;

    public XssRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String[] getParameterValues(String parameter) {
        String[] values = super.getParameterValues(parameter);
        if (values == null) {
            return null;
        }
        int count = values.length;
        String[] encodedValues = new String[count];
        for (int i = 0; i < count; i++) {
            encodedValues[i] = XssSanitizer.sanitize(values[i]);
        }
        return encodedValues;
    }

    @Override
    public String getParameter(String parameter) {
        String value = super.getParameter(parameter);
        return XssSanitizer.sanitize(value);
    }

    @Override
    public Map<String, String[]> getParameterMap() {
        Map<String, String[]> originalMap = super.getParameterMap();
        Map<String, String[]> sanitizedMap = new HashMap<>();
        for (Map.Entry<String, String[]> entry : originalMap.entrySet()) {
            String[] values = entry.getValue();
            if (values != null) {
                String[] sanitizedValues = new String[values.length];
                for (int i = 0; i < values.length; i++) {
                    sanitizedValues[i] = XssSanitizer.sanitize(values[i]);
                }
                sanitizedMap.put(entry.getKey(), sanitizedValues);
            } else {
                sanitizedMap.put(entry.getKey(), null);
            }
        }
        return sanitizedMap;
    }

    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        return XssSanitizer.sanitize(value);
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        if (rawBody == null) {
            InputStream is = super.getInputStream();
            byte[] bodyBytes = is.readAllBytes();
            String contentType = getContentType();
            if (contentType != null && (contentType.contains("application/json") || contentType.contains("text/"))) {
                String bodyStr = new String(bodyBytes, StandardCharsets.UTF_8);
                String sanitizedBody = XssSanitizer.sanitize(bodyStr);
                rawBody = sanitizedBody.getBytes(StandardCharsets.UTF_8);
            } else {
                rawBody = bodyBytes;
            }
        }

        ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(rawBody);
        return new ServletInputStream() {
            @Override
            public boolean isFinished() {
                return byteArrayInputStream.available() == 0;
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener) {
            }

            @Override
            public int read() {
                return byteArrayInputStream.read();
            }
        };
    }
}
