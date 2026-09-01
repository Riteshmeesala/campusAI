package com.campusiq.common.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret:CampusIQPlusSecretKey2024SuperSecureJWTSigningKey256BitsOrMoreForHMACSHA}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes()));
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email, Long userId, String role) {
        return buildToken(email, userId, role, jwtExpirationMs);
    }

    public String generateRefreshToken(String email, Long userId, String role) {
        return buildToken(email, userId, role, refreshExpirationMs);
    }

    private String buildToken(String email, Long userId, String role, long expiration) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expiration))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        Number userId = claims.get("userId", Number.class);
        return userId != null ? userId.longValue() : null;
    }

    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();
    }
}
