package org.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MfaSetupVerifyRequest {
    private String code;
    private String tempToken;
}
