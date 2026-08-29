package com.example.IRON.dto.request;

import com.example.IRON.entity.Contact;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContactStatusRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private Contact.ContactStatus status;
}
