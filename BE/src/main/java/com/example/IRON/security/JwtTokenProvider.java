package com.example.IRON.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return generateTokenFromEmail(userDetails.getUsername());
    }

    public String generateTokenFromEmail(String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiration);
        return Jwts.builder()
                .subject(email)          // 0.12.x dùng .subject() thay .setSubject()
                .issuedAt(now)           // .issuedAt() thay .setIssuedAt()
                .expiration(expiry)      // .expiration() thay .setExpiration()
                .signWith(getSigningKey()) // 0.12.x không cần SignatureAlgorithm
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()             // 0.12.x dùng .parser() thay .parserBuilder()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token) // .parseSignedClaims() thay .parseClaimsJws()
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("Token không hợp lệ: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("Token hết hạn: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("Token không hỗ trợ: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims rỗng: " + e.getMessage());
        }
        return false;
    }
}