# ---------- Stage 1: Build GymCommonServices (shared dependency) ----------
FROM maven:3.9-eclipse-temurin-17 AS common-builder
WORKDIR /build/common

COPY backend/GymCommonServices/pom.xml ./pom.xml
COPY backend/GymCommonServices/src ./src
RUN mvn clean install -DskipTests -B

# ---------- Stage 2: Build GymUserManagement ----------
FROM common-builder AS builder
WORKDIR /build/service

COPY backend/GymUserManagement/pom.xml ./pom.xml
COPY backend/GymUserManagement/src ./src
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
