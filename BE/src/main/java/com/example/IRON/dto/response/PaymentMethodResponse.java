package com.example.IRON.dto.response;

import com.example.IRON.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String iconUrl;
    private Boolean active;
    private Integer sortOrder;

    public static PaymentMethodResponse fromEntity(PaymentMethod pm) {
        return PaymentMethodResponse.builder()
                .id(pm.getId())
                .name(pm.getName())
                .code(pm.getCode())
                .description(pm.getDescription())
                .iconUrl(pm.getIconUrl())
                .active(pm.getActive())
                .sortOrder(pm.getSortOrder())
                .build();
    }
}