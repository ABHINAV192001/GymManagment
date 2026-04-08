package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.entity.RefreshToken;
import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(String userEmail);
    Optional<RefreshToken> findByToken(String token);
    RefreshToken verifyExpiration(RefreshToken token);
    void deleteByUserEmail(String userEmail);
}
