package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaEmailSendRequest {
    private String tempToken;
}
