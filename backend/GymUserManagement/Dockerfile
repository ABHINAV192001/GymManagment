# ---------- Stage 1: Build GymUserManagement (Unified Monolith) ----------
FROM --platform=$BUILDPLATFORM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build/service

COPY . ./
RUN if [ -f "backend/GymUserManagement/pom.xml" ]; then cp -rf backend/GymUserManagement/* ./ ; fi
RUN if [ ! -f "target/usermanagement-0.0.1-SNAPSHOT.jar" ]; then mvn clean package -DskipTests -B ; fi

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Security: run as non-root
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Create uploads directory with correct ownership
RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

USER appuser

COPY --from=builder /build/service/target/usermanagement-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-Xms192m", \
  "-Xmx256m", \
  "-XX:MaxMetaspaceSize=128m", \
  "-XX:ReservedCodeCacheSize=64m", \
  "-Xss256k", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
