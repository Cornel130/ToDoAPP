package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaVerifyRequest {
    private String code;
    private String method;
    private String tempToken;
}
