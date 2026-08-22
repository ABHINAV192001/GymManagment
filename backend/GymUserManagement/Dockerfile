# ---------- Stage 1: Build GymUserManagement (Unified Monolith) ----------
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build/service

COPY pom.xml ./pom.xml
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---------- Stage 3: Runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

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
