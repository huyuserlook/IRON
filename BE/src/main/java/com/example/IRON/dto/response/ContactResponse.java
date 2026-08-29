package com.example.IRON.dto.response;

import com.example.IRON.entity.Contact;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {
private Long id;
    private String name;
    private String phone;
    private String email;
    private String subject;
    private String message;
    private Contact.ContactStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
