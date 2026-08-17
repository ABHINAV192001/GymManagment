# ---------- Stage 1: Build GymCommonServices (shared dependency) ----------
FROM maven:3.9-eclipse-temurin-17 AS common-builder
WORKDIR /build/common

COPY GymCommonServices/pom.xml ./pom.xml
COPY GymCommonServices/src ./src
RUN mvn clean install -DskipTests -B

# ---------- Stage 2: Build GymChatService ----------
FROM common-builder AS builder
WORKDIR /build/service

# Copy POM first for dependency caching
COPY GymChatService/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B || true

# Copy source and build
COPY GymChatService/src ./src
RUN mvn clean package -DskipTests -B

# ---------- Stage 3: Runtime ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /build/service/target/GymChatService-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
